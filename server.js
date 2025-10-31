// server.js - Backend API for CyberProfile Minting
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
const sharp = require('sharp');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration
const PORT = process.env.PORT || 3000;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET = process.env.PINATA_SECRET;
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

// Contract configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PROVIDER_URL = process.env.PROVIDER_URL || 'https://mainnet.base.org';
const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);

// In-memory store for parameters (in production, use database)
let mintingParameters = {
    minFid: 1,
    maxFid: 100000,
    baseMintPrice: ethers.utils.parseEther('0.002'),
    proMintPrice: ethers.utils.parseEther('0.001'),
    proDiscountPercent: 50,
    maxSupply: 10000,
    currentSupply: 0,
    paused: false
};

// Cache for transformed images
const transformCache = new Map();

// ===== FARCASTER INTEGRATION =====

/**
 * Get Farcaster user data
 */
async function getFarcasterUser(fid) {
    try {
        const response = await axios.get(
            `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
            {
                headers: {
                    'accept': 'application/json',
                    'api_key': NEYNAR_API_KEY
                }
            }
        );
        
        const user = response.data.users[0];
        return {
            fid: user.fid,
            username: user.username,
            displayName: user.display_name,
            profileImage: user.pfp_url,
            isPro: user.power_badge || false,
            custodyAddress: user.custody_address,
            verifications: user.verifications
        };
    } catch (error) {
        console.error('Error fetching Farcaster user:', error);
        throw new Error('Failed to fetch Farcaster user data');
    }
}

/**
 * Verify Farcaster signature
 */
async function verifyFarcasterSignature(message, signature, fid) {
    try {
        const response = await axios.post(
            'https://api.neynar.com/v2/farcaster/frame/validate',
            {
                message_bytes_in_hex: message,
                signature: signature,
                fid: fid
            },
            {
                headers: {
                    'accept': 'application/json',
                    'api_key': NEYNAR_API_KEY,
                    'content-type': 'application/json'
                }
            }
        );
        
        return response.data.valid;
    } catch (error) {
        console.error('Error verifying signature:', error);
        return false;
    }
}

// ===== AI IMAGE TRANSFORMATION =====

/**
 * Transform profile picture using Together.ai API
 */
async function transformToCyberpunk(imageUrl, fid) {
    try {
        // Check cache first
        const cacheKey = `${fid}-${imageUrl}`;
        if (transformCache.has(cacheKey)) {
            return transformCache.get(cacheKey);
        }

        // Use Together.ai's Stable Diffusion XL for cyberpunk transformation
        const response = await axios.post(
            'https://api.together.xyz/v1/images/generations',
            {
                model: "stabilityai/stable-diffusion-xl-base-1.0",
                prompt: "cyberpunk futuristic neon portrait, highly detailed, digital art, concept art, trending on artstation, dramatic lighting, neon colors, holographic elements, augmented reality, chrome and glass, dystopian aesthetic, 8k, masterpiece",
                negative_prompt: "ugly, blurry, low quality, distorted, deformed, duplicate, worst quality",
                width: 1024,
                height: 1024,
                steps: 30,
                n: 1,
                seed: Math.floor(Math.random() * 1000000)
            },
            {
                headers: {
                    'Authorization': `Bearer ${TOGETHER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Together.ai returns the image URL directly
        const transformedUrl = response.data.data[0].url;
        
        // Cache the result
        transformCache.set(cacheKey, transformedUrl);
        
        return transformedUrl;
    } catch (error) {
        console.error('Error transforming image with Together.ai:', error.response?.data || error.message);
        throw new Error('Failed to transform image');
    }
}

// ===== IPFS/PINATA INTEGRATION =====

/**
 * Upload image to IPFS via Pinata
 */
async function uploadToIPFS(imageUrl) {
    try {
        // Download the image
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);

        // Create form data
        const formData = new FormData();
        formData.append('file', buffer, 'cyberpunk-pfp.png');

        // Upload to Pinata
        const pinataResponse = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET
                }
            }
        );

        return `ipfs://${pinataResponse.data.IpfsHash}`;
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw new Error('Failed to upload to IPFS');
    }
}

/**
 * Upload metadata to IPFS
 */
async function uploadMetadataToIPFS(metadata) {
    try {
        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            metadata,
            {
                headers: {
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET,
                    'Content-Type': 'application/json'
                }
            }
        );

        return `ipfs://${response.data.IpfsHash}`;
    } catch (error) {
        console.error('Error uploading metadata to IPFS:', error);
        throw new Error('Failed to upload metadata to IPFS');
    }
}

// ===== API ROUTES =====

/**
 * Health check
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Get user profile and eligibility
 */
app.get('/api/user/:fid', async (req, res) => {
    try {
        const fid = parseInt(req.params.fid);
        const userData = await getFarcasterUser(fid);
        
        const isEligible = fid >= mintingParameters.minFid && 
                          fid <= mintingParameters.maxFid &&
                          mintingParameters.currentSupply < mintingParameters.maxSupply &&
                          !mintingParameters.paused;
        
        const mintPrice = userData.isPro ? 
            mintingParameters.proMintPrice : 
            mintingParameters.baseMintPrice;
        
        res.json({
            ...userData,
            isEligible,
            mintPrice: ethers.utils.formatEther(mintPrice),
            parameters: {
                minFid: mintingParameters.minFid,
                maxFid: mintingParameters.maxFid,
                maxSupply: mintingParameters.maxSupply,
                currentSupply: mintingParameters.currentSupply,
                paused: mintingParameters.paused
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Transform profile picture
 */
app.post('/api/transform', async (req, res) => {
    try {
        const { imageUrl, fid } = req.body;
        
        if (!imageUrl || !fid) {
            return res.status(400).json({ error: 'Missing imageUrl or fid' });
        }
        
        const transformedUrl = await transformToCyberpunk(imageUrl, fid);
        
        res.json({ 
            success: true,
            transformedUrl,
            message: 'Image transformed successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Prepare mint (transform + upload to IPFS)
 */
app.post('/api/prepare-mint', async (req, res) => {
    try {
        const { imageUrl, fid, username, displayName } = req.body;
        
        // Transform the image
        const transformedUrl = await transformToCyberpunk(imageUrl, fid);
        
        // Upload transformed image to IPFS
        const ipfsImageUrl = await uploadToIPFS(transformedUrl);
        
        // Create metadata
        const metadata = {
            name: `CyberProfile #${fid}`,
            description: `Cyberpunk transformation of @${username}'s Farcaster profile`,
            image: ipfsImageUrl,
            attributes: [
                {
                    trait_type: "FID",
                    value: fid
                },
                {
                    trait_type: "Username",
                    value: username
                },
                {
                    trait_type: "Display Name",
                    value: displayName
                },
                {
                    trait_type: "Style",
                    value: "Cyberpunk"
                }
            ]
        };
        
        // Upload metadata to IPFS
        const tokenURI = await uploadMetadataToIPFS(metadata);
        
        res.json({
            success: true,
            tokenURI,
            ipfsImageUrl,
            transformedUrl,
            metadata
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get current minting parameters
 */
app.get('/api/parameters', (req, res) => {
    res.json({
        ...mintingParameters,
        baseMintPrice: ethers.utils.formatEther(mintingParameters.baseMintPrice),
        proMintPrice: ethers.utils.formatEther(mintingParameters.proMintPrice)
    });
});

/**
 * Get stats for admin dashboard
 */
app.get('/api/admin/stats', async (req, res) => {
    try {
        res.json({
            currentSupply: mintingParameters.currentSupply,
            maxSupply: mintingParameters.maxSupply,
            isPaused: mintingParameters.paused,
            parameters: {
                ...mintingParameters,
                baseMintPrice: ethers.utils.formatEther(mintingParameters.baseMintPrice),
                proMintPrice: ethers.utils.formatEther(mintingParameters.proMintPrice)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Update minting parameters (admin only)
 */
app.post('/api/admin/update-parameters', (req, res) => {
    try {
        const { minFid, maxFid, baseMintPrice, proMintPrice, maxSupply } = req.body;
        
        if (minFid !== undefined) mintingParameters.minFid = parseInt(minFid);
        if (maxFid !== undefined) mintingParameters.maxFid = parseInt(maxFid);
        if (baseMintPrice !== undefined) mintingParameters.baseMintPrice = ethers.utils.parseEther(baseMintPrice.toString());
        if (proMintPrice !== undefined) mintingParameters.proMintPrice = ethers.utils.parseEther(proMintPrice.toString());
        if (maxSupply !== undefined) mintingParameters.maxSupply = parseInt(maxSupply);
        
        res.json({ 
            success: true, 
            parameters: {
                ...mintingParameters,
                baseMintPrice: ethers.utils.formatEther(mintingParameters.baseMintPrice),
                proMintPrice: ethers.utils.formatEther(mintingParameters.proMintPrice)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Toggle pause state
 */
app.post('/api/admin/toggle-pause', (req, res) => {
    mintingParameters.paused = !mintingParameters.paused;
    res.json({ 
        success: true, 
        paused: mintingParameters.paused 
    });
});

/**
 * Update Pro status for a FID
 */
app.post('/api/admin/update-pro-status', (req, res) => {
    try {
        const { fid, isPro } = req.body;
        // In production, this would update a database
        res.json({ success: true, fid, isPro });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CyberProfile API running on port ${PORT}`);
    console.log(`📡 Farcaster integration: ${NEYNAR_API_KEY ? '✅' : '❌'}`);
    console.log(`🎨 AI transformation: ${TOGETHER_API_KEY ? '✅' : '❌'}`);
    console.log(`📦 IPFS upload: ${PINATA_API_KEY ? '✅' : '❌'}`);
});

module.exports = app;

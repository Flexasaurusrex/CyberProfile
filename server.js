// server.js - Backend API for CyberProfile Minting
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');

const app = express();
const upload = multer({ storage: multer.memoryStorage()});

// Middleware
app.use(cors({
    origin: [
        'https://cyber-profile-seven.vercel.app',
        'http://localhost:3000',
        'https://cyberprofile-production.up.railway.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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

// Auth session storage (in production, use Redis or database)
const authSessions = new Map();
const authTokens = new Map();

// ===== AUTHENTICATION HELPERS =====

/**
 * Generate secure auth token
 */
function generateAuthToken(fid) {
    const token = crypto.randomBytes(32).toString('hex');
    authTokens.set(token, {
        fid: parseInt(fid),
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });
    return token;
}

/**
 * Verify auth token
 */
function verifyAuthToken(token) {
    const session = authTokens.get(token);
    if (!session) return null;
    
    if (Date.now() > session.expiresAt) {
        authTokens.delete(token);
        return null;
    }
    
    return session;
}

/**
 * Auth middleware
 */
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.substring(7);
    const session = verifyAuthToken(token);
    
    if (!session) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    req.userFid = session.fid;
    req.authToken = token;
    next();
}

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
            isPro: user.power_badge || false, // Farcaster Power Badge indicates Pro
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

// ===== IMAGE TRANSFORMATION =====

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

/**
 * Alternative: Use Stability AI
 */
async function transformWithStability(imageUrl, fid) {
    try {
        // Download original image
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data);

        // Prepare form data
        const formData = new FormData();
        formData.append('init_image', imageBuffer, 'image.png');
        formData.append('init_image_mode', 'IMAGE_STRENGTH');
        formData.append('image_strength', 0.35);
        formData.append('text_prompts[0][text]', 'cyberpunk futuristic neon portrait, highly detailed digital art, neon colors, holographic, chrome, dystopian, 8k');
        formData.append('text_prompts[0][weight]', 1);
        formData.append('cfg_scale', 7);
        formData.append('samples', 1);
        formData.append('steps', 30);

        const response = await axios.post(
            'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`
                }
            }
        );

        const transformedBase64 = response.data.artifacts[0].base64;
        return `data:image/png;base64,${transformedBase64}`;
    } catch (error) {
        console.error('Error with Stability AI:', error);
        throw error;
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
                    'Content-Type': 'application/json',
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET
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

// ===== AUTHENTICATION ENDPOINTS =====

/**
 * Request Farcaster auth challenge
 */
app.post('/api/auth/challenge', async (req, res) => {
    try {
        // Generate unique channel token
        const channelToken = crypto.randomBytes(16).toString('hex');
        const nonce = crypto.randomBytes(16).toString('hex');
        
        // Create auth request via Neynar
        const response = await axios.post(
            'https://api.neynar.com/v2/farcaster/login',
            {},
            {
                headers: {
                    'api_key': NEYNAR_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const { signer_uuid, url } = response.data;
        
        // Store auth session
        authSessions.set(channelToken, {
            signerUuid: signer_uuid,
            nonce,
            state: 'pending',
            createdAt: Date.now()
        });
        
        res.json({
            channelToken,
            url,
            nonce
        });
    } catch (error) {
        console.error('Auth challenge error:', error);
        res.status(500).json({ error: 'Failed to create auth challenge' });
    }
});

/**
 * Check auth status (polling endpoint)
 */
app.get('/api/auth/status/:channelToken', async (req, res) => {
    try {
        const { channelToken } = req.params;
        const session = authSessions.get(channelToken);
        
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        // Check if already completed
        if (session.state === 'completed') {
            return res.json({
                state: 'completed',
                fid: session.fid,
                token: session.token
            });
        }
        
        // Check Neynar for auth status
        const response = await axios.get(
            `https://api.neynar.com/v2/farcaster/login?signer_uuid=${session.signerUuid}`,
            {
                headers: {
                    'api_key': NEYNAR_API_KEY
                }
            }
        );
        
        const { state, fid, custody_address } = response.data;
        
        if (state === 'completed') {
            // Generate auth token
            const authToken = generateAuthToken(fid);
            
            // Update session
            session.state = 'completed';
            session.fid = fid;
            session.custodyAddress = custody_address;
            session.token = authToken;
            
            authSessions.set(channelToken, session);
            
            return res.json({
                state: 'completed',
                fid,
                token: authToken
            });
        }
        
        res.json({ state: 'pending' });
        
    } catch (error) {
        console.error('Auth status error:', error);
        res.status(500).json({ error: 'Failed to check auth status' });
    }
});

/**
 * Verify auth token
 */
app.get('/api/auth/verify', requireAuth, (req, res) => {
    res.json({
        valid: true,
        fid: req.userFid
    });
});

/**
 * Get current minting parameters
 */
app.get('/api/parameters', async (req, res) => {
    try {
        res.json({
            ...mintingParameters,
            baseMintPrice: mintingParameters.baseMintPrice.toString(),
            proMintPrice: mintingParameters.proMintPrice.toString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get user profile and eligibility (requires authentication)
 */
app.get('/api/user/:fid', requireAuth, async (req, res) => {
    try {
        const fid = parseInt(req.params.fid);
        
        // Verify user is requesting their own FID
        if (fid !== req.userFid) {
            return res.status(403).json({ error: 'Can only access your own profile' });
        }
        
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
 * Authenticate Farcaster user
 */
app.post('/api/auth/farcaster', async (req, res) => {
    try {
        const { fid, signature, message } = req.body;
        
        // Verify signature
        const isValid = await verifyFarcasterSignature(message, signature, fid);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Get user data
        const userData = await getFarcasterUser(fid);
        
        res.json(userData);
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Transform profile picture (requires authentication)
 */
app.post('/api/transform', requireAuth, async (req, res) => {
    try {
        const { fid, imageUrl } = req.body;

        if (!fid || !imageUrl) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Verify user is transforming their own FID
        if (fid !== req.userFid) {
            return res.status(403).json({ error: 'Can only transform your own profile' });
        }

        // Check eligibility
        const isEligible = fid >= mintingParameters.minFid && 
                          fid <= mintingParameters.maxFid &&
                          !mintingParameters.paused;

        if (!isEligible) {
            return res.status(403).json({ 
                error: 'Not eligible to mint',
                isEligible: false,
                reason: 'FID out of range or minting paused'
            });
        }

        // Transform the image
        const transformedUrl = await transformToCyberpunk(imageUrl, fid);

        res.json({
            success: true,
            transformedUrl,
            isEligible: true,
            fid
        });
    } catch (error) {
        console.error('Transform error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Check eligibility for minting
 */
app.get('/api/check-eligibility/:fid', async (req, res) => {
    try {
        const fid = parseInt(req.params.fid);
        
        const isEligible = fid >= mintingParameters.minFid && 
                          fid <= mintingParameters.maxFid &&
                          mintingParameters.currentSupply < mintingParameters.maxSupply &&
                          !mintingParameters.paused;

        let reason = '';
        if (fid < mintingParameters.minFid || fid > mintingParameters.maxFid) {
            reason = `FID must be between ${mintingParameters.minFid} and ${mintingParameters.maxFid}`;
        } else if (mintingParameters.currentSupply >= mintingParameters.maxSupply) {
            reason = 'Max supply reached';
        } else if (mintingParameters.paused) {
            reason = 'Minting is currently paused';
        }

        res.json({
            isEligible,
            reason,
            fid
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Prepare mint (transform + upload to IPFS) (requires authentication)
 */
app.post('/api/prepare-mint', requireAuth, async (req, res) => {
    try {
        const { imageUrl, fid, username, displayName } = req.body;
        
        // Verify user is minting their own FID
        if (fid !== req.userFid) {
            return res.status(403).json({ error: 'Can only mint your own profile' });
        }

        // Upload transformed image to IPFS
        const ipfsImageUrl = await uploadToIPFS(imageUrl);

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
            metadata
        });
    } catch (error) {
        console.error('Prepare mint error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== ADMIN ROUTES (Protected in production) =====

/**
 * Update minting parameters
 */
app.post('/api/admin/update-parameters', async (req, res) => {
    try {
        // In production, add authentication middleware
        const { minFid, maxFid, baseMintPrice, proMintPrice, maxSupply, paused } = req.body;

        if (minFid !== undefined) mintingParameters.minFid = parseInt(minFid);
        if (maxFid !== undefined) mintingParameters.maxFid = parseInt(maxFid);
        if (baseMintPrice !== undefined) {
            mintingParameters.baseMintPrice = ethers.utils.parseEther(baseMintPrice);
        }
        if (proMintPrice !== undefined) {
            mintingParameters.proMintPrice = ethers.utils.parseEther(proMintPrice);
            mintingParameters.proDiscountPercent = Math.round(
                (1 - parseFloat(proMintPrice) / parseFloat(baseMintPrice)) * 100
            );
        }
        if (maxSupply !== undefined) mintingParameters.maxSupply = parseInt(maxSupply);
        if (paused !== undefined) mintingParameters.paused = Boolean(paused);

        res.json({
            success: true,
            parameters: {
                ...mintingParameters,
                baseMintPrice: mintingParameters.baseMintPrice.toString(),
                proMintPrice: mintingParameters.proMintPrice.toString()
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get admin stats
 */
app.get('/api/admin/stats', async (req, res) => {
    try {
        res.json({
            totalTransformations: transformCache.size,
            currentSupply: mintingParameters.currentSupply,
            maxSupply: mintingParameters.maxSupply,
            isPaused: mintingParameters.paused,
            parameters: mintingParameters
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== FARCASTER FRAME HANDLER =====

/**
 * Handle Frame actions
 */
app.post('/api/frame-action', async (req, res) => {
    try {
        const { untrustedData, trustedData } = req.body;
        const fid = untrustedData.fid;
        const buttonIndex = untrustedData.buttonIndex;

        // Get user data
        const userData = await getFarcasterUser(fid);

        let imageUrl = '';
        let buttons = [];

        switch (buttonIndex) {
            case 1: // Transform PFP
                const transformedUrl = await transformToCyberpunk(userData.profileImage, fid);
                imageUrl = transformedUrl;
                buttons = [
                    { label: '💎 Mint NFT', action: 'post' },
                    { label: '🔄 Try Again', action: 'post' },
                    { label: '📊 Stats', action: 'post' }
                ];
                break;

            case 2: // Mint NFT
                imageUrl = `https://your-domain.com/api/generate-mint-confirmation/${fid}`;
                buttons = [
                    { label: '✅ Confirm Mint', action: 'tx', target: `${CONTRACT_ADDRESS}/mint` },
                    { label: '↩️ Back', action: 'post' }
                ];
                break;

            case 3: // Check Eligibility
                const eligibility = await checkEligibility(fid);
                imageUrl = `https://your-domain.com/api/generate-eligibility-image/${fid}`;
                buttons = [
                    { label: '🔮 Transform', action: 'post' },
                    { label: '📈 View Parameters', action: 'post' }
                ];
                break;

            default:
                imageUrl = 'https://your-domain.com/api/generate-preview';
                buttons = [
                    { label: '🔮 Transform My PFP', action: 'post' },
                    { label: '💎 Mint NFT', action: 'post' },
                    { label: '📊 Check Eligibility', action: 'post' }
                ];
        }

        // Return Frame response
        res.json({
            image: imageUrl,
            buttons: buttons
        });
    } catch (error) {
        console.error('Frame action error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===== START SERVER =====

app.listen(PORT, () => {
    console.log(`🚀 CyberProfile API running on port ${PORT}`);
    console.log(`📡 Farcaster integration: ${NEYNAR_API_KEY ? '✅' : '❌'}`);
    console.log(`🎨 AI transformation: ${TOGETHER_API_KEY ? '✅' : '❌'}`);
    console.log(`📦 IPFS upload: ${PINATA_API_KEY ? '✅' : '❌'}`);
});

module.exports = app;

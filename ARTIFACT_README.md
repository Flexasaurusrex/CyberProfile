# 🤖 CyberProfile - Farcaster NFT Minting DApp

Transform your Farcaster profile picture into a badass cyberpunk NFT with AI-powered generation and dynamic minting parameters.

![CyberProfile Banner](https://via.placeholder.com/1200x300/1a0033/00ff9f?text=CYBERPROFILE)

## ✨ Features

- 🎨 **AI-Powered Transformation**: Convert any profile picture into a stunning cyberpunk masterpiece
- ⚡ **Farcaster Integration**: Seamless authentication and profile data fetching
- 💎 **Dynamic Minting**: Smart contract with configurable parameters
- 🎯 **FID Range Control**: Target specific Farcaster user ranges
- ⭐ **Pro User Benefits**: Automatic discounts for Farcaster Pro users
- 📊 **Admin Dashboard**: Real-time parameter control and analytics
- 🔐 **On-chain Verification**: All mints are permanently stored as NFTs
- 🌈 **Viral Marketing**: Built-in social sharing features

## 🏗️ Architecture

```
┌─────────────────┐
│  Farcaster User │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│       Frontend (index.html)         │
│  ┌──────────┐      ┌─────────────┐ │
│  │  Connect │      │  Transform  │ │
│  │ Farcaster│◄────►│  Generate   │ │
│  └──────────┘      └─────────────┘ │
│         │                 │         │
│         │                 │         │
│  ┌──────▼─────────────────▼──────┐ │
│  │      Mint NFT Interface       │ │
│  └───────────────────────────────┘ │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│       Backend API (server.js)       │
│  ┌──────────────────────────────┐  │
│  │   Farcaster Auth & Profile   │  │
│  │   (Neynar API Integration)   │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │     AI Image Transform       │  │
│  │  (Replicate/Stability AI)    │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │    IPFS Upload (Pinata)      │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │   Parameter Management       │  │
│  └──────────────────────────────┘  │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Smart Contract (CyberProfile.sol) │
│                                     │
│  • Dynamic Minting Parameters      │
│  • FID Range Eligibility           │
│  • Pro User Discounts              │
│  • Supply Management               │
│  • ERC-721 NFT Standard            │
└─────────────────────────────────────┘
```

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MetaMask or compatible Web3 wallet
- Farcaster account
- API keys for:
  - Neynar (Farcaster API)
  - Replicate or Stability AI
  - Pinata (IPFS)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/cyberpunk-pfp-minter.git
cd cyberpunk-pfp-minter
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your API keys and configuration:

```env
# Essential Configuration
NEYNAR_API_KEY=your_neynar_api_key
REPLICATE_API_TOKEN=your_replicate_token
PINATA_API_KEY=your_pinata_key
PINATA_SECRET=your_pinata_secret

# Blockchain
PRIVATE_KEY=your_deployer_private_key
TREASURY_ADDRESS=your_treasury_address
ORACLE_ADDRESS=your_oracle_address

# Initial Parameters
MIN_FID=1
MAX_FID=100000
BASE_MINT_PRICE=0.002
PRO_MINT_PRICE=0.001
MAX_SUPPLY=10000
```

### 3. Get API Keys

#### Neynar API (Farcaster)
1. Visit [neynar.com](https://neynar.com)
2. Sign up and create an API key
3. Copy to `NEYNAR_API_KEY`

#### Replicate (AI Image Generation)
1. Visit [replicate.com](https://replicate.com)
2. Sign up and get API token
3. Copy to `REPLICATE_API_TOKEN`

#### Pinata (IPFS)
1. Visit [pinata.cloud](https://pinata.cloud)
2. Create account and generate API keys
3. Copy API Key and Secret

### 4. Deploy Smart Contract

```bash
# Compile contracts
npx hardhat compile

# Deploy to Base Sepolia (testnet)
npx hardhat run scripts/deploy.js --network baseSepolia

# Deploy to Base Mainnet
npx hardhat run scripts/deploy.js --network base
```

Save the deployed contract address and update your `.env`:
```env
CONTRACT_ADDRESS=0x...
```

### 5. Start Backend Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

Server runs on `http://localhost:3000`

### 6. Deploy Frontend

#### Option A: Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Option B: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=.
```

#### Option C: Traditional Hosting
Upload these files to your web server:
- `index.html`
- `admin.html`
- Update API_BASE URLs in both files

## 🎛️ Admin Dashboard

Access at `/admin.html`

Features:
- **Live Stats**: Real-time minting metrics
- **Parameter Control**: 
  - FID range management
  - Pricing adjustments
  - Supply limits
- **Quick Actions**: Pre-configured parameter sets
- **Pro Status Management**: Update user Pro status
- **Emergency Controls**: Pause/resume minting

### Admin Operations

#### Update FID Range
```javascript
// Via dashboard or API
POST /api/admin/update-parameters
{
  "minFid": 1,
  "maxFid": 50000
}
```

#### Update Pricing
```javascript
POST /api/admin/update-parameters
{
  "baseMintPrice": "0.003",
  "proMintPrice": "0.0015"
}
```

#### Pause Minting
```javascript
POST /api/admin/update-parameters
{
  "paused": true
}
```

## 💎 Smart Contract Functions

### User Functions

```solidity
// Mint a CyberProfile NFT
function mint(address to, string memory tokenURI, uint256 fid) 
    external payable

// Check eligibility
function isEligible(uint256 fid) 
    public view returns (bool)

// Get mint price
function getMintPrice(uint256 fid, bool isPro) 
    public view returns (uint256)
```

### Admin Functions

```solidity
// Update all parameters
function updateMintingParams(
    uint256 _minFid,
    uint256 _maxFid,
    uint256 _baseMintPrice,
    uint256 _proMintPrice,
    uint256 _maxSupply
) external onlyOwner

// Quick FID range update
function updateFidRange(uint256 _minFid, uint256 _maxFid) 
    external onlyOwner

// Update Pro status
function updateProStatus(uint256 fid, bool isPro) 
    external onlyOracle

// Pause/unpause
function pause() external onlyOwner
function unpause() external onlyOwner
```

## 🎨 Customization

### Modify AI Transformation Style

Edit `server.js`:

```javascript
const response = await axios.post(
    'https://api.replicate.com/v1/predictions',
    {
        input: {
            prompt: "YOUR CUSTOM PROMPT HERE",
            negative_prompt: "unwanted elements",
            // ... other parameters
        }
    }
);
```

### Change Visual Theme

Edit CSS in `index.html`:

```css
/* Cyberpunk theme colors */
--primary: #00ff9f;
--secondary: #ff00ff;
--accent: #00b8ff;
--dark: #0a0a0a;
```

### Add Custom Parameters

1. Update `MintingParams` struct in contract
2. Add fields to backend state
3. Update admin dashboard form
4. Deploy contract upgrade

## 🔐 Security Best Practices

1. **Never commit `.env` file**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Secure admin endpoints** (add middleware):
   ```javascript
   const authenticateAdmin = (req, res, next) => {
       // Implement JWT or other auth
   };
   app.post('/api/admin/*', authenticateAdmin, ...);
   ```

3. **Rate limiting**:
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
       windowMs: 15 * 60 * 1000,
       max: 100
   });
   app.use('/api/', limiter);
   ```

4. **Input validation**:
   ```javascript
   const { body, validationResult } = require('express-validator');
   ```

## 📊 Analytics Integration

Add tracking to monitor performance:

```javascript
// In server.js
const mixpanel = require('mixpanel').init(process.env.MIXPANEL_TOKEN);

app.post('/api/transform', async (req, res) => {
    // Track transformation
    mixpanel.track('Profile Transformed', {
        fid: req.body.fid,
        timestamp: new Date()
    });
    // ... rest of function
});
```

## 🧪 Testing

### Run Contract Tests
```bash
npx hardhat test
```

### Test API Endpoints
```bash
curl -X POST http://localhost:3000/api/parameters
curl -X POST http://localhost:3000/api/transform \
  -H "Content-Type: application/json" \
  -d '{"fid": 123, "profileImageUrl": "https://..."}'
```

## 🚢 Deployment Checklist

- [ ] Environment variables configured
- [ ] API keys tested and working
- [ ] Smart contract deployed and verified
- [ ] Frontend deployed to hosting
- [ ] Backend deployed (Heroku/Railway/etc)
- [ ] CONTRACT_ADDRESS updated in frontend
- [ ] Treasury wallet funded
- [ ] Oracle wallet configured
- [ ] Admin dashboard secured
- [ ] CORS origins configured
- [ ] Rate limiting enabled
- [ ] Analytics setup
- [ ] Domain configured
- [ ] SSL certificate active

## 🎯 Launch Strategy

### Phase 1: Early Adopters (FID 1-10000)
```javascript
// Via admin dashboard
updateFidRange(1, 10000);
updateMintPrices(0.001, 0.0005);
```

### Phase 2: Pro Users Special
```javascript
updateFidRange(1, 50000);
updateMintPrices(0.002, 0.001);
```

### Phase 3: Public Launch
```javascript
updateFidRange(1, 999999);
updateMintPrices(0.003, 0.0015);
```

## 🐛 Troubleshooting

### Common Issues

**"Invalid signature" error**
- Ensure Neynar API key is correct
- Check Farcaster authentication flow

**"Image transformation failed"**
- Verify Replicate/Stability AI credits
- Check image URL accessibility
- Ensure prompt is valid

**"Transaction reverted"**
- Check wallet has enough ETH
- Verify FID is in eligible range
- Ensure contract not paused

**IPFS upload fails**
- Verify Pinata credentials
- Check file size limits
- Ensure stable internet connection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

- Farcaster community
- Neynar API
- OpenZeppelin contracts
- Replicate AI
- Base blockchain
- All the amazing artists whose work inspires cyberpunk aesthetics

## 📞 Support

- Documentation: [docs.cyberprofile.io](https://docs.cyberprofile.io)
- Discord: [discord.gg/cyberprofile](https://discord.gg/cyberprofile)
- Twitter: [@CyberProfileNFT](https://twitter.com/CyberProfileNFT)
- Email: support@cyberprofile.io

## 🚀 Roadmap

- [ ] Batch minting for multiple users
- [ ] Gallery view of all minted CyberProfiles
- [ ] Rarity traits system
- [ ] Integration with Warpcast frames
- [ ] Mobile app
- [ ] Additional art styles
- [ ] Community voting on parameters
- [ ] Staking rewards for holders
- [ ] Avatar customization tools
- [ ] Metaverse integrations

---

**Built with ❤️ for the Farcaster community**

Transform your identity. Mint your future. 🤖✨

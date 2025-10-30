# 🚀 CyberProfile - Complete Deployment Guide

## 🎯 Overview

This guide will walk you through deploying your **CyberProfile NFT minting platform** with dynamic parameters and 6.66% secondary royalties.

**What you're deploying:**
- ✅ Smart contract with 6.66% royalties on Base blockchain
- ✅ Backend API with Farcaster, AI, and IPFS integration
- ✅ Beautiful frontend minting interface
- ✅ Admin dashboard for real-time parameter control
- ✅ Marketing landing page

**Time required:** 30-60 minutes
**Cost:** ~$5-10 in gas fees (Base mainnet)

---

## 📋 Prerequisites

### Required Accounts (All Free)

1. **Neynar** (Farcaster API)
   - Sign up: https://neynar.com
   - Get API key from dashboard

2. **Replicate** (AI Image Generation)
   - Sign up: https://replicate.com
   - Get API token from account settings
   - Add credits ($5-10 recommended)

3. **Pinata** (IPFS Storage)
   - Sign up: https://pinata.cloud
   - Get API Key and Secret from Keys section

4. **Wallet with ETH**
   - MetaMask or similar
   - Have ~0.02 ETH on Base for deployment

5. **GitHub Account**
   - For code hosting

6. **Hosting** (Choose one)
   - Vercel (recommended - free)
   - Netlify (free)
   - Railway (for backend)

---

## 🔑 Step 1: Get Your API Keys

### Neynar API Key
```
1. Go to https://neynar.com
2. Sign up with your email
3. Navigate to Dashboard > API Keys
4. Click "Create New Key"
5. Copy your API key
```

### Replicate API Token
```
1. Go to https://replicate.com
2. Sign up and verify email
3. Click your profile > Account Settings
4. Go to API tokens
5. Copy your token
6. Add $5-10 credits in Billing
```

### Pinata IPFS Credentials
```
1. Go to https://pinata.cloud
2. Sign up for free account
3. Go to API Keys section
4. Click "New Key"
5. Give it full permissions
6. Copy API Key and API Secret
```

---

## 📁 Step 2: Setup GitHub Repository

### Create Repository
```bash
# On GitHub.com
1. Click "New Repository"
2. Name it: "cyberpunk-pfp-minter"
3. Make it Public or Private
4. Don't initialize with README
5. Click "Create Repository"
```

### Clone and Push Code
```bash
# On your computer
git clone https://github.com/yourusername/cyberpunk-pfp-minter.git
cd cyberpunk-pfp-minter

# Copy all ARTIFACT files from Claude to this directory
# Remove "ARTIFACT_" prefix from filenames

# Create directory structure
mkdir contracts scripts test

# Move files to correct locations
mv CyberProfile.sol contracts/
mv deploy.js scripts/

# Initialize git
git add .
git commit -m "Initial commit: CyberProfile NFT platform"
git push origin main
```

---

## ⚙️ Step 3: Configure Environment

### Create .env File
```bash
cp .env.example .env
nano .env  # or use your favorite editor
```

### Fill in .env
```env
# ===== REQUIRED - Get these first =====
NEYNAR_API_KEY=YOUR_NEYNAR_KEY_HERE
REPLICATE_API_TOKEN=YOUR_REPLICATE_TOKEN_HERE
PINATA_API_KEY=YOUR_PINATA_KEY_HERE
PINATA_SECRET=YOUR_PINATA_SECRET_HERE

# ===== BLOCKCHAIN - Add after deployment =====
PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY
TREASURY_ADDRESS=YOUR_WALLET_ADDRESS
ORACLE_ADDRESS=YOUR_WALLET_ADDRESS

# ===== INITIAL PARAMETERS =====
MIN_FID=1
MAX_FID=100000
BASE_MINT_PRICE=0.002
PRO_MINT_PRICE=0.001
MAX_SUPPLY=10000

# ===== OPTIONAL =====
PORT=3000
NODE_ENV=production
```

**⚠️ SECURITY WARNING:**
- Never commit .env to GitHub
- Keep your PRIVATE_KEY secret
- Use separate wallet for treasury if possible

---

## 🔨 Step 4: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# This installs:
# - Express (backend)
# - ethers.js (blockchain)
# - Hardhat (smart contracts)
# - All required packages
```

If you get errors, try:
```bash
npm install --legacy-peer-deps
```

---

## 🎨 Step 5: Test Smart Contract

### Compile Contract
```bash
npx hardhat compile
```

You should see:
```
✅ Compiled 1 Solidity file successfully
```

### Run Tests
```bash
npx hardhat test
```

You should see all tests passing:
```
✅ 25 passing
```

---

## 🚀 Step 6: Deploy Smart Contract

### Option A: Deploy to Base Mainnet (LIVE)
```bash
# Make sure you have ETH on Base
npx hardhat run scripts/deploy.js --network base
```

### Option B: Deploy to Base Sepolia (TESTNET)
```bash
# For testing first
npx hardhat run scripts/deploy.js --network baseSepolia
```

**After deployment, you'll see:**
```
✅ CyberProfile deployed to: 0x1234...5678
```

**IMPORTANT: Copy this contract address!**

---

## 📝 Step 7: Update Contract Address

### Update .env
```env
CONTRACT_ADDRESS=0x1234...5678  # Your deployed address
```

### Update Frontend Files

**index.html** (line ~500):
```javascript
const CONTRACT_ADDRESS = '0x1234...5678';
```

**admin.html** (line ~460):
```javascript
const CONTRACT_ADDRESS = '0x1234...5678';
```

---

## 🔐 Step 8: Verify Contract on Basescan

```bash
npx hardhat verify --network base \
  0x1234...5678 \
  "TREASURY_ADDRESS" \
  "ORACLE_ADDRESS" \
  1 \
  100000 \
  "2000000000000000" \
  "1000000000000000" \
  10000
```

Once verified, your contract will show on Basescan with a green checkmark!

---

## 🖥️ Step 9: Deploy Backend

### Option A: Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set NEYNAR_API_KEY=xxx
railway variables set REPLICATE_API_TOKEN=xxx
railway variables set PINATA_API_KEY=xxx
railway variables set PINATA_SECRET=xxx
railway variables set CONTRACT_ADDRESS=0x...

# Deploy
railway up
```

### Option B: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create cyberpunk-pfp-minter

# Set environment variables
heroku config:set NEYNAR_API_KEY=xxx
heroku config:set REPLICATE_API_TOKEN=xxx
heroku config:set PINATA_API_KEY=xxx
heroku config:set PINATA_SECRET=xxx
heroku config:set CONTRACT_ADDRESS=0x...

# Deploy
git push heroku main
```

**Note your backend URL:**
```
https://your-app.railway.app
```

---

## 🎨 Step 10: Deploy Frontend

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=.
```

### Update API_BASE URLs

After deployment, update these files with your backend URL:

**index.html** (line ~490):
```javascript
const API_BASE = 'https://your-backend.railway.app/api';
```

**admin.html** (line ~460):
```javascript
const API_BASE = 'https://your-backend.railway.app/api';
```

**landing.html** (line ~450):
```javascript
const API_BASE = 'https://your-backend.railway.app/api';
```

Then redeploy:
```bash
vercel --prod
```

---

## ✅ Step 11: Test Everything

### Test Minting Flow

1. **Open your frontend:**
   ```
   https://your-site.vercel.app
   ```

2. **Connect Farcaster:**
   - Click "Connect Farcaster"
   - Authenticate

3. **Check Eligibility:**
   - Should show your FID
   - Should show if you're eligible
   - Should show correct price

4. **Transform PFP:**
   - Click "Transform"
   - Wait for AI to generate
   - Preview should show

5. **Mint NFT:**
   - Click "Mint NFT"
   - Approve MetaMask transaction
   - Wait for confirmation

6. **Verify:**
   - Check on Basescan
   - View on OpenSea
   - Confirm 6.66% royalties showing

### Test Admin Dashboard

1. **Open admin dashboard:**
   ```
   https://your-site.vercel.app/admin.html
   ```

2. **Test parameter updates:**
   - Change FID range
   - Update prices
   - Pause/unpause
   - Update royalties

3. **Verify changes:**
   - Check on frontend
   - Try test mint with new params

---

## 🎛️ Step 12: Configure Parameters

### Initial Launch Settings (Recommended)

```javascript
// Early adopters only
FID Range: 1 - 10,000
Base Price: 0.001 ETH
Pro Price: 0.0005 ETH
Max Supply: 10,000

// Royalties
Royalty Rate: 6.66%
Royalty Receiver: Your treasury wallet
```

### Via Admin Dashboard:
1. Open admin.html
2. Update fields
3. Click "Update Parameters"
4. Confirm in MetaMask

---

## 📊 Step 13: Set Up Monitoring

### Add Analytics

**Google Analytics** (index.html):
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

**Mixpanel** (server.js):
```javascript
const mixpanel = require('mixpanel').init('YOUR_TOKEN');
```

### Set Up Alerts

**Discord Webhook for Mints:**
```javascript
// In server.js after successful mint
await axios.post('YOUR_DISCORD_WEBHOOK', {
  content: `🎉 New mint! FID ${fid} minted CyberProfile #${tokenId}`
});
```

---

## 🎨 Step 14: Customize (Optional)

### Change AI Style

**server.js** (line ~100):
```javascript
prompt: "YOUR CUSTOM STYLE HERE"
```

Try:
- "vaporwave aesthetic portrait"
- "steampunk portrait"
- "fantasy magical portrait"

### Change Colors

**index.html, admin.html, landing.html**:
```css
--primary: #00ff9f;    /* Neon green */
--secondary: #ff00ff;  /* Magenta */
--accent: #00b8ff;     /* Cyan */
```

### Update Branding

- Replace logo images
- Update project name
- Change social links

---

## 🚀 Step 15: Launch Marketing

### Pre-Launch (1 Week Before)

```
✅ Post teasers on Warpcast
✅ Share preview images
✅ Announce launch date/time
✅ Build waitlist
✅ Partner with Farcaster influencers
```

### Launch Day

```
✅ Post on Warpcast announcing live
✅ Share first mints
✅ Engage with community
✅ Monitor admin dashboard
✅ Be ready to adjust parameters
```

### Post-Launch

```
✅ Share gallery of mints
✅ Highlight cool transformations
✅ Run giveaways
✅ Gather feedback
✅ Plan future features
```

---

## 🐛 Troubleshooting

### "Invalid signature" Error
**Fix:** Check NEYNAR_API_KEY in .env

### "Transformation failed" Error
**Fix:** 
- Verify REPLICATE_API_TOKEN
- Check Replicate credits
- Try different AI model

### "IPFS upload failed" Error
**Fix:**
- Check PINATA credentials
- Verify file size < 100MB
- Check Pinata storage quota

### "Transaction reverted" Error
**Fix:**
- Check FID eligibility (in range?)
- Verify correct mint price sent
- Ensure supply not exhausted
- Check contract not paused

### Contract not found
**Fix:**
- Update CONTRACT_ADDRESS in frontend
- Verify contract deployed
- Check network (mainnet vs testnet)

### Backend connection failed
**Fix:**
- Verify API_BASE URL
- Check backend is running
- Review CORS settings
- Check environment variables

---

## 📱 Step 16: Mobile Testing

Test on mobile devices:
- iPhone Safari
- Android Chrome
- Farcaster mobile app

Common mobile issues:
- Wallet connection
- Image transformation display
- Form submissions

---

## 🔐 Security Checklist

Before going live:

```
✅ .env file not committed to git
✅ Private keys stored securely
✅ Contract verified on Basescan
✅ Admin endpoints secured
✅ Rate limiting enabled
✅ CORS configured correctly
✅ SSL certificate active
✅ Backup .env file saved offline
✅ Treasury wallet secured
✅ Test transactions completed
```

---

## 💰 Cost Breakdown

**Initial Setup:**
- Contract deployment: ~$2-5 (Base)
- Test mints: ~$0.50
- Total: ~$5-10

**Ongoing:**
- AI generations: ~$0.01-0.05 per image
- IPFS storage: Free (Pinata has generous limits)
- Hosting: Free (Vercel/Netlify)
- Backend: $5-10/month (Railway)

**Revenue:**
- Primary sales: Keep 100%
- Secondary sales: 6.66% royalties forever

---

## 📈 Success Metrics

**Week 1 Goals:**
- 100+ mints
- Active community
- Zero failed transactions
- Positive feedback

**Month 1 Goals:**
- 1000+ mints
- Secondary sales happening
- Partnership formed
- Feature requests coming

**Long Term:**
- Full collection minted
- Active trading
- Strong community
- Roadmap expanding

---

## 🎯 Next Steps After Launch

1. **Community Building**
   - Create Discord server
   - Regular updates on Warpcast
   - Holder benefits
   - Community proposals

2. **Feature Additions**
   - Gallery page
   - Rarity traits
   - Staking/rewards
   - Gamification

3. **Marketing**
   - Influencer partnerships
   - Giveaways
   - Featured on NFT platforms
   - Press coverage

4. **Expansion**
   - Additional collections
   - Collaborations
   - Metaverse integration
   - Utility expansion

---

## 🆘 Getting Help

**Documentation:**
- Full README: See ARTIFACT_README.md
- Quick Reference: QUICK_REFERENCE.md
- Project Overview: PROJECT_OVERVIEW.md

**Support Channels:**
- GitHub Issues
- Discord community
- Warpcast @cyberprofile
- Email: support@cyberprofile.io

**Resources:**
- Base docs: https://docs.base.org
- Neynar docs: https://docs.neynar.com
- Replicate docs: https://replicate.com/docs
- Hardhat docs: https://hardhat.org/docs

---

## ✨ Final Checklist

Before announcing your launch:

```
✅ Smart contract deployed and verified
✅ Royalties set to 6.66%
✅ Frontend live and tested
✅ Backend running and responding
✅ Admin dashboard accessible
✅ Test mint completed successfully
✅ Parameters configured correctly
✅ Monitoring/analytics set up
✅ Marketing materials ready
✅ Social media accounts created
✅ Support channels established
✅ Team briefed and ready
✅ Backup plans in place
✅ Legal/compliance reviewed
✅ Budget allocated
```

---

## 🎊 You're Ready to Launch!

Congratulations! You now have a **professional, production-ready NFT minting platform** with:

✅ Dynamic FID-based eligibility
✅ Pro user discounts
✅ 6.66% secondary royalties
✅ AI-powered transformations
✅ Real-time admin control
✅ Beautiful UX
✅ Viral marketing features

**Time to make some badass cyberpunk art!** 🤖✨

---

## 📞 Emergency Contacts

If something goes wrong:

1. **Pause minting immediately** (admin dashboard)
2. **Check logs** (Railway/Heroku dashboard)
3. **Verify contract state** (Basescan)
4. **Contact support** (Discord/Email)
5. **Communicate with community** (Warpcast)

---

**Built with ❤️ for the Farcaster community**

**Good luck with your launch! 🚀**

# ⚡ CyberProfile - Quick Start Guide (15 Minutes)

## 🎯 What You're Building

A Farcaster NFT minting app where users transform their profile pics into cyberpunk art. You control who can mint via FID ranges, pricing, and more. **6.66% royalties on all secondary sales.**

---

## 🚀 Speed Run Setup

### 1. Get API Keys (5 min)

```
Neynar:    https://neynar.com  → API Keys
Replicate: https://replicate.com → Account → API Tokens
Pinata:    https://pinata.cloud → API Keys → New Key
```

### 2. Clone & Install (2 min)

```bash
git clone YOUR_REPO
cd cyberpunk-pfp-minter
npm install
cp .env.example .env
# Edit .env with your keys
```

### 3. Deploy Contract (3 min)

```bash
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network base
# Copy contract address
```

### 4. Update Contract Address (1 min)

```bash
# Update in .env
CONTRACT_ADDRESS=0x...

# Update in index.html (line ~500)
const CONTRACT_ADDRESS = '0x...';

# Update in admin.html (line ~460)  
const CONTRACT_ADDRESS = '0x...';
```

### 5. Deploy Backend (2 min)

```bash
# Railway
npm install -g @railway/cli
railway login
railway init
railway up
# Copy backend URL
```

### 6. Deploy Frontend (2 min)

```bash
# Update API_BASE in all HTML files
const API_BASE = 'https://your-backend.railway.app/api';

# Vercel
npm install -g vercel
vercel --prod
# Copy frontend URL
```

---

## ✅ You're Live!

**Frontend:** `https://your-site.vercel.app`
**Admin:** `https://your-site.vercel.app/admin.html`
**Backend:** `https://your-backend.railway.app`

---

## 🎛️ Essential Commands

### Update Parameters
```bash
# Via Admin Dashboard (easiest)
Open: https://your-site.vercel.app/admin.html

# Via API
curl -X POST https://your-backend/api/admin/update-parameters \
  -H "Content-Type: application/json" \
  -d '{"minFid": 1, "maxFid": 50000}'
```

### Quick Actions
- **Early Adopters**: FID 1-10,000
- **Pro Only**: High base price, low pro price
- **Half Price**: 50% off everything
- **Emergency Pause**: Stop all minting

---

## 🎨 Recommended Launch Settings

```javascript
// Week 1: Early adopters
FID Range: 1-10,000
Base Price: 0.001 ETH
Pro Price: 0.0005 ETH
Max Supply: 10,000
Royalty: 6.66%

// Week 2: Expand
FID Range: 1-50,000
Base Price: 0.002 ETH
Pro Price: 0.001 ETH

// Week 3+: Open to all
FID Range: 1-999,999
Base Price: 0.003 ETH
Pro Price: 0.0015 ETH
```

---

## 🐛 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| "Invalid signature" | Check NEYNAR_API_KEY |
| "Transform failed" | Check REPLICATE_API_TOKEN + credits |
| "IPFS failed" | Check PINATA keys |
| "Transaction reverted" | Check FID range, price, supply |
| Can't connect | Update API_BASE URL in HTML |

---

## 📱 Test Checklist

```
✅ Visit frontend URL
✅ Connect Farcaster
✅ Transform PFP (wait ~30 sec)
✅ Mint NFT
✅ Verify on Basescan
✅ Check OpenSea for listing
✅ Confirm 6.66% royalty showing
✅ Open admin dashboard
✅ Update a parameter
✅ Test with new parameter
```

---

## 🔥 Marketing Checklist

```
✅ Post on Warpcast
✅ Share preview images
✅ Tag @farcaster
✅ Share first mints
✅ Engage with comments
✅ Run giveaway
✅ Partner with influencer
```

---

## 💰 Costs

- **Deploy**: ~$5 gas
- **Per mint**: ~$0.02 AI + gas
- **Hosting**: Free (Vercel)
- **Backend**: $5/mo (Railway)

**Revenue**: Keep 100% primary + 6.66% secondary forever

---

## 📞 Need Help?

- **Docs**: ARTIFACT_DEPLOYMENT_GUIDE.md (full guide)
- **Docs**: ARTIFACT_README.md (complete docs)
- **Docs**: QUICK_REFERENCE.md (commands)

---

## 🎯 One-Liners

**Deploy everything:**
```bash
cp .env.example .env && nano .env && npm install && npx hardhat run scripts/deploy.js --network base && railway up && vercel --prod
```

**Update parameters:**
```bash
# Open admin dashboard
open https://your-site.vercel.app/admin.html
```

**Emergency pause:**
```bash
curl -X POST https://your-backend/api/admin/update-parameters -d '{"paused":true}'
```

---

## ✨ You're Live! Now What?

1. **Test mint yourself**
2. **Share on Warpcast**
3. **Monitor admin dashboard**
4. **Adjust parameters as needed**
5. **Engage with minters**
6. **Build community**
7. **Plan roadmap**

---

**🤖 Transform Identity. Mint Future. Earn 6.66% Forever. 💎**

---

## 🎁 Pro Tips

1. Start with **small FID range** (1-10k)
2. Price **conservatively** at first
3. **Monitor closely** first 24h
4. Be **responsive** to feedback
5. **Engage** with every mint
6. **Adjust** parameters based on demand
7. **Share** best transformations
8. **Build** holder community
9. **Plan** roadmap early
10. **Have fun!** 🎉

---

**Time to make history on Farcaster! 🚀**

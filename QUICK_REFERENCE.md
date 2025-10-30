# 🚀 CyberProfile - Quick Reference

## ⚡ Most Common Commands

### Setup & Deployment
```bash
# First time setup
cp .env.example .env
# Edit .env with your keys
npm install
chmod +x deploy.sh
./deploy.sh

# Start server
npm start

# Run tests
npm test

# Deploy contract
npx hardhat run scripts/deploy.js --network base
```

### Parameter Updates (Via Admin Dashboard)

**Open**: `http://localhost:3000/admin.html`

**Quick Actions:**
- **Early Adopters**: Sets FID 1-10000
- **Pro Only**: High base price, low pro price
- **Open to All**: FID 1-999999
- **Half Price Sale**: 50% off everything
- **Emergency Pause**: Stops all minting

### Parameter Updates (Via API)

```bash
# Update FID range
curl -X POST http://localhost:3000/api/admin/update-parameters \
  -H "Content-Type: application/json" \
  -d '{"minFid": 1, "maxFid": 50000}'

# Update prices
curl -X POST http://localhost:3000/api/admin/update-parameters \
  -H "Content-Type: application/json" \
  -d '{"baseMintPrice": "0.003", "proMintPrice": "0.0015"}'

# Pause minting
curl -X POST http://localhost:3000/api/admin/update-parameters \
  -H "Content-Type: application/json" \
  -d '{"paused": true}'

# Update max supply
curl -X POST http://localhost:3000/api/admin/update-parameters \
  -H "Content-Type: application/json" \
  -d '{"maxSupply": 5000}'
```

### Parameter Updates (Via Smart Contract)

```javascript
// Using ethers.js
const contract = new ethers.Contract(contractAddress, abi, signer);

// Update FID range
await contract.updateFidRange(1, 50000);

// Update prices
await contract.updateMintPrices(
  ethers.utils.parseEther("0.003"),
  ethers.utils.parseEther("0.0015")
);

// Update all parameters
await contract.updateMintingParams(
  1,                                      // minFid
  100000,                                 // maxFid
  ethers.utils.parseEther("0.003"),      // baseMintPrice
  ethers.utils.parseEther("0.0015"),     // proMintPrice
  10000                                   // maxSupply
);

// Pause/unpause
await contract.pause();
await contract.unpause();
```

## 📋 Launch Strategies

### Strategy 1: Tiered by FID
```javascript
// Week 1: Early adopters
minFid: 1, maxFid: 10000, basePrice: 0.001

// Week 2: Medium users  
minFid: 1, maxFid: 50000, basePrice: 0.002

// Week 3: Everyone
minFid: 1, maxFid: 999999, basePrice: 0.003
```

### Strategy 2: Pro Priority
```javascript
// Day 1-3: Pro users only (expensive for others)
basePrice: 0.01, proPrice: 0.001

// Day 4+: Everyone
basePrice: 0.002, proPrice: 0.001
```

### Strategy 3: Dutch Auction
```javascript
// Start high, decrease daily
Day 1: 0.01 ETH
Day 2: 0.008 ETH
Day 3: 0.006 ETH
Day 4: 0.004 ETH
Day 5: 0.002 ETH (final)
```

### Strategy 4: Flash Sales
```javascript
// Normal
basePrice: 0.003

// Flash sale (4 hours)
basePrice: 0.001

// Back to normal
basePrice: 0.003
```

## 🎯 Essential URLs

```
Frontend:      http://localhost:3000/index.html
Admin:         http://localhost:3000/admin.html
Landing:       http://localhost:3000/landing.html
API Base:      http://localhost:3000/api
Contract:      https://basescan.org/address/YOUR_ADDRESS
```

## 🔑 Environment Variables

**Required:**
```env
NEYNAR_API_KEY=xxx
REPLICATE_API_TOKEN=xxx
PINATA_API_KEY=xxx
PINATA_SECRET=xxx
PRIVATE_KEY=xxx
```

**Important:**
```env
CONTRACT_ADDRESS=0x...
TREASURY_ADDRESS=0x...
ORACLE_ADDRESS=0x...
```

**Optional:**
```env
PORT=3000
MIN_FID=1
MAX_FID=100000
BASE_MINT_PRICE=0.002
PRO_MINT_PRICE=0.001
MAX_SUPPLY=10000
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid signature" | Check NEYNAR_API_KEY |
| "Transformation failed" | Check REPLICATE_API_TOKEN |
| "IPFS upload failed" | Check PINATA credentials |
| "Transaction reverted" | Check FID eligibility, price, supply |
| Contract not found | Update CONTRACT_ADDRESS in frontend |
| Server won't start | Check PORT availability |

## 📊 Monitoring

```bash
# View server logs
tail -f logs/server.log

# Check contract events
npx hardhat console --network base
> const contract = await ethers.getContractAt("CyberProfile", "ADDRESS")
> const events = await contract.queryFilter("CyberProfileMinted")

# API health check
curl http://localhost:3000/api/parameters
```

## 🔄 Updates

```bash
# Update dependencies
npm update

# Redeploy contract (if needed)
npx hardhat run scripts/deploy.js --network base

# Restart server
pkill -f "node server.js"
npm start

# Clear cache
rm -rf cache/ artifacts/
npx hardhat clean
```

## 💡 Pro Tips

1. **Test on Sepolia first**: Use baseSepo to test before mainnet
2. **Start conservative**: Low FID range, higher prices initially
3. **Monitor gas**: Adjust during low-traffic times
4. **Backup .env**: Store securely, never commit
5. **Use admin dashboard**: Easier than CLI for most operations
6. **Set alerts**: Monitor when supply hits milestones
7. **Prepare marketing**: Have content ready before launch
8. **Engage community**: Respond to questions quickly

## 📈 Key Metrics to Watch

- **Mint rate**: How fast are people minting?
- **Pro ratio**: What % are Pro users?
- **Average price**: Track actual paid amounts
- **FID distribution**: Which FID ranges are most active?
- **Failure rate**: Monitor failed transactions
- **Gas costs**: Track ETH spent on gas

## 🎨 Customization Shortcuts

**Change AI style** → `server.js` line ~100
**Change colors** → `index.html` CSS variables
**Change prices** → Admin dashboard
**Change supply** → Admin dashboard
**Add features** → Modular codebase, easy to extend

## 🚨 Emergency Procedures

**If something goes wrong:**

1. **Pause minting immediately**
   ```bash
   curl -X POST http://localhost:3000/api/admin/update-parameters \
     -d '{"paused": true}'
   ```

2. **Check logs**
   ```bash
   tail -100 logs/server.log
   ```

3. **Verify contract state**
   ```javascript
   const params = await contract.getMintingParams()
   console.log(params)
   ```

4. **Contact support channels**
   - Discord
   - Twitter
   - Email admin

## 📞 Support Resources

- **Documentation**: README.md (comprehensive)
- **Examples**: test/ directory (working examples)
- **Community**: Discord/Warpcast
- **Issues**: GitHub issues
- **Direct**: Email support

## ✅ Pre-Launch Checklist

- [ ] All API keys configured
- [ ] Contract deployed and verified
- [ ] Frontend deployed
- [ ] Backend deployed
- [ ] Admin dashboard accessible
- [ ] Test mint completed
- [ ] Parameters set correctly
- [ ] Marketing ready
- [ ] Community channels active
- [ ] Support team briefed
- [ ] Backup plans ready
- [ ] Monitoring setup

## 🎯 Success Metrics

**Day 1 Goals:**
- 100 mints
- 50% Pro users
- Zero failed transactions
- Positive community feedback

**Week 1 Goals:**
- 1000 mints (10% of supply)
- Strong social media presence
- Gallery of best transformations
- Partnerships forming

**Month 1 Goals:**
- 50%+ of supply minted
- Secondary market activity
- Community proposals
- Feature requests flowing

---

## 🔥 One-Liner Deploy

```bash
cp .env.example .env && nano .env && npm install && ./deploy.sh
```

## 🚀 One-Liner Launch

```bash
npm start & open http://localhost:3000/landing.html
```

**That's it! You're ready to launch the sickest cyberpunk PFP project on Farcaster! 🤖✨**

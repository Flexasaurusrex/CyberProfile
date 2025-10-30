# 📁 CyberProfile - GitHub Repository Structure

## 🎯 How to Organize Your Repository

This guide shows exactly how to structure your GitHub repo for deployment.

---

## 📂 Complete Directory Structure

```
cyberpunk-pfp-minter/
│
├── 📄 README.md                    # Project overview
├── 📄 LICENSE                      # MIT License
├── 📄 .gitignore                   # Git ignore rules
├── 📄 package.json                 # Dependencies
├── 📄 hardhat.config.js            # Hardhat config
├── 📄 .env.example                 # Environment template
├── 📄 .env                         # Your secrets (NOT committed)
├── 📄 deploy.sh                    # Deployment script
│
├── 📄 index.html                   # Main minting page
├── 📄 admin.html                   # Admin dashboard
├── 📄 landing.html                 # Marketing page
├── 📄 server.js                    # Backend API
├── 📄 frame.config.json            # Farcaster Frame config
│
├── 📁 contracts/
│   └── 📄 CyberProfile.sol         # Smart contract
│
├── 📁 scripts/
│   └── 📄 deploy.js                # Deployment script
│
├── 📁 test/
│   └── 📄 CyberProfile.test.js     # Contract tests
│
├── 📁 docs/                        # Documentation
│   ├── 📄 DEPLOYMENT_GUIDE.md
│   ├── 📄 QUICKSTART.md
│   ├── 📄 PROJECT_OVERVIEW.md
│   └── 📄 QUICK_REFERENCE.md
│
├── 📁 public/                      # Static assets
│   ├── 📁 images/
│   ├── 📁 icons/
│   └── 📁 fonts/
│
├── 📁 cache/                       # Hardhat cache (gitignored)
├── 📁 artifacts/                   # Compiled contracts (gitignored)
└── 📁 node_modules/                # Dependencies (gitignored)
```

---

## 🚀 Setup Instructions

### Step 1: Create GitHub Repository

```bash
# On GitHub.com
1. Click "New Repository"
2. Name: cyberpunk-pfp-minter
3. Description: "Farcaster NFT minting with dynamic parameters"
4. Public or Private
5. Don't initialize with README
6. Create repository
```

### Step 2: Clone and Setup Locally

```bash
# Clone your empty repo
git clone https://github.com/yourusername/cyberpunk-pfp-minter.git
cd cyberpunk-pfp-minter

# Initialize structure
mkdir contracts scripts test docs public
mkdir public/images public/icons public/fonts
```

### Step 3: Copy ARTIFACT Files

```bash
# Copy and rename all ARTIFACT_* files
# Remove "ARTIFACT_" prefix from names

# Example:
ARTIFACT_CyberProfile.sol → contracts/CyberProfile.sol
ARTIFACT_index.html → index.html
ARTIFACT_server.js → server.js
ARTIFACT_deploy.js → scripts/deploy.js
ARTIFACT_package.json → package.json
ARTIFACT_README.md → README.md
ARTIFACT_.env.example → .env.example
ARTIFACT_hardhat.config.js → hardhat.config.js
ARTIFACT_deploy.sh → deploy.sh
ARTIFACT_admin.html → admin.html
ARTIFACT_landing.html → landing.html

# Copy docs
ARTIFACT_DEPLOYMENT_GUIDE.md → docs/DEPLOYMENT_GUIDE.md
ARTIFACT_QUICKSTART.md → docs/QUICKSTART.md
ARTIFACT_PROJECT_OVERVIEW.md → docs/PROJECT_OVERVIEW.md
ARTIFACT_QUICK_REFERENCE.md → docs/QUICK_REFERENCE.md
```

### Step 4: Create .gitignore

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json

# Environment
.env
.env.local
.env.production

# Hardhat
artifacts/
cache/
coverage/
typechain/
typechain-types/

# Build
dist/
build/

# IDE
.vscode/
.idea/
*.swp
.DS_Store

# Logs
*.log
logs/

# Temporary
tmp/
temp/
.tmp/

# Secrets
*.key
*.pem
secrets/
EOF
```

### Step 5: Initial Commit

```bash
# Stage all files
git add .

# Commit
git commit -m "🚀 Initial commit: CyberProfile NFT platform

- Smart contract with 6.66% royalties
- Dynamic FID-based parameters
- Farcaster integration
- AI transformation pipeline
- Admin dashboard
- Complete documentation"

# Push to GitHub
git push origin main
```

---

## 📝 Essential Files Explained

### Root Level Files

**README.md**
- Project overview
- Features list
- Quick start guide
- Links to detailed docs

**package.json**
- All dependencies
- Scripts for development
- Project metadata

**server.js**
- Express backend
- API routes
- Farcaster auth
- AI transformation
- IPFS upload

**hardhat.config.js**
- Network configuration
- Base mainnet/testnet
- Compiler settings

**.env.example**
- Template for environment variables
- Shows what keys are needed
- Safe to commit

**.env**
- Your actual API keys
- NEVER commit this!
- Add to .gitignore

**deploy.sh**
- Automated deployment
- Make executable: `chmod +x deploy.sh`

### Frontend Files

**index.html**
- Main minting interface
- Farcaster connection
- Transformation preview
- Mint button

**admin.html**
- Parameter control dashboard
- Live stats
- Quick actions
- Pro status management

**landing.html**
- Marketing page
- Feature highlights
- Gallery
- FAQ

### Smart Contract

**contracts/CyberProfile.sol**
- ERC-721 NFT
- Dynamic parameters
- 6.66% royalties (EIP-2981)
- FID-based eligibility
- Pro user discounts

### Scripts

**scripts/deploy.js**
- Hardhat deployment script
- Network detection
- Parameter setting
- Contract verification

### Tests

**test/CyberProfile.test.js**
- Complete test suite
- 25+ test cases
- Parameter validation
- Security checks

### Documentation

**docs/DEPLOYMENT_GUIDE.md**
- Full deployment walkthrough
- Step-by-step instructions
- Troubleshooting

**docs/QUICKSTART.md**
- 15-minute setup
- Essential commands
- Quick reference

**docs/PROJECT_OVERVIEW.md**
- Architecture explanation
- Feature deep-dive
- Use cases

**docs/QUICK_REFERENCE.md**
- Command cheat sheet
- Common operations
- API examples

---

## 🔒 Security: What NOT to Commit

### Always in .gitignore

```
.env                    # Your API keys
.env.local              # Local environment
.env.production         # Production secrets
node_modules/           # Dependencies
*.key                   # Private keys
*.pem                   # Certificates
secrets/                # Any secrets folder
```

### Safe to Commit

```
.env.example            # Template (no real keys)
README.md               # Documentation
package.json            # Dependencies list
*.sol                   # Smart contracts
*.js                    # Source code
*.html                  # Frontend
*.md                    # Documentation
```

---

## 📋 GitHub Repository Settings

### Enable Features

```
✅ Issues - For bug reports
✅ Wiki - For extended docs
✅ Discussions - For community
✅ Projects - For roadmap
✅ Actions - For CI/CD (optional)
```

### Add Topics

```
farcaster
nft
ethereum
base
web3
smart-contracts
ai-generated
cyberpunk
erc721
blockchain
```

### Branch Protection

```
Main Branch Rules:
✅ Require pull request reviews
✅ Require status checks to pass
✅ Require conversation resolution
✅ Require signed commits (optional)
```

---

## 🏷️ Version Tagging

### Creating Releases

```bash
# Tag version
git tag -a v1.0.0 -m "🚀 Initial release"
git push origin v1.0.0

# Create release on GitHub
1. Go to "Releases"
2. Click "Draft a new release"
3. Choose tag v1.0.0
4. Add release notes
5. Publish release
```

### Semantic Versioning

```
v1.0.0 - Initial release
v1.0.1 - Bug fixes
v1.1.0 - New features
v2.0.0 - Breaking changes
```

---

## 📚 Additional Files to Add

### LICENSE

```bash
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2025 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
```

### CONTRIBUTING.md

```markdown
# Contributing to CyberProfile

## How to Contribute

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## Code Standards

- Use ESLint for JavaScript
- Follow Solidity style guide
- Add tests for new features
- Update documentation

## Reporting Bugs

Use GitHub Issues with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
```

### CHANGELOG.md

```markdown
# Changelog

## [1.0.0] - 2025-01-15

### Added
- Initial release
- Smart contract with 6.66% royalties
- Dynamic FID-based parameters
- Farcaster integration
- AI transformation
- Admin dashboard

### Security
- Rate limiting
- Input validation
- Reentrancy guards
```

---

## 🔄 Keeping Repository Updated

### Regular Maintenance

```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit
npm audit fix

# Update documentation
# Keep README current
# Update CHANGELOG for each release
# Add new docs as needed

# Commit updates
git add .
git commit -m "📦 Update dependencies"
git push
```

### Semantic Commit Messages

```
🚀 feat: Add new feature
🐛 fix: Fix bug
📝 docs: Update documentation
🎨 style: Format code
♻️ refactor: Refactor code
✅ test: Add tests
🔧 chore: Update config
🔒 security: Security fix
⚡ perf: Performance improvement
```

---

## 🌟 Repository Badges

Add to README.md:

```markdown
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Solidity](https://img.shields.io/badge/solidity-0.8.20-purple.svg)
![Base](https://img.shields.io/badge/chain-Base-blue.svg)
```

---

## ✅ Pre-Push Checklist

Before pushing to GitHub:

```
✅ Remove any .env files
✅ Check .gitignore includes secrets
✅ No console.log() in production code
✅ Tests passing
✅ Code formatted
✅ README updated
✅ No hardcoded keys/addresses
✅ License file present
✅ Documentation current
```

---

## 🎯 Quick Commands

```bash
# Clone repo
git clone https://github.com/yourusername/cyberpunk-pfp-minter.git

# Create branch
git checkout -b feature/new-feature

# Stage changes
git add .

# Commit
git commit -m "Add new feature"

# Push
git push origin feature/new-feature

# Pull latest
git pull origin main

# View status
git status

# View history
git log --oneline
```

---

## 📞 Need Help?

- **GitHub Docs**: https://docs.github.com
- **Git Tutorial**: https://git-scm.com/docs
- **Best Practices**: https://github.com/github/gitignore

---

**Your repository is now professionally organized and ready for deployment! 🚀**

#!/bin/bash

# CyberProfile - One-Click Deployment Script
# This script automates the entire deployment process

set -e  # Exit on error

echo "🤖 ============================================"
echo "   CYBERPROFILE DEPLOYMENT SCRIPT"
echo "============================================ 🤖"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please copy .env.example to .env and configure it first."
    echo ""
    echo "Run: cp .env.example .env"
    echo "Then edit .env with your API keys and configuration"
    exit 1
fi

# Source environment variables
set -a
source .env
set +a

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  Network: ${NETWORK:-base}"
echo "  Treasury: ${TREASURY_ADDRESS}"
echo "  Min FID: ${MIN_FID}"
echo "  Max FID: ${MAX_FID}"
echo "  Base Price: ${BASE_MINT_PRICE} ETH"
echo "  Pro Price: ${PRO_MINT_PRICE} ETH"
echo ""

# Step 1: Install dependencies
echo -e "${YELLOW}📦 Step 1: Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
echo ""

# Step 2: Compile contracts
echo -e "${YELLOW}🔨 Step 2: Compiling smart contracts...${NC}"
npx hardhat compile
echo -e "${GREEN}✅ Contracts compiled${NC}"
echo ""

# Step 3: Run tests
echo -e "${YELLOW}🧪 Step 3: Running tests...${NC}"
read -p "Run tests before deployment? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx hardhat test
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed${NC}"
    else
        echo -e "${RED}❌ Tests failed. Deployment aborted.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Skipping tests${NC}"
fi
echo ""

# Step 4: Deploy contract
echo -e "${YELLOW}🚀 Step 4: Deploying smart contract...${NC}"
echo "Network: ${NETWORK:-base}"
echo ""
read -p "Proceed with deployment? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.js --network ${NETWORK:-base})
    echo "$DEPLOY_OUTPUT"
    
    # Extract contract address from output
    CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -oP 'deployed to: \K[0-9a-fA-Fx]+' | tail -1)
    
    if [ ! -z "$CONTRACT_ADDRESS" ]; then
        echo -e "${GREEN}✅ Contract deployed to: $CONTRACT_ADDRESS${NC}"
        
        # Update .env file
        if grep -q "^CONTRACT_ADDRESS=" .env; then
            sed -i.bak "s|^CONTRACT_ADDRESS=.*|CONTRACT_ADDRESS=$CONTRACT_ADDRESS|" .env
            echo -e "${GREEN}✅ Updated CONTRACT_ADDRESS in .env${NC}"
        else
            echo "CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env
            echo -e "${GREEN}✅ Added CONTRACT_ADDRESS to .env${NC}"
        fi
    else
        echo -e "${RED}❌ Could not extract contract address${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Deployment cancelled${NC}"
    exit 0
fi
echo ""

# Step 5: Verify contract
echo -e "${YELLOW}🔐 Step 5: Verifying contract on Basescan...${NC}"
if [ ! -z "$BASESCAN_API_KEY" ]; then
    read -p "Verify contract now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sleep 10  # Wait for contract to be indexed
        npx hardhat verify --network ${NETWORK:-base} \
            $CONTRACT_ADDRESS \
            "$TREASURY_ADDRESS" \
            "$ORACLE_ADDRESS" \
            $MIN_FID \
            $MAX_FID \
            "$(node -e "console.log(require('ethers').utils.parseEther('$BASE_MINT_PRICE').toString())")" \
            "$(node -e "console.log(require('ethers').utils.parseEther('$PRO_MINT_PRICE').toString())")" \
            $MAX_SUPPLY
        echo -e "${GREEN}✅ Contract verified${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No Basescan API key found. Skipping verification.${NC}"
fi
echo ""

# Step 6: Update frontend
echo -e "${YELLOW}🎨 Step 6: Updating frontend configuration...${NC}"
sed -i.bak "s|CONTRACT_ADDRESS = '.*'|CONTRACT_ADDRESS = '$CONTRACT_ADDRESS'|" index.html
sed -i.bak "s|CONTRACT_ADDRESS = '.*'|CONTRACT_ADDRESS = '$CONTRACT_ADDRESS'|" admin.html
echo -e "${GREEN}✅ Frontend updated with contract address${NC}"
echo ""

# Step 7: Start backend server
echo -e "${YELLOW}🖥️  Step 7: Backend server setup${NC}"
read -p "Start backend server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Starting server...${NC}"
    npm start &
    SERVER_PID=$!
    echo -e "${GREEN}✅ Server started (PID: $SERVER_PID)${NC}"
    echo "Server running at http://localhost:${PORT:-3000}"
    echo ""
    echo "To stop the server later, run: kill $SERVER_PID"
else
    echo -e "${YELLOW}⚠️  Start server manually with: npm start${NC}"
fi
echo ""

# Step 8: Deployment summary
echo -e "${GREEN}🎉 ============================================${NC}"
echo -e "${GREEN}   DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}============================================ 🎉${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo "  Contract Address: $CONTRACT_ADDRESS"
echo "  Network: ${NETWORK:-base}"
echo "  Explorer: https://basescan.org/address/$CONTRACT_ADDRESS"
echo "  Frontend: index.html"
echo "  Admin Dashboard: admin.html"
echo "  Backend: http://localhost:${PORT:-3000}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "  1. Deploy frontend to hosting (Vercel/Netlify)"
echo "  2. Deploy backend to production server"
echo "  3. Update API_BASE URLs in frontend files"
echo "  4. Configure CORS origins"
echo "  5. Set up domain and SSL"
echo "  6. Test minting functionality"
echo "  7. Launch marketing campaign!"
echo ""
echo -e "${BLUE}🔗 Useful Commands:${NC}"
echo "  View logs: tail -f logs/server.log"
echo "  Stop server: pkill -f 'node server.js'"
echo "  Run tests: npm test"
echo "  Update parameters: Open admin.html"
echo ""
echo -e "${GREEN}✨ Happy minting! ✨${NC}"

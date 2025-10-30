// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting CyberProfile NFT deployment...\n");

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

    // Deployment parameters
    const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS || deployer.address;
    const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS || deployer.address;
    
    // Initial minting parameters
    const MIN_FID = process.env.MIN_FID || 1;
    const MAX_FID = process.env.MAX_FID || 100000;
    const BASE_MINT_PRICE = ethers.utils.parseEther(process.env.BASE_MINT_PRICE || "0.002");
    const PRO_MINT_PRICE = ethers.utils.parseEther(process.env.PRO_MINT_PRICE || "0.001");
    const MAX_SUPPLY = process.env.MAX_SUPPLY || 10000;

    console.log("Deployment Configuration:");
    console.log("------------------------");
    console.log("Treasury Address:", TREASURY_ADDRESS);
    console.log("Oracle Address:", ORACLE_ADDRESS);
    console.log("Min FID:", MIN_FID);
    console.log("Max FID:", MAX_FID);
    console.log("Base Mint Price:", ethers.utils.formatEther(BASE_MINT_PRICE), "ETH");
    console.log("Pro Mint Price:", ethers.utils.formatEther(PRO_MINT_PRICE), "ETH");
    console.log("Max Supply:", MAX_SUPPLY);
    console.log("");

    // Deploy contract
    console.log("📦 Deploying CyberProfile contract...");
    const CyberProfile = await ethers.getContractFactory("CyberProfile");
    const cyberProfile = await CyberProfile.deploy(
        TREASURY_ADDRESS,
        ORACLE_ADDRESS,
        MIN_FID,
        MAX_FID,
        BASE_MINT_PRICE,
        PRO_MINT_PRICE,
        MAX_SUPPLY
    );

    await cyberProfile.deployed();

    console.log("✅ CyberProfile deployed to:", cyberProfile.address);
    console.log("");

    // Wait for a few block confirmations
    console.log("⏳ Waiting for block confirmations...");
    await cyberProfile.deployTransaction.wait(5);
    console.log("✅ Confirmed!\n");

    // Verify contract parameters
    console.log("🔍 Verifying deployment...");
    const mintingParams = await cyberProfile.getMintingParams();
    console.log("Contract Minting Parameters:");
    console.log("---------------------------");
    console.log("Min FID:", mintingParams.minFid.toString());
    console.log("Max FID:", mintingParams.maxFid.toString());
    console.log("Base Price:", ethers.utils.formatEther(mintingParams.baseMintPrice), "ETH");
    console.log("Pro Price:", ethers.utils.formatEther(mintingParams.proMintPrice), "ETH");
    console.log("Max Supply:", mintingParams.maxSupply.toString());
    console.log("Current Supply:", mintingParams.currentSupply.toString());
    console.log("");

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        contract: "CyberProfile",
        address: cyberProfile.address,
        deployer: deployer.address,
        treasury: TREASURY_ADDRESS,
        oracle: ORACLE_ADDRESS,
        parameters: {
            minFid: MIN_FID,
            maxFid: MAX_FID,
            baseMintPrice: ethers.utils.formatEther(BASE_MINT_PRICE),
            proMintPrice: ethers.utils.formatEther(PRO_MINT_PRICE),
            maxSupply: MAX_SUPPLY
        },
        timestamp: new Date().toISOString(),
        blockNumber: cyberProfile.deployTransaction.blockNumber
    };

    console.log("📝 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    console.log("");

    // Verification command
    console.log("🔐 To verify on Basescan, run:");
    console.log(`npx hardhat verify --network ${network.name} ${cyberProfile.address} "${TREASURY_ADDRESS}" "${ORACLE_ADDRESS}" ${MIN_FID} ${MAX_FID} "${BASE_MINT_PRICE}" "${PRO_MINT_PRICE}" ${MAX_SUPPLY}`);
    console.log("");

    console.log("✨ Deployment complete!");
    console.log("");
    console.log("📋 Next Steps:");
    console.log("1. Update CONTRACT_ADDRESS in your .env file");
    console.log("2. Update frontend with contract address");
    console.log("3. Fund treasury address for gas if needed");
    console.log("4. Set up oracle for Pro status updates");
    console.log("5. Test minting functionality");

    return cyberProfile;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

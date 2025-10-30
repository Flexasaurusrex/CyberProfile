// test/CyberProfile.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CyberProfile NFT Contract", function () {
    let cyberProfile;
    let owner, treasury, oracle, user1, user2, user3;
    let baseMintPrice, proMintPrice;

    const MIN_FID = 1;
    const MAX_FID = 100000;
    const MAX_SUPPLY = 10000;
    const TEST_TOKEN_URI = "ipfs://QmTest123";

    beforeEach(async function () {
        [owner, treasury, oracle, user1, user2, user3] = await ethers.getSigners();

        baseMintPrice = ethers.utils.parseEther("0.002");
        proMintPrice = ethers.utils.parseEther("0.001");

        const CyberProfile = await ethers.getContractFactory("CyberProfile");
        cyberProfile = await CyberProfile.deploy(
            treasury.address,
            oracle.address,
            MIN_FID,
            MAX_FID,
            baseMintPrice,
            proMintPrice,
            MAX_SUPPLY
        );
        await cyberProfile.deployed();
    });

    describe("Deployment", function () {
        it("Should set the correct initial parameters", async function () {
            const params = await cyberProfile.getMintingParams();
            expect(params.minFid).to.equal(MIN_FID);
            expect(params.maxFid).to.equal(MAX_FID);
            expect(params.baseMintPrice).to.equal(baseMintPrice);
            expect(params.proMintPrice).to.equal(proMintPrice);
            expect(params.maxSupply).to.equal(MAX_SUPPLY);
            expect(params.currentSupply).to.equal(0);
        });

        it("Should set the correct owner", async function () {
            expect(await cyberProfile.owner()).to.equal(owner.address);
        });

        it("Should set the correct treasury and oracle", async function () {
            expect(await cyberProfile.treasury()).to.equal(treasury.address);
            expect(await cyberProfile.oracle()).to.equal(oracle.address);
        });
    });

    describe("Minting", function () {
        it("Should mint successfully with base price for regular user", async function () {
            const fid = 12345;
            
            await expect(
                cyberProfile.connect(user1).mint(
                    user1.address,
                    TEST_TOKEN_URI,
                    fid,
                    { value: baseMintPrice }
                )
            ).to.emit(cyberProfile, "CyberProfileMinted")
                .withArgs(user1.address, 0, fid, false, baseMintPrice);

            expect(await cyberProfile.hasMinted(fid)).to.be.true;
            expect(await cyberProfile.ownerOf(0)).to.equal(user1.address);
        });

        it("Should mint with pro discount for pro user", async function () {
            const fid = 54321;
            
            // Set user as pro
            await cyberProfile.connect(oracle).updateProStatus(fid, true);
            expect(await cyberProfile.isProUser(fid)).to.be.true;

            await expect(
                cyberProfile.connect(user1).mint(
                    user1.address,
                    TEST_TOKEN_URI,
                    fid,
                    { value: proMintPrice }
                )
            ).to.emit(cyberProfile, "CyberProfileMinted")
                .withArgs(user1.address, 0, fid, true, proMintPrice);
        });

        it("Should reject mint with insufficient payment", async function () {
            const fid = 99999;
            const lowPrice = ethers.utils.parseEther("0.001");

            await expect(
                cyberProfile.connect(user1).mint(
                    user1.address,
                    TEST_TOKEN_URI,
                    fid,
                    { value: lowPrice }
                )
            ).to.be.revertedWith("Insufficient payment");
        });

        it("Should reject mint for FID below minimum", async function () {
            const fid = 0;

            await expect(
                cyberProfile.connect(user1).mint(
                    user1.address,
                    TEST_TOKEN_URI,
                    fid,
                    { value: baseMintPrice }
                )
            ).to.be.revertedWith("FID not in eligible range");
        });

        it("Should reject mint for FID above maximum", async function () {
            const fid = MAX_FID + 1;

            await expect(
                cyberProfile.connect(user1).mint(
                    user1.address,
                    TEST_TOKEN_URI,
                    fid,
                    { value: baseMintPrice }
                )
            ).to.be.revertedWith("FID not in eligible range");
        });

        it("Should reject duplicate mints from same FID", async function () {
            const fid = 12345;

            await cyberProfile.connect(user1).mint(
                user1.address,
                TEST_TOKEN_URI,
                fid,
                { value: baseMintPrice }
            );

            await expect(
                cyberProfile.connect(user2).mint(
                    user2.address,
                    TEST_TOKEN_URI,
                    fid,
                    { value: baseMintPrice }
                )
            ).to.be.revertedWith("FID has already minted");
        });

        it("Should transfer funds to treasury", async function () {
            const fid = 12345;
            const treasuryBalanceBefore = await ethers.provider.getBalance(treasury.address);

            await cyberProfile.connect(user1).mint(
                user1.address,
                TEST_TOKEN_URI,
                fid,
                { value: baseMintPrice }
            );

            const treasuryBalanceAfter = await ethers.provider.getBalance(treasury.address);
            expect(treasuryBalanceAfter.sub(treasuryBalanceBefore)).to.equal(baseMintPrice);
        });

        it("Should update current supply correctly", async function () {
            const fid1 = 1000;
            const fid2 = 2000;

            await cyberProfile.connect(user1).mint(
                user1.address,
                TEST_TOKEN_URI,
                fid1,
                { value: baseMintPrice }
            );

            let params = await cyberProfile.getMintingParams();
            expect(params.currentSupply).to.equal(1);

            await cyberProfile.connect(user2).mint(
                user2.address,
                TEST_TOKEN_URI,
                fid2,
                { value: baseMintPrice }
            );

            params = await cyberProfile.getMintingParams();
            expect(params.currentSupply).to.equal(2);
        });
    });

    describe("Parameter Updates", function () {
        it("Should allow owner to update FID range", async function () {
            const newMin = 5000;
            const newMax = 50000;

            await cyberProfile.updateFidRange(newMin, newMax);

            const params = await cyberProfile.getMintingParams();
            expect(params.minFid).to.equal(newMin);
            expect(params.maxFid).to.equal(newMax);
        });

        it("Should allow owner to update prices", async function () {
            const newBase = ethers.utils.parseEther("0.005");
            const newPro = ethers.utils.parseEther("0.0025");

            await cyberProfile.updateMintPrices(newBase, newPro);

            const params = await cyberProfile.getMintingParams();
            expect(params.baseMintPrice).to.equal(newBase);
            expect(params.proMintPrice).to.equal(newPro);
        });

        it("Should reject invalid price updates (pro > base)", async function () {
            const newBase = ethers.utils.parseEther("0.001");
            const newPro = ethers.utils.parseEther("0.002");

            await expect(
                cyberProfile.updateMintPrices(newBase, newPro)
            ).to.be.revertedWith("Pro price must be <= base price");
        });

        it("Should allow owner to update all parameters", async function () {
            const newMin = 10000;
            const newMax = 200000;
            const newBase = ethers.utils.parseEther("0.003");
            const newPro = ethers.utils.parseEther("0.0015");
            const newMaxSupply = 20000;

            await cyberProfile.updateMintingParams(
                newMin,
                newMax,
                newBase,
                newPro,
                newMaxSupply
            );

            const params = await cyberProfile.getMintingParams();
            expect(params.minFid).to.equal(newMin);
            expect(params.maxFid).to.equal(newMax);
            expect(params.baseMintPrice).to.equal(newBase);
            expect(params.proMintPrice).to.equal(newPro);
            expect(params.maxSupply).to.equal(newMaxSupply);
        });

        it("Should reject parameter updates from non-owner", async function () {
            await expect(
                cyberProfile.connect(user1).updateFidRange(1000, 5000)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Pro Status Management", function () {
        it("Should allow oracle to update pro status", async function () {
            const fid = 12345;

            await cyberProfile.connect(oracle).updateProStatus(fid, true);
            expect(await cyberProfile.isProUser(fid)).to.be.true;

            await cyberProfile.connect(oracle).updateProStatus(fid, false);
            expect(await cyberProfile.isProUser(fid)).to.be.false;
        });

        it("Should allow owner to update pro status", async function () {
            const fid = 54321;

            await cyberProfile.connect(owner).updateProStatus(fid, true);
            expect(await cyberProfile.isProUser(fid)).to.be.true;
        });

        it("Should reject pro status update from unauthorized user", async function () {
            const fid = 99999;

            await expect(
                cyberProfile.connect(user1).updateProStatus(fid, true)
            ).to.be.revertedWith("Not authorized");
        });

        it("Should batch update pro status", async function () {
            const fids = [100, 200, 300];
            const statuses = [true, true, false];

            await cyberProfile.connect(oracle).batchUpdateProStatus(fids, statuses);

            expect(await cyberProfile.isProUser(100)).to.be.true;
            expect(await cyberProfile.isProUser(200)).to.be.true;
            expect(await cyberProfile.isProUser(300)).to.be.false;
        });
    });

    describe("Eligibility Checks", function () {
        it("Should return correct eligibility status", async function () {
            const fid = 50000;
            expect(await cyberProfile.isEligible(fid)).to.be.true;

            // Mint
            await cyberProfile.connect(user1).mint(
                user1.address,
                TEST_TOKEN_URI,
                fid,
                { value: baseMintPrice }
            );

            // Should no longer be eligible
            expect(await cyberProfile.isEligible(fid)).to.be.false;
        });

        it("Should return false for out-of-range FID", async function () {
            expect(await cyberProfile.isEligible(0)).to.be.false;
            expect(await cyberProfile.isEligible(MAX_FID + 1)).to.be.false;
        });
    });

    describe("Pause Functionality", function () {
        it("Should allow owner to pause", async function () {
            await cyberProfile.pause();
            expect(await cyberProfile.paused()).to.be.true;
        });

        it("Should prevent minting when paused", async function () {
            await cyberProfile.pause();

            await expect(
                cyberProfile.connect(user1).mint(
                    user1.address,
                    TEST_TOKEN_URI,
                    12345,
                    { value: baseMintPrice }
                )
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should allow owner to unpause", async function () {
            await cyberProfile.pause();
            await cyberProfile.unpause();
            expect(await cyberProfile.paused()).to.be.false;
        });
    });

    describe("Batch Minting", function () {
        it("Should allow owner to batch mint", async function () {
            const recipients = [user1.address, user2.address, user3.address];
            const tokenURIs = [TEST_TOKEN_URI, TEST_TOKEN_URI, TEST_TOKEN_URI];
            const fids = [1000, 2000, 3000];

            await cyberProfile.batchMint(recipients, tokenURIs, fids);

            expect(await cyberProfile.ownerOf(0)).to.equal(user1.address);
            expect(await cyberProfile.ownerOf(1)).to.equal(user2.address);
            expect(await cyberProfile.ownerOf(2)).to.equal(user3.address);

            const params = await cyberProfile.getMintingParams();
            expect(params.currentSupply).to.equal(3);
        });

        it("Should reject batch mint from non-owner", async function () {
            const recipients = [user1.address];
            const tokenURIs = [TEST_TOKEN_URI];
            const fids = [1000];

            await expect(
                cyberProfile.connect(user1).batchMint(recipients, tokenURIs, fids)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Token URI and Metadata", function () {
        it("Should return correct token URI", async function () {
            const fid = 12345;

            await cyberProfile.connect(user1).mint(
                user1.address,
                TEST_TOKEN_URI,
                fid,
                { value: baseMintPrice }
            );

            expect(await cyberProfile.tokenURI(0)).to.equal(TEST_TOKEN_URI);
        });

        it("Should track FID to token mapping", async function () {
            const fid = 99999;

            await cyberProfile.connect(user1).mint(
                user1.address,
                TEST_TOKEN_URI,
                fid,
                { value: baseMintPrice }
            );

            expect(await cyberProfile.getTokenIdByFid(fid)).to.equal(0);
            expect(await cyberProfile.getFidByTokenId(0)).to.equal(fid);
        });
    });

    describe("Supply Management", function () {
        it("Should reject mint when max supply reached", async function () {
            // Set very low max supply for testing
            await cyberProfile.updateMintingParams(
                MIN_FID,
                MAX_FID,
                baseMintPrice,
                proMintPrice,
                1
            );

            // First mint should succeed
            await cyberProfile.connect(user1).mint(
                user1.address,
                TEST_TOKEN_URI,
                1000,
                { value: baseMintPrice }
            );

            // Second mint should fail
            await expect(
                cyberProfile.connect(user2).mint(
                    user2.address,
                    TEST_TOKEN_URI,
                    2000,
                    { value: baseMintPrice }
                )
            ).to.be.revertedWith("Max supply reached");
        });
    });

    describe("Administrative Functions", function () {
        it("Should allow owner to update treasury", async function () {
            await cyberProfile.updateTreasury(user1.address);
            expect(await cyberProfile.treasury()).to.equal(user1.address);
        });

        it("Should allow owner to update oracle", async function () {
            await cyberProfile.updateOracle(user1.address);
            expect(await cyberProfile.oracle()).to.equal(user1.address);
        });

        it("Should reject zero address for treasury", async function () {
            await expect(
                cyberProfile.updateTreasury(ethers.constants.AddressZero)
            ).to.be.revertedWith("Invalid treasury address");
        });

        it("Should reject zero address for oracle", async function () {
            await expect(
                cyberProfile.updateOracle(ethers.constants.AddressZero)
            ).to.be.revertedWith("Invalid oracle address");
        });
    });

    describe("Price Calculation", function () {
        it("Should return base price for non-pro user", async function () {
            const fid = 12345;
            const price = await cyberProfile.getMintPrice(fid, false);
            expect(price).to.equal(baseMintPrice);
        });

        it("Should return pro price for pro user", async function () {
            const fid = 54321;
            const price = await cyberProfile.getMintPrice(fid, true);
            expect(price).to.equal(proMintPrice);
        });
    });
});

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CyberProfile
 * @dev NFT contract for cyberpunk-transformed Farcaster profile pictures
 * Features dynamic minting parameters based on FID and Pro status
 * Includes EIP-2981 royalty standard with 6.66% default royalty
 */
contract CyberProfile is ERC721, ERC721URIStorage, ERC2981, Ownable, ReentrancyGuard, Pausable {
    
    // ===== STATE VARIABLES =====
    
    uint256 private _tokenIdCounter;
    
    // Minting parameters
    struct MintingParams {
        uint256 minFid;              // Minimum eligible FID
        uint256 maxFid;              // Maximum eligible FID
        uint256 baseMintPrice;       // Base minting price in wei
        uint256 proMintPrice;        // Pro user minting price in wei
        uint256 maxSupply;           // Maximum number of NFTs
        uint256 currentSupply;       // Current minted supply
        bool requireProForDiscount;  // Whether discount is Pro-only
    }
    
    MintingParams public mintingParams;
    
    // Mapping to track if a FID has already minted
    mapping(uint256 => bool) public hasMinted;
    
    // Mapping from FID to token ID
    mapping(uint256 => uint256) public fidToTokenId;
    
    // Mapping from token ID to FID
    mapping(uint256 => uint256) public tokenIdToFid;
    
    // Mapping to track Pro users (can be updated by oracle or owner)
    mapping(uint256 => bool) public isProUser;
    
    // Treasury address for collected funds
    address public treasury;
    
    // Oracle address that can update Pro status
    address public oracle;
    
    // Royalty configuration (default 6.66% = 666 basis points)
    address public royaltyReceiver;
    uint96 public royaltyBasisPoints = 666; // 6.66%
    
    // ===== EVENTS =====
    
    event CyberProfileMinted(
        address indexed minter,
        uint256 indexed tokenId,
        uint256 indexed fid,
        bool isPro,
        uint256 pricePaid
    );
    
    event MintingParamsUpdated(
        uint256 minFid,
        uint256 maxFid,
        uint256 baseMintPrice,
        uint256 proMintPrice,
        uint256 maxSupply
    );
    
    event ProStatusUpdated(uint256 indexed fid, bool isPro);
    event OracleUpdated(address indexed newOracle);
    event TreasuryUpdated(address indexed newTreasury);
    event RoyaltyUpdated(address indexed receiver, uint96 basisPoints);
    
    // ===== MODIFIERS =====
    
    modifier onlyOracle() {
        require(msg.sender == oracle || msg.sender == owner(), "Not authorized");
        _;
    }
    
    // ===== CONSTRUCTOR =====
    
    constructor(
        address _treasury,
        address _oracle,
        uint256 _minFid,
        uint256 _maxFid,
        uint256 _baseMintPrice,
        uint256 _proMintPrice,
        uint256 _maxSupply
    ) ERC721("CyberProfile", "CYBER") {
        require(_treasury != address(0), "Invalid treasury address");
        require(_baseMintPrice >= _proMintPrice, "Pro price must be <= base price");
        require(_maxSupply > 0, "Max supply must be > 0");
        
        treasury = _treasury;
        oracle = _oracle;
        royaltyReceiver = _treasury; // Default royalty receiver is treasury
        
        mintingParams = MintingParams({
            minFid: _minFid,
            maxFid: _maxFid,
            baseMintPrice: _baseMintPrice,
            proMintPrice: _proMintPrice,
            maxSupply: _maxSupply,
            currentSupply: 0,
            requireProForDiscount: true
        });
        
        // Set default royalty to 6.66% (666 basis points)
        _setDefaultRoyalty(royaltyReceiver, royaltyBasisPoints);
    }
    
    // ===== MINTING FUNCTIONS =====
    
    /**
     * @dev Mint a CyberProfile NFT
     * @param to Address to mint to
     * @param tokenURI IPFS URI for the token metadata
     * @param fid Farcaster ID of the user
     */
    function mint(
        address to,
        string memory tokenURI,
        uint256 fid
    ) external payable nonReentrant whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(!hasMinted[fid], "FID has already minted");
        require(fid >= mintingParams.minFid && fid <= mintingParams.maxFid, "FID not in eligible range");
        require(mintingParams.currentSupply < mintingParams.maxSupply, "Max supply reached");
        
        bool isPro = isProUser[fid];
        uint256 requiredPrice = getMintPrice(fid, isPro);
        require(msg.value >= requiredPrice, "Insufficient payment");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        hasMinted[fid] = true;
        fidToTokenId[fid] = tokenId;
        tokenIdToFid[tokenId] = fid;
        mintingParams.currentSupply++;
        
        // Transfer funds to treasury
        (bool success, ) = treasury.call{value: msg.value}("");
        require(success, "Transfer to treasury failed");
        
        emit CyberProfileMinted(to, tokenId, fid, isPro, msg.value);
    }
    
    /**
     * @dev Batch mint for multiple users (owner only)
     */
    function batchMint(
        address[] calldata recipients,
        string[] calldata tokenURIs,
        uint256[] calldata fids
    ) external onlyOwner {
        require(
            recipients.length == tokenURIs.length && recipients.length == fids.length,
            "Array lengths must match"
        );
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(!hasMinted[fids[i]], "FID already minted");
            require(mintingParams.currentSupply < mintingParams.maxSupply, "Max supply reached");
            
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            
            _safeMint(recipients[i], tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            
            hasMinted[fids[i]] = true;
            fidToTokenId[fids[i]] = tokenId;
            tokenIdToFid[tokenId] = fids[i];
            mintingParams.currentSupply++;
        }
    }
    
    // ===== VIEW FUNCTIONS =====
    
    /**
     * @dev Get the mint price for a specific FID
     */
    function getMintPrice(uint256 fid, bool isPro) public view returns (uint256) {
        if (isPro && mintingParams.requireProForDiscount) {
            return mintingParams.proMintPrice;
        }
        return mintingParams.baseMintPrice;
    }
    
    /**
     * @dev Check if a FID is eligible to mint
     */
    function isEligible(uint256 fid) public view returns (bool) {
        return !hasMinted[fid] &&
               fid >= mintingParams.minFid &&
               fid <= mintingParams.maxFid &&
               mintingParams.currentSupply < mintingParams.maxSupply &&
               !paused();
    }
    
    /**
     * @dev Get token ID for a specific FID
     */
    function getTokenIdByFid(uint256 fid) external view returns (uint256) {
        require(hasMinted[fid], "FID has not minted");
        return fidToTokenId[fid];
    }
    
    /**
     * @dev Get FID for a specific token ID
     */
    function getFidByTokenId(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return tokenIdToFid[tokenId];
    }
    
    /**
     * @dev Get all minting parameters
     */
    function getMintingParams() external view returns (MintingParams memory) {
        return mintingParams;
    }
    
    // ===== ADMIN FUNCTIONS =====
    
    /**
     * @dev Update minting parameters
     */
    function updateMintingParams(
        uint256 _minFid,
        uint256 _maxFid,
        uint256 _baseMintPrice,
        uint256 _proMintPrice,
        uint256 _maxSupply
    ) external onlyOwner {
        require(_baseMintPrice >= _proMintPrice, "Pro price must be <= base price");
        require(_maxSupply >= mintingParams.currentSupply, "Cannot set max supply below current supply");
        require(_maxFid >= _minFid, "Invalid FID range");
        
        mintingParams.minFid = _minFid;
        mintingParams.maxFid = _maxFid;
        mintingParams.baseMintPrice = _baseMintPrice;
        mintingParams.proMintPrice = _proMintPrice;
        mintingParams.maxSupply = _maxSupply;
        
        emit MintingParamsUpdated(_minFid, _maxFid, _baseMintPrice, _proMintPrice, _maxSupply);
    }
    
    /**
     * @dev Update FID range only
     */
    function updateFidRange(uint256 _minFid, uint256 _maxFid) external onlyOwner {
        require(_maxFid >= _minFid, "Invalid FID range");
        mintingParams.minFid = _minFid;
        mintingParams.maxFid = _maxFid;
    }
    
    /**
     * @dev Update mint prices
     */
    function updateMintPrices(uint256 _baseMintPrice, uint256 _proMintPrice) external onlyOwner {
        require(_baseMintPrice >= _proMintPrice, "Pro price must be <= base price");
        mintingParams.baseMintPrice = _baseMintPrice;
        mintingParams.proMintPrice = _proMintPrice;
    }
    
    /**
     * @dev Update Pro status for a FID (oracle or owner only)
     */
    function updateProStatus(uint256 fid, bool isPro) external onlyOracle {
        isProUser[fid] = isPro;
        emit ProStatusUpdated(fid, isPro);
    }
    
    /**
     * @dev Batch update Pro status
     */
    function batchUpdateProStatus(uint256[] calldata fids, bool[] calldata statuses) external onlyOracle {
        require(fids.length == statuses.length, "Array lengths must match");
        
        for (uint256 i = 0; i < fids.length; i++) {
            isProUser[fids[i]] = statuses[i];
            emit ProStatusUpdated(fids[i], statuses[i]);
        }
    }
    
    /**
     * @dev Toggle Pro discount requirement
     */
    function setRequireProForDiscount(bool required) external onlyOwner {
        mintingParams.requireProForDiscount = required;
    }
    
    /**
     * @dev Update oracle address
     */
    function updateOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        oracle = newOracle;
        emit OracleUpdated(newOracle);
    }
    
    /**
     * @dev Update treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }
    
    /**
     * @dev Update royalty configuration
     * @param receiver Address to receive royalties
     * @param basisPoints Royalty amount in basis points (100 = 1%, 666 = 6.66%)
     */
    function updateRoyalty(address receiver, uint96 basisPoints) external onlyOwner {
        require(receiver != address(0), "Invalid royalty receiver");
        require(basisPoints <= 1000, "Royalty too high (max 10%)");
        
        royaltyReceiver = receiver;
        royaltyBasisPoints = basisPoints;
        _setDefaultRoyalty(receiver, basisPoints);
        
        emit RoyaltyUpdated(receiver, basisPoints);
    }
    
    /**
     * @dev Get current royalty info
     */
    function getRoyaltyInfo() external view returns (address receiver, uint96 basisPoints) {
        return (royaltyReceiver, royaltyBasisPoints);
    }
    
    /**
     * @dev Pause minting
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause minting
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw (only if needed)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // ===== OVERRIDES =====
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        _resetTokenRoyalty(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

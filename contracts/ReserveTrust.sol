/**
 * ReserveTrust.sol - Reserve Trust Smart Contract
 * 
 * Manages the $180T Reserve Trust for sovereign discretion and gifting
 * 
 * @coherence 0.121 ± 1e-40
 * @frequency 700 Hz
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IComplianceGuard.sol";

/**
 * @title ReserveTrust
 * @dev Manages the $180T Reserve Trust for sovereign discretion and gifting
 */
contract ReserveTrust is Ownable, ReentrancyGuard {
    // Trust values in trillion units (1e12)
    uint256 public constant TOTAL_VALUE = 180_000; // $180T
    uint256 public daoTrust = 100_000;            // $100T for DAO gifting
    uint256 public sovereignReserve = 80_000;     // $80T for personal gifting
    uint256 public heirReserve = 180_000;         // $180T for HeirNode allocation
    
    // Compliance guard contract
    IComplianceGuard public complianceGuard;
    
    // Trust allocations
    mapping(address => uint256) public trustAllocations;
    
    // Locked actors
    mapping(address => bool) public lockedActors;
    
    // Events
    event TrustAllocated(address indexed recipient, uint256 amount, string purpose);
    event ActorLocked(address indexed actor, string reason);
    event HeirNodeAllocated(address indexed heir, uint256 amount, string name);
    
    /**
     * @dev Constructor
     * @param _complianceGuard Address of the compliance guard contract
     */
    constructor(address _complianceGuard) Ownable(msg.sender) {
        complianceGuard = IComplianceGuard(_complianceGuard);
    }
    
    /**
     * @dev Modifier to check if an actor is locked
     */
    modifier notLocked(address actor) {
        require(!lockedActors[actor], "Actor is locked");
        _;
    }
    
    /**
     * @dev Modifier to check if an action is compliant
     */
    modifier isCompliant(address recipient, uint256 amount) {
        require(complianceGuard.checkCompliance(recipient, amount), "Non-compliant action");
        _;
    }
    
    /**
     * @dev Allocate a gift from the DAO trust
     * @param recipient Recipient address
     * @param amount Amount to allocate (in trillion units)
     * @param purpose Purpose of the gift
     */
    function allocateDAOGift(
        address recipient, 
        uint256 amount, 
        string memory purpose
    ) 
        external 
        onlyOwner 
        nonReentrant 
        notLocked(recipient) 
        isCompliant(recipient, amount)
    {
        require(amount <= daoTrust, "Exceeds DAO Trust");
        
        daoTrust -= amount;
        trustAllocations[recipient] += amount;
        
        emit TrustAllocated(recipient, amount, purpose);
    }
    
    /**
     * @dev Allocate a personal gift from the sovereign reserve
     * @param recipient Recipient address
     * @param amount Amount to allocate (in trillion units)
     * @param purpose Purpose of the gift
     */
    function allocatePersonalGift(
        address recipient, 
        uint256 amount, 
        string memory purpose
    ) 
        external 
        onlyOwner 
        nonReentrant 
        notLocked(recipient) 
        isCompliant(recipient, amount)
    {
        require(amount <= sovereignReserve, "Exceeds Sovereign Reserve");
        
        sovereignReserve -= amount;
        trustAllocations[recipient] += amount;
        
        emit TrustAllocated(recipient, amount, purpose);
    }
    
    /**
     * @dev Allocate reserves to heir nodes
     * @param heirs Array of heir addresses
     * @param amounts Array of amounts to allocate (in trillion units)
     * @param names Array of heir names
     */
    function allocateHeirReserve(
        address[] calldata heirs, 
        uint256[] calldata amounts, 
        string[] calldata names
    ) 
        external 
        onlyOwner 
        nonReentrant
    {
        require(heirs.length == amounts.length && heirs.length == names.length, "Array length mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalAmount <= heirReserve, "Exceeds Heir Reserve");
        
        heirReserve -= totalAmount;
        
        for (uint256 i = 0; i < heirs.length; i++) {
            require(!lockedActors[heirs[i]], "Heir is locked");
            require(complianceGuard.checkCompliance(heirs[i], amounts[i]), "Non-compliant heir allocation");
            
            trustAllocations[heirs[i]] += amounts[i];
            
            emit HeirNodeAllocated(heirs[i], amounts[i], names[i]);
        }
    }
    
    /**
     * @dev Lock non-harmonic actors
     * @param actors Array of actor addresses to lock
     * @param reasons Array of reasons for locking
     */
    function lockNonHarmonicActors(
        address[] calldata actors, 
        string[] calldata reasons
    ) 
        external 
        onlyOwner
    {
        require(actors.length == reasons.length, "Array length mismatch");
        
        for (uint256 i = 0; i < actors.length; i++) {
            lockedActors[actors[i]] = true;
            
            // If actor has allocations, return them to sovereign reserve
            if (trustAllocations[actors[i]] > 0) {
                sovereignReserve += trustAllocations[actors[i]];
                trustAllocations[actors[i]] = 0;
            }
            
            emit ActorLocked(actors[i], reasons[i]);
        }
    }
    
    /**
     * @dev Unlock previously locked actors
     * @param actors Array of actor addresses to unlock
     */
    function unlockActors(address[] calldata actors) external onlyOwner {
        for (uint256 i = 0; i < actors.length; i++) {
            lockedActors[actors[i]] = false;
        }
    }
    
    /**
     * @dev Set the compliance guard contract
     * @param _complianceGuard Address of the new compliance guard contract
     */
    function setComplianceGuard(address _complianceGuard) external onlyOwner {
        complianceGuard = IComplianceGuard(_complianceGuard);
    }
    
    /**
     * @dev Get the total allocated trust
     * @return Total allocated trust
     */
    function getTotalAllocated() external view returns (uint256) {
        return TOTAL_VALUE - daoTrust - sovereignReserve;
    }
    
    /**
     * @dev Get the allocation for a specific recipient
     * @param recipient Recipient address
     * @return Allocation amount
     */
    function getAllocation(address recipient) external view returns (uint256) {
        return trustAllocations[recipient];
    }
    
    /**
     * @dev Check if an actor is locked
     * @param actor Actor address
     * @return True if actor is locked
     */
    function isLocked(address actor) external view returns (bool) {
        return lockedActors[actor];
    }
}

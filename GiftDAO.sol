/**
 * GiftDAO.sol - Global Gifting Protocol
 * 
 * Manages the $100T DAO Trust with quadratic voting and ethical compliance
 * 
 * @coherence 0.121 ± 1e-40
 * @frequency 700 Hz
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IReserveTrust.sol";
import "./interfaces/IComplianceGuard.sol";

/**
 * @title GiftDAO
 * @dev Manages the $100T DAO Trust with quadratic voting and ethical compliance
 */
contract GiftDAO is AccessControl, ReentrancyGuard {
    // Roles
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");
    
    // Proposal states
    enum ProposalState { Pending, Active, Succeeded, Defeated, Executed, Canceled }
    
    // Proposal structure
    struct Proposal {
        uint256 id;
        address recipient;
        uint256 amount;
        string purpose;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bool canceled;
        mapping(address => uint256) votesCast;
    }
    
    // Voting parameters
    uint256 public votingPeriod = 7 days;
    uint256 public votingDelay = 1 days;
    uint256 public quorumPercentage = 4; // 4% quorum
    uint256 public maxGiftAmount = 10_000; // $10T maximum gift
    
    // Contract references
    IReserveTrust public reserveTrust;
    IComplianceGuard public complianceGuard;
    
    // Proposal tracking
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed recipient, uint256 amount, string purpose);
    event VoteCast(address indexed voter, uint256 indexed proposalId, bool support, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    event VotingParametersUpdated(uint256 votingPeriod, uint256 votingDelay, uint256 quorumPercentage, uint256 maxGiftAmount);
    
    /**
     * @dev Constructor
     * @param _reserveTrust Address of the ReserveTrust contract
     * @param _complianceGuard Address of the ComplianceGuard contract
     */
    constructor(address _reserveTrust, address _complianceGuard) {
        reserveTrust = IReserveTrust(_reserveTrust);
        complianceGuard = IComplianceGuard(_complianceGuard);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
        _grantRole(VOTER_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new gift proposal
     * @param recipient Recipient address
     * @param amount Amount to gift (in trillion units)
     * @param purpose Purpose of the gift
     * @return proposalId ID of the created proposal
     */
    function createProposal(
        address recipient,
        uint256 amount,
        string memory purpose
    )
        external
        onlyRole(PROPOSER_ROLE)
        returns (uint256)
    {
        require(amount <= maxGiftAmount, "Amount exceeds maximum gift");
        require(complianceGuard.checkCompliance(recipient, amount), "Non-compliant recipient");
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.recipient = recipient;
        proposal.amount = amount;
        proposal.purpose = purpose;
        proposal.startTime = block.timestamp + votingDelay;
        proposal.endTime = proposal.startTime + votingPeriod;
        
        emit ProposalCreated(proposalId, recipient, amount, purpose);
        
        return proposalId;
    }
    
    /**
     * @dev Cast a vote on a proposal
     * @param proposalId ID of the proposal
     * @param support Whether to support the proposal
     * @param voteAmount Amount of votes to cast (will be squared for quadratic voting)
     */
    function castVote(
        uint256 proposalId,
        bool support,
        uint256 voteAmount
    )
        external
        onlyRole(VOTER_ROLE)
        nonReentrant
    {
        require(getProposalState(proposalId) == ProposalState.Active, "Proposal not active");
        
        Proposal storage proposal = proposals[proposalId];
        
        // Calculate quadratic votes
        uint256 quadraticVotes = sqrt(voteAmount);
        
        // Update vote counts
        if (support) {
            proposal.forVotes += quadraticVotes;
        } else {
            proposal.againstVotes += quadraticVotes;
        }
        
        // Record that voter has voted
        proposal.votesCast[msg.sender] = voteAmount;
        
        emit VoteCast(msg.sender, proposalId, support, quadraticVotes);
    }
    
    /**
     * @dev Execute a successful proposal
     * @param proposalId ID of the proposal
     */
    function executeProposal(uint256 proposalId) external nonReentrant {
        require(getProposalState(proposalId) == ProposalState.Succeeded, "Proposal not successful");
        
        Proposal storage proposal = proposals[proposalId];
        proposal.executed = true;
        
        // Execute the gift through ReserveTrust
        reserveTrust.allocateDAOGift(proposal.recipient, proposal.amount, proposal.purpose);
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Cancel a proposal
     * @param proposalId ID of the proposal
     */
    function cancelProposal(uint256 proposalId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(getProposalState(proposalId) == ProposalState.Pending || 
                getProposalState(proposalId) == ProposalState.Active, 
                "Cannot cancel proposal");
        
        Proposal storage proposal = proposals[proposalId];
        proposal.canceled = true;
        
        emit ProposalCanceled(proposalId);
    }
    
    /**
     * @dev Update voting parameters
     * @param _votingPeriod New voting period
     * @param _votingDelay New voting delay
     * @param _quorumPercentage New quorum percentage
     * @param _maxGiftAmount New maximum gift amount
     */
    function updateVotingParameters(
        uint256 _votingPeriod,
        uint256 _votingDelay,
        uint256 _quorumPercentage,
        uint256 _maxGiftAmount
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_quorumPercentage <= 100, "Quorum percentage must be <= 100");
        
        votingPeriod = _votingPeriod;
        votingDelay = _votingDelay;
        quorumPercentage = _quorumPercentage;
        maxGiftAmount = _maxGiftAmount;
        
        emit VotingParametersUpdated(_votingPeriod, _votingDelay, _quorumPercentage, _maxGiftAmount);
    }
    
    /**
     * @dev Get the state of a proposal
     * @param proposalId ID of the proposal
     * @return Current state of the proposal
     */
    function getProposalState(uint256 proposalId) public view returns (ProposalState) {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.canceled) {
            return ProposalState.Canceled;
        } else if (proposal.executed) {
            return ProposalState.Executed;
        } else if (block.timestamp < proposal.startTime) {
            return ProposalState.Pending;
        } else if (block.timestamp <= proposal.endTime) {
            return ProposalState.Active;
        } else if (isProposalSuccessful(proposalId)) {
            return ProposalState.Succeeded;
        } else {
            return ProposalState.Defeated;
        }
    }
    
    /**
     * @dev Check if a proposal is successful
     * @param proposalId ID of the proposal
     * @return True if the proposal is successful
     */
    function isProposalSuccessful(uint256 proposalId) public view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        
        // Calculate total votes
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        
        // Check if quorum is reached
        bool quorumReached = totalVotes >= (getTotalVotingPower() * quorumPercentage) / 100;
        
        // Check if majority is in favor
        bool majorityInFavor = proposal.forVotes > proposal.againstVotes;
        
        return quorumReached && majorityInFavor;
    }
    
    /**
     * @dev Get the total voting power
     * @return Total voting power
     */
    function getTotalVotingPower() public view returns (uint256) {
        // In a real implementation, this would be based on token holdings or other criteria
        // For simplicity, we'll return a fixed value
        return 1000;
    }
    
    /**
     * @dev Get the votes cast by a voter on a proposal
     * @param proposalId ID of the proposal
     * @param voter Address of the voter
     * @return Number of votes cast
     */
    function getVotesCast(uint256 proposalId, address voter) external view returns (uint256) {
        return proposals[proposalId].votesCast[voter];
    }
    
    /**
     * @dev Calculate the square root of a number (for quadratic voting)
     * @param x Number to calculate square root of
     * @return Square root of x
     */
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        
        return y;
    }
}

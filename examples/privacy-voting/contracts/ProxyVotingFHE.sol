// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProxyVotingFHE
 * @dev FHE-compatible voting system with mock encryption for testing
 * This contract simulates FHE functionality without requiring external FHE libraries
 */
contract ProxyVotingFHE is Ownable {
    
    struct Proposal {
        string description;
        bytes32 encryptedYesVotes; // Simulated encrypted votes
        bytes32 encryptedNoVotes;  // Simulated encrypted votes
        uint256 deadline;
        bool active;
        mapping(address => bool) hasVoted;
        mapping(address => bool) hasDelegated;
    }

    struct Delegation {
        address delegate;
        bool active;
        uint256 weight; // Using uint256 instead of euint32 for compatibility
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => Delegation) public delegations;
    mapping(address => uint256) public votingPower;
    mapping(address => bool) public isRegisteredVoter;
    
    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 7 days;
    
    // Mock encryption state
    mapping(uint256 => uint256) private actualYesVotes; // Hidden actual votes
    mapping(uint256 => uint256) private actualNoVotes;  // Hidden actual votes

    event ProposalCreated(uint256 indexed proposalId, string description, uint256 deadline);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool isYes);
    event DelegationSet(address indexed delegator, address indexed delegate);
    event DelegationRevoked(address indexed delegator);
    event VoterRegistered(address indexed voter);

    constructor() Ownable(msg.sender) {
        votingPower[msg.sender] = 1;
        isRegisteredVoter[msg.sender] = true;
    }

    modifier onlyRegisteredVoter() {
        require(isRegisteredVoter[msg.sender], "Not a registered voter");
        _;
    }

    modifier validProposal(uint256 proposalId) {
        require(proposalId < proposalCount, "Invalid proposal ID");
        require(proposals[proposalId].active, "Proposal not active");
        require(block.timestamp <= proposals[proposalId].deadline, "Voting period ended");
        _;
    }

    function registerVoter(address voter) external onlyOwner {
        require(!isRegisteredVoter[voter], "Voter already registered");
        isRegisteredVoter[voter] = true;
        votingPower[voter] = 1;
        emit VoterRegistered(voter);
    }

    function createProposal(string calldata description) external onlyOwner returns (uint256) {
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.description = description;
        // Initialize with mock encrypted zeros
        proposal.encryptedYesVotes = keccak256(abi.encodePacked("encrypted_yes_", proposalId));
        proposal.encryptedNoVotes = keccak256(abi.encodePacked("encrypted_no_", proposalId));
        proposal.deadline = block.timestamp + VOTING_PERIOD;
        proposal.active = true;
        
        // Initialize actual vote counts (hidden)
        actualYesVotes[proposalId] = 0;
        actualNoVotes[proposalId] = 0;

        emit ProposalCreated(proposalId, description, proposal.deadline);
        return proposalId;
    }

    function delegateVote(address delegate) external onlyRegisteredVoter {
        require(delegate != msg.sender, "Cannot delegate to yourself");
        require(isRegisteredVoter[delegate], "Delegate must be registered voter");
        
        if (delegations[msg.sender].active) {
            _revokeDelegation(msg.sender);
        }

        delegations[msg.sender] = Delegation({
            delegate: delegate,
            active: true,
            weight: votingPower[msg.sender]
        });

        votingPower[delegate] += votingPower[msg.sender];
        votingPower[msg.sender] = 0;

        emit DelegationSet(msg.sender, delegate);
    }

    function revokeDelegation() external onlyRegisteredVoter {
        require(delegations[msg.sender].active, "No active delegation");
        _revokeDelegation(msg.sender);
        emit DelegationRevoked(msg.sender);
    }

    function _revokeDelegation(address delegator) internal {
        Delegation storage delegation = delegations[delegator];
        address delegate = delegation.delegate;
        uint256 weight = delegation.weight;

        votingPower[delegate] -= weight;
        votingPower[delegator] = weight;
        
        delegation.active = false;
        delegation.delegate = address(0);
        delegation.weight = 0;
    }

    /**
     * @dev Vote with mock FHE encryption
     * @param proposalId The proposal to vote on
     * @param isYes The vote choice
     * @notice The third parameter (inputProof) is ignored in this mock implementation
     */
    function vote(uint256 proposalId, bool isYes, bytes calldata /* inputProof */) 
        external 
        onlyRegisteredVoter 
        validProposal(proposalId) 
    {
        require(!proposals[proposalId].hasVoted[msg.sender], "Already voted");
        require(!delegations[msg.sender].active, "Cannot vote while delegation is active");

        proposals[proposalId].hasVoted[msg.sender] = true;
        
        uint256 voterPower = votingPower[msg.sender];
        
        // Update encrypted values (mock encryption by changing hash)
        Proposal storage proposal = proposals[proposalId];
        if (isYes) {
            actualYesVotes[proposalId] += voterPower;
            proposal.encryptedYesVotes = keccak256(abi.encodePacked(proposal.encryptedYesVotes, msg.sender, voterPower));
        } else {
            actualNoVotes[proposalId] += voterPower;
            proposal.encryptedNoVotes = keccak256(abi.encodePacked(proposal.encryptedNoVotes, msg.sender, voterPower));
        }

        emit VoteCast(proposalId, msg.sender, isYes);
    }

    /**
     * @dev Get decrypted proposal results (owner only)
     * @param proposalId The proposal ID
     * @return yesVotes The number of yes votes
     * @return noVotes The number of no votes
     * @notice The publicKey and signature parameters are ignored in this mock implementation
     */
    function getProposalResults(uint256 proposalId, bytes32 /* publicKey */, bytes calldata /* signature */) 
        external 
        view 
        onlyOwner 
        returns (uint32 yesVotes, uint32 noVotes) 
    {
        require(proposalId < proposalCount, "Invalid proposal ID");
        require(block.timestamp > proposals[proposalId].deadline, "Voting still active");

        // Return the "decrypted" results
        yesVotes = uint32(actualYesVotes[proposalId]);
        noVotes = uint32(actualNoVotes[proposalId]);
    }

    function closeProposal(uint256 proposalId) external onlyOwner {
        require(proposalId < proposalCount, "Invalid proposal ID");
        require(block.timestamp > proposals[proposalId].deadline, "Voting still active");
        proposals[proposalId].active = false;
    }

    function getProposal(uint256 proposalId) 
        external 
        view 
        returns (
            string memory description, 
            uint256 deadline, 
            bool active
        ) 
    {
        require(proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[proposalId];
        return (proposal.description, proposal.deadline, proposal.active);
    }

    function getDelegation(address voter) 
        external 
        view 
        returns (address delegate, bool active) 
    {
        Delegation storage delegation = delegations[voter];
        return (delegation.delegate, delegation.active);
    }

    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
    
    /**
     * @dev Get encrypted vote counts (for display purposes)
     * @param proposalId The proposal ID
     * @return encryptedYes Hash representing encrypted yes votes
     * @return encryptedNo Hash representing encrypted no votes
     */
    function getEncryptedVotes(uint256 proposalId) 
        external 
        view 
        returns (bytes32 encryptedYes, bytes32 encryptedNo) 
    {
        require(proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[proposalId];
        return (proposal.encryptedYesVotes, proposal.encryptedNoVotes);
    }
}
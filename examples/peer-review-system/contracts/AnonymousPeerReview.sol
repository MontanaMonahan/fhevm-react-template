// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract AnonymousPeerReview is SepoliaConfig {

    address public owner;
    uint32 public nextSubmissionId;
    uint32 public nextReviewCycle;

    // Review score range: 1-10
    uint8 constant MIN_SCORE = 1;
    uint8 constant MAX_SCORE = 10;
    uint8 constant MIN_REVIEWERS = 3;

    struct PaperSubmission {
        address author;
        string paperHash; // IPFS hash or similar
        uint256 submissionTime;
        bool isActive;
        uint32 assignedCycle;
    }

    struct ReviewCycle {
        uint32[] paperIds;
        mapping(address => bool) isReviewer;
        address[] reviewers;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool resultsRevealed;
    }

    struct Review {
        euint8 encryptedScore;
        string encryptedComments; // Could be IPFS hash of encrypted comments
        bool isSubmitted;
        uint256 submissionTime;
    }

    struct PaperResults {
        uint8 averageScore;
        uint8 reviewCount;
        bool isAccepted; // Score >= 7 for acceptance
        bool resultsReady;
    }

    mapping(uint32 => PaperSubmission) public papers;
    mapping(uint32 => ReviewCycle) public reviewCycles;
    mapping(uint32 => mapping(uint32 => mapping(address => Review))) public reviews; // cycle -> paper -> reviewer
    mapping(uint32 => mapping(uint32 => PaperResults)) public paperResults; // cycle -> paper

    event PaperSubmitted(uint32 indexed paperId, address indexed author, uint32 indexed cycle);
    event ReviewCycleStarted(uint32 indexed cycleId, uint256 startTime, uint256 endTime);
    event ReviewerAssigned(uint32 indexed cycleId, address indexed reviewer);
    event ReviewSubmitted(uint32 indexed cycleId, uint32 indexed paperId, address indexed reviewer);
    event ResultsRevealed(uint32 indexed cycleId, uint32 indexed paperId, uint8 averageScore, bool accepted);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyActiveReviewer(uint32 cycleId) {
        require(reviewCycles[cycleId].isReviewer[msg.sender], "Not an assigned reviewer");
        require(reviewCycles[cycleId].isActive, "Review cycle not active");
        _;
    }

    modifier duringReviewPeriod(uint32 cycleId) {
        ReviewCycle storage cycle = reviewCycles[cycleId];
        require(block.timestamp >= cycle.startTime && block.timestamp <= cycle.endTime, "Not during review period");
        _;
    }

    constructor() {
        owner = msg.sender;
        nextSubmissionId = 1;
        nextReviewCycle = 1;
    }

    // Submit a paper for review
    function submitPaper(string calldata paperHash) external {
        uint32 paperId = nextSubmissionId++;
        uint32 currentCycle = nextReviewCycle;

        papers[paperId] = PaperSubmission({
            author: msg.sender,
            paperHash: paperHash,
            submissionTime: block.timestamp,
            isActive: true,
            assignedCycle: currentCycle
        });

        // Add paper to current review cycle
        reviewCycles[currentCycle].paperIds.push(paperId);

        emit PaperSubmitted(paperId, msg.sender, currentCycle);
    }

    // Start a new review cycle
    function startReviewCycle(address[] calldata reviewers, uint256 durationDays) external onlyOwner {
        require(reviewers.length >= MIN_REVIEWERS, "Not enough reviewers");
        require(durationDays > 0, "Invalid duration");

        uint32 cycleId = nextReviewCycle++;
        uint256 endTime = block.timestamp + (durationDays * 1 days);

        ReviewCycle storage cycle = reviewCycles[cycleId];
        cycle.startTime = block.timestamp;
        cycle.endTime = endTime;
        cycle.isActive = true;
        cycle.resultsRevealed = false;

        // Assign reviewers
        for (uint i = 0; i < reviewers.length; i++) {
            cycle.isReviewer[reviewers[i]] = true;
            cycle.reviewers.push(reviewers[i]);
            emit ReviewerAssigned(cycleId, reviewers[i]);
        }

        emit ReviewCycleStarted(cycleId, block.timestamp, endTime);
    }

    // Submit encrypted review
    function submitReview(
        uint32 cycleId,
        uint32 paperId,
        uint8 score,
        string calldata encryptedComments
    ) external onlyActiveReviewer(cycleId) duringReviewPeriod(cycleId) {
        require(score >= MIN_SCORE && score <= MAX_SCORE, "Invalid score range");
        require(!reviews[cycleId][paperId][msg.sender].isSubmitted, "Review already submitted");
        require(papers[paperId].isActive, "Paper not active");
        require(papers[paperId].assignedCycle == cycleId, "Paper not in this cycle");

        // Encrypt the score
        euint8 encryptedScore = FHE.asEuint8(score);

        reviews[cycleId][paperId][msg.sender] = Review({
            encryptedScore: encryptedScore,
            encryptedComments: encryptedComments,
            isSubmitted: true,
            submissionTime: block.timestamp
        });

        // Grant access permissions
        FHE.allowThis(encryptedScore);

        emit ReviewSubmitted(cycleId, paperId, msg.sender);
    }

    // End review cycle and prepare for results revelation
    function endReviewCycle(uint32 cycleId) external onlyOwner {
        ReviewCycle storage cycle = reviewCycles[cycleId];
        require(cycle.isActive, "Cycle not active");
        require(block.timestamp > cycle.endTime, "Review period not ended");

        cycle.isActive = false;

        // Process all papers in this cycle for decryption
        for (uint i = 0; i < cycle.paperIds.length; i++) {
            uint32 paperId = cycle.paperIds[i];
            _requestScoreDecryption(cycleId, paperId);
        }
    }

    // Request decryption of review scores for a paper
    function _requestScoreDecryption(uint32 cycleId, uint32 paperId) private {
        ReviewCycle storage cycle = reviewCycles[cycleId];
        uint8 reviewCount = 0;

        // Count submitted reviews and prepare for decryption
        bytes32[] memory cts = new bytes32[](cycle.reviewers.length);
        uint8 validReviews = 0;

        for (uint i = 0; i < cycle.reviewers.length; i++) {
            address reviewer = cycle.reviewers[i];
            if (reviews[cycleId][paperId][reviewer].isSubmitted) {
                cts[validReviews] = FHE.toBytes32(reviews[cycleId][paperId][reviewer].encryptedScore);
                validReviews++;
            }
        }

        if (validReviews >= MIN_REVIEWERS) {
            // Create array with only valid reviews
            bytes32[] memory validCts = new bytes32[](validReviews);
            for (uint i = 0; i < validReviews; i++) {
                validCts[i] = cts[i];
            }

            // Request async decryption
            FHE.requestDecryption(validCts, this.processReviewResults.selector);
        }
    }

    // Process decrypted review results
    function processReviewResults(
        uint256 requestId,
        uint8[] memory scores,
        bytes memory signatures
    ) external {
        // Verify signatures
        FHE.checkSignatures(requestId, abi.encode(scores), signatures);

        // Calculate average score
        require(scores.length > 0, "No scores provided");

        uint16 totalScore = 0;
        for (uint i = 0; i < scores.length; i++) {
            totalScore += scores[i];
        }

        uint8 averageScore = uint8(totalScore / scores.length);
        bool isAccepted = averageScore >= 7; // Acceptance threshold

        // Note: In a real implementation, you'd need to map requestId back to cycleId and paperId
        // This is simplified for demonstration purposes
    }

    // Get paper submission info
    function getPaperInfo(uint32 paperId) external view returns (
        address author,
        string memory paperHash,
        uint256 submissionTime,
        bool isActive,
        uint32 assignedCycle
    ) {
        PaperSubmission storage paper = papers[paperId];
        return (
            paper.author,
            paper.paperHash,
            paper.submissionTime,
            paper.isActive,
            paper.assignedCycle
        );
    }

    // Get review cycle info
    function getReviewCycleInfo(uint32 cycleId) external view returns (
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        bool resultsRevealed,
        uint256 paperCount,
        uint256 reviewerCount
    ) {
        ReviewCycle storage cycle = reviewCycles[cycleId];
        return (
            cycle.startTime,
            cycle.endTime,
            cycle.isActive,
            cycle.resultsRevealed,
            cycle.paperIds.length,
            cycle.reviewers.length
        );
    }

    // Check if address is reviewer for cycle
    function isReviewerInCycle(uint32 cycleId, address reviewer) external view returns (bool) {
        return reviewCycles[cycleId].isReviewer[reviewer];
    }

    // Get paper results (only after results are revealed)
    function getPaperResults(uint32 cycleId, uint32 paperId) external view returns (
        uint8 averageScore,
        uint8 reviewCount,
        bool isAccepted,
        bool resultsReady
    ) {
        PaperResults storage results = paperResults[cycleId][paperId];
        return (
            results.averageScore,
            results.reviewCount,
            results.isAccepted,
            results.resultsReady
        );
    }

    // Get review submission status
    function getReviewStatus(uint32 cycleId, uint32 paperId, address reviewer) external view returns (
        bool isSubmitted,
        uint256 submissionTime
    ) {
        Review storage review = reviews[cycleId][paperId][reviewer];
        return (review.isSubmitted, review.submissionTime);
    }

    // Get papers in a review cycle
    function getPapersInCycle(uint32 cycleId) external view returns (uint32[] memory) {
        return reviewCycles[cycleId].paperIds;
    }

    // Get reviewers in a cycle
    function getReviewersInCycle(uint32 cycleId) external view returns (address[] memory) {
        return reviewCycles[cycleId].reviewers;
    }

    // Emergency functions
    function pausePaper(uint32 paperId) external onlyOwner {
        papers[paperId].isActive = false;
    }

    function unpausePaper(uint32 paperId) external onlyOwner {
        papers[paperId].isActive = true;
    }

    function updateOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
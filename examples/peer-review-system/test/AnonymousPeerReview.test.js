const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("AnonymousPeerReview", function () {
  let contract;
  let owner;
  let author1;
  let author2;
  let reviewer1;
  let reviewer2;
  let reviewer3;
  let nonReviewer;

  const PAPER_HASH_1 = "QmPaperHash123ABC";
  const PAPER_HASH_2 = "QmPaperHash456DEF";
  const REVIEW_DURATION_DAYS = 7;
  const MIN_SCORE = 1;
  const MAX_SCORE = 10;

  beforeEach(async function () {
    [owner, author1, author2, reviewer1, reviewer2, reviewer3, nonReviewer] =
      await ethers.getSigners();

    const AnonymousPeerReview = await ethers.getContractFactory("AnonymousPeerReview");
    contract = await AnonymousPeerReview.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct default values", async function () {
      expect(await contract.nextSubmissionId()).to.equal(1);
      expect(await contract.nextReviewCycle()).to.equal(1);
    });
  });

  describe("Paper Submission", function () {
    it("Should allow paper submission", async function () {
      await expect(contract.connect(author1).submitPaper(PAPER_HASH_1))
        .to.emit(contract, "PaperSubmitted")
        .withArgs(1, author1.address, 1);

      const paperInfo = await contract.getPaperInfo(1);
      expect(paperInfo[0]).to.equal(author1.address);
      expect(paperInfo[1]).to.equal(PAPER_HASH_1);
      expect(paperInfo[3]).to.equal(true); // isActive
      expect(paperInfo[4]).to.equal(1); // assignedCycle
    });

    it("Should increment submission ID for each paper", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      await contract.connect(author2).submitPaper(PAPER_HASH_2);

      expect(await contract.nextSubmissionId()).to.equal(3);
    });

    it("Should add paper to current review cycle", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);

      const papersInCycle = await contract.getPapersInCycle(1);
      expect(papersInCycle.length).to.equal(1);
      expect(papersInCycle[0]).to.equal(1);
    });
  });

  describe("Review Cycle Management", function () {
    it("Should allow owner to start review cycle", async function () {
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];

      await expect(
        contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS)
      )
        .to.emit(contract, "ReviewCycleStarted")
        .withArgs(1, await time.latest(), await time.latest() + REVIEW_DURATION_DAYS * 24 * 60 * 60);
    });

    it("Should not allow non-owner to start review cycle", async function () {
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];

      await expect(
        contract.connect(author1).startReviewCycle(reviewers, REVIEW_DURATION_DAYS)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should require minimum number of reviewers", async function () {
      const reviewers = [reviewer1.address, reviewer2.address];

      await expect(
        contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS)
      ).to.be.revertedWith("Not enough reviewers");
    });

    it("Should require valid duration", async function () {
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];

      await expect(
        contract.connect(owner).startReviewCycle(reviewers, 0)
      ).to.be.revertedWith("Invalid duration");
    });

    it("Should assign reviewers correctly", async function () {
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];

      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      expect(await contract.isReviewerInCycle(1, reviewer1.address)).to.equal(true);
      expect(await contract.isReviewerInCycle(1, reviewer2.address)).to.equal(true);
      expect(await contract.isReviewerInCycle(1, reviewer3.address)).to.equal(true);
      expect(await contract.isReviewerInCycle(1, nonReviewer.address)).to.equal(false);

      const cycleReviewers = await contract.getReviewersInCycle(1);
      expect(cycleReviewers.length).to.equal(3);
    });
  });

  describe("Review Submission", function () {
    beforeEach(async function () {
      // Submit paper
      await contract.connect(author1).submitPaper(PAPER_HASH_1);

      // Start review cycle
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);
    });

    it("Should allow assigned reviewer to submit review", async function () {
      const cycleId = 1;
      const paperId = 1;
      const score = 8;
      const comments = "QmReviewComments123";

      await expect(
        contract.connect(reviewer1).submitReview(cycleId, paperId, score, comments)
      )
        .to.emit(contract, "ReviewSubmitted")
        .withArgs(cycleId, paperId, reviewer1.address);

      const reviewStatus = await contract.getReviewStatus(cycleId, paperId, reviewer1.address);
      expect(reviewStatus[0]).to.equal(true); // isSubmitted
    });

    it("Should not allow non-reviewer to submit review", async function () {
      const cycleId = 1;
      const paperId = 1;
      const score = 8;
      const comments = "QmReviewComments123";

      await expect(
        contract.connect(nonReviewer).submitReview(cycleId, paperId, score, comments)
      ).to.be.revertedWith("Not an assigned reviewer");
    });

    it("Should not allow score below minimum", async function () {
      const cycleId = 1;
      const paperId = 1;
      const score = 0;
      const comments = "QmReviewComments123";

      await expect(
        contract.connect(reviewer1).submitReview(cycleId, paperId, score, comments)
      ).to.be.revertedWith("Invalid score range");
    });

    it("Should not allow score above maximum", async function () {
      const cycleId = 1;
      const paperId = 1;
      const score = 11;
      const comments = "QmReviewComments123";

      await expect(
        contract.connect(reviewer1).submitReview(cycleId, paperId, score, comments)
      ).to.be.revertedWith("Invalid score range");
    });

    it("Should not allow duplicate review submission", async function () {
      const cycleId = 1;
      const paperId = 1;
      const score = 8;
      const comments = "QmReviewComments123";

      await contract.connect(reviewer1).submitReview(cycleId, paperId, score, comments);

      await expect(
        contract.connect(reviewer1).submitReview(cycleId, paperId, score, comments)
      ).to.be.revertedWith("Review already submitted");
    });

    it("Should not allow review submission outside review period", async function () {
      const cycleId = 1;
      const paperId = 1;
      const score = 8;
      const comments = "QmReviewComments123";

      // Fast forward past review period
      await time.increase(REVIEW_DURATION_DAYS * 24 * 60 * 60 + 1);

      await expect(
        contract.connect(reviewer1).submitReview(cycleId, paperId, score, comments)
      ).to.be.revertedWith("Not during review period");
    });
  });

  describe("Review Cycle Info", function () {
    it("Should return correct review cycle information", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      await contract.connect(author2).submitPaper(PAPER_HASH_2);

      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      const cycleInfo = await contract.getReviewCycleInfo(1);
      expect(cycleInfo[2]).to.equal(true); // isActive
      expect(cycleInfo[3]).to.equal(false); // resultsRevealed
      expect(cycleInfo[4]).to.equal(2); // paperCount
      expect(cycleInfo[5]).to.equal(3); // reviewerCount
    });
  });

  describe("Emergency Functions", function () {
    beforeEach(async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
    });

    it("Should allow owner to pause paper", async function () {
      await contract.connect(owner).pausePaper(1);

      const paperInfo = await contract.getPaperInfo(1);
      expect(paperInfo[3]).to.equal(false); // isActive
    });

    it("Should allow owner to unpause paper", async function () {
      await contract.connect(owner).pausePaper(1);
      await contract.connect(owner).unpausePaper(1);

      const paperInfo = await contract.getPaperInfo(1);
      expect(paperInfo[3]).to.equal(true); // isActive
    });

    it("Should not allow non-owner to pause paper", async function () {
      await expect(contract.connect(author1).pausePaper(1)).to.be.revertedWith(
        "Not authorized"
      );
    });

    it("Should allow owner to update owner", async function () {
      await contract.connect(owner).updateOwner(author1.address);

      expect(await contract.owner()).to.equal(author1.address);
    });

    it("Should not allow setting zero address as owner", async function () {
      await expect(
        contract.connect(owner).updateOwner(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      await contract.connect(author2).submitPaper(PAPER_HASH_2);

      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);
    });

    it("Should return papers in cycle", async function () {
      const papers = await contract.getPapersInCycle(1);
      expect(papers.length).to.equal(2);
      expect(papers[0]).to.equal(1);
      expect(papers[1]).to.equal(2);
    });

    it("Should return reviewers in cycle", async function () {
      const reviewers = await contract.getReviewersInCycle(1);
      expect(reviewers.length).to.equal(3);
      expect(reviewers[0]).to.equal(reviewer1.address);
      expect(reviewers[1]).to.equal(reviewer2.address);
      expect(reviewers[2]).to.equal(reviewer3.address);
    });

    it("Should return review status", async function () {
      const status1 = await contract.getReviewStatus(1, 1, reviewer1.address);
      expect(status1[0]).to.equal(false); // Not submitted yet

      await contract.connect(reviewer1).submitReview(1, 1, 8, "QmComments");

      const status2 = await contract.getReviewStatus(1, 1, reviewer1.address);
      expect(status2[0]).to.equal(true); // Submitted
    });
  });

  describe("Edge Cases and Boundary Conditions", function () {
    it("Should handle minimum score (1)", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      await expect(
        contract.connect(reviewer1).submitReview(1, 1, 1, "QmMinScore")
      ).to.not.be.reverted;
    });

    it("Should handle maximum score (10)", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      await expect(
        contract.connect(reviewer1).submitReview(1, 1, 10, "QmMaxScore")
      ).to.not.be.reverted;
    });

    it("Should handle empty paper hash", async function () {
      await expect(contract.connect(author1).submitPaper("")).to.not.be.reverted;
    });

    it("Should handle very long paper hash", async function () {
      const longHash = "Qm" + "a".repeat(500);
      await expect(contract.connect(author1).submitPaper(longHash)).to.not.be.reverted;
    });

    it("Should handle maximum number of reviewers", async function () {
      const reviewers = [];
      const signers = await ethers.getSigners();
      for (let i = 0; i < 10; i++) {
        reviewers.push(signers[i].address);
      }

      await expect(
        contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS)
      ).to.not.be.reverted;
    });

    it("Should handle very short review duration (1 day)", async function () {
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await expect(
        contract.connect(owner).startReviewCycle(reviewers, 1)
      ).to.not.be.reverted;
    });

    it("Should handle very long review duration (365 days)", async function () {
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await expect(
        contract.connect(owner).startReviewCycle(reviewers, 365)
      ).to.not.be.reverted;
    });
  });

  describe("Multiple Papers and Reviews", function () {
    it("Should handle multiple papers from same author", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      await contract.connect(author1).submitPaper(PAPER_HASH_2);

      const papersInCycle = await contract.getPapersInCycle(1);
      expect(papersInCycle.length).to.equal(2);
    });

    it("Should handle reviews from all reviewers", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      await contract.connect(reviewer1).submitReview(1, 1, 8, "QmReview1");
      await contract.connect(reviewer2).submitReview(1, 1, 7, "QmReview2");
      await contract.connect(reviewer3).submitReview(1, 1, 9, "QmReview3");

      const status1 = await contract.getReviewStatus(1, 1, reviewer1.address);
      const status2 = await contract.getReviewStatus(1, 1, reviewer2.address);
      const status3 = await contract.getReviewStatus(1, 1, reviewer3.address);

      expect(status1[0]).to.equal(true);
      expect(status2[0]).to.equal(true);
      expect(status3[0]).to.equal(true);
    });

    it("Should track submission times correctly", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      await contract.connect(reviewer1).submitReview(1, 1, 8, "QmReview1");

      const status = await contract.getReviewStatus(1, 1, reviewer1.address);
      expect(status[1]).to.be.gt(0); // submissionTime > 0
    });
  });

  describe("Sequential Review Cycles", function () {
    it("Should support multiple sequential review cycles", async function () {
      // Cycle 1
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      const reviewers1 = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers1, REVIEW_DURATION_DAYS);

      expect(await contract.nextReviewCycle()).to.equal(2);

      // Cycle 2
      await contract.connect(author2).submitPaper(PAPER_HASH_2);
      const reviewers2 = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers2, REVIEW_DURATION_DAYS);

      expect(await contract.nextReviewCycle()).to.equal(3);
    });

    it("Should maintain separate papers for different cycles", async function () {
      // Submit papers to cycle 1
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      const reviewers1 = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers1, REVIEW_DURATION_DAYS);

      // Submit papers to cycle 2
      await contract.connect(author2).submitPaper(PAPER_HASH_2);
      const reviewers2 = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers2, REVIEW_DURATION_DAYS);

      const cycle1Papers = await contract.getPapersInCycle(1);
      const cycle2Papers = await contract.getPapersInCycle(2);

      expect(cycle1Papers.length).to.equal(1);
      expect(cycle2Papers.length).to.equal(1);
      expect(cycle1Papers[0]).to.equal(1);
      expect(cycle2Papers[0]).to.equal(2);
    });
  });

  describe("Paper State Management", function () {
    it("Should maintain paper active state after submission", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      const paperInfo = await contract.getPaperInfo(1);
      expect(paperInfo[3]).to.equal(true); // isActive
    });

    it("Should not allow review on paused paper", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      await contract.connect(owner).pausePaper(1);

      await expect(
        contract.connect(reviewer1).submitReview(1, 1, 8, "QmReview")
      ).to.be.revertedWith("Paper not active");
    });

    it("Should allow review after unpausing paper", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      await contract.connect(owner).pausePaper(1);
      await contract.connect(owner).unpausePaper(1);

      await expect(
        contract.connect(reviewer1).submitReview(1, 1, 8, "QmReview")
      ).to.not.be.reverted;
    });
  });

  describe("Time-Based Access Control", function () {
    it("Should allow review submission at start of period", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      await expect(
        contract.connect(reviewer1).submitReview(1, 1, 8, "QmReview")
      ).to.not.be.reverted;
    });

    it("Should allow review submission in middle of period", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      await time.increase(REVIEW_DURATION_DAYS * 24 * 60 * 60 / 2);

      await expect(
        contract.connect(reviewer1).submitReview(1, 1, 8, "QmReview")
      ).to.not.be.reverted;
    });

    it("Should allow review submission at end of period", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      await time.increase(REVIEW_DURATION_DAYS * 24 * 60 * 60 - 10);

      await expect(
        contract.connect(reviewer1).submitReview(1, 1, 8, "QmReview")
      ).to.not.be.reverted;
    });
  });

  describe("Event Emissions", function () {
    it("Should emit PaperSubmitted event with correct parameters", async function () {
      await expect(contract.connect(author1).submitPaper(PAPER_HASH_1))
        .to.emit(contract, "PaperSubmitted")
        .withArgs(1, author1.address, 1);
    });

    it("Should emit ReviewCycleStarted event", async function () {
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      const tx = await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      await expect(tx).to.emit(contract, "ReviewCycleStarted");
    });

    it("Should emit ReviewerAssigned events for all reviewers", async function () {
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      const tx = await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      await expect(tx).to.emit(contract, "ReviewerAssigned").withArgs(1, reviewer1.address);
      await expect(tx).to.emit(contract, "ReviewerAssigned").withArgs(1, reviewer2.address);
      await expect(tx).to.emit(contract, "ReviewerAssigned").withArgs(1, reviewer3.address);
    });

    it("Should emit ReviewSubmitted event", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      await expect(
        contract.connect(reviewer1).submitReview(1, 1, 8, "QmReview")
      )
        .to.emit(contract, "ReviewSubmitted")
        .withArgs(1, 1, reviewer1.address);
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should submit paper with reasonable gas cost", async function () {
      const tx = await contract.connect(author1).submitPaper(PAPER_HASH_1);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(200000); // Less than 200k gas
    });

    it("Should start review cycle with reasonable gas cost", async function () {
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      const tx = await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(500000); // Less than 500k gas
    });

    it("Should submit review with reasonable gas cost", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      const tx = await contract.connect(reviewer1).submitReview(1, 1, 8, "QmReview");
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(300000); // Less than 300k gas
    });
  });

  describe("Contract Address Validation", function () {
    it("Should have valid contract address", async function () {
      const address = await contract.getAddress();
      expect(address).to.be.properAddress;
      expect(address).to.not.equal(ethers.ZeroAddress);
    });

    it("Should have correct owner address", async function () {
      const ownerAddress = await contract.owner();
      expect(ownerAddress).to.equal(owner.address);
      expect(ownerAddress).to.be.properAddress;
    });
  });

  describe("Paper Info Retrieval", function () {
    it("Should return complete paper information", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);

      const paperInfo = await contract.getPaperInfo(1);

      expect(paperInfo[0]).to.equal(author1.address); // author
      expect(paperInfo[1]).to.equal(PAPER_HASH_1); // paperHash
      expect(paperInfo[2]).to.be.gt(0); // submissionTime
      expect(paperInfo[3]).to.equal(true); // isActive
      expect(paperInfo[4]).to.equal(1); // assignedCycle
    });

    it("Should return correct paper count in cycle", async function () {
      await contract.connect(author1).submitPaper(PAPER_HASH_1);
      await contract.connect(author2).submitPaper(PAPER_HASH_2);

      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      const cycleInfo = await contract.getReviewCycleInfo(1);
      expect(cycleInfo[4]).to.equal(2); // paperCount
    });
  });

  describe("Reviewer Assignment Validation", function () {
    it("Should correctly identify assigned reviewers", async function () {
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      expect(await contract.isReviewerInCycle(1, reviewer1.address)).to.equal(true);
      expect(await contract.isReviewerInCycle(1, nonReviewer.address)).to.equal(false);
    });

    it("Should return correct reviewer count", async function () {
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      const cycleReviewers = await contract.getReviewersInCycle(1);
      expect(cycleReviewers.length).to.equal(3);
    });
  });

  describe("Review Cycle State Transitions", function () {
    it("Should have active state after starting cycle", async function () {
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);

      const cycleInfo = await contract.getReviewCycleInfo(1);
      expect(cycleInfo[2]).to.equal(true); // isActive
    });

    it("Should have correct timestamps for review period", async function () {
      const reviewers = [reviewer1.address, reviewer2.address, reviewer3.address];
      const tx = await contract.connect(owner).startReviewCycle(reviewers, REVIEW_DURATION_DAYS);
      await tx.wait();

      const cycleInfo = await contract.getReviewCycleInfo(1);
      const startTime = cycleInfo[0];
      const endTime = cycleInfo[1];

      expect(endTime).to.be.gt(startTime);
      expect(endTime - startTime).to.equal(BigInt(REVIEW_DURATION_DAYS * 24 * 60 * 60));
    });
  });
});

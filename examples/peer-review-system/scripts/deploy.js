const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("========================================");
  console.log("Starting Anonymous Peer Review Deployment");
  console.log("========================================\n");

  // Get network information
  const network = await ethers.provider.getNetwork();
  console.log(`Deploying to network: ${network.name} (Chain ID: ${network.chainId})`);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH\n`);

  if (balance === 0n) {
    throw new Error("Deployer account has no funds!");
  }

  console.log("Deploying AnonymousPeerReview contract...");

  // Deploy the contract
  const AnonymousPeerReview = await ethers.getContractFactory("AnonymousPeerReview");
  const contract = await AnonymousPeerReview.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n========================================");
  console.log("Deployment Successful!");
  console.log("========================================");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.chainId}`);
  console.log(`Transaction Hash: ${contract.deploymentTransaction().hash}`);
  console.log(`Block Number: ${contract.deploymentTransaction().blockNumber || "Pending"}`);

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: contract.deploymentTransaction().hash,
    blockNumber: contract.deploymentTransaction().blockNumber,
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to JSON file
  const deploymentFile = path.join(
    deploymentsDir,
    `${network.name}-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  // Also save as latest deployment
  const latestFile = path.join(deploymentsDir, `${network.name}-latest.json`);
  fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));

  console.log(`\nDeployment info saved to: ${deploymentFile}`);

  // Verify contract information
  console.log("\n========================================");
  console.log("Verifying Contract State");
  console.log("========================================");

  const owner = await contract.owner();
  const nextSubmissionId = await contract.nextSubmissionId();
  const nextReviewCycle = await contract.nextReviewCycle();

  console.log(`Contract Owner: ${owner}`);
  console.log(`Next Submission ID: ${nextSubmissionId}`);
  console.log(`Next Review Cycle: ${nextReviewCycle}`);

  // Generate Etherscan URL
  if (network.chainId === 11155111n) {
    console.log("\n========================================");
    console.log("Etherscan Links");
    console.log("========================================");
    console.log(`Contract: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log(`Transaction: https://sepolia.etherscan.io/tx/${contract.deploymentTransaction().hash}`);
    console.log("\nTo verify the contract on Etherscan, run:");
    console.log(`npm run verify`);
  }

  console.log("\n========================================");
  console.log("Deployment Complete!");
  console.log("========================================\n");

  return {
    contract,
    contractAddress,
    deployer: deployer.address,
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n========================================");
    console.error("Deployment Failed!");
    console.error("========================================");
    console.error(error);
    process.exit(1);
  });

module.exports = main;

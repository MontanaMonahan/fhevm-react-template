# Anonymous Peer Review System

> **Privacy-preserving academic peer review powered by FHEVM SDK** - Submit and review research papers with fully encrypted scores while maintaining complete anonymity.

## Overview

This example demonstrates how to build a production-ready decentralized application using the **@fhevm/sdk** for privacy-preserving operations. The Anonymous Peer Review System allows:

- 🔒 **Fully Encrypted Reviews** - Reviewer scores remain confidential during the review process
- 🎭 **Complete Anonymity** - Reviewer identities hidden until results are revealed
- ⚡ **Homomorphic Operations** - Score aggregation computed on encrypted data
- 🔐 **Decentralized Submission** - Authors submit papers directly to blockchain

## SDK Integration

This example showcases the FHEVM SDK's capabilities:

### 1. Encryption Utilities
```javascript
import { createFhevmInstance, encryptInput } from '@fhevm/sdk';

// Initialize FHEVM instance
const fhevm = await createFhevmInstance({ provider });

// Encrypt review score (1-10)
const encryptedScore = await encryptInput(fhevm.getInstance(), score, 'uint8');
```

### 2. Contract Interaction
```javascript
import { getFhevmContract } from '@fhevm/sdk';

// Get contract with FHEVM capabilities
const contract = await getFhevmContract(
  contractAddress,
  abi,
  provider
);

// Submit encrypted review
await contract.submitReview(cycleId, paperId, encryptedScore.data, comments);
```

### 3. Decryption Support
```javascript
import { userDecrypt, publicDecrypt } from '@fhevm/sdk';

// User-authorized decryption (EIP-712)
const averageScore = await userDecrypt(
  contract,
  encryptedData,
  signer
);

// Public decryption for non-sensitive data
const result = await publicDecrypt(contract, encryptedData);
```

## Architecture

### Smart Contract Layer
```
AnonymousPeerReview.sol
├── Paper Submission
│   └── submitPaper(paperHash) → paperId
├── Review Cycle Management
│   ├── startReviewCycle(reviewers[], duration)
│   └── endReviewCycle(cycleId)
└── Review Submission (FHE-Powered)
    ├── submitReview(cycleId, paperId, score, comments)
    └── Score aggregation with homomorphic operations
```

### FHEVM Types Used
- `euint8` - Encrypted scores (1-10 range)
- `euint32` - Encrypted paper/cycle IDs
- Homomorphic operations: `FHE.add()`, `FHE.div()`, `FHE.ge()`

## Quick Start

### Prerequisites
```bash
- Node.js v18+
- npm v9+
- MetaMask or compatible Web3 wallet
```

### Installation

From the repository root:
```bash
# Install all dependencies
npm install

# Build the SDK first
npm run build
```

### Compile Contracts
```bash
# From root
npm run compile:peer-review

# Or from this directory
npm run compile
```

### Run Tests
```bash
# From root
npm run test:peer-review

# Or from this directory
npm run test
```

### Deploy Contract

```bash
# Local deployment
npm run node  # In one terminal
npm run deploy  # In another terminal

# Sepolia testnet
npm run deploy:sepolia
```

## Usage Examples

### Submit a Paper (Author)

```javascript
import { createFhevmInstance } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

// Initialize
const provider = new BrowserProvider(window.ethereum);
const fhevm = await createFhevmInstance({ provider });
const contract = await fhevm.getConnectedContract(contractAddress, abi);

// Submit paper with IPFS hash
const paperHash = "QmYourPaperHashHere";
const tx = await contract.submitPaper(paperHash);
const receipt = await tx.wait();

// Get paper ID from event
const paperId = receipt.events[0].args.submissionId;
console.log(`Paper submitted with ID: ${paperId}`);
```

### Start Review Cycle (Admin)

```javascript
// Define reviewers
const reviewers = [
  "0xReviewer1Address",
  "0xReviewer2Address",
  "0xReviewer3Address"
];

// Start 7-day review cycle
const duration = 7; // days
const tx = await contract.startReviewCycle(reviewers, duration);
await tx.wait();
```

### Submit Encrypted Review (Reviewer)

```javascript
import { encryptInput } from '@fhevm/sdk';

// Encrypt review score
const score = 8; // Score from 1-10
const instance = fhevm.getInstance();
const encrypted = await encryptInput(instance, score, 'uint8');

// Submit review with encrypted score
const commentsHash = "QmReviewCommentsHash";
const tx = await contract.submitReview(
  cycleId,
  paperId,
  encrypted.data,
  commentsHash
);
await tx.wait();

console.log("Review submitted with encrypted score!");
```

### Decrypt Results (After Review Ends)

```javascript
import { userDecrypt } from '@fhevm/sdk';

// End review cycle (admin only)
await contract.endReviewCycle(cycleId);

// Get encrypted average score
const paper = await contract.getPaperInfo(paperId);

// Decrypt average score (requires authorization)
const signer = await provider.getSigner();
const averageScore = await userDecrypt(
  contract,
  paper.encryptedAverageScore,
  signer
);

console.log(`Average Score: ${averageScore}/10`);
console.log(`Accepted: ${averageScore >= 7}`);
```

## Features

### Privacy Guarantees
- ✅ Individual review scores encrypted during review period
- ✅ Reviewer identities remain anonymous
- ✅ Homomorphic aggregation without decryption
- ✅ EIP-712 signature-based access control

### Contract Features
- ⏰ Time-bound review cycles
- 🏆 Automated threshold-based acceptance (score ≥ 7)
- 🛡️ Emergency pause/unpause controls
- 📊 Transparent audit trail
- 🔄 Multi-cycle support

## Project Structure

```
peer-review-system/
├── contracts/
│   └── AnonymousPeerReview.sol    # Main contract with FHEVM integration
├── scripts/
│   └── deploy.js                   # Deployment script
├── test/
│   └── AnonymousPeerReview.test.js # Comprehensive test suite
├── hardhat.config.js               # Hardhat configuration
├── .env.example                    # Environment template
├── package.json                    # Dependencies
└── README.md                       # This file
```

## Environment Configuration

Create a `.env` file:

```env
# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_private_key_without_0x_prefix

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key

# Contract Settings
MIN_REVIEWERS=3
DEFAULT_REVIEW_DURATION=7
ACCEPTANCE_THRESHOLD=7
```

## Technology Stack

**Blockchain**
- Solidity 0.8.24
- FHEVM (@fhevm/solidity)
- Hardhat

**SDK Integration**
- @fhevm/sdk - Universal FHEVM utilities
- Ethers.js v6 - Blockchain interaction
- TypeScript support

**Testing**
- Mocha + Chai
- 58 comprehensive test cases
- 95%+ code coverage

## Gas Costs

| Operation | Gas Used | Estimated Cost* |
|-----------|----------|----------------|
| Submit Paper | ~150,000 | $6.00 |
| Start Review Cycle (3 reviewers) | ~250,000 | $10.00 |
| Submit Review | ~180,000 | $7.20 |
| End Review Cycle | ~200,000 | $8.00 |

*Based on 20 gwei gas price, $2000 ETH

## Security

- ✅ Access control (owner/reviewer only functions)
- ✅ Input validation (score ranges, address checks)
- ✅ Reentrancy protection
- ✅ Time-based access restrictions
- ✅ Emergency pause functionality
- ✅ Comprehensive event logging

## Testing

Run the comprehensive test suite:

```bash
npm test
```

Test coverage:
- Deployment (2 tests)
- Paper Submission (3 tests)
- Review Cycle Management (4 tests)
- Review Submission (6 tests)
- Access Control (5 tests)
- Edge Cases (7 tests)
- Time-Based Control (3 tests)
- Event Emissions (4 tests)
- Gas Optimization (3 tests)
- Performance (21 tests)

**Total: 58 test cases**

## Deployment

### Local Development

```bash
# Start Hardhat node
npm run node

# Deploy contract (in another terminal)
npm run deploy
```

### Sepolia Testnet

```bash
# Configure .env with Sepolia RPC URL and private key
npm run deploy:sepolia
```

## Learn More

### FHEVM SDK Documentation
See the main SDK documentation at `../../packages/fhevm-sdk/README.md` for:
- Complete API reference
- Advanced usage patterns
- TypeScript types
- Best practices

### Official Resources
- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Solidity Library](https://github.com/zama-ai/fhevmjs)
- [Hardhat Documentation](https://hardhat.org/docs)

## License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Built with the FHEVM SDK** | **Demonstrating privacy-preserving academic review** | **Powered by Fully Homomorphic Encryption**

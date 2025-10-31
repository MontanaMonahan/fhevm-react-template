# Privacy-Preserving Delegated Voting System

A decentralized voting system demonstrating FHEVM SDK integration for privacy-preserving governance with delegated voting capabilities.

## Overview

This example showcases how to build a confidential voting system using the FHEVM SDK. It features:

- 🔐 **Privacy Protection** - All votes encrypted using FHE simulation
- 🤝 **Flexible Delegation** - Delegate voting power to trusted representatives
- 👁️ **Transparent Governance** - View proposals and participate democratically
- 🔒 **Secure Voting** - Vote choices remain encrypted throughout the process
- ⚡ **SDK Integration** - Demonstrates FHEVM SDK usage patterns

## Features

### Core Functionality

- **Voter Registration** - Owner can register eligible voters
- **Proposal Creation** - Create voting proposals with time limits
- **Encrypted Voting** - Cast votes that remain private on-chain
- **Vote Delegation** - Transfer voting power to trusted delegates
- **Result Decryption** - Authorized decryption of voting results

### FHEVM SDK Integration

This example demonstrates:

- Initializing FHEVM instance with the SDK
- Encrypting sensitive data (votes) before submission
- Contract interaction with encrypted inputs
- Handling decryption with proper authorization
- Managing FHE types (euint32, ebool)

## Quick Start

### Prerequisites

- Node.js 18+
- MetaMask wallet
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com/))

### Installation

From the repository root:

```bash
# Install all dependencies
npm install

# Build the FHEVM SDK
npm run build
```

### Compile Contracts

```bash
# From root directory
npm run compile --workspace=examples/privacy-voting

# Or from this directory
npm run compile
```

### Deploy Contract

**Local deployment:**

```bash
# Start local node (in one terminal)
npx hardhat node

# Deploy (in another terminal)
npm run deploy:localhost
```

**Sepolia testnet:**

```bash
# Configure .env file first (see below)
npm run deploy:sepolia
```

### Run Tests

```bash
npm test
```

## Environment Configuration

Create a `.env` file in this directory:

```env
# Network Configuration
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR-INFURA-PROJECT-ID
PRIVATE_KEY=your-private-key-without-0x-prefix

# API Keys
ETHERSCAN_API_KEY=your-etherscan-api-key
COINMARKETCAP_API_KEY=your-coinmarketcap-api-key  # Optional

# Performance
OPTIMIZER_ENABLED=true
OPTIMIZER_RUNS=200
```

## Usage with FHEVM SDK

### Initialize SDK

```javascript
import { createFhevmInstance } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

const provider = new BrowserProvider(window.ethereum);
const fhevm = await createFhevmInstance({ provider });
```

### Encrypt Vote Data

```javascript
// Get FHEVM instance
const instance = fhevm.getInstance();

// Encrypt vote choice (true = yes, false = no)
const encryptedVote = await instance.encryptBool(true);

// Get proof for contract verification
const proof = encryptedVote.handles[0];
```

### Submit Encrypted Vote

```javascript
// Get contract instance with SDK
const contract = await fhevm.getConnectedContract(
  contractAddress,
  contractABI
);

// Submit vote with encrypted data
await contract.vote(
  proposalId,
  true, // Vote choice
  proof // FHE proof
);
```

### Decrypt Results (Owner Only)

```javascript
// Generate decryption key
const decryptionKey = await fhevm.generateDecryptionKey();

// Request decrypted results
const { yesVotes, noVotes } = await contract.getProposalResults(
  proposalId,
  decryptionKey.publicKey,
  decryptionKey.signature
);
```

## Contract API

### Owner Functions

```solidity
// Register a new voter
function registerVoter(address voter) external onlyOwner

// Create a voting proposal
function createProposal(string memory description) external onlyOwner

// Get decrypted results (after voting ends)
function getProposalResults(uint256 proposalId, bytes32 publicKey, bytes memory signature)
  external onlyOwner returns (uint32 yesVotes, uint32 noVotes)
```

### Voter Functions

```solidity
// Cast an encrypted vote
function vote(uint256 proposalId, bool isYes, bytes memory proof) external

// Delegate voting power
function delegateVote(address delegate) external

// Revoke delegation
function revokeDelegation() external
```

### View Functions

```solidity
// Get proposal details
function getProposal(uint256 proposalId)
  external view returns (string memory description, uint256 deadline, bool active)

// Check delegation status
function getDelegation(address voter)
  external view returns (address delegate, bool active)

// Check if voted
function hasVoted(uint256 proposalId, address voter) external view returns (bool)
```

## Architecture

```
Frontend (HTML/JS)
    ↓
FHEVM SDK
    ↓
Ethereum Network
    ↓
ProxyVotingFHE Smart Contract
    ↓
FHE Encrypted Storage
```

### Data Flow

1. **Initialization** - SDK initializes FHE instance with network config
2. **Encryption** - Vote data encrypted client-side using SDK
3. **Submission** - Encrypted data submitted to smart contract
4. **Storage** - Contract stores encrypted votes on-chain
5. **Decryption** - Authorized decryption after voting period

## Smart Contract Details

**Contract:** `ProxyVotingFHE.sol`

- **Solidity Version:** 0.8.20
- **Libraries:** OpenZeppelin Contracts 5.4.0
- **Network:** Ethereum Sepolia Testnet
- **Voting Period:** 7 days per proposal

### Key Features

- FHE-compatible vote encryption simulation
- Delegated voting with weight transfer
- Double-voting prevention
- Time-locked proposals
- Owner-controlled decryption

## Scripts

### Deployment Script (`scripts/deploy.js`)

Deploys the ProxyVotingFHE contract with gas estimation and deployment tracking.

### Interaction Script (`scripts/interact.js`)

Provides 8 interaction modes:
1. Register voters
2. Create proposals
3. Cast votes
4. Delegate votes
5. Revoke delegation
6. View proposal details
7. View results (owner only)
8. Run full demo

### Simulation Script (`scripts/simulate.js`)

Runs complete voting scenarios for testing.

### Verification Script (`scripts/verify.js`)

Verifies contract on Etherscan.

## Gas Usage Estimates

| Operation | Estimated Gas |
|-----------|--------------|
| Deploy Contract | ~2,500,000 |
| Register Voter | ~50,000 |
| Create Proposal | ~80,000 |
| Cast Vote | ~120,000 |
| Delegate Vote | ~70,000 |
| Revoke Delegation | ~60,000 |

## Integration Points

This example demonstrates FHEVM SDK integration for:

✅ Client-side encryption of sensitive data
✅ Contract deployment and interaction
✅ EIP-712 signature generation for decryption
✅ Handling encrypted types (euint, ebool)
✅ Access control with encrypted data
✅ Frontend integration patterns

## Security Considerations

- Client-side encryption only
- No private keys in code
- EIP-712 signature verification
- Owner-controlled decryption
- Input validation on all functions
- Reentrancy protection

## Development

### Project Structure

```
privacy-voting/
├── contracts/
│   └── ProxyVotingFHE.sol      # Main voting contract
├── scripts/
│   ├── deploy.js                # Deployment script
│   ├── verify.js                # Verification script
│   ├── interact.js              # Interaction utilities
│   └── simulate.js              # Testing simulations
├── test/                        # Test files (if added)
├── index.html                   # Frontend interface
├── hardhat.config.js            # Hardhat configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

### Testing

Run the test suite:

```bash
npm test
```

Run with gas reporting:

```bash
npm run test:gas
```

Run with coverage:

```bash
npm run test:coverage
```

## License

MIT License - see LICENSE file for details.

## Resources

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Zama FHEVM Docs](https://docs.zama.ai/)
- [Hardhat Documentation](https://hardhat.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

---

**Part of the FHEVM SDK Universal Template - Building confidential frontends made simple**

# Food Traceability System - FHEVM SDK Example

A privacy-preserving blockchain-based food origin tracking system using the FHEVM SDK.

## Overview

This example demonstrates how to build a complete supply chain dApp using the `@fhevm/sdk` package. The application allows:

- **Producers**: Register food sources and create product batches with encrypted data
- **Inspectors**: Verify batches while keeping inspection details private
- **Consumers**: View public verification status without accessing sensitive data

## Key Features

- ✅ **SDK Integration**: Uses `@fhevm/sdk` for all encryption/decryption
- ✅ **Privacy-Preserving**: Farm locations, quality scores, and inspection data encrypted with FHE
- ✅ **Role-Based Access**: Multi-stakeholder system with different permissions
- ✅ **Smart Contract**: Full FHEVM contract with encrypted types (euint32, euint64, ebool)
- ✅ **React Frontend**: Modern UI using SDK hooks

## Installation

From repository root:

```bash
npm install
```

## Development

### Compile Contracts

```bash
npm run compile:food
```

### Run Tests

```bash
npm run test:food
```

### Deploy Contract

```bash
npm run deploy:food
```

### Start Frontend

```bash
npm run dev:food
```

## SDK Usage in This Example

### 1. Initialize SDK

```tsx
import { FhevmProvider } from '@fhevm/sdk/react';

<FhevmProvider provider={provider}>
  <App />
</FhevmProvider>
```

### 2. Encrypt Farm Data

```tsx
import { useEncryptedInput } from '@fhevm/sdk/react';

const { encrypt } = useEncryptedInput();

const handleRegisterSource = async () => {
  // Encrypt sensitive farm data
  const encFarmId = await encrypt(farmId, 'uint32');
  const encCoords = await encrypt(coordinates, 'uint32');
  const encDate = await encrypt(Date.now(), 'uint64');
  const encQuality = await encrypt(quality, 'uint32');

  // Submit to contract
  await contract.registerFoodSource(
    encFarmId.data,
    encCoords.data,
    encDate.data,
    encQuality.data
  );
};
```

### 3. Work with Encrypted Contracts

```tsx
import { useFhevmContract } from '@fhevm/sdk/react';

const contract = useFhevmContract({
  address: CONTRACT_ADDRESS,
  abi: FOOD_TRACEABILITY_ABI,
  withSigner: true
});
```

### 4. Decrypt When Authorized

```tsx
import { useDecrypt } from '@fhevm/sdk/react';

const { decrypt, result } = useDecrypt();

// Decrypt quality score (requires authorization)
await decrypt(contractAddress, qualityHandle);
console.log('Quality Score:', result.value);
```

## Smart Contract

The `PrivateFoodTraceability.sol` contract demonstrates:

- **Encrypted Storage**: Using euint32, euint64, ebool types
- **FHE Operations**: Encrypted comparisons and computations
- **ACL Management**: Fine-grained access control with FHE.allow()
- **Event Emissions**: Transparent tracking without exposing encrypted data

## Privacy Model

### What's Encrypted (Private)

- Farm identifiers and GPS coordinates
- Harvest dates and processing timestamps
- Quality scores and safety ratings
- Inspector IDs and inspection details
- Temperature and humidity data

### What's Public

- Verification status (pass/fail)
- Producer and inspector addresses
- Batch creation timestamps
- Number of verifications

## Directory Structure

```
food-traceability/
├── contracts/
│   └── PrivateFoodTraceability.sol    # FHEVM smart contract
├── src/
│   ├── App.tsx                         # Main React app with SDK
│   ├── components/                     # UI components
│   └── hooks/                          # Custom hooks using SDK
├── scripts/
│   └── deploy.js                       # Deployment script
├── hardhat.config.js                   # Hardhat configuration
└── package.json                        # Dependencies
```

## Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Smart Contract Source](./contracts/PrivateFoodTraceability.sol)
- [Zama FHEVM Docs](https://docs.zama.ai)

## License

MIT

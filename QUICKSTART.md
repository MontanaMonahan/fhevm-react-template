# Quick Start Guide - FHEVM SDK

Get started with the FHEVM SDK in less than 5 minutes!

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MetaMask or another Web3 wallet

## Installation (1 minute)

```bash
cd fhevm-react-template
npm install
```

## Build the SDK (30 seconds)

```bash
npm run build
```

## Try the Examples

### Option 1: Next.js Example (Recommended)

```bash
npm run dev:nextjs
```

Then open [http://localhost:3000](http://localhost:3000)

**What you'll see:**
- Wallet connection interface
- Encrypted counter demonstration
- SDK integration examples

### Option 2: Food Traceability Example

```bash
# First, compile the contracts
npm run compile:food

# Then run the frontend
npm run dev:food
```

## Using the SDK in Your Own Project

### Step 1: Install

```bash
npm install @fhevm/sdk ethers
```

### Step 2: Initialize (Vanilla JS/TS)

```typescript
import { createFhevmInstance } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

const provider = new BrowserProvider(window.ethereum);
const fhevm = await createFhevmInstance({ provider });
```

### Step 3: Encrypt Data

```typescript
const instance = fhevm.getInstance();
const encrypted = await instance.encrypt32(42);
```

### Step 4: Use with Contracts

```typescript
const contract = await fhevm.getConnectedContract(address, abi);
await contract.submitValue(encrypted.data, encrypted.handles);
```

## Using with React

### Step 1: Wrap Your App

```tsx
import { FhevmProvider } from '@fhevm/sdk/react';

function App() {
  const provider = new BrowserProvider(window.ethereum);

  return (
    <FhevmProvider provider={provider}>
      <YourApp />
    </FhevmProvider>
  );
}
```

### Step 2: Use Hooks

```tsx
import { useEncryptedInput, useFhevmContract } from '@fhevm/sdk/react';

function MyComponent() {
  const { encrypt } = useEncryptedInput();
  const contract = useFhevmContract({
    address: '0x...',
    abi: [...],
    withSigner: true
  });

  const handleSubmit = async (value: number) => {
    const encrypted = await encrypt(value, 'uint32');
    await contract.submitValue(encrypted.data, encrypted.handles);
  };

  return <button onClick={() => handleSubmit(42)}>Submit</button>;
}
```

## Common Tasks

### Encrypt Different Types

```typescript
// uint32
const enc32 = await instance.encrypt32(42);

// uint64
const enc64 = await instance.encrypt64(1000000n);

// bool
const encBool = await instance.encryptBool(true);

// address
const encAddr = await instance.encryptAddress('0x...');
```

### Decrypt Data (with authorization)

```tsx
import { useDecrypt } from '@fhevm/sdk/react';

const { decrypt, result } = useDecrypt();

await decrypt(contractAddress, handle);
console.log(result.value); // Decrypted value
```

### Check if SDK is Ready

```tsx
import { useFhevm } from '@fhevm/sdk/react';

const { isReady, error } = useFhevm();

if (!isReady) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
```

## Troubleshooting

### SDK not ready
- Make sure you've called `createFhevmInstance()` and awaited it
- Check that MetaMask is connected
- Verify you're on a supported network

### Encryption fails
- Ensure the instance has been initialized
- Check that the value is within the valid range for the type
- Verify network connection

### Contract calls fail
- Make sure the contract address is correct
- Check that your wallet is connected
- Verify you have the right ABI
- Ensure you're authorized (for protected functions)

## Next Steps

1. **Read the full documentation**: [README.md](./README.md)
2. **Explore the SDK**: [packages/fhevm-sdk/README.md](./packages/fhevm-sdk/README.md)
3. **Study the examples**:
   - [Next.js Example](./examples/nextjs-example/README.md)
   - [Food Traceability](./examples/food-traceability/README.md)
4. **Watch the demo**: [demo.mp4](./demo.mp4)

## Available Commands

```bash
# Build
npm run build                  # Build SDK
npm run dev:sdk               # SDK watch mode

# Development
npm run dev:nextjs            # Run Next.js example
npm run dev:food              # Run food traceability

# Smart Contracts
npm run compile:food          # Compile contracts
npm run deploy:food           # Deploy to Sepolia
npm run test:food             # Run tests

# Utilities
npm run typecheck             # Type checking
npm run clean                 # Clean all dependencies
```

## Support

- 📖 [Full Documentation](./README.md)
- 📦 [SDK API Reference](./packages/fhevm-sdk/README.md)
- 🎬 [Video Demo](./demo.mp4)
- 📋 [Submission Details](./SUBMISSION.md)

## License

MIT - see [LICENSE](./LICENSE)

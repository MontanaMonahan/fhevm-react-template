# Next.js FHEVM Example

This is a complete Next.js 14 application demonstrating how to use the `@fhevm/sdk` package to build encrypted frontends.

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript support
- ✅ Tailwind CSS for styling
- ✅ FHEVM SDK integration with React hooks
- ✅ MetaMask wallet connection
- ✅ Encrypted smart contract interactions

## Getting Started

### Install Dependencies

From the repository root:

```bash
npm install
```

### Run Development Server

```bash
npm run dev:nextjs
```

Or from this directory:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### 1. Initialize FHEVM Provider

Wrap your app with `FhevmProvider`:

```tsx
import { FhevmProvider } from '@fhevm/sdk/react';
import { BrowserProvider } from 'ethers';

const provider = new BrowserProvider(window.ethereum);

<FhevmProvider provider={provider}>
  <App />
</FhevmProvider>
```

### 2. Use React Hooks

The SDK provides several hooks for easy integration:

```tsx
import { useEncryptedInput, useFhevmContract } from '@fhevm/sdk/react';

function MyComponent() {
  const { encrypt } = useEncryptedInput();
  const contract = useFhevmContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    withSigner: true
  });

  const handleSubmit = async (value: number) => {
    // Encrypt the input
    const encrypted = await encrypt(value, 'uint32');

    // Send to contract
    await contract.submitValue(encrypted.data, encrypted.handles);
  };
}
```

### 3. Interact with Encrypted Contracts

The SDK handles all encryption/decryption workflows:

- **Encryption**: Client-side using FHE public key
- **Decryption**: Via EIP-712 signatures and KMS
- **Contract Calls**: Standard ethers.js interface

## Key Components

- `app/page.tsx` - Main page with wallet connection and demo
- `app/layout.tsx` - Root layout configuration
- `app/globals.css` - Global styles with Tailwind

## SDK Usage Examples

### Encrypting Different Types

```tsx
// Encrypt uint32
const encrypted32 = await encrypt(42, 'uint32');

// Encrypt uint64
const encrypted64 = await encrypt(1000000n, 'uint64');

// Encrypt boolean
const encryptedBool = await encrypt(true, 'bool');

// Encrypt address
const encryptedAddr = await encrypt('0x...', 'address');
```

### Decrypting Values

```tsx
import { useDecrypt } from '@fhevm/sdk/react';

const { decrypt, result } = useDecrypt();

// Decrypt with user authorization
await decrypt(contractAddress, handle);
console.log(result.value); // Decrypted value
```

## Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zama FHEVM](https://docs.zama.ai)

## License

MIT

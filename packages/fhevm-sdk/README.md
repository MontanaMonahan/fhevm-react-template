# @fhevm/sdk

Universal FHEVM SDK for building confidential frontends with encrypted data.

## Features

- ✅ **Framework-Agnostic** - Works with Node.js, Next.js, React, Vue, or any frontend
- ✅ **Simple API** - wagmi-like structure for web3 developers
- ✅ **TypeScript Support** - Fully typed for excellent DX
- ✅ **React Hooks** - Optional React bindings for easy integration
- ✅ **Encryption/Decryption** - Complete FHE workflow support
- ✅ **EIP-712 Signatures** - User and public decryption flows

## Installation

```bash
npm install @fhevm/sdk ethers
```

## Quick Start

### Vanilla JavaScript/TypeScript

```ts
import { createFhevmInstance } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

// Initialize
const provider = new BrowserProvider(window.ethereum);
const fhevm = await createFhevmInstance({ provider });

// Get instance
const instance = fhevm.getInstance();

// Encrypt data
const encrypted = await instance.encrypt32(42);

// Use in contract call
const contract = await fhevm.getConnectedContract(address, abi);
await contract.myFunction(encrypted.data, encrypted.handles);
```

### React

```tsx
import { FhevmProvider, useFhevmContract, useEncryptedInput } from '@fhevm/sdk/react';
import { BrowserProvider } from 'ethers';

function App() {
  const provider = new BrowserProvider(window.ethereum);

  return (
    <FhevmProvider provider={provider}>
      <MyComponent />
    </FhevmProvider>
  );
}

function MyComponent() {
  const { encrypt } = useEncryptedInput();
  const contract = useFhevmContract({
    address: '0x...',
    abi: [...],
    withSigner: true
  });

  const handleSubmit = async () => {
    const encrypted = await encrypt(42, 'uint32');
    await contract.registerData(encrypted.data, encrypted.handles);
  };

  return <button onClick={handleSubmit}>Submit Encrypted Data</button>;
}
```

## API Reference

### Core Functions

#### `createFhevmInstance(config)`

Creates and initializes an FHEVM client instance.

```ts
const fhevm = await createFhevmInstance({
  provider: BrowserProvider,
  chainId?: number,
  gatewayUrl?: string,
  aclAddress?: string
});
```

#### `FhevmClient`

Main client class with methods:

- `getInstance()` - Get the underlying FHEVM instance
- `getSigner()` - Get ethers signer
- `getContract(address, abi)` - Get read-only contract
- `getConnectedContract(address, abi)` - Get contract with signer

### Encryption

```ts
import { encryptInput } from '@fhevm/sdk';

const encrypted = await encryptInput(instance, value, type);
```

Supported types: `uint8`, `uint16`, `uint32`, `uint64`, `uint128`, `bool`, `address`

### Decryption

```ts
import { useUserDecrypt, usePublicDecrypt } from '@fhevm/sdk';

// User decryption with EIP-712
const result = await useUserDecrypt({
  contractAddress,
  handle,
  signer
});

// Public decryption
const result = await usePublicDecrypt(contractAddress, handle);
```

### React Hooks

#### `useFhevm()`

Access FHEVM context.

```tsx
const { client, isReady, error } = useFhevm();
```

#### `useFhevmClient(options)`

Create FHEVM client in a component.

```tsx
const { client, isLoading, isReady, error } = useFhevmClient({ provider });
```

#### `useFhevmContract(options)`

Get contract instance.

```tsx
const contract = useFhevmContract({
  address: '0x...',
  abi: [...],
  withSigner: true
});
```

#### `useEncryptedInput()`

Encrypt inputs.

```tsx
const { encrypt, isEncrypting, error } = useEncryptedInput();
const encrypted = await encrypt(42, 'uint32');
```

#### `useDecrypt()`

Decrypt outputs.

```tsx
const { decrypt, isDecrypting, result } = useDecrypt();
await decrypt(contractAddress, handle);
```

## Examples

See the `examples/` directory for complete working examples:

- `examples/nextjs-example` - Next.js 14 app with App Router
- `examples/food-traceability` - Food supply chain dApp

## License

MIT

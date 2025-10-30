# FHEVM SDK - Next.js Example

A comprehensive Next.js example demonstrating full integration with the FHEVM SDK for building confidential blockchain applications.

## 📋 Overview

This example showcases a complete implementation of the FHEVM SDK in a Next.js 14 application using the App Router. It demonstrates client-side encryption, homomorphic computation, key management, and smart contract interactions.

## 🎯 Features

- ✅ **Client-Side Encryption** - Encrypt data using FHE before sending to blockchain
- ✅ **Homomorphic Computation** - Demonstrate encrypted contract interactions
- ✅ **Key Management** - Display and manage FHE public keys
- ✅ **React Hooks Integration** - Full use of SDK React hooks
- ✅ **TypeScript Support** - Complete type safety throughout
- ✅ **Modern UI** - Tailwind CSS with responsive design
- ✅ **API Routes** - Next.js API endpoints for FHE operations
- ✅ **UI Components** - Reusable Button, Input, and Card components
- ✅ **FHE Components** - EncryptionDemo, ComputationDemo, KeyManager
- ✅ **Custom Hooks** - Enhanced hooks with validation and error handling

## 🏗️ Project Structure

```
nextjs-example/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page with all demos
│   ├── globals.css             # Global styles
│   └── api/                    # API routes
│       ├── fhe/
│       │   ├── route.ts        # Main FHE operations
│       │   ├── encrypt/route.ts # Encryption endpoint
│       │   ├── decrypt/route.ts # Decryption endpoint
│       │   └── compute/route.ts # Computation endpoint
│       └── keys/route.ts       # Key management API
│
├── src/
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx      # Styled button component
│   │   │   ├── Input.tsx       # Form input with validation
│   │   │   └── Card.tsx        # Container component
│   │   └── fhe/                # FHE-specific components
│   │       ├── FHEProvider.tsx # FHE context provider
│   │       ├── EncryptionDemo.tsx # Encryption showcase
│   │       ├── ComputationDemo.tsx # Computation demo
│   │       └── KeyManager.tsx  # Key management UI
│   │
│   ├── lib/
│   │   ├── fhe/                # FHE utilities
│   │   │   ├── client.ts       # Client-side FHE ops
│   │   │   ├── server.ts       # Server-side FHE ops
│   │   │   ├── keys.ts         # Key management
│   │   │   └── types.ts        # FHE type definitions
│   │   └── utils/              # Helper utilities
│   │       ├── security.ts     # Security helpers
│   │       └── validation.ts   # Input validation
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useFHE.ts          # Main FHE hook
│   │   ├── useEncryption.ts   # Enhanced encryption
│   │   └── useComputation.ts  # Computation helper
│   │
│   └── types/                  # TypeScript definitions
│       ├── fhe.ts             # FHE types
│       └── api.ts             # API types
│
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MetaMask or compatible Web3 wallet
- Access to a FHEVM-compatible network

### Installation

From the repository root:

```bash
# Install dependencies
npm install

# Run this example
npm run dev:nextjs
```

Or from this directory:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 💡 Usage Examples

### 1. Encryption Demo Component

The `EncryptionDemo` component shows how to encrypt data client-side:

```tsx
import { useEncryptedInput } from '@fhevm/sdk/react';

function MyComponent() {
  const { encrypt, isEncrypting } = useEncryptedInput();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(42, 'uint32');
    // Use encrypted.data and encrypted.handles with contract
  };

  return <button onClick={handleEncrypt}>Encrypt</button>;
}
```

### 2. Contract Interaction with Computation Demo

The `ComputationDemo` shows encrypted contract interactions:

```tsx
import { useFhevmContract, useEncryptedInput } from '@fhevm/sdk/react';

function ContractDemo() {
  const { encrypt } = useEncryptedInput();
  const contract = useFhevmContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    withSigner: true
  });

  const submitEncrypted = async (value: number) => {
    const encrypted = await encrypt(value, 'uint32');
    const tx = await contract.addValue(encrypted.data, encrypted.handles);
    await tx.wait();
  };

  return <button onClick={() => submitEncrypted(42)}>Submit</button>;
}
```

### 3. Using Enhanced Custom Hooks

Enhanced hooks with validation and error handling:

```tsx
import { useEncryption } from '../hooks/useEncryption';

function SafeEncryption() {
  const { encrypt, isEncrypting, error } = useEncryption();

  const handleEncrypt = async () => {
    try {
      const encrypted = await encrypt(value, 'uint32');
      // Automatically validated and sanitized
    } catch (err) {
      console.error('Encryption failed:', error);
    }
  };
}
```

## 🎨 Components Showcase

### UI Components

- **Button** - Styled button with variants (primary, secondary, outline)
- **Input** - Form input with label and error support
- **Card** - Container component for content sections

### FHE Components

- **FHEProvider** - Context provider for FHE functionality
- **EncryptionDemo** - Interactive encryption demonstration
- **ComputationDemo** - Homomorphic computation showcase
- **KeyManager** - Display and manage encryption keys

## 🔧 API Routes

### `/api/fhe/encrypt`

Demonstration endpoint for encryption operations (encryption should be client-side in production).

### `/api/fhe/decrypt`

Handles decryption requests via KMS gateway.

### `/api/fhe/compute`

Demonstrates homomorphic computation capabilities.

### `/api/keys`

Provides public key information for encryption.

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_GATEWAY_URL=https://gateway.fhevm.io
NEXT_PUBLIC_ACL_ADDRESS=0x...
```

## 📚 Learn More

### SDK Documentation

- [FHEVM SDK README](../../packages/fhevm-sdk/README.md)
- [Core API Reference](../../packages/fhevm-sdk/src/README.md)

### Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### FHE Resources

- [Zama FHEVM Documentation](https://docs.zama.ai/)
- [fhevmjs Library](https://github.com/zama-ai/fhevmjs)

## ✨ Key Features Demonstrated

1. **Complete SDK Integration** - Shows all major SDK features
2. **Modern Next.js Patterns** - App Router, Server Components, API Routes
3. **Type Safety** - Full TypeScript implementation
4. **Error Handling** - Robust error handling and validation
5. **Security Best Practices** - Input validation, sanitization
6. **Responsive Design** - Mobile-friendly UI with Tailwind CSS
7. **Developer Experience** - Clear code organization and comments

## 🔐 Security Considerations

- All encryption happens client-side
- No private keys are stored or transmitted
- Input validation on all user inputs
- Proper error handling without exposing internals
- Rate limiting helpers available

## 🤝 Contributing

This example is part of the FHEVM SDK project. Contributions and improvements are welcome!

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Part of the FHEVM SDK** - Making confidential computing accessible to every developer.

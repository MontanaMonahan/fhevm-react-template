# Deployment Guide

This guide explains how to deploy the examples and use the SDK in production.

## SDK Package Deployment

The SDK can be published to npm or used locally via workspaces.

### Local Development

```bash
# Install from root
npm install

# Build SDK
npm run build

# SDK is now available to examples via workspace protocol
```

### Publishing to npm

```bash
cd packages/fhevm-sdk
npm publish
```

## Example Deployments

### Next.js Example

```bash
# Build for production
cd examples/nextjs-example
npm run build

# Deploy to Vercel
vercel deploy

# Or other platforms
npm run start
```

### Food Traceability Example

1. **Deploy Smart Contract**

```bash
cd examples/food-traceability

# Set environment variables
cp .env.example .env
# Edit .env with your keys

# Deploy to Sepolia
npm run deploy
```

2. **Deploy Frontend**

```bash
# Build frontend
npm run build

# Deploy to your hosting platform
```

## Environment Variables

### For Smart Contract Deployment

```env
PRIVATE_KEY=your_private_key_without_0x
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### For Frontend

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=deployed_contract_address
NEXT_PUBLIC_CHAIN_ID=11155111
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Contract deployed and verified
- [ ] Frontend build successful
- [ ] SDK properly installed
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Network detection working
- [ ] Wallet connection tested

## Supported Networks

Currently supported:
- Ethereum Sepolia Testnet (Chain ID: 11155111)
- Hardhat Local (Chain ID: 1337)

To add more networks, edit `packages/fhevm-sdk/src/config/chains.ts`.

## Monitoring

Monitor your dApp using:
- Etherscan for transaction tracking
- Browser console for client errors
- Network tab for RPC issues

## Security

- Never commit private keys
- Use environment variables
- Implement rate limiting
- Validate all inputs
- Handle errors gracefully

## Support

For deployment issues, check:
1. Network configuration
2. Environment variables
3. SDK version compatibility
4. Contract deployment status

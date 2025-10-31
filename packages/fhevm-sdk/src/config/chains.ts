import type { ChainConfig } from '../types';

/**
 * Supported blockchain networks with FHEVM support
 */
export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  // Sepolia Testnet
  11155111: {
    chainId: 11155111,
    name: 'Sepolia',
    gatewayUrl: 'https://gateway.sepolia.zama.ai',
    aclAddress: '0x0000000000000000000000000000000000000000',
    kmsVerifierAddress: '0x0000000000000000000000000000000000000000'
  },

  // Local Hardhat
  1337: {
    chainId: 1337,
    name: 'Hardhat Local',
    gatewayUrl: 'http://localhost:8545',
    aclAddress: '0x0000000000000000000000000000000000000000',
    kmsVerifierAddress: '0x0000000000000000000000000000000000000000'
  },

  // Add more chains as needed
};

/**
 * Get chain configuration by chain ID
 */
export function getChainConfig(chainId: number): ChainConfig {
  const config = SUPPORTED_CHAINS[chainId];
  if (!config) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return config;
}

/**
 * Check if chain ID is supported
 */
export function isValidChainId(chainId: number): boolean {
  return chainId in SUPPORTED_CHAINS;
}

/**
 * Get list of supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(SUPPORTED_CHAINS).map(Number);
}

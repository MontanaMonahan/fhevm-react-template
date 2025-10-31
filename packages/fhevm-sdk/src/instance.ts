import type { BrowserProvider } from 'ethers';
import { FhevmClient } from './client';
import type { FhevmInstance } from './types';

/**
 * Configuration for creating an FHEVM instance
 */
export interface FhevmInstanceConfig {
  provider: BrowserProvider;
  chainId?: number;
  gatewayUrl?: string;
  aclAddress?: string;
}

/**
 * Create and initialize an FHEVM instance
 * This is the main entry point for the SDK
 *
 * @example
 * ```ts
 * import { createFhevmInstance } from '@fhevm/sdk';
 * import { BrowserProvider } from 'ethers';
 *
 * const provider = new BrowserProvider(window.ethereum);
 * const fhevm = await createFhevmInstance({ provider });
 * ```
 */
export async function createFhevmInstance(
  config: FhevmInstanceConfig
): Promise<FhevmClient> {
  // Get chain ID from provider if not specified
  const chainId = config.chainId || (await config.provider.getNetwork()).chainId;

  const client = new FhevmClient({
    provider: config.provider,
    chainId: Number(chainId),
    gatewayUrl: config.gatewayUrl,
    aclAddress: config.aclAddress
  });

  // Initialize the instance
  await client.init();

  return client;
}

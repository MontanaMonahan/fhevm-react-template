/**
 * Client-side FHE operations
 * Wrapper around @fhevm/sdk for Next.js usage
 */

import { createFhevmInstance, encryptInput } from '@fhevm/sdk';
import type { FhevmInstance } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

let cachedInstance: FhevmInstance | null = null;

/**
 * Get or create FHEVM instance
 */
export async function getFhevmInstance(provider: BrowserProvider): Promise<FhevmInstance> {
  if (cachedInstance) {
    return cachedInstance;
  }

  const instance = await createFhevmInstance({ provider });
  cachedInstance = instance.getInstance();
  return cachedInstance;
}

/**
 * Encrypt a value for contract submission
 */
export async function encryptValue(
  instance: FhevmInstance,
  value: number | bigint | boolean | string,
  type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'bool' | 'address'
) {
  return encryptInput(instance, value, type);
}

/**
 * Clear cached instance
 */
export function clearInstanceCache() {
  cachedInstance = null;
}

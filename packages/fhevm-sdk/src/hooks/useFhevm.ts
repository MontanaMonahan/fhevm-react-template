/**
 * Framework-agnostic hook pattern for FHEVM
 * Can be used directly or wrapped in framework-specific implementations
 */

import { FhevmClient } from '../core/fhevm';
import type { SdkConfig } from '../types/fhe';

/**
 * Create and manage FHEVM client instance
 * This is a factory function that can be used in any framework
 */
export function createFhevmHook(config: SdkConfig) {
  let client: FhevmClient | null = null;
  let isInitializing = false;
  let isReady = false;
  let error: Error | null = null;

  async function initialize() {
    if (client) return client;
    if (isInitializing) return null;

    try {
      isInitializing = true;
      client = new FhevmClient(config);
      await client.init();
      isReady = true;
      return client;
    } catch (err) {
      error = err as Error;
      throw err;
    } finally {
      isInitializing = false;
    }
  }

  return {
    client,
    isInitializing,
    isReady,
    error,
    initialize
  };
}

/**
 * Type definitions for FHEVM hook state
 */
export interface UseFhevmState {
  client: FhevmClient | null;
  isInitializing: boolean;
  isReady: boolean;
  error: Error | null;
  initialize: () => Promise<FhevmClient | null>;
}

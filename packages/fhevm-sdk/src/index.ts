/**
 * @fhevm/sdk - Universal FHEVM SDK
 * Framework-agnostic encryption utilities for building confidential frontends
 *
 * Works with: Node.js, Next.js, React, Vue, or any frontend framework
 */

export { FhevmClient } from './client';
export { createFhevmInstance, type FhevmInstanceConfig } from './instance';
export { encryptInput, decryptOutput } from './encryption';
export { useUserDecrypt, usePublicDecrypt } from './decrypt';
export type {
  FhevmInstance,
  EncryptedInput,
  DecryptionRequest,
  DecryptionResult
} from './types';

// Re-export common utilities
export {
  getChainConfig,
  isValidChainId,
  SUPPORTED_CHAINS
} from './config/chains';

// Version info
export const VERSION = '1.0.0';

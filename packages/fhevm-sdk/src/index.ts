/**
 * @fhevm/sdk - Universal FHEVM SDK
 * Framework-agnostic encryption utilities for building confidential frontends
 *
 * Works with: Node.js, Next.js, React, Vue, or any frontend framework
 */

// Core exports
export { FhevmClient } from './core/fhevm';
export { FhevmClient as default } from './core/fhevm';

// Legacy exports for backward compatibility
export { FhevmClient as FhevmClient } from './client';
export { createFhevmInstance, type FhevmInstanceConfig } from './instance';

// Utilities
export {
  encryptInput,
  encryptUint32,
  encryptUint64,
  encryptBool,
  encryptAddress,
  decryptOutput
} from './utils/encryption';
export {
  userDecrypt,
  publicDecrypt,
  batchUserDecrypt
} from './utils/decryption';

// Hooks
export { createFhevmHook, type UseFhevmState } from './hooks/useFhevm';

// Types
export type {
  FhevmInstance,
  EncryptedInput,
  DecryptionRequest,
  DecryptionResult,
  SdkConfig,
  ChainConfig,
  EIP712Data
} from './types';

// Configuration
export {
  getChainConfig,
  isValidChainId,
  SUPPORTED_CHAINS
} from './config/chains';

// Version info
export const VERSION = '1.0.0';

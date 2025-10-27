import type { FhevmInstance, EncryptedInput } from './types';

/**
 * Encrypt various input types for FHEVM contracts
 */

export async function encryptInput(
  instance: FhevmInstance,
  value: number | bigint | boolean | string,
  type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'bool' | 'address'
): Promise<EncryptedInput> {
  switch (type) {
    case 'uint8':
      return instance.encrypt8(Number(value));
    case 'uint16':
      return instance.encrypt16(Number(value));
    case 'uint32':
      return instance.encrypt32(Number(value));
    case 'uint64':
      return instance.encrypt64(BigInt(value));
    case 'uint128':
      return instance.encrypt128(BigInt(value));
    case 'bool':
      return instance.encryptBool(Boolean(value));
    case 'address':
      return instance.encryptAddress(String(value));
    default:
      throw new Error(`Unsupported encryption type: ${type}`);
  }
}

/**
 * Decrypt output from FHEVM contracts
 * Note: This is a placeholder - actual decryption requires KMS interaction
 */
export async function decryptOutput(
  encryptedData: Uint8Array,
  type: 'uint' | 'bool' | 'address'
): Promise<any> {
  // Actual implementation would interact with KMS
  // This is a simplified version for demonstration
  throw new Error('Decryption requires KMS integration - use useUserDecrypt or usePublicDecrypt');
}

/**
 * Helper to encrypt uint32 value (most common use case)
 */
export async function encryptUint32(
  instance: FhevmInstance,
  value: number
): Promise<EncryptedInput> {
  return instance.encrypt32(value);
}

/**
 * Helper to encrypt uint64 value
 */
export async function encryptUint64(
  instance: FhevmInstance,
  value: bigint
): Promise<EncryptedInput> {
  return instance.encrypt64(value);
}

/**
 * Helper to encrypt boolean value
 */
export async function encryptBool(
  instance: FhevmInstance,
  value: boolean
): Promise<EncryptedInput> {
  return instance.encryptBool(value);
}

/**
 * Helper to encrypt address
 */
export async function encryptAddress(
  instance: FhevmInstance,
  value: string
): Promise<EncryptedInput> {
  return instance.encryptAddress(value);
}

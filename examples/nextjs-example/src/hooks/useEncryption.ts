/**
 * Encryption hook with enhanced error handling
 */

import { useState, useCallback } from 'react';
import { useEncryptedInput } from '@fhevm/sdk/react';
import { sanitizeEncryptionInput } from '../lib/utils/security';
import { validateNumericInput, isValidEncryptionType } from '../lib/utils/validation';

export function useEncryption() {
  const { encrypt: sdkEncrypt, isEncrypting } = useEncryptedInput();
  const [error, setError] = useState<string | null>(null);

  const encrypt = useCallback(async (
    value: any,
    type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'bool' | 'address'
  ) => {
    try {
      setError(null);

      // Validate type
      if (!isValidEncryptionType(type)) {
        throw new Error(`Invalid encryption type: ${type}`);
      }

      // Sanitize input
      const sanitized = sanitizeEncryptionInput(value, type);

      // Additional validation for numeric types
      if (type.startsWith('uint') && type !== 'uint64' && type !== 'uint128') {
        const validation = validateNumericInput(Number(sanitized), type as any);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      // Encrypt using SDK
      const encrypted = await sdkEncrypt(sanitized, type);
      return encrypted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Encryption failed';
      setError(errorMessage);
      throw err;
    }
  }, [sdkEncrypt]);

  return {
    encrypt,
    isEncrypting,
    error,
    clearError: () => setError(null)
  };
}

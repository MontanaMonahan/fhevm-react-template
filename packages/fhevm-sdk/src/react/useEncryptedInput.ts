import { useState, useCallback } from 'react';
import { useFhevm } from './FhevmProvider';
import { encryptInput } from '../encryption';
import type { EncryptedInput } from '../types';

type EncryptionType = 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'bool' | 'address';

interface UseEncryptedInputReturn {
  encrypt: (value: number | bigint | boolean | string, type: EncryptionType) => Promise<EncryptedInput>;
  isEncrypting: boolean;
  error: Error | null;
}

/**
 * Hook to encrypt inputs for FHEVM contracts
 *
 * @example
 * ```tsx
 * import { useEncryptedInput } from '@fhevm/sdk/react';
 *
 * function MyComponent() {
 *   const { encrypt, isEncrypting } = useEncryptedInput();
 *
 *   const handleEncrypt = async () => {
 *     const encrypted = await encrypt(42, 'uint32');
 *     console.log('Encrypted:', encrypted);
 *   };
 *
 *   return <button onClick={handleEncrypt} disabled={isEncrypting}>Encrypt</button>;
 * }
 * ```
 */
export function useEncryptedInput(): UseEncryptedInputReturn {
  const { client, isReady } = useFhevm();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (value: number | bigint | boolean | string, type: EncryptionType) => {
      if (!isReady || !client) {
        throw new Error('FHEVM client not ready');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const instance = client.getInstance();
        const encrypted = await encryptInput(instance, value, type);
        return encrypted;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Encryption failed');
        setError(error);
        throw error;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client, isReady]
  );

  return { encrypt, isEncrypting, error };
}

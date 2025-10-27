import { useState, useCallback } from 'react';
import { useFhevm } from './FhevmProvider';
import { useUserDecrypt } from '../decrypt';
import type { DecryptionResult } from '../types';

interface UseDecryptReturn {
  decrypt: (contractAddress: string, handle: string) => Promise<DecryptionResult>;
  isDecrypting: boolean;
  error: Error | null;
  result: DecryptionResult | null;
}

/**
 * Hook to decrypt FHEVM encrypted data
 *
 * @example
 * ```tsx
 * import { useDecrypt } from '@fhevm/sdk/react';
 *
 * function MyComponent() {
 *   const { decrypt, isDecrypting, result } = useDecrypt();
 *
 *   const handleDecrypt = async () => {
 *     await decrypt('0x...', '0x...');
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleDecrypt} disabled={isDecrypting}>Decrypt</button>
 *       {result && <div>Value: {result.value.toString()}</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDecrypt(): UseDecryptReturn {
  const { client, isReady } = useFhevm();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<DecryptionResult | null>(null);

  const decrypt = useCallback(
    async (contractAddress: string, handle: string) => {
      if (!isReady || !client) {
        throw new Error('FHEVM client not ready');
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const signer = await client.getSigner();
        const decrypted = await useUserDecrypt({
          contractAddress,
          handle,
          signer
        });

        setResult(decrypted);
        return decrypted;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Decryption failed');
        setError(error);
        throw error;
      } finally {
        setIsDecrypting(false);
      }
    },
    [client, isReady]
  );

  return { decrypt, isDecrypting, error, result };
}

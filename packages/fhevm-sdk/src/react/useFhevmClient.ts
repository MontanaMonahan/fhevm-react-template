import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { FhevmClient } from '../client';
import { createFhevmInstance } from '../instance';

interface UseFhevmClientOptions {
  provider: BrowserProvider;
  chainId?: number;
}

interface UseFhevmClientReturn {
  client: FhevmClient | null;
  isLoading: boolean;
  isReady: boolean;
  error: Error | null;
}

/**
 * Hook to create and manage an FHEVM client instance
 *
 * @example
 * ```tsx
 * import { useFhevmClient } from '@fhevm/sdk/react';
 * import { BrowserProvider } from 'ethers';
 *
 * function MyComponent() {
 *   const provider = new BrowserProvider(window.ethereum);
 *   const { client, isReady } = useFhevmClient({ provider });
 *
 *   if (!isReady) return <div>Loading...</div>;
 *
 *   return <div>FHEVM Ready!</div>;
 * }
 * ```
 */
export function useFhevmClient(options: UseFhevmClientOptions): UseFhevmClientReturn {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        setIsLoading(true);
        const fhevmClient = await createFhevmInstance(options);

        if (mounted) {
          setClient(fhevmClient);
          setIsReady(fhevmClient.isReady());
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize'));
          setIsReady(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [options.provider, options.chainId]);

  return { client, isLoading, isReady, error };
}

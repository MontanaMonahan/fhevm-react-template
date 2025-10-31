import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BrowserProvider } from 'ethers';
import { FhevmClient } from '../client';
import { createFhevmInstance } from '../instance';

interface FhevmContextValue {
  client: FhevmClient | null;
  isReady: boolean;
  error: Error | null;
}

const FhevmContext = createContext<FhevmContextValue>({
  client: null,
  isReady: false,
  error: null
});

interface FhevmProviderProps {
  provider: BrowserProvider;
  chainId?: number;
  children: ReactNode;
}

/**
 * Provider component for FHEVM functionality
 * Wrap your app with this to access FHEVM features
 *
 * @example
 * ```tsx
 * import { FhevmProvider } from '@fhevm/sdk/react';
 *
 * function App() {
 *   const provider = new BrowserProvider(window.ethereum);
 *
 *   return (
 *     <FhevmProvider provider={provider}>
 *       <YourApp />
 *     </FhevmProvider>
 *   );
 * }
 * ```
 */
export function FhevmProvider({ provider, chainId, children }: FhevmProviderProps) {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const fhevmClient = await createFhevmInstance({ provider, chainId });

        if (mounted) {
          setClient(fhevmClient);
          setIsReady(fhevmClient.isReady());
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize FHEVM'));
          setIsReady(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [provider, chainId]);

  return (
    <FhevmContext.Provider value={{ client, isReady, error }}>
      {children}
    </FhevmContext.Provider>
  );
}

/**
 * Hook to access FHEVM context
 */
export function useFhevm() {
  const context = useContext(FhevmContext);

  if (!context) {
    throw new Error('useFhevm must be used within FhevmProvider');
  }

  return context;
}

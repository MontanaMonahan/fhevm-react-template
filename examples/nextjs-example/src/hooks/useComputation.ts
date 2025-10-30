/**
 * Homomorphic computation hook
 */

import { useState, useCallback } from 'react';
import { useFhevmContract } from '@fhevm/sdk/react';
import { validateContractAddress } from '../lib/utils/security';

interface ComputationConfig {
  contractAddress: string;
  abi: any[];
}

export function useComputation({ contractAddress, abi }: ComputationConfig) {
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contract = useFhevmContract({
    address: contractAddress,
    abi,
    withSigner: true
  });

  const compute = useCallback(async (
    functionName: string,
    ...args: any[]
  ) => {
    try {
      setIsComputing(true);
      setError(null);

      // Validate contract address
      validateContractAddress(contractAddress);

      if (!contract) {
        throw new Error('Contract not initialized');
      }

      // Call contract function
      const tx = await contract[functionName](...args);
      const receipt = await tx.wait();

      return receipt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Computation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsComputing(false);
    }
  }, [contract, contractAddress]);

  return {
    contract,
    compute,
    isComputing,
    error,
    clearError: () => setError(null)
  };
}

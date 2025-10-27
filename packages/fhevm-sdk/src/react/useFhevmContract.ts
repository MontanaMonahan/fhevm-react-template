import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { useFhevm } from './FhevmProvider';

interface UseFhevmContractOptions {
  address: string;
  abi: any[];
  withSigner?: boolean;
}

/**
 * Hook to get a contract instance with FHEVM support
 *
 * @example
 * ```tsx
 * import { useFhevmContract } from '@fhevm/sdk/react';
 *
 * function MyComponent() {
 *   const contract = useFhevmContract({
 *     address: '0x...',
 *     abi: [...],
 *     withSigner: true
 *   });
 *
 *   const handleSubmit = async () => {
 *     await contract.myFunction();
 *   };
 *
 *   return <button onClick={handleSubmit}>Submit</button>;
 * }
 * ```
 */
export function useFhevmContract(options: UseFhevmContractOptions): Contract | null {
  const { client, isReady } = useFhevm();
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (!isReady || !client) {
      setContract(null);
      return;
    }

    async function setupContract() {
      try {
        if (options.withSigner) {
          const connectedContract = await client!.getConnectedContract(
            options.address,
            options.abi
          );
          setContract(connectedContract);
        } else {
          const readOnlyContract = client!.getContract(options.address, options.abi);
          setContract(readOnlyContract);
        }
      } catch (error) {
        console.error('Failed to setup contract:', error);
        setContract(null);
      }
    }

    setupContract();
  }, [client, isReady, options.address, options.withSigner]);

  return contract;
}

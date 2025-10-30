/**
 * Main FHE hook for Next.js applications
 */

import { useFhevmClient } from '@fhevm/sdk/react';

export function useFHE() {
  const { client, isReady, isInitializing } = useFhevmClient();

  return {
    client,
    isReady,
    isInitializing,
    getInstance: () => client?.getInstance()
  };
}

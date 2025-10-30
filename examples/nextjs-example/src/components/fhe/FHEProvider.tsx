'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';
import { FhevmProvider } from '@fhevm/sdk/react';

interface FHEContextValue {
  provider: BrowserProvider | null;
  account: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
}

const FHEContext = createContext<FHEContextValue | undefined>(undefined);

export function FHEProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!');
      return;
    }

    const web3Provider = new BrowserProvider(window.ethereum);
    await web3Provider.send('eth_requestAccounts', []);
    const signer = await web3Provider.getSigner();
    const address = await signer.getAddress();

    setProvider(web3Provider);
    setAccount(address);
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setProvider(null);
          setAccount(null);
        } else {
          setAccount(accounts[0]);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
  }, []);

  const value: FHEContextValue = {
    provider,
    account,
    isConnected: !!provider && !!account,
    connect
  };

  if (!provider) {
    return (
      <FHEContext.Provider value={value}>
        {children}
      </FHEContext.Provider>
    );
  }

  return (
    <FHEContext.Provider value={value}>
      <FhevmProvider provider={provider}>
        {children}
      </FhevmProvider>
    </FHEContext.Provider>
  );
}

export function useFHE() {
  const context = useContext(FHEContext);
  if (context === undefined) {
    throw new Error('useFHE must be used within FHEProvider');
  }
  return context;
}

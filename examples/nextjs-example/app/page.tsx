'use client';

import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { FhevmProvider } from '@fhevm/sdk/react';
import { EncryptionDemo } from '../src/components/fhe/EncryptionDemo';
import { ComputationDemo } from '../src/components/fhe/ComputationDemo';
import { KeyManager } from '../src/components/fhe/KeyManager';
import { BankingExample } from '../src/components/examples/BankingExample';
import { MedicalExample } from '../src/components/examples/MedicalExample';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';

function WalletConnector() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!');
      return;
    }

    setIsConnecting(true);
    try {
      const web3Provider = new BrowserProvider(window.ethereum);
      await web3Provider.send('eth_requestAccounts', []);
      const signer = await web3Provider.getSigner();
      const address = await signer.getAddress();

      setProvider(web3Provider);
      setAccount(address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6">FHEVM Next.js SDK Demo</h1>
          <p className="text-gray-600 text-center mb-8">
            Connect your wallet to explore Fully Homomorphic Encryption on blockchain
          </p>
          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full"
            size="lg"
          >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </Button>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2 text-sm">What you'll see:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Client-side encryption with FHE</li>
              <li>Homomorphic computation demos</li>
              <li>Key management interface</li>
              <li>Smart contract integration</li>
            </ul>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <FhevmProvider provider={provider}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">FHEVM SDK Showcase</h1>
                <p className="text-gray-600">
                  Explore Fully Homomorphic Encryption with Next.js
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Connected</div>
                <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <EncryptionDemo />
            <ComputationDemo />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <KeyManager />

            {/* SDK Features */}
            <Card title="SDK Features">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <h4 className="font-semibold mb-2">Framework-Agnostic Core</h4>
                  <p className="text-sm text-gray-700">
                    Works with Next.js, React, Vue, or vanilla JavaScript
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                  <h4 className="font-semibold mb-2">React Hooks</h4>
                  <p className="text-sm text-gray-700">
                    useEncryptedInput, useFhevmContract, useDecrypt
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <h4 className="font-semibold mb-2">Full Type Safety</h4>
                  <p className="text-sm text-gray-700">
                    Complete TypeScript definitions for all operations
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                  <h4 className="font-semibold mb-2">Easy Integration</h4>
                  <p className="text-sm text-gray-700">
                    Less than 10 lines of code to get started
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Real-World Use Case Examples */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <BankingExample />
            <MedicalExample />
          </div>

          {/* About Section */}
          <Card>
            <h2 className="text-2xl font-bold mb-4">About This Demo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">What is FHE?</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Fully Homomorphic Encryption (FHE) allows computations on encrypted data
                  without decryption. This enables privacy-preserving blockchain applications
                  where smart contracts can process sensitive data while keeping it encrypted.
                </p>
                <h3 className="font-semibold mb-2">SDK Capabilities:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Client-side encryption (uint8-uint128, bool, address)</li>
                  <li>EIP-712 based user decryption</li>
                  <li>Public decryption for non-sensitive data</li>
                  <li>Seamless contract integration</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Use Cases:</h3>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-blue-50 rounded">
                    <strong>DeFi:</strong> Private balances and trading
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <strong>Healthcare:</strong> Encrypted medical records
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <strong>Voting:</strong> Secret ballot systems
                  </div>
                  <div className="p-3 bg-orange-50 rounded">
                    <strong>Gaming:</strong> Hidden game state
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </FhevmProvider>
  );
}

export default function Home() {
  return <WalletConnector />;
}

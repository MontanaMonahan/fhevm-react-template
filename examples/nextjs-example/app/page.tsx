'use client';

import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { FhevmProvider, useFhevmClient, useEncryptedInput, useFhevmContract } from '@fhevm/sdk/react';

// Sample contract ABI
const COUNTER_ABI = [
  {
    inputs: [
      { internalType: 'bytes', name: 'encryptedValue', type: 'bytes' },
      { internalType: 'bytes32[]', name: 'handles', type: 'bytes32[]' }
    ],
    name: 'addValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];

const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with actual contract

function CounterDemo() {
  const { encrypt, isEncrypting } = useEncryptedInput();
  const contract = useFhevmContract({
    address: CONTRACT_ADDRESS,
    abi: COUNTER_ABI,
    withSigner: true
  });

  const [value, setValue] = useState('');
  const [status, setStatus] = useState('');

  const handleEncryptAndSubmit = async () => {
    if (!contract || !value) return;

    try {
      setStatus('Encrypting...');
      const encrypted = await encrypt(parseInt(value), 'uint32');

      setStatus('Sending transaction...');
      const tx = await contract.addValue(encrypted.data, encrypted.handles);

      setStatus('Waiting for confirmation...');
      await tx.wait();

      setStatus('Success! Value encrypted and submitted.');
      setValue('');
    } catch (error) {
      console.error('Error:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Encrypted Counter Demo</h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Enter a number to encrypt:
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Enter a number"
        />
      </div>

      <button
        onClick={handleEncryptAndSubmit}
        disabled={isEncrypting || !value || !contract}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isEncrypting ? 'Encrypting...' : 'Encrypt & Submit'}
      </button>

      {status && (
        <div className="p-4 bg-gray-100 rounded-lg">
          <p className="text-sm">{status}</p>
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Enter a number in the input field</li>
          <li>The SDK encrypts the number using FHEVM</li>
          <li>The encrypted data is sent to the smart contract</li>
          <li>The contract stores the encrypted value without seeing its contents</li>
        </ol>
      </div>
    </div>
  );
}

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
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6">FHEVM Next.js Example</h1>
          <p className="text-gray-600 text-center mb-8">
            Connect your wallet to interact with encrypted smart contracts
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <FhevmProvider provider={provider}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">FHEVM Next.js Example</h1>
              <div className="text-sm text-gray-600">
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            </div>

            <CounterDemo />
          </div>

          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-4">About This Example</h2>
            <p className="text-gray-700 mb-4">
              This Next.js application demonstrates how to use the <code className="bg-gray-100 px-2 py-1 rounded">@fhevm/sdk</code> package
              to interact with encrypted smart contracts.
            </p>
            <p className="text-gray-700 mb-4">
              The SDK provides React hooks that make it easy to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Initialize FHEVM instances with <code className="bg-gray-100 px-2 py-1 rounded">FhevmProvider</code></li>
              <li>Encrypt inputs with <code className="bg-gray-100 px-2 py-1 rounded">useEncryptedInput()</code></li>
              <li>Connect to contracts with <code className="bg-gray-100 px-2 py-1 rounded">useFhevmContract()</code></li>
              <li>Decrypt outputs with <code className="bg-gray-100 px-2 py-1 rounded">useDecrypt()</code></li>
            </ul>
            <p className="text-gray-700">
              All encryption happens client-side, ensuring your sensitive data never leaves your browser unencrypted.
            </p>
          </div>
        </div>
      </div>
    </FhevmProvider>
  );
}

export default function Home() {
  return <WalletConnector />;
}

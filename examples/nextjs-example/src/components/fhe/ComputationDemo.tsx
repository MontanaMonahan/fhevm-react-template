'use client';

import React, { useState } from 'react';
import { useFhevmContract, useEncryptedInput } from '@fhevm/sdk/react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

const SAMPLE_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'bytes', name: 'encryptedValue', type: 'bytes' },
      { internalType: 'bytes32[]', name: 'handles', type: 'bytes32[]' }
    ],
    name: 'addValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

export function ComputationDemo() {
  const { encrypt } = useEncryptedInput();
  const [contractAddress, setContractAddress] = useState('');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('');

  const contract = useFhevmContract({
    address: contractAddress || '0x0000000000000000000000000000000000000000',
    abi: SAMPLE_CONTRACT_ABI,
    withSigner: true
  });

  const handleCompute = async () => {
    if (!contract || !value || !contractAddress) {
      setStatus('Please enter both contract address and value');
      return;
    }

    try {
      setStatus('Encrypting value...');
      const encrypted = await encrypt(parseInt(value), 'uint32');

      setStatus('Sending transaction...');
      const tx = await contract.addValue(encrypted.data, encrypted.handles);

      setStatus('Waiting for confirmation...');
      await tx.wait();

      setStatus('Success! Transaction confirmed.');
      setValue('');
    } catch (error) {
      console.error('Computation error:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card title="Homomorphic Computation Demo">
      <div className="space-y-4">
        <Input
          type="text"
          label="Contract Address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="0x..."
        />

        <Input
          type="number"
          label="Value to Add"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a number"
        />

        <Button
          onClick={handleCompute}
          disabled={!value || !contractAddress}
          className="w-full"
        >
          Encrypt & Submit
        </Button>

        {status && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">{status}</p>
          </div>
        )}

        <div className="p-4 bg-purple-50 rounded-lg">
          <h4 className="font-semibold mb-2">About Homomorphic Computation:</h4>
          <p className="text-sm text-gray-700 mb-2">
            Fully Homomorphic Encryption allows computations on encrypted data without decryption.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>Data remains encrypted during computation</li>
            <li>Smart contracts can process encrypted values</li>
            <li>Results are also encrypted</li>
            <li>Only authorized parties can decrypt results</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

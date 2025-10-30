'use client';

import React, { useEffect, useState } from 'react';
import { useFhevmClient } from '@fhevm/sdk/react';
import { Card } from '../ui/Card';

export function KeyManager() {
  const { client, isReady } = useFhevmClient();
  const [publicKey, setPublicKey] = useState<string>('');
  const [status, setStatus] = useState<string>('Initializing...');

  useEffect(() => {
    if (isReady && client) {
      try {
        const instance = client.getInstance();
        const key = instance.getPublicKey();
        setPublicKey(key);
        setStatus('Ready');
      } catch (error) {
        setStatus('Error loading keys');
        console.error('Key manager error:', error);
      }
    }
  }, [isReady, client]);

  return (
    <Card title="Key Manager">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <span className={`text-sm font-semibold ${
            isReady ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {status}
          </span>
        </div>

        {publicKey && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">Public Key:</h4>
            <p className="text-xs font-mono break-all text-gray-600">
              {publicKey.slice(0, 20)}...{publicKey.slice(-20)}
            </p>
          </div>
        )}

        <div className="p-4 bg-indigo-50 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm">About FHE Keys:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>Public key encrypts data client-side</li>
            <li>Private keys never leave the KMS</li>
            <li>EIP-712 signatures authorize decryption</li>
            <li>Automatic key rotation supported</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

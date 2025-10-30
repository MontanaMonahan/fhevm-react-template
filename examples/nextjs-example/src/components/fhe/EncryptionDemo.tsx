'use client';

import React, { useState } from 'react';
import { useEncryptedInput } from '@fhevm/sdk/react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

export function EncryptionDemo() {
  const { encrypt, isEncrypting } = useEncryptedInput();
  const [value, setValue] = useState('');
  const [encryptedData, setEncryptedData] = useState<string>('');
  const [status, setStatus] = useState('');

  const handleEncrypt = async () => {
    if (!value) return;

    try {
      setStatus('Encrypting...');
      const encrypted = await encrypt(parseInt(value), 'uint32');

      setEncryptedData(JSON.stringify({
        dataLength: encrypted.data.length,
        handlesCount: encrypted.handles.length
      }, null, 2));

      setStatus('Successfully encrypted!');
    } catch (error) {
      console.error('Encryption error:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card title="Encryption Demo">
      <div className="space-y-4">
        <Input
          type="number"
          label="Enter a number to encrypt"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a number"
        />

        <Button
          onClick={handleEncrypt}
          disabled={isEncrypting || !value}
          className="w-full"
        >
          {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
        </Button>

        {status && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">{status}</p>
          </div>
        )}

        {encryptedData && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Encrypted Data:</h4>
            <pre className="text-xs overflow-auto">{encryptedData}</pre>
          </div>
        )}

        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold mb-2">How it works:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>Enter a number in the input field</li>
            <li>Click "Encrypt Value" to encrypt using FHE</li>
            <li>The SDK encrypts the data client-side</li>
            <li>Encrypted data can be sent to smart contracts</li>
          </ol>
        </div>
      </div>
    </Card>
  );
}

'use client';

import React, { useState } from 'react';
import { useEncryptedInput, useFhevmContract } from '@fhevm/sdk/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

/**
 * Banking Example - Demonstrates FHE for financial applications
 * Shows private balance management and encrypted transactions
 */
export function BankingExample() {
  const [balance, setBalance] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { encrypt } = useEncryptedInput();

  // Example contract interaction (replace with actual contract)
  const handleDeposit = async () => {
    if (!amount) {
      setError('Please enter an amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Encrypt the deposit amount
      const encrypted = await encrypt(parseInt(amount), 'uint32');

      // In a real application, you would interact with your contract here
      // const contract = useFhevmContract({ address: '0x...', abi: [...] });
      // await contract.deposit(encrypted.data, encrypted.handles);

      console.log('Encrypted deposit:', encrypted);
      setBalance((prev) => {
        const current = parseInt(prev || '0');
        return (current + parseInt(amount)).toString();
      });
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to encrypt deposit');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount) {
      setError('Please enter an amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Encrypt the withdrawal amount
      const encrypted = await encrypt(parseInt(amount), 'uint32');

      console.log('Encrypted withdrawal:', encrypted);
      setBalance((prev) => {
        const current = parseInt(prev || '0');
        return Math.max(0, current - parseInt(amount)).toString();
      });
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to encrypt withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Banking Example - Private Financial Transactions">
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            This example demonstrates how FHE can be used for private banking operations.
            Balances and transaction amounts are encrypted, ensuring financial privacy.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Current Balance (Demo)</label>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${balance || '0'}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="amount" className="block text-sm font-medium">
            Amount
          </label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="0"
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleDeposit}
            disabled={loading || !amount}
            className="flex-1"
          >
            {loading ? 'Processing...' : 'Deposit (Encrypted)'}
          </Button>
          <Button
            onClick={handleWithdraw}
            disabled={loading || !amount}
            variant="secondary"
            className="flex-1"
          >
            {loading ? 'Processing...' : 'Withdraw (Encrypted)'}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-sm mb-2">How it works:</h4>
          <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
            <li>• Transaction amounts are encrypted before submission</li>
            <li>• Balance updates happen on encrypted values</li>
            <li>• Only authorized parties can decrypt and view balances</li>
            <li>• Smart contracts perform computations on encrypted data</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

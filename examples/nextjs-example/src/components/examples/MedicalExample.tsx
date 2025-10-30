'use client';

import React, { useState } from 'react';
import { useEncryptedInput } from '@fhevm/sdk/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

/**
 * Medical Example - Demonstrates FHE for healthcare applications
 * Shows private health data management with encrypted patient records
 */
export function MedicalExample() {
  const [patientId, setPatientId] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [bloodPressure, setBloodPressure] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const { encrypt } = useEncryptedInput();

  const handleSubmitVitals = async () => {
    if (!patientId || !heartRate || !bloodPressure) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Encrypt patient vitals
      const encryptedHeartRate = await encrypt(parseInt(heartRate), 'uint8');
      const encryptedBP = await encrypt(parseInt(bloodPressure), 'uint8');

      // In a real application, you would interact with your medical records contract
      // const contract = useFhevmContract({ address: '0x...', abi: [...] });
      // await contract.recordVitals(
      //   patientId,
      //   encryptedHeartRate.data,
      //   encryptedBP.data,
      //   encryptedHeartRate.handles,
      //   encryptedBP.handles
      // );

      console.log('Encrypted vitals:', {
        patientId,
        heartRate: encryptedHeartRate,
        bloodPressure: encryptedBP
      });

      setSuccess('Patient vitals successfully encrypted and recorded');
      setPatientId('');
      setHeartRate('');
      setBloodPressure('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to encrypt patient data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Medical Example - Private Health Records">
      <div className="space-y-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            This example demonstrates how FHE protects sensitive medical data.
            Patient information is encrypted before storage, ensuring HIPAA compliance
            and patient privacy while allowing authorized medical computations.
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="patientId" className="block text-sm font-medium">
              Patient ID
            </label>
            <Input
              id="patientId"
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter patient ID"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="heartRate" className="block text-sm font-medium">
              Heart Rate (bpm)
            </label>
            <Input
              id="heartRate"
              type="number"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              placeholder="Enter heart rate"
              min="40"
              max="200"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="bloodPressure" className="block text-sm font-medium">
              Blood Pressure (systolic)
            </label>
            <Input
              id="bloodPressure"
              type="number"
              value={bloodPressure}
              onChange={(e) => setBloodPressure(e.target.value)}
              placeholder="Enter systolic BP"
              min="80"
              max="200"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        <Button
          onClick={handleSubmitVitals}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Encrypting & Submitting...' : 'Submit Encrypted Vitals'}
        </Button>

        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Privacy Features:</h4>
          <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
            <li>• Patient data encrypted client-side before transmission</li>
            <li>• Medical records stored as encrypted values on blockchain</li>
            <li>• Only authorized healthcare providers can decrypt</li>
            <li>• Enables secure data sharing between institutions</li>
            <li>• Supports encrypted medical analytics and research</li>
          </ul>
        </div>

        <div className="p-3 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> This is a demonstration. In production, integrate with
            actual medical records contracts and implement proper access controls.
          </p>
        </div>
      </div>
    </Card>
  );
}

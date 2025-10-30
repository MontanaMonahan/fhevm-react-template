/**
 * Key management utilities
 */

export interface KeyPair {
  publicKey: string;
  chainId: number;
  timestamp: number;
}

/**
 * Fetch public key for encryption
 */
export async function fetchPublicKey(chainId: number = 11155111): Promise<KeyPair> {
  try {
    const response = await fetch('/api/keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chainId }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch public key');
    }

    const data = await response.json();
    return {
      publicKey: data.publicKey,
      chainId: data.chainId,
      timestamp: data.timestamp,
    };
  } catch (error) {
    console.error('Error fetching public key:', error);
    throw error;
  }
}

/**
 * Validate public key format
 */
export function isValidPublicKey(key: string): boolean {
  return key.startsWith('0x') && key.length > 10;
}

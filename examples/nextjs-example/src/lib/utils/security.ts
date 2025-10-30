/**
 * Security utilities for FHE operations
 */

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate contract address before interaction
 */
export function validateContractAddress(address: string): void {
  if (!address) {
    throw new Error('Contract address is required');
  }
  if (!isValidAddress(address)) {
    throw new Error('Invalid contract address format');
  }
}

/**
 * Sanitize user input for encryption
 */
export function sanitizeEncryptionInput(
  value: any,
  type: string
): number | bigint | boolean | string {
  switch (type) {
    case 'uint8':
    case 'uint16':
    case 'uint32':
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        throw new Error('Invalid numeric value');
      }
      return num;

    case 'uint64':
    case 'uint128':
      try {
        return BigInt(value);
      } catch {
        throw new Error('Invalid bigint value');
      }

    case 'bool':
      return Boolean(value);

    case 'address':
      if (!isValidAddress(String(value))) {
        throw new Error('Invalid address');
      }
      return String(value);

    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}

/**
 * Rate limiting helper for API requests
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];

    const recentRequests = userRequests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }
}

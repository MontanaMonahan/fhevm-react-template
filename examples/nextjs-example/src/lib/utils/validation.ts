/**
 * Validation utilities
 */

/**
 * Validate numeric input for encryption
 */
export function validateNumericInput(
  value: number,
  type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128'
): { valid: boolean; error?: string } {
  const limits = {
    uint8: { min: 0, max: 255 },
    uint16: { min: 0, max: 65535 },
    uint32: { min: 0, max: 4294967295 },
    uint64: { min: 0, max: BigInt('18446744073709551615') },
    uint128: { min: 0, max: BigInt('340282366920938463463374607431768211455') }
  };

  const limit = limits[type];

  if (type === 'uint64' || type === 'uint128') {
    const bigValue = BigInt(value);
    if (bigValue < 0) {
      return { valid: false, error: `Value must be non-negative` };
    }
    if (bigValue > limit.max) {
      return { valid: false, error: `Value exceeds maximum for ${type}` };
    }
  } else {
    if (value < limit.min || value > limit.max) {
      return { valid: false, error: `Value must be between ${limit.min} and ${limit.max}` };
    }
  }

  return { valid: true };
}

/**
 * Validate encryption type
 */
export function isValidEncryptionType(type: string): boolean {
  const validTypes = ['uint8', 'uint16', 'uint32', 'uint64', 'uint128', 'bool', 'address'];
  return validTypes.includes(type);
}

/**
 * Validate handle format
 */
export function isValidHandle(handle: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(handle);
}

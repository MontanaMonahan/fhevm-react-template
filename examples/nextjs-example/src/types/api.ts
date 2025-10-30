/**
 * API type definitions
 */

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EncryptionAPIRequest {
  value: number | bigint | boolean | string;
  type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'bool' | 'address';
}

export interface DecryptionAPIRequest {
  handle: string;
  contractAddress: string;
  signature?: string;
}

export interface ComputationAPIRequest {
  operation: 'add' | 'sub' | 'mul' | 'div' | 'and' | 'or' | 'xor';
  operands: string[];
}

export interface KeyResponse {
  publicKey: string;
  chainId: number;
  timestamp: number;
}

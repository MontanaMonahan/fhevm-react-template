/**
 * API type definitions for FHEVM SDK
 */

export interface FHEOperationResult {
  success: boolean;
  data?: any;
  error?: string;
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

export interface KeyManagementResponse {
  publicKey: string;
  chainId: number;
  timestamp: number;
}

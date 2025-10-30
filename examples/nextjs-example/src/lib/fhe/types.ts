/**
 * FHE-related type definitions
 */

export interface EncryptedData {
  data: Uint8Array;
  handles: string[];
}

export interface FHEConfig {
  chainId: number;
  gatewayUrl: string;
  aclAddress: string;
}

export type FHEType = 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'bool' | 'address';

export interface DecryptionRequest {
  handle: string;
  contractAddress: string;
  signature?: string;
}

export interface DecryptionResponse {
  value: bigint | boolean | string;
  type: 'uint' | 'bool' | 'address';
}

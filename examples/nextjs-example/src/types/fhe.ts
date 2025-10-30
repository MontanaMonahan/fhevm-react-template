/**
 * FHE type definitions for Next.js application
 */

export interface FHEInstance {
  publicKey: string;
  chainId: number;
  isReady: boolean;
}

export interface EncryptedValue {
  data: Uint8Array;
  handles: string[];
  type: FHEType;
}

export type FHEType = 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'bool' | 'address';

export interface FHEOperation {
  type: 'encrypt' | 'decrypt' | 'compute';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface ContractInteraction {
  address: string;
  functionName: string;
  args: any[];
  encrypted: boolean;
}

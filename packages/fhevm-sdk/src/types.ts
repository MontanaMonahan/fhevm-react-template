import type { BrowserProvider, Signer } from 'ethers';

/**
 * Core FHEVM instance interface
 */
export interface FhevmInstance {
  encrypt8(value: number): Promise<EncryptedInput>;
  encrypt16(value: number): Promise<EncryptedInput>;
  encrypt32(value: number): Promise<EncryptedInput>;
  encrypt64(value: bigint): Promise<EncryptedInput>;
  encrypt128(value: bigint): Promise<EncryptedInput>;
  encryptBool(value: boolean): Promise<EncryptedInput>;
  encryptAddress(value: string): Promise<EncryptedInput>;

  createEIP712(
    verifyingContract: string,
    functionName: string,
    args: any[]
  ): EIP712Data;

  getPublicKey(): string;
  hasKeypair(): boolean;
}

/**
 * Encrypted input data
 */
export interface EncryptedInput {
  data: Uint8Array;
  handles: string[];
}

/**
 * EIP-712 signature data for userDecrypt
 */
export interface EIP712Data {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  types: Record<string, Array<{ name: string; type: string }>>;
  message: Record<string, any>;
}

/**
 * Decryption request configuration
 */
export interface DecryptionRequest {
  contractAddress: string;
  handle: string;
  signer: Signer;
}

/**
 * Decryption result
 */
export interface DecryptionResult {
  value: bigint | boolean | string;
  type: 'uint' | 'bool' | 'address';
}

/**
 * SDK configuration
 */
export interface SdkConfig {
  provider: BrowserProvider;
  chainId: number;
  gatewayUrl?: string;
  aclAddress?: string;
}

/**
 * Chain-specific configuration
 */
export interface ChainConfig {
  chainId: number;
  name: string;
  gatewayUrl: string;
  aclAddress: string;
  kmsVerifierAddress: string;
}

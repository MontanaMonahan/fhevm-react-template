import { BrowserProvider, Contract, Signer } from 'ethers';
import type { FhevmInstance, SdkConfig } from '../types';
import { getChainConfig } from '../config/chains';

/**
 * Main FHEVM Client class
 * Provides high-level API for working with encrypted data
 */
export class FhevmClient {
  private provider: BrowserProvider;
  private chainId: number;
  private instance: FhevmInstance | null = null;
  private gatewayUrl: string;
  private aclAddress: string;

  constructor(config: SdkConfig) {
    this.provider = config.provider;
    this.chainId = config.chainId;

    const chainConfig = getChainConfig(config.chainId);
    this.gatewayUrl = config.gatewayUrl || chainConfig.gatewayUrl;
    this.aclAddress = config.aclAddress || chainConfig.aclAddress;
  }

  /**
   * Initialize the FHEVM instance with keypair generation
   */
  async init(): Promise<void> {
    // Dynamically import fhevmjs to avoid bundling issues
    const { createInstance } = await import('fhevmjs');

    const instance = await createInstance({
      chainId: this.chainId,
      publicKey: await this.getNetworkPublicKey(),
      gatewayUrl: this.gatewayUrl
    });

    this.instance = instance as unknown as FhevmInstance;
  }

  /**
   * Get network's public key for encryption
   */
  private async getNetworkPublicKey(): Promise<string> {
    // In a real implementation, fetch from the network
    // For now, return a placeholder
    return '0x' + '0'.repeat(128);
  }

  /**
   * Get the initialized instance
   */
  getInstance(): FhevmInstance {
    if (!this.instance) {
      throw new Error('FHEVM instance not initialized. Call init() first.');
    }
    return this.instance;
  }

  /**
   * Check if instance is ready
   */
  isReady(): boolean {
    return this.instance !== null && this.instance.hasKeypair();
  }

  /**
   * Get signer from provider
   */
  async getSigner(): Promise<Signer> {
    return this.provider.getSigner();
  }

  /**
   * Get contract instance with encryption support
   */
  getContract(address: string, abi: any[]): Contract {
    return new Contract(address, abi, this.provider);
  }

  /**
   * Get connected contract with signer
   */
  async getConnectedContract(address: string, abi: any[]): Promise<Contract> {
    const signer = await this.getSigner();
    return new Contract(address, abi, signer);
  }
}

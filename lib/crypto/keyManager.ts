/**
 * Client-side key management service
 * Handles master key and document key lifecycle
 */

import {
  generateMasterKey,
  generateDocumentKey,
  encryptDocumentKey,
  decryptDocumentKey,
  storeMasterKey,
  retrieveMasterKey,
} from "./keys";

/**
 * Key manager singleton for managing encryption keys
 */
class KeyManager {
  private masterKey: CryptoKey | null = null;
  private documentKeys: Map<string, CryptoKey> = new Map();
  private initialized: boolean = false;

  /**
   * Initialize the key manager
   * Retrieves master key from IndexedDB or generates a new one
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const stored = await retrieveMasterKey();
    if (stored) {
      this.masterKey = stored.key;
      this.initialized = true;
      return;
    }

    // Generate new master key
    const { key, salt } = await generateMasterKey();
    this.masterKey = key;
    await storeMasterKey(key, salt);
    this.initialized = true;
  }

  /**
   * Get the master key
   * Throws if not initialized
   */
  getMasterKey(): CryptoKey {
    if (!this.masterKey) {
      throw new Error("KeyManager not initialized");
    }
    return this.masterKey;
  }

  /**
   * Generate a new document key
   * Encrypts it with the master key for storage
   */
  async createDocumentKey(): Promise<{
    key: CryptoKey;
    encryptedKey: string;
  }> {
    if (!this.masterKey) {
      throw new Error("KeyManager not initialized");
    }

    const documentKey = await generateDocumentKey();
    const encryptedKey = await encryptDocumentKey(documentKey, this.masterKey);

    // Convert to base64 for storage
    const encryptedKeyBase64 = btoa(
      String.fromCharCode(...new Uint8Array(encryptedKey))
    );

    return {
      key: documentKey,
      encryptedKey: encryptedKeyBase64,
    };
  }

  /**
   * Decrypt a document key
   */
  async getDocumentKey(encryptedKey: string): Promise<CryptoKey> {
    if (!this.masterKey) {
      throw new Error("KeyManager not initialized");
    }

    // Convert from base64
    const binary = atob(encryptedKey);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const documentKey = await decryptDocumentKey(bytes.buffer, this.masterKey);
    return documentKey;
  }

  /**
   * Cache a document key in memory
   */
  cacheDocumentKey(documentId: string, key: CryptoKey): void {
    this.documentKeys.set(documentId, key);
  }

  /**
   * Get cached document key
   */
  getCachedDocumentKey(documentId: string): CryptoKey | undefined {
    return this.documentKeys.get(documentId);
  }

  /**
   * Clear all cached keys
   */
  clearCache(): void {
    this.documentKeys.clear();
  }

  /**
   * Reset the key manager (for logout)
   */
  reset(): void {
    this.masterKey = null;
    this.documentKeys.clear();
    this.initialized = false;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const keyManager = new KeyManager();

/**
 * AES-256-GCM decryption utilities using Web Crypto API
 */

/**
 * Decrypt data using AES-256-GCM
 * @param ciphertext - The encrypted data
 * @param ivData - The initialization vector used during encryption
 * @param key - The CryptoKey to use for decryption
 * @returns Decrypted data as string
 */
export async function decrypt(
  ciphertext: ArrayBuffer,
  ivData: Uint8Array,
  key: CryptoKey
): Promise<string> {
  // Decrypt the data
  const algorithm = {
    name: "AES-GCM",
    iv: ivData,
  } as AesGcmParams;
  
  const decrypted = await crypto.subtle.decrypt(
    algorithm,
    key,
    ciphertext
  );

  // Decode the decrypted data
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Decrypt from base64 encoded data
 * @param encryptedBase64 - Base64 encoded encrypted data with IV
 * @param key - The CryptoKey to use for decryption
 * @returns Decrypted data as string
 */
export async function decryptFromBase64(
  encryptedBase64: string,
  key: CryptoKey
): Promise<string> {
  // Convert from base64
  const binary = atob(encryptedBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  // Extract IV and ciphertext
  const iv = new Uint8Array(bytes.slice(0, 12));
  const ciphertext = bytes.slice(12);

  return await decrypt(ciphertext.buffer, iv, key);
}

/**
 * Decrypt and parse JSON data
 * @param encryptedBase64 - Base64 encoded encrypted data
 * @param key - The CryptoKey to use for decryption
 * @returns Decrypted and parsed object
 */
export async function decryptJSON<T = unknown>(
  encryptedBase64: string,
  key: CryptoKey
): Promise<T> {
  const decrypted = await decryptFromBase64(encryptedBase64, key);
  return JSON.parse(decrypted);
}

/**
 * Decrypt data from storage format
 */
export async function decryptFromStorage(
  encrypted: string,
  key: CryptoKey
): Promise<string> {
  return await decryptFromBase64(encrypted, key);
}

/**
 * Decrypt document content
 */
export async function decryptDocument<T = unknown>(
  encryptedContent: string,
  documentKey: CryptoKey
): Promise<T> {
  const decrypted = await decryptFromBase64(encryptedContent, documentKey);
  return JSON.parse(decrypted);
}

/**
 * Batch decrypt multiple documents
 */
export async function decryptDocuments<T = unknown>(
  documents: Array<{ encryptedContent: string; id: string }>,
  documentKeys: Map<string, CryptoKey>
): Promise<Array<{ id: string; content: T }>> {
  const results = await Promise.all(
    documents.map(async (doc) => {
      const key = documentKeys.get(doc.id);
      if (!key) {
        throw new Error(`No key found for document ${doc.id}`);
      }
      const content = await decryptDocument<T>(doc.encryptedContent, key);
      return { id: doc.id, content };
    })
  );

  return results;
}

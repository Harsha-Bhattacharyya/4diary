/**
 * Copyright © 2025 Harsha Bhattacharyya
 * 
 * This file is part of 4diary.
 * 
 * SPDX-License-Identifier: BSD-3-Clause
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the conditions in the LICENSE file are met.
 */

/**
 * Key generation and management utilities
 * Handles master keys and document-specific encryption keys
 */

const MASTER_KEY_LENGTH = 256; // bits
const PBKDF2_ITERATIONS = 100000;

export interface MasterKey {
  key: CryptoKey;
  salt: Uint8Array;
}

export interface DocumentKey {
  key: CryptoKey;
  encryptedKey: ArrayBuffer;
}

/**
 * Generate a new master key for the user
 * This key is used to encrypt all document keys
 */
export async function generateMasterKey(): Promise<MasterKey> {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: MASTER_KEY_LENGTH,
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );

  // Generate a random salt for key derivation
  const salt = crypto.getRandomValues(new Uint8Array(16));

  return { key, salt };
}

/**
 * Derive a master key from a password
 * Used for password-based encryption
 */
export async function deriveMasterKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  const pbkdf2Params = {
    name: "PBKDF2",
    salt: salt,
    iterations: PBKDF2_ITERATIONS,
    hash: "SHA-256",
  } as Pbkdf2Params;

  const masterKey = await crypto.subtle.deriveKey(
    pbkdf2Params,
    baseKey,
    { name: "AES-GCM", length: MASTER_KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );

  return masterKey;
}

/**
 * Generate a new document-specific encryption key
 */
export async function generateDocumentKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a document key with the master key
 */
export async function encryptDocumentKey(
  documentKey: CryptoKey,
  masterKey: CryptoKey
): Promise<ArrayBuffer> {
  // Export the document key to raw format
  const rawKey = await crypto.subtle.exportKey("raw", documentKey);

  // Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the document key
  const encryptedKey = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    masterKey,
    rawKey
  );

  // Combine IV and encrypted key
  const result = new Uint8Array(iv.length + encryptedKey.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encryptedKey), iv.length);

  return result.buffer;
}

/**
 * Decrypt a document key using the master key
 */
export async function decryptDocumentKey(
  encryptedKey: ArrayBuffer,
  masterKey: CryptoKey
): Promise<CryptoKey> {
  const data = new Uint8Array(encryptedKey);

  // Extract IV and encrypted key
  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);

  // Decrypt the document key
  const decryptedKey = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    masterKey,
    encrypted
  );

  // Import the decrypted key
  return await crypto.subtle.importKey(
    "raw",
    decryptedKey,
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Export a key to a base64 string for storage
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Import a key from a base64 string
 */
export async function importKey(keyData: string): Promise<CryptoKey> {
  const binary = atob(keyData);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return await crypto.subtle.importKey(
    "raw",
    bytes,
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Store master key in IndexedDB
 */
export async function storeMasterKey(
  key: CryptoKey,
  salt: Uint8Array
): Promise<void> {
  const db = await openKeyStore();
  const exported = await crypto.subtle.exportKey("raw", key);
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["keys"], "readwrite");
    const store = transaction.objectStore("keys");

    // Set up transaction handlers first
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);

    try {
      // Perform the put operation
      store.put(
        {
          id: "master",
          key: exported,
          salt: salt,
        },
        "master"
      );
    } catch (error) {
      transaction.abort();
      reject(error);
    }
  });
}

/**
 * Retrieve master key from IndexedDB
 */
export async function retrieveMasterKey(): Promise<MasterKey | null> {
  const db = await openKeyStore();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["keys"], "readonly");
    const store = transaction.objectStore("keys");
    const request = store.get("master");
    
    request.onsuccess = async () => {
      try {
        const data = request.result;
        if (!data) {
          resolve(null);
          return;
        }

        const key = await crypto.subtle.importKey(
          "raw",
          data.key,
          "AES-GCM",
          true,
          ["encrypt", "decrypt"]
        );

        resolve({
          key,
          salt: new Uint8Array(data.salt),
        });
      } catch (error) {
        reject(error);
      }
    };
    
    request.onerror = () => reject(request.error);
  });
}

/**
 * Open IndexedDB for key storage
 */
function openKeyStore(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("4diary-keys", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
      }
    };
  });
}

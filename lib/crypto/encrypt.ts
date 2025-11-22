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
 * AES-256-GCM encryption utilities using Web Crypto API
 * All encryption happens client-side only
 */

export interface EncryptedData {
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
}

/**
 * Encrypt data using AES-256-GCM
 * @param data - The data to encrypt (string or object)
 * @param key - The CryptoKey to use for encryption
 * @returns EncryptedData containing ciphertext and IV
 */
export async function encrypt(
  data: string | object,
  key: CryptoKey
): Promise<EncryptedData> {
  // Convert data to string if it's an object
  const dataString = typeof data === "string" ? data : JSON.stringify(data);

  // Encode the data
  const encoder = new TextEncoder();
  const encoded = encoder.encode(dataString);

  // Generate a random IV (Initialization Vector)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the data
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encoded
  );

  return {
    ciphertext,
    iv,
  };
}

/**
 * Encrypt and encode to base64 for easy storage
 * @param data - The data to encrypt
 * @param key - The CryptoKey to use for encryption
 * @returns Base64 encoded encrypted data with IV
 */
export async function encryptToBase64(
  data: string | object,
  key: CryptoKey
): Promise<string> {
  const { ciphertext, iv } = await encrypt(data, key);

  // Combine IV and ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Encrypt data for storage in database
 * Returns an object with base64 encoded data
 */
export async function encryptForStorage(
  data: string | object,
  key: CryptoKey
): Promise<{
  encrypted: string;
  algorithm: string;
}> {
  const encrypted = await encryptToBase64(data, key);

  return {
    encrypted,
    algorithm: "AES-GCM-256",
  };
}

/**
 * Encrypt document content with metadata
 */
export async function encryptDocument(
  content: object,
  metadata: {
    title: string;
    tags?: string[];
    folder?: string;
  },
  documentKey: CryptoKey
): Promise<{
  encryptedContent: string;
  metadata: {
    title: string;
    tags?: string[];
    folder?: string;
  };
}> {
  const encryptedContent = await encryptToBase64(content, documentKey);

  return {
    encryptedContent,
    metadata, // Metadata stays unencrypted for search
  };
}

/**
 * Utility to convert ArrayBuffer to base64
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Utility to convert base64 to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

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
 * Document service for handling document CRUD operations with encryption
 */

import { keyManager } from "./crypto/keyManager";
import { encryptToBase64 } from "./crypto/encrypt";
import { decryptFromBase64 } from "./crypto/decrypt";

export interface DocumentMetadata {
  title: string;
  tags?: string[];
  folder?: string;
  emojiIcon?: string;
  type?: "doc" | "board" | "quick" | "handwritten";
  embedPreviews?: Array<{
    url: string;
    title?: string;
    description?: string;
    image?: string;
  }>;
  isQuickReadSaved?: boolean;
  backgroundColor?: string; // Background color for the note
}

export interface Document {
  id: string;
  workspaceId: string;
  metadata: DocumentMetadata;
  content: unknown[];
  favorite: boolean;
  archived: boolean;
  readOnly?: boolean; // Whether the note is read-only
  passwordProtected?: boolean; // Whether note requires password
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentParams {
  workspaceId: string;
  userId: string;
  content: unknown[];
  metadata: DocumentMetadata;
}

export interface UpdateDocumentParams {
  id: string;
  userId: string;
  content?: unknown[];
  metadata?: DocumentMetadata;
  favorite?: boolean;
  archived?: boolean;
  readOnly?: boolean;
  passwordProtected?: boolean;
  passwordHash?: string;
  sortOrder?: number;
}

/**
 * Create a new encrypted document
 */
export async function createDocument(
  params: CreateDocumentParams
): Promise<Document> {
  // Ensure key manager is initialized
  if (!keyManager.isInitialized()) {
    await keyManager.initialize();
  }

  // Generate new document key
  const { key: documentKey, encryptedKey } =
    await keyManager.createDocumentKey();

  // Encrypt content
  const encryptedContent = await encryptToBase64(params.content, documentKey);

  // Send to API
  const response = await fetch("/api/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workspaceId: params.workspaceId,
      userId: params.userId,
      encryptedContent,
      encryptedDocumentKey: encryptedKey,
      metadata: params.metadata,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create document");
  }

  const result = await response.json();

  // Cache the document key
  keyManager.cacheDocumentKey(result.id, documentKey);

  return {
    id: result.id,
    workspaceId: params.workspaceId,
    metadata: params.metadata,
    content: params.content,
    favorite: false,
    archived: false,
    sortOrder: undefined,
    createdAt: result.document.createdAt,
    updatedAt: result.document.updatedAt,
  };
}

/**
 * Update an existing encrypted document
 */
export async function updateDocument(
  params: UpdateDocumentParams
): Promise<void> {
  let encryptedContent: string | undefined;

  // If content is being updated, encrypt it
  if (params.content) {
    // Get or retrieve document key
    let documentKey = keyManager.getCachedDocumentKey(params.id);
    if (!documentKey) {
      // Need to fetch the document to get its encrypted key
      await fetchDocument(params.id, params.userId);
      documentKey = keyManager.getCachedDocumentKey(params.id);
      if (!documentKey) {
        throw new Error("Failed to retrieve document key");
      }
    }

    encryptedContent = await encryptToBase64(params.content, documentKey);
  }

  // Send to API
  const response = await fetch("/api/documents", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: params.id,
      userId: params.userId,
      encryptedContent,
      metadata: params.metadata,
      favorite: params.favorite,
      archived: params.archived,
      readOnly: params.readOnly,
      passwordProtected: params.passwordProtected,
      passwordHash: params.passwordHash,
      sortOrder: params.sortOrder,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update document");
  }
}

/**
 * Fetch and decrypt a document
 */
async function fetchDocument(id: string, userId: string): Promise<Document> {
  const response = await fetch(
    `/api/documents/${id}?userId=${encodeURIComponent(userId)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch document");
  }

  const data = await response.json();
  return await decryptDocument(data.document);
}

/**
 * Decrypt a document from API response
 */
async function decryptDocument(encryptedDoc: {
  _id: string;
  workspaceId: string;
  encryptedContent: string;
  encryptedDocumentKey: string;
  metadata: DocumentMetadata;
  favorite: boolean;
  archived: boolean;
  readOnly?: boolean;
  passwordProtected?: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}): Promise<Document> {
  // Ensure key manager is initialized
  if (!keyManager.isInitialized()) {
    await keyManager.initialize();
  }

  // Get or decrypt document key
  let documentKey = keyManager.getCachedDocumentKey(encryptedDoc._id);
  if (!documentKey) {
    documentKey = await keyManager.getDocumentKey(
      encryptedDoc.encryptedDocumentKey
    );
    keyManager.cacheDocumentKey(encryptedDoc._id, documentKey);
  }

  // Decrypt content
  const content = await decryptFromBase64(
    encryptedDoc.encryptedContent,
    documentKey
  );

  return {
    id: encryptedDoc._id,
    workspaceId: encryptedDoc.workspaceId,
    metadata: encryptedDoc.metadata,
    content: JSON.parse(content),
    favorite: encryptedDoc.favorite,
    archived: encryptedDoc.archived,
    readOnly: encryptedDoc.readOnly,
    passwordProtected: encryptedDoc.passwordProtected,
    sortOrder: encryptedDoc.sortOrder,
    createdAt: encryptedDoc.createdAt,
    updatedAt: encryptedDoc.updatedAt,
  };
}

/**
 * List documents for a workspace
 */
export async function listDocuments(
  workspaceId: string,
  userId: string
): Promise<Document[]> {
  const response = await fetch(
    `/api/documents?workspaceId=${encodeURIComponent(workspaceId)}&userId=${encodeURIComponent(userId)}`
  );

  if (!response.ok) {
    throw new Error("Failed to list documents");
  }

  const data = await response.json();

  // Decrypt all documents
  const documents = await Promise.all(
    data.documents.map((doc: unknown) => decryptDocument(doc as Parameters<typeof decryptDocument>[0]))
  );

  return documents;
}

/**
 * Get a single document by ID
 */
export async function getDocument(
  id: string,
  userId: string
): Promise<Document> {
  return await fetchDocument(id, userId);
}

/**
 * Delete a document
 */
export async function deleteDocument(
  id: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `/api/documents?id=${encodeURIComponent(id)}&userId=${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete document");
  }

  // Clear cached key
  keyManager.clearCache();
}

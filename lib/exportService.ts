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
 * Export service for downloading documents
 */

import JSZip from "jszip";
import { keyManager } from "./crypto/keyManager";
import { decryptFromBase64 } from "./crypto/decrypt";
import { exportKey } from "./crypto/keys";
import {
  downloadMarkdownFile,
  downloadWorkspaceZip,
  type ExportDocument,
} from "./export";

export interface DocumentForExport {
  id: string;
  encryptedContent: string;
  encryptedDocumentKey: string;
  metadata: {
    title: string;
    tags?: string[];
    folder?: string;
  };
}

/**
 * Export a single document as markdown
 */
export async function exportDocumentAsMarkdown(
  document: DocumentForExport
): Promise<void> {
  // Ensure key manager is initialized
  if (!keyManager.isInitialized()) {
    await keyManager.initialize();
  }

  // Get or decrypt document key
  let documentKey = keyManager.getCachedDocumentKey(document.id);
  if (!documentKey) {
    documentKey = await keyManager.getDocumentKey(document.encryptedDocumentKey);
    keyManager.cacheDocumentKey(document.id, documentKey);
  }

  // Decrypt content
  const contentString = await decryptFromBase64(
    document.encryptedContent,
    documentKey
  );
  const content = JSON.parse(contentString);

  // Create export document
  const exportDoc: ExportDocument = {
    title: document.metadata.title,
    content,
    folder: document.metadata.folder,
    tags: document.metadata.tags,
  };

  // Use export utility to download
  const { exportDocumentAsMarkdown: convertToMarkdown } = await import("./export");
  const markdown = convertToMarkdown(exportDoc);
  downloadMarkdownFile(document.metadata.title, markdown);
}

/**
 * Export multiple documents as ZIP
 */
export async function exportDocumentsAsZip(
  workspaceName: string,
  documents: DocumentForExport[]
): Promise<void> {
  // Ensure key manager is initialized
  if (!keyManager.isInitialized()) {
    await keyManager.initialize();
  }

  // Decrypt all documents
  const exportDocs: ExportDocument[] = await Promise.all(
    documents.map(async (doc) => {
      // Get or decrypt document key
      let documentKey = keyManager.getCachedDocumentKey(doc.id);
      if (!documentKey) {
        documentKey = await keyManager.getDocumentKey(doc.encryptedDocumentKey);
        keyManager.cacheDocumentKey(doc.id, documentKey);
      }

      // Decrypt content
      const contentString = await decryptFromBase64(
        doc.encryptedContent,
        documentKey
      );
      const content = JSON.parse(contentString);

      return {
        title: doc.metadata.title,
        content,
        folder: doc.metadata.folder,
        tags: doc.metadata.tags,
      };
    })
  );

  // Use export utility to download
  await downloadWorkspaceZip(workspaceName, exportDocs);
}

/**
 * Export encrypted workspace data as ZIP
 * Includes encrypted note blobs and master key for backup/restore purposes
 */
export async function exportEncryptedWorkspaceAsZip(
  workspaceName: string,
  documents: DocumentForExport[]
): Promise<void> {
  // Ensure key manager is initialized
  if (!keyManager.isInitialized()) {
    await keyManager.initialize();
  }

  const zip = new JSZip();

  // Export master key
  const masterKey = keyManager.getMasterKey();
  const exportedMasterKey = await exportKey(masterKey);

  // Create manifest with metadata
  const manifest = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    workspaceName,
    documentCount: documents.length,
    documents: documents.map((doc) => ({
      id: doc.id,
      title: doc.metadata.title,
      folder: doc.metadata.folder,
      tags: doc.metadata.tags,
    })),
  };

  // Add master key to ZIP
  zip.file("master-key.txt", exportedMasterKey);

  // Add manifest to ZIP
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  // Create encrypted-blobs folder
  const blobsFolder = zip.folder("encrypted-blobs");

  // Add each encrypted document
  documents.forEach((doc) => {
    if (blobsFolder) {
      // Create a JSON file for each document containing encrypted data
      const encryptedData = {
        id: doc.id,
        encryptedContent: doc.encryptedContent,
        encryptedDocumentKey: doc.encryptedDocumentKey,
        metadata: doc.metadata,
      };
      blobsFolder.file(`${doc.id}.json`, JSON.stringify(encryptedData, null, 2));
    }
  });

  // Add README for the encrypted export
  const readme = `# ${workspaceName} - Encrypted Export

Exported from 4diary on ${new Date().toLocaleString()}

## Contents

- **master-key.txt**: Your master encryption key (KEEP THIS SAFE!)
- **manifest.json**: Export metadata and document list
- **encrypted-blobs/**: Folder containing encrypted document data

## Security Notice

⚠️ The master-key.txt file can decrypt all your notes.
Store this export securely and never share the master key.

## Documents Included

Total: ${documents.length} documents
`;

  zip.file("README.md", readme);

  // Generate ZIP blob
  const blob = await zip.generateAsync({ type: "blob" });

  // Download the ZIP
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFilename(workspaceName)}-encrypted-backup.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sanitize filename for safe file system usage
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9\s-_]/gi, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .substring(0, 100);
}

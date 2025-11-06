/**
 * Export service for downloading documents
 */

import { keyManager } from "./crypto/keyManager";
import { decryptFromBase64 } from "./crypto/decrypt";
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

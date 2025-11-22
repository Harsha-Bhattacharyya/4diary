/**
 * Backlink service for managing bidirectional document links
 * Extracts [[wiki-style]] links and provides backlink queries
 */

/**
 * Extract wiki-style links from document content
 * Matches [[Document Title]] or [[Document Title|Display Text]]
 */
export function extractWikiLinks(content: unknown[]): string[] {
  const links: string[] = [];
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

  function extractFromBlock(block: Record<string, unknown>): void {
    if (!block) return;

    // Extract from text content
    if (typeof block.content === 'string') {
      const matches = block.content.matchAll(wikiLinkRegex);
      for (const match of matches) {
        const linkTitle = match[1].trim();
        if (linkTitle && !links.includes(linkTitle)) {
          links.push(linkTitle);
        }
      }
    }

    // Extract from array content (nested blocks)
    if (Array.isArray(block.content)) {
      for (const item of block.content) {
        if (typeof item === 'object' && item !== null) {
          extractFromBlock(item as Record<string, unknown>);
        }
      }
    }

    // Extract from children
    if (Array.isArray(block.children)) {
      for (const child of block.children) {
        if (typeof child === 'object' && child !== null) {
          extractFromBlock(child as Record<string, unknown>);
        }
      }
    }
  }

  // Process all blocks
  if (Array.isArray(content)) {
    for (const block of content) {
      if (typeof block === 'object' && block !== null) {
        extractFromBlock(block as Record<string, unknown>);
      }
    }
  }

  return links;
}

/**
 * Find documents that link to the given document title
 * This performs client-side decryption and filtering
 */
export async function getBacklinks(
  documentTitle: string,
  workspaceId: string,
  userId: string,
  keyManager: {
    getCachedDocumentKey: (id: string) => CryptoKey | null;
    getDocumentKey: (encryptedKey: string) => Promise<CryptoKey>;
    cacheDocumentKey: (id: string, key: CryptoKey) => void;
  }
): Promise<Array<{ id: string; title: string; snippet: string }>> {
  try {
    const response = await fetch(
      `/api/backlinks?title=${encodeURIComponent(documentTitle)}&workspaceId=${encodeURIComponent(workspaceId)}&userId=${encodeURIComponent(userId)}`
    );

    if (!response.ok) {
      console.error('Failed to fetch backlinks');
      return [];
    }

    const data = await response.json();
    const documents = data.documents || [];
    const backlinks: Array<{ id: string; title: string; snippet: string }> = [];

    // Decrypt and filter documents client-side
    for (const doc of documents) {
      // Skip the document we're finding backlinks for
      if (doc.title === documentTitle) {
        continue;
      }

      try {
        // Get document key
        let documentKey = keyManager.getCachedDocumentKey(doc.id);
        if (!documentKey) {
          documentKey = await keyManager.getDocumentKey(doc.encryptedDocumentKey);
          keyManager.cacheDocumentKey(doc.id, documentKey);
        }

        // Decrypt content
        const { decryptFromBase64 } = await import('./crypto/decrypt');
        const contentStr = await decryptFromBase64(doc.encryptedContent, documentKey);
        const content = JSON.parse(contentStr);

        // Extract links from content
        const links = extractWikiLinks(content);

        // Check if this document links to the target
        if (links.includes(documentTitle)) {
          // Extract a snippet containing the link
          const snippetContent = JSON.stringify(content).substring(0, 200);
          
          backlinks.push({
            id: doc.id,
            title: doc.title,
            snippet: snippetContent,
          });
        }
      } catch (error) {
        console.error(`Error processing document ${doc.id}:`, error);
      }
    }

    return backlinks;
  } catch (error) {
    console.error('Error fetching backlinks:', error);
    return [];
  }
}

/**
 * Find forward links (documents this document links to)
 */
export function getForwardLinks(content: unknown[]): string[] {
  return extractWikiLinks(content);
}

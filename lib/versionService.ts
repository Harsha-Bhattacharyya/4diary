/**
 * Version history service for document versioning
 */

export interface DocumentVersion {
  id: string;
  documentId: string;
  content: unknown[];
  metadata: {
    title: string;
    timestamp: Date;
    changeDescription?: string;
  };
}

/**
 * Save a document version to IndexedDB
 */
export async function saveDocumentVersion(
  documentId: string,
  content: unknown[],
  title: string,
  changeDescription?: string
): Promise<void> {
  if (typeof window === 'undefined') return;

  const version: DocumentVersion = {
    id: `${documentId}_${Date.now()}`,
    documentId,
    content,
    metadata: {
      title,
      timestamp: new Date(),
      changeDescription,
    },
  };

  try {
    const db = await openVersionDB();
    const tx = db.transaction(['versions'], 'readwrite');
    const store = tx.objectStore('versions');
    await store.add(version);
    
    // Keep only last 50 versions per document
    await pruneOldVersions(documentId, 50);
  } catch (error) {
    console.error('Error saving document version:', error);
  }
}

/**
 * Get version history for a document
 */
export async function getDocumentVersions(
  documentId: string
): Promise<DocumentVersion[]> {
  if (typeof window === 'undefined') return [];

  try {
    const db = await openVersionDB();
    const tx = db.transaction(['versions'], 'readonly');
    const store = tx.objectStore('versions');
    const index = store.index('by-document');
    const versions = await index.getAll(documentId);
    
    // Sort by timestamp descending
    return versions.sort(
      (a, b) =>
        new Date(b.metadata.timestamp).getTime() -
        new Date(a.metadata.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error fetching document versions:', error);
    return [];
  }
}

/**
 * Delete old versions to keep storage manageable
 */
async function pruneOldVersions(
  documentId: string,
  keepCount: number
): Promise<void> {
  try {
    const versions = await getDocumentVersions(documentId);
    
    if (versions.length <= keepCount) return;

    const db = await openVersionDB();
    const tx = db.transaction(['versions'], 'readwrite');
    const store = tx.objectStore('versions');

    // Delete versions beyond keepCount
    const toDelete = versions.slice(keepCount);
    for (const version of toDelete) {
      await store.delete(version.id);
    }
  } catch (error) {
    console.error('Error pruning old versions:', error);
  }
}

/**
 * Open or create the IndexedDB database for versions
 */
function openVersionDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('4diary-versions', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store for versions
      if (!db.objectStoreNames.contains('versions')) {
        const store = db.createObjectStore('versions', { keyPath: 'id' });
        store.createIndex('by-document', 'documentId', { unique: false });
      }
    };
  });
}

/**
 * Clear all versions for a document
 */
export async function clearDocumentVersions(documentId: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const versions = await getDocumentVersions(documentId);
    const db = await openVersionDB();
    const tx = db.transaction(['versions'], 'readwrite');
    const store = tx.objectStore('versions');

    for (const version of versions) {
      await store.delete(version.id);
    }
  } catch (error) {
    console.error('Error clearing document versions:', error);
  }
}

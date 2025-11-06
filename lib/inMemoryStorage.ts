/**
 * In-memory storage fallback for when MongoDB is not available
 * Allows the app to function in demo mode without a database
 */

export interface StoredWorkspace {
  _id: string;
  userId: string;
  name: string;
  encryptedMasterKey: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredDocument {
  _id: string;
  workspaceId: string;
  userId: string;
  encryptedContent: string;
  encryptedDocumentKey: string;
  metadata: {
    title: string;
    tags?: string[];
    folder?: string;
  };
  favorite: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

class InMemoryStorage {
  private workspaces: Map<string, StoredWorkspace> = new Map();
  private documents: Map<string, StoredDocument> = new Map();
  private initialized: boolean = false;

  constructor() {
    // Load from localStorage if available (browser only)
    if (typeof window !== "undefined") {
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage() {
    try {
      const workspacesData = localStorage.getItem("4diary_workspaces");
      if (workspacesData) {
        const workspaces = JSON.parse(workspacesData);
        this.workspaces = new Map(Object.entries(workspaces));
      }

      const documentsData = localStorage.getItem("4diary_documents");
      if (documentsData) {
        const documents = JSON.parse(documentsData);
        this.documents = new Map(Object.entries(documents));
      }

      this.initialized = true;
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
    }
  }

  private saveToLocalStorage() {
    if (typeof window === "undefined") return;

    try {
      const workspacesObj = Object.fromEntries(this.workspaces);
      localStorage.setItem("4diary_workspaces", JSON.stringify(workspacesObj));

      const documentsObj = Object.fromEntries(this.documents);
      localStorage.setItem("4diary_documents", JSON.stringify(documentsObj));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  // Workspace operations
  createWorkspace(workspace: Omit<StoredWorkspace, "_id">): StoredWorkspace {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 15);
    const newWorkspace: StoredWorkspace = {
      ...workspace,
      _id: id,
    };
    this.workspaces.set(id, newWorkspace);
    this.saveToLocalStorage();
    return newWorkspace;
  }

  getWorkspaces(userId: string): StoredWorkspace[] {
    return Array.from(this.workspaces.values()).filter(
      (ws) => ws.userId === userId
    );
  }

  // Create a unique document ID using crypto
  createDocument(document: Omit<StoredDocument, "_id">): StoredDocument {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 15);
    const newDocument: StoredDocument = {
      ...document,
      _id: id,
    };
    this.documents.set(id, newDocument);
    this.saveToLocalStorage();
    return newDocument;
  }

  getDocument(id: string): StoredDocument | null {
    return this.documents.get(id) || null;
  }

  getDocuments(workspaceId: string, userId: string): StoredDocument[] {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.workspaceId === workspaceId && doc.userId === userId
    );
  }

  updateDocument(
    id: string,
    updates: Partial<Omit<StoredDocument, "_id">>
  ): boolean {
    const document = this.documents.get(id);
    if (!document) return false;

    this.documents.set(id, {
      ...document,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    this.saveToLocalStorage();
    return true;
  }

  deleteDocument(id: string): boolean {
    const result = this.documents.delete(id);
    if (result) {
      this.saveToLocalStorage();
    }
    return result;
  }

  // Clear all data
  clear() {
    this.workspaces.clear();
    this.documents.clear();
    if (typeof window !== "undefined") {
      localStorage.removeItem("4diary_workspaces");
      localStorage.removeItem("4diary_documents");
    }
  }
}

// Export singleton instance
export const inMemoryStorage = new InMemoryStorage();

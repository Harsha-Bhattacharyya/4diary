/**
 * MongoDB connection utility
 * Handles database connection with connection pooling
 */

import { MongoClient, Db, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    if (uri) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
  }
  clientPromise = globalWithMongo._mongoClientPromise!;
} else {
  // In production mode, it's best to not use a global variable.
  if (uri) {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

/**
 * Get database instance
 */
export async function getDatabase(): Promise<Db> {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  const client = await clientPromise;
  return client.db("4diary");
}

/**
 * Database collections interface
 */
export const collections = {
  workspaces: "workspaces",
  documents: "documents",
  templates: "templates",
  analyticsEvents: "analytics_events",
} as const;

/**
 * Initialize database indexes
 */
export async function initializeDatabase() {
  const db = await getDatabase();

  // Workspaces collection indexes
  await db.collection(collections.workspaces).createIndex({ userId: 1 });
  await db.collection(collections.workspaces).createIndex({ createdAt: -1 });

  // Documents collection indexes
  await db.collection(collections.documents).createIndex({ workspaceId: 1 });
  await db.collection(collections.documents).createIndex({ userId: 1 });
  await db
    .collection(collections.documents)
    .createIndex({ "metadata.folder": 1 });
  await db
    .collection(collections.documents)
    .createIndex({ "metadata.tags": 1 });
  await db
    .collection(collections.documents)
    .createIndex({ "metadata.title": "text" });
  await db.collection(collections.documents).createIndex({ createdAt: -1 });
  await db.collection(collections.documents).createIndex({ updatedAt: -1 });
  await db.collection(collections.documents).createIndex({ favorite: 1 });
  await db.collection(collections.documents).createIndex({ archived: 1 });

  // Templates collection indexes
  await db.collection(collections.templates).createIndex({ category: 1 });
  await db.collection(collections.templates).createIndex({ public: 1 });

  // Analytics events collection indexes
  await db.collection(collections.analyticsEvents).createIndex({ event: 1 });
  await db
    .collection(collections.analyticsEvents)
    .createIndex({ timestamp: -1 });
  await db.collection(collections.analyticsEvents).createIndex(
    { timestamp: 1 },
    { expireAfterSeconds: 30 * 24 * 60 * 60 } // 30 days TTL
  );

  console.log("Database indexes initialized");
}

/**
 * Type definitions for collections
 */

export interface Workspace {
  _id?: ObjectId;
  userId: string;
  name: string;
  encryptedMasterKey: string; // Master key encrypted with user password
  salt: string; // Salt for key derivation
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentType {
  _id?: ObjectId;
  workspaceId: string;
  userId: string;
  encryptedContent: string; // Encrypted document content
  encryptedDocumentKey: string; // Document key encrypted with master key
  metadata: {
    title: string; // Unencrypted for search
    tags?: string[];
    folder?: string;
  };
  favorite: boolean;
  archived: boolean;
  burnAfterReading?: boolean;
  selfDestructAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
}

export interface Template {
  _id?: ObjectId;
  name: string;
  description: string;
  category: string;
  content: object;
  variables?: string[]; // e.g., ["{{date}}", "{{title}}"]
  public: boolean;
  userId?: string; // null for public templates
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsEvent {
  _id?: ObjectId;
  event: string;
  metadata?: object;
  timestamp: Date;
  sessionId?: string;
}

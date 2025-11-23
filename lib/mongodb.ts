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
 * MongoDB connection utility
 * Handles database connection with connection pooling
 */

import { MongoClient, MongoClientOptions, Db, ObjectId } from "mongodb";
import { attachDatabasePool } from '@vercel/functions';

const uri = process.env.MONGODB_URI;

const options: MongoClientOptions = {
  tls: true,
  tlsAllowInvalidCertificates: true,
  appName: "devrel.vercel.integration",
  maxIdleTimeMS: 5000
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  // During build time, URI might not be available
  // Create a placeholder that will throw at runtime if used
  console.warn("MongoDB URI not found - database operations will fail at runtime");
  clientPromise = Promise.reject(new Error("Please add your MongoDB URI to .env.local"));
} else if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so the client is preserved across module reloads
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
    attachDatabasePool(client);
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
  attachDatabasePool(client);
}

// Export a module-scoped MongoClient to ensure the client can be shared across functions.
export default clientPromise;

/**
 * Get database instance
 * Returns null if MongoDB is not available
 */
export async function getDatabase(): Promise<Db | null> {
  if (!uri) {
    return null;
  }
  try {
    const client = await clientPromise;
    return client.db("4diary");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    return null;
  }
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
    emojiIcon?: string; // Emoji icon for the document
    type?: "doc" | "board" | "quick"; // Document type
    embedPreviews?: Array<{
      url: string;
      title?: string;
      description?: string;
      image?: string;
    }>; // Cached embed previews
    isQuickReadSaved?: boolean; // Whether quick read mode was saved
  };
  favorite: boolean;
  archived: boolean;
  sortOrder?: number; // Custom sort order for documents in sidebar
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

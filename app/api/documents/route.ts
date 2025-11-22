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

import { NextRequest, NextResponse } from "next/server";
import { getDatabase, collections, DocumentType } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { inMemoryStorage } from "@/lib/inMemoryStorage";

/**
 * GET /api/documents
 * List documents for a workspace
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");
    const userId = searchParams.get("userId"); // In production, get from auth session
    const folder = searchParams.get("folder");
    const tags = searchParams.get("tags")?.split(",");
    const archived = searchParams.get("archived") === "true";
    const favorite = searchParams.get("favorite") === "true";

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();

    // Use in-memory storage if database is not available
    if (!db) {
      if (!workspaceId) {
        return NextResponse.json({ documents: [] });
      }
      let documents = inMemoryStorage.getDocuments(workspaceId, userId);

      // Apply filters
      if (folder) {
        documents = documents.filter((d) => d.metadata.folder === folder);
      }
      if (tags && tags.length > 0) {
        documents = documents.filter((d) =>
          d.metadata.tags?.some((tag) => tags.includes(tag))
        );
      }
      if (archived !== undefined) {
        documents = documents.filter((d) => d.archived === archived);
      }
      if (favorite !== undefined) {
        documents = documents.filter((d) => d.favorite === favorite);
      }

      return NextResponse.json({ documents });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { userId };

    if (workspaceId) query.workspaceId = workspaceId;
    if (folder) query["metadata.folder"] = folder;
    if (tags && tags.length > 0) query["metadata.tags"] = { $in: tags };
    if (archived !== undefined) query.archived = archived;
    if (favorite !== undefined) query.favorite = favorite;

    const documents = await db
      .collection(collections.documents)
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents
 * Create a new document
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      workspaceId,
      userId,
      encryptedContent,
      encryptedDocumentKey,
      metadata,
      burnAfterReading,
      selfDestructAt,
    } = body;

    if (!userId || !workspaceId || !encryptedContent || !encryptedDocumentKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Use in-memory storage if database is not available
    if (!db) {
      const document = inMemoryStorage.createDocument({
        workspaceId,
        userId,
        encryptedContent,
        encryptedDocumentKey,
        metadata: metadata || { title: "Untitled" },
        favorite: false,
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        id: document._id,
        document,
      });
    }

    const document: DocumentType = {
      workspaceId,
      userId,
      encryptedContent,
      encryptedDocumentKey,
      metadata: metadata || { title: "Untitled" },
      favorite: false,
      archived: false,
      burnAfterReading: burnAfterReading || false,
      selfDestructAt: selfDestructAt ? new Date(selfDestructAt) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection(collections.documents)
      .insertOne(document);

    return NextResponse.json({
      id: result.insertedId,
      document,
    });
  } catch (error) {
    console.error("Failed to create document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/documents
 * Update an existing document
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      userId,
      encryptedContent,
      metadata,
      favorite,
      archived,
    } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Use in-memory storage if database is not available
    if (!db) {
      const updates: Partial<typeof body> = {};
      if (encryptedContent) updates.encryptedContent = encryptedContent;
      if (metadata) updates.metadata = metadata;
      if (favorite !== undefined) updates.favorite = favorite;
      if (archived !== undefined) updates.archived = archived;

      const success = inMemoryStorage.updateDocument(id, updates);

      if (!success) {
        return NextResponse.json(
          { error: "Document not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
      lastAccessedAt: new Date(),
    };

    if (encryptedContent) updateFields.encryptedContent = encryptedContent;
    if (metadata) updateFields.metadata = metadata;
    if (favorite !== undefined) updateFields.favorite = favorite;
    if (archived !== undefined) updateFields.archived = archived;

    const result = await db.collection(collections.documents).updateOne(
      { _id: new ObjectId(id), userId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents
 * Delete a document
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const result = await db
      .collection(collections.documents)
      .deleteOne({ _id: new ObjectId(id), userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

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
 * API endpoint for backlinks
 * Returns documents that link to the specified document
 */

import { NextRequest, NextResponse } from "next/server";
import { getDatabase, collections } from "@/lib/mongodb";

/**
 * GET /api/backlinks
 * Query parameters:
 * - title: The document title to find backlinks for
 * - workspaceId: The workspace ID
 * - userId: The user ID (for authorization)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get("title");
    const workspaceId = searchParams.get("workspaceId");
    const userId = searchParams.get("userId");

    if (!title || !workspaceId || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    // Due to zero-knowledge encryption, we can't search content server-side
    // Return all documents for client-side filtering
    const documents = await db
      .collection(collections.documents)
      .find({
        workspaceId,
        userId,
        archived: { $ne: true },
      })
      .project({
        _id: 1,
        encryptedContent: 1,
        encryptedDocumentKey: 1,
        "metadata.title": 1,
      })
      .toArray();

    // Return encrypted documents for client-side decryption and link extraction
    return NextResponse.json({
      documents: documents.map((doc) => ({
        id: doc._id.toString(),
        title: doc.metadata?.title || "Untitled",
        encryptedContent: doc.encryptedContent,
        encryptedDocumentKey: doc.encryptedDocumentKey,
      })),
    });
  } catch (error) {
    console.error("Backlinks API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch backlinks" },
      { status: 500 }
    );
  }
}

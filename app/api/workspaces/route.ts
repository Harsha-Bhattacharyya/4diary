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
import { getDatabase, collections, Workspace } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { inMemoryStorage } from "@/lib/inMemoryStorage";

/**
 * GET /api/workspaces
 * List user's workspaces
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId"); // In production, get from auth session

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();

    // Use in-memory storage if database is not available
    if (!db) {
      const workspaces = inMemoryStorage.getWorkspaces(userId);
      return NextResponse.json({ workspaces });
    }

    const workspaces = await db
      .collection(collections.workspaces)
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error("Failed to fetch workspaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces
 * Create a new workspace
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, encryptedMasterKey, salt } = body;

    if (!userId || !name || !encryptedMasterKey || !salt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Use in-memory storage if database is not available
    if (!db) {
      const workspace = inMemoryStorage.createWorkspace({
        userId,
        name,
        encryptedMasterKey,
        salt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        id: workspace._id,
        workspace,
      });
    }

    const workspace: Workspace = {
      userId,
      name,
      encryptedMasterKey,
      salt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection(collections.workspaces)
      .insertOne(workspace);

    return NextResponse.json({
      id: result.insertedId,
      workspace,
    });
  } catch (error) {
    console.error("Failed to create workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workspaces
 * Update workspace
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, name, language } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate language code if provided
    if (language !== undefined) {
      const validLanguages = ['en', 'bn', 'hi'];
      if (!validLanguages.includes(language)) {
        return NextResponse.json(
          { 
            error: "Invalid language code",
            validLanguages: validLanguages,
            received: language
          },
          { status: 400 }
        );
      }
    }

    const db = await getDatabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (name) updateFields.name = name;
    if (language) updateFields.language = language;

    const result = await db.collection(collections.workspaces).updateOne(
      { _id: new ObjectId(id), userId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update workspace:", error);
    return NextResponse.json(
      { error: "Failed to update workspace" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workspaces
 * Delete workspace and all its documents
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

    // Delete all documents in the workspace
    await db.collection(collections.documents).deleteMany({
      workspaceId: id,
      userId,
    });

    // Delete the workspace
    const result = await db
      .collection(collections.workspaces)
      .deleteOne({ _id: new ObjectId(id), userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete workspace:", error);
    return NextResponse.json(
      { error: "Failed to delete workspace" },
      { status: 500 }
    );
  }
}

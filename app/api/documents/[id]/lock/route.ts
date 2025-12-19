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
import { getDatabase, collections } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { jwtVerify } from "jose";

/**
 * POST /api/documents/[id]/lock
 * Lock a document with password protection
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { password } = await request.json();
    const { id } = await params;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Verify user is authenticated
    const sessionCookie = request.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(sessionCookie.value, secret);
    const username = payload.username as string;

    if (!username) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 500 }
      );
    }

    // Get userId from username
    const usersCollection = db.collection(collections.users);
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user._id.toString();

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update document with password protection
    const documentsCollection = db.collection(collections.documents);
    const result = await documentsCollection.updateOne(
      { _id: new ObjectId(id), userId },
      {
        $set: {
          passwordProtected: true,
          passwordHash: passwordHash,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Document locked successfully",
    });
  } catch (error) {
    console.error("Document lock error:", error);
    return NextResponse.json(
      { error: "Failed to lock document" },
      { status: 500 }
    );
  }
}

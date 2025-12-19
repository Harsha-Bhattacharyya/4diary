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
 * POST /api/documents/[id]/verify-password
 * Verify password for a locked document
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

    // Get document
    const documentsCollection = db.collection(collections.documents);
    const document = await documentsCollection.findOne({
      _id: new ObjectId(id),
      userId,
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (!document.passwordProtected || !document.passwordHash) {
      return NextResponse.json(
        { error: "Document is not password protected" },
        { status: 400 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, document.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password", valid: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      message: "Password verified successfully",
    });
  } catch (error) {
    console.error("Password verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify password" },
      { status: 500 }
    );
  }
}

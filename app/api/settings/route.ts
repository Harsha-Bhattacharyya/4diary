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
import { jwtVerify } from "jose";

/**
 * GET /api/settings
 * Get user settings
 */
export async function GET(request: NextRequest) {
  try {
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
      // Return default settings if database is not available
      return NextResponse.json({
        encryptionEnabled: true, // Encryption is always on by default
      });
    }

    const usersCollection = db.collection(collections.users);
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      encryptionEnabled: user.encryptionEnabled !== false, // Default to true
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * Update user settings
 */
export async function PUT(request: NextRequest) {
  try {
    const { encryptionEnabled } = await request.json();

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

    const usersCollection = db.collection(collections.users);

    // Update settings
    await usersCollection.updateOne(
      { username },
      { $set: { encryptionEnabled: encryptionEnabled !== false } }
    );

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

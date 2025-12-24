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
import speakeasy from "speakeasy";
import { jwtVerify } from "jose";

/**
 * POST /api/auth/2fa/enable
 * Enable 2FA after verifying a token
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
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

    const usersCollection = db.collection(collections.users);
    const user = await usersCollection.findOne({ username });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: "2FA not setup. Call /api/auth/2fa/setup first." },
        { status: 400 }
      );
    }

    // Verify the token before enabling
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 2,
    });

    if (!verified) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 401 }
      );
    }

    // Enable 2FA
    await usersCollection.updateOne(
      { username },
      { $set: { twoFactorEnabled: true } }
    );

    return NextResponse.json({
      success: true,
      message: "2FA enabled successfully",
    });
  } catch (error) {
    console.error("2FA enable error:", error);
    return NextResponse.json(
      { error: "Failed to enable 2FA" },
      { status: 500 }
    );
  }
}

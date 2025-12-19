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
import QRCode from "qrcode";
import bcrypt from "bcrypt";
import { jwtVerify } from "jose";

/**
 * POST /api/auth/2fa/setup
 * Generate a new TOTP secret and QR code for 2FA setup
 */
export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 500 }
      );
    }

    const usersCollection = db.collection(collections.users);
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is already enabled. Disable it first to regenerate." },
        { status: 400 }
      );
    }

    // Generate secret
    const twoFactorSecret = speakeasy.generateSecret({
      name: `4diary (${username})`,
      issuer: "4diary",
      length: 32,
    });

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(twoFactorSecret.otpauth_url!);

    // Generate backup codes (10 codes)
    const backupCodes: string[] = [];
    const hashedBackupCodes: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      backupCodes.push(code);
      hashedBackupCodes.push(await bcrypt.hash(code, 10));
    }

    // Store the secret temporarily (not enabled yet)
    // User must verify it first
    await usersCollection.updateOne(
      { username },
      {
        $set: {
          twoFactorSecret: twoFactorSecret.base32,
          twoFactorEnabled: false, // Not enabled until verified
          backupCodes: hashedBackupCodes,
        },
      }
    );

    return NextResponse.json({
      secret: twoFactorSecret.base32,
      qrCode: qrCodeDataURL,
      backupCodes, // Return plaintext backup codes only once
      manualEntryKey: twoFactorSecret.base32,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup 2FA" },
      { status: 500 }
    );
  }
}

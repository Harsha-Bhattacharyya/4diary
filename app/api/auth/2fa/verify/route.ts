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
import bcrypt from "bcrypt";
import { jwtVerify } from "jose";

// Rate limiting for 2FA verification
const verificationAttempts = new Map<string, { count: number; lockedUntil?: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * POST /api/auth/2fa/verify
 * Verify a TOTP code or backup code
 */
export async function POST(request: NextRequest) {
  try {
    const { token, isBackupCode } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
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

    // Check rate limiting
    const attempts = verificationAttempts.get(username);
    if (attempts) {
      if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
        const remainingMinutes = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
        return NextResponse.json(
          { error: `Too many failed attempts. Locked for ${remainingMinutes} more minute(s).` },
          { status: 429 }
        );
      }
      if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
        verificationAttempts.delete(username);
      }
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
        { error: "2FA not configured" },
        { status: 400 }
      );
    }

    let verified = false;

    if (isBackupCode) {
      // Verify backup code
      if (!user.backupCodes || user.backupCodes.length === 0) {
        return NextResponse.json(
          { error: "No backup codes available" },
          { status: 400 }
        );
      }

      // Check against all backup codes
      for (let i = 0; i < user.backupCodes.length; i++) {
        const isValid = await bcrypt.compare(token, user.backupCodes[i]);
        if (isValid) {
          verified = true;
          // Remove used backup code
          const newBackupCodes = [...user.backupCodes];
          newBackupCodes.splice(i, 1);
          await usersCollection.updateOne(
            { username },
            { $set: { backupCodes: newBackupCodes } }
          );
          break;
        }
      }
    } else {
      // Verify TOTP token
      verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token,
        window: 2, // Allow 2 steps before/after for clock skew
      });
    }

    if (!verified) {
      // Increment failed attempts
      const currentAttempts = verificationAttempts.get(username);
      const newCount = (currentAttempts?.count || 0) + 1;

      if (newCount >= MAX_ATTEMPTS) {
        verificationAttempts.set(username, {
          count: newCount,
          lockedUntil: Date.now() + LOCK_DURATION,
        });
        return NextResponse.json(
          { error: "Too many failed attempts. Locked for 15 minutes." },
          { status: 429 }
        );
      }

      verificationAttempts.set(username, { count: newCount });

      return NextResponse.json(
        { error: "Invalid token", attemptsRemaining: MAX_ATTEMPTS - newCount },
        { status: 401 }
      );
    }

    // Clear failed attempts on success
    verificationAttempts.delete(username);

    return NextResponse.json({
      success: true,
      message: "Token verified successfully",
    });
  } catch (error) {
    console.error("2FA verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}

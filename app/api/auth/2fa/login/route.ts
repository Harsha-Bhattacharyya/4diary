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
import { SignJWT } from "jose";
import { deriveKeyFromPassword } from "@/lib/crypto-utils";

/**
 * POST /api/auth/2fa/login
 * Complete login with 2FA verification
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password, token, isBackupCode } = await request.json();

    if (!username || !password || !token) {
      return NextResponse.json(
        { error: "Username, password, and token are required" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify 2FA token
    let verified = false;

    if (isBackupCode) {
      // Verify backup code
      if (!user.backupCodes || user.backupCodes.length === 0) {
        return NextResponse.json(
          { error: "No backup codes available" },
          { status: 400 }
        );
      }

      for (let i = 0; i < user.backupCodes.length; i++) {
        const isValidCode = await bcrypt.compare(token, user.backupCodes[i]);
        if (isValidCode) {
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
        window: 2,
      });
    }

    if (!verified) {
      return NextResponse.json(
        { error: "Invalid 2FA token" },
        { status: 401 }
      );
    }

    // Derive encryption key
    const encryptionKey = await deriveKeyFromPassword(password, username);

    // Create session token
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const sessionToken = await new SignJWT({ username, encryptionKey })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { success: true, message: "Login successful" },
      { status: 200 }
    );

    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("2FA login error:", error);
    return NextResponse.json(
      { error: "Failed to login with 2FA" },
      { status: 500 }
    );
  }
}

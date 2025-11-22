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
import { getDatabase } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { deriveKeyFromPassword } from "@/lib/crypto-utils";

// In-memory rate limiting (use Redis in production for multi-instance support)
const loginAttempts = new Map<string, { count: number; lockedUntil?: number }>();

const MAX_ATTEMPTS = 3;
const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Authenticate a user using username and password, issue a JWT that includes the username and a password-derived encryption key, and set it as an HTTP-only "session" cookie.
 * Implements rate limiting: locks account/IP after 3 failed attempts for 15 minutes.
 *
 * @returns A NextResponse JSON response. On success, returns status 200 with `{ success: true, message: "Login successful" }` and sets a `session` cookie containing the JWT (HTTP-only, secure in production, SameSite=lax, 7-day max age). On failure, returns an error JSON with status 400 (missing credentials), 401 (invalid credentials), 429 (too many attempts), or 500 (internal server error).
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Check rate limiting
    const clientIdentifier = username; // In production, consider also using IP address
    const attempts = loginAttempts.get(clientIdentifier);
    
    if (attempts) {
      // Check if account is locked
      if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
        const remainingMinutes = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
        return NextResponse.json(
          { error: `Too many failed attempts. Account locked for ${remainingMinutes} more minute(s).` },
          { status: 429 }
        );
      }
      
      // Reset if lock expired
      if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
        loginAttempts.delete(clientIdentifier);
      }
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    // Find user by username
    const user = await usersCollection.findOne({ username });
    if (!user) {
      // Increment failed attempts
      const currentAttempts = loginAttempts.get(clientIdentifier);
      const newCount = (currentAttempts?.count || 0) + 1;
      
      if (newCount >= MAX_ATTEMPTS) {
        loginAttempts.set(clientIdentifier, {
          count: newCount,
          lockedUntil: Date.now() + LOCK_DURATION
        });
        return NextResponse.json(
          { error: "Too many failed attempts. Account locked for 15 minutes." },
          { status: 429 }
        );
      }
      
      loginAttempts.set(clientIdentifier, { count: newCount });
      
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      // Increment failed attempts
      const currentAttempts = loginAttempts.get(clientIdentifier);
      const newCount = (currentAttempts?.count || 0) + 1;
      
      if (newCount >= MAX_ATTEMPTS) {
        loginAttempts.set(clientIdentifier, {
          count: newCount,
          lockedUntil: Date.now() + LOCK_DURATION
        });
        return NextResponse.json(
          { error: "Too many failed attempts. Account locked for 15 minutes." },
          { status: 429 }
        );
      }
      
      loginAttempts.set(clientIdentifier, { count: newCount });
      
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Clear failed attempts on successful login
    loginAttempts.delete(clientIdentifier);

    // Derive encryption key (should match stored key)
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
    const token = await new SignJWT({ username, encryptionKey })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { success: true, message: "Login successful" },
      { status: 200 }
    );

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
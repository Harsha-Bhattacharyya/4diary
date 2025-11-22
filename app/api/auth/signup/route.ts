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

/**
 * Handle signup requests and create a new user account.
 *
 * Processes a JSON body with `username`, `password`, and optional `name`; creates and stores a new user record, issues a JWT session token, and sets an HTTP-only `session` cookie on success.
 *
 * @param request - Incoming request whose JSON body must include `username` and `password` (and may include `name`)
 * @returns A NextResponse with:
 *  - status 201 and a success JSON body and an HTTP-only `session` cookie when the account is created,
 *  - status 400 and an error JSON body when `username` or `password` is missing or username contains spaces,
 *  - status 409 and an error JSON body when the username is already taken,
 *  - status 500 and an error JSON body on internal failure.
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password, name } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Validate username has no spaces
    if (username.includes(" ")) {
      return NextResponse.json(
        { error: "Username cannot contain spaces" },
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

    const usersCollection = db.collection("users");
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Derive encryption key from password
    const encryptionKey = await deriveKeyFromPassword(password, username);

    // Create user
    const user = {
      username,
      passwordHash,
      encryptionKey,
      name: name || username,
      createdAt: new Date(),
    };

    await usersCollection.insertOne(user);

    // Create session token
    const secretValue = process.env.JWT_SECRET;
    if (!secretValue) {
      console.error("JWT_SECRET not configured");
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    const secret = new TextEncoder().encode(secretValue);
    const token = await new SignJWT({ username, encryptionKey })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { success: true, message: "Account created successfully" },
      { status: 201 }
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
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
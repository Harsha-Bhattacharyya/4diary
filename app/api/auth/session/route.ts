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
import { jwtVerify } from "jose";

/**
 * Checks the request's "session" cookie JWT and determines whether the session is authenticated.
 *
 * @returns A JSON `NextResponse` containing `authenticated: true` and the token's `username` and `encryptionKey` when the cookie holds a valid JWT; otherwise a JSON response with `authenticated: false`.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "fallback-secret-key"
    );

    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json(
      {
        authenticated: true,
        username: payload.username || payload.email, // Support both for backward compatibility
        encryptionKey: payload.encryptionKey,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
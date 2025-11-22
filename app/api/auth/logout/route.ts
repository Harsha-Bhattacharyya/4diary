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

import { NextResponse } from "next/server";

/**
 * Responds to logout requests by clearing the session cookie and returning a success JSON payload.
 *
 * @returns A Response whose JSON body is `{ success: true, message: "Logged out successfully" }` with HTTP status 200; the response includes a cleared `session` cookie (path "/", maxAge 0, httpOnly, `secure` set when `NODE_ENV` is "production", sameSite "lax").
 */
export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 }
  );

  // Clear session cookie
  response.cookies.set("session", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}
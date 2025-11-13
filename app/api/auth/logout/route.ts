import { NextResponse } from "next/server";

/**
 * Handle logout requests by returning a success JSON response and removing the session cookie.
 *
 * Clears the `session` cookie on the response and returns a JSON payload indicating logout success.
 *
 * @returns A Response whose JSON body is `{ success: true, message: "Logged out successfully" }`, with HTTP status 200 and the `session` cookie deleted.
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
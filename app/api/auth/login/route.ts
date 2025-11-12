import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

/**
 * Derives a base64-encoded encryption key from a password using PBKDF2 with the user's email as salt.
 *
 * @param password - The user's password used as the PBKDF2 input key material
 * @param email - The user's email used as the PBKDF2 salt
 * @returns A base64-encoded 256-bit key derived from the provided password and email
 */
async function deriveKeyFromPassword(
  password: string,
  email: string
): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(email);

  const key = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256
  );

  return Buffer.from(derivedBits).toString("base64");
}

/**
 * Authenticate a user using email and password, issue a JWT that includes the email and a password-derived encryption key, and set it as an HTTP-only "session" cookie.
 *
 * @returns A NextResponse JSON response. On success, returns status 200 with `{ success: true, message: "Login successful" }` and sets a `session` cookie containing the JWT (HTTP-only, secure in production, SameSite=lax, 7-day max age). On failure, returns an error JSON with status 400 (missing credentials), 401 (invalid credentials), or 500 (internal server error).
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    // Find user
    const user = await usersCollection.findOne({ email });
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

    // Derive encryption key (should match stored key)
    const encryptionKey = await deriveKeyFromPassword(password, email);

    // Create session token
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ email, encryptionKey })
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
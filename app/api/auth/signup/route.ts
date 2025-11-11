import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

/**
 * Derives a deterministic 256-bit encryption key from a password and email.
 *
 * @param password - The user's password used as the derivation input.
 * @param email - The user's email used as the PBKDF2 salt to ensure determinism.
 * @returns A base64-encoded 32-byte (256-bit) encryption key.
 */
async function deriveKeyFromPassword(
  password: string,
  email: string
): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(email); // Use email as salt for deterministic key

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

  // Convert to base64 for storage
  return Buffer.from(derivedBits).toString("base64");
}

/**
 * Handle signup requests and create a new user account.
 *
 * Processes a JSON body with `email`, `password`, and optional `name`; creates and stores a new user record, issues a JWT session token, and sets an HTTP-only `session` cookie on success.
 *
 * @param request - Incoming request whose JSON body must include `email` and `password` (and may include `name`)
 * @returns A NextResponse with:
 *  - status 201 and a success JSON body and an HTTP-only `session` cookie when the account is created,
 *  - status 400 and an error JSON body when `email` or `password` is missing,
 *  - status 409 and an error JSON body when the email is already registered,
 *  - status 500 and an error JSON body on internal failure.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Derive encryption key from password
    const encryptionKey = await deriveKeyFromPassword(password, email);

    // Create user
    const user = {
      email,
      passwordHash,
      encryptionKey,
      name: name || email.split("@")[0],
      createdAt: new Date(),
    };

    await usersCollection.insertOne(user);

    // Create session token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "fallback-secret-key"
    );
    const token = await new SignJWT({ email, encryptionKey })
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
/**
 * Shares API - Manage ephemeral share tokens via Redis
 * Server never sees plaintext document content or keys
 */

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  setShareToken,
  getShareToken,
  revokeShareToken,
  extendShareTokenTTL,
  updateShareTokenPermissions,
  ShareTokenPayload,
} from "@/lib/redis";

// Rate limiting map (in-memory, simple approach)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Enforces a per-IP rate limit and updates the in-memory counters.
 *
 * Uses a 60-second window and allows up to 10 requests per IP within that window. If the window has expired for the IP, the counter and window are reset.
 *
 * @param ip - Client IP address used as the rate-limit key
 * @returns `true` if the request is allowed and the counter is incremented (or reset), `false` if the IP has reached 10 requests within the current 60-second window
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 }); // 1 minute window
    return true;
  }

  if (limit.count >= 10) {
    // Max 10 requests per minute
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Create a new ephemeral share token for a document.
 *
 * Requires `docId`, `encryptedDocKey`, and `userId` in the request JSON. Applies default permissions (view allowed, edit disabled unless provided) and a default TTL of 24 hours when not specified, persists the token, and returns a shareable URL and expiration.
 *
 * @returns An object with `success: true`, the generated `token`, the `shareUrl`, and `expiresAt` indicating when the token will expire.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { docId, encryptedDocKey, permissions, ttl, userId } = body;

    if (!docId || !encryptedDocKey || !userId) {
      return NextResponse.json(
        { error: "docId, encryptedDocKey, and userId are required" },
        { status: 400 }
      );
    }

    // Generate secure token
    const token = uuidv4();

    // Default permissions
    const sharePermissions = {
      canView: true,
      canEdit: permissions?.canEdit ?? false,
    };

    // Default TTL: 24 hours
    const ttlSeconds = ttl || 86400;

    const payload: ShareTokenPayload = {
      documentId: docId,
      encryptedDocumentKey: encryptedDocKey,
      permissions: sharePermissions,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };

    const success = await setShareToken(token, payload, ttlSeconds);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to create share token (Redis unavailable)" },
        { status: 503 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const shareUrl = `${baseUrl}/share/${token}`;

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    return NextResponse.json(
      {
        success: true,
        token,
        shareUrl,
        expiresAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Share creation error:", error);
    return NextResponse.json(
      { error: "Failed to create share token" },
      { status: 500 }
    );
  }
}

/**
 * Retrieve a share token's payload by token query parameter.
 *
 * @param request - Incoming request. Query parameter `token` must contain the share token to retrieve.
 * @returns The share payload: `documentId`, `encryptedDocumentKey`, `permissions`, and `createdAt`.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const payload = await getShareToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Share token not found or expired" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        documentId: payload.documentId,
        encryptedDocumentKey: payload.encryptedDocumentKey,
        permissions: payload.permissions,
        createdAt: payload.createdAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Share retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve share token" },
      { status: 500 }
    );
  }
}

/**
 * Revokes an existing share token identified by the `token` query parameter if the requester matches `userId`.
 *
 * @param request - Incoming request; query must include `token` and `userId` to identify the share and verify ownership.
 * @returns An object with `success: true` when the share token was revoked.
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    const userId = request.nextUrl.searchParams.get("userId");

    if (!token || !userId) {
      return NextResponse.json(
        { error: "Token and userId are required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const payload = await getShareToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Share token not found" },
        { status: 404 }
      );
    }

    if (payload.createdBy !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to revoke this token" },
        { status: 403 }
      );
    }

    const success = await revokeShareToken(token);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to revoke share token" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Share revocation error:", error);
    return NextResponse.json(
      { error: "Failed to revoke share token" },
      { status: 500 }
    );
  }
}

/**
 * Update an existing share token's time-to-live and/or permissions.
 *
 * @param body.token - The share token identifier to update
 * @param body.userId - The ID of the user performing the update; must match the token's creator
 * @param body.ttl - Optional TTL extension in seconds to apply to the token
 * @param body.permissions - Optional permissions object to replace the token's current permissions
 * @returns An object with `success: true` when the update completes successfully
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, userId, ttl, permissions } = body;

    if (!token || !userId) {
      return NextResponse.json(
        { error: "Token and userId are required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const payload = await getShareToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Share token not found" },
        { status: 404 }
      );
    }

    if (payload.createdBy !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to update this token" },
        { status: 403 }
      );
    }

    let success = true;

    // Extend TTL if provided
    if (ttl) {
      success = success && (await extendShareTokenTTL(token, ttl));
    }

    // Update permissions if provided
    if (permissions) {
      success =
        success && (await updateShareTokenPermissions(token, permissions));
    }

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update share token" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Share update error:", error);
    return NextResponse.json(
      { error: "Failed to update share token" },
      { status: 500 }
    );
  }
}
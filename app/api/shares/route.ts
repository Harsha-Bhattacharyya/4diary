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
 * POST - Create a new share token
 * Body: { docId, encryptedDocKey, permissions?, ttl? }
 * Returns: { success, token, shareUrl, expiresAt }
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
 * GET - Retrieve a share token
 * Query: ?token=...
 * Returns: { documentId, encryptedDocumentKey, permissions }
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
 * DELETE - Revoke a share token
 * Query: ?token=...&userId=...
 * Returns: { success }
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
 * PUT - Update share token (extend TTL or change permissions)
 * Body: { token, userId, ttl?, permissions? }
 * Returns: { success }
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

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { randomBytes } from "crypto";

// Generate temporary share link
export async function POST(request: NextRequest) {
  try {
    const { documentId, title, content } = await request.json();

    if (!documentId || !content) {
      return NextResponse.json(
        { error: "Document ID and content are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const sharesCollection = db.collection("shares");

    // Generate random share ID
    const shareId = randomBytes(16).toString("hex");

    // Create share record (expires in 24 hours)
    const share = {
      shareId,
      documentId,
      title: title || "Untitled",
      content, // Store encrypted content
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      views: 0,
    };

    await sharesCollection.insertOne(share);

    // Create share URL
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const shareUrl = `${baseUrl}/share/${shareId}`;

    return NextResponse.json(
      {
        success: true,
        shareUrl,
        shareId,
        expiresAt: share.expiresAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Share creation error:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}

// Get shared document
export async function GET(request: NextRequest) {
  try {
    const shareId = request.nextUrl.searchParams.get("id");

    if (!shareId) {
      return NextResponse.json(
        { error: "Share ID is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const sharesCollection = db.collection("shares");

    // Find share
    const share = await sharesCollection.findOne({ shareId });

    if (!share) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 });
    }

    // Check if expired
    if (new Date() > share.expiresAt) {
      return NextResponse.json({ error: "Share has expired" }, { status: 410 });
    }

    // Increment view count
    await sharesCollection.updateOne(
      { shareId },
      { $inc: { views: 1 } }
    );

    return NextResponse.json(
      {
        title: share.title,
        content: share.content,
        createdAt: share.createdAt,
        expiresAt: share.expiresAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Share retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve share" },
      { status: 500 }
    );
  }
}

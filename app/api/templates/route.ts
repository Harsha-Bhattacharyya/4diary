import { NextRequest, NextResponse } from "next/server";
import { getDatabase, collections, Template } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { builtInTemplates } from "@/lib/templates";

/**
 * GET /api/templates
 * Get all templates (built-in + user custom)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const category = searchParams.get("category");

    const db = await getDatabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {
      $or: [{ public: true }, { userId }],
    };

    if (category) {
      query.category = category;
    }

    const customTemplates = await db
      .collection(collections.templates)
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Combine built-in and custom templates
    let allTemplates = [
      ...builtInTemplates.map((t) => ({
        ...t,
        _id: t.id,
        public: true,
        isBuiltIn: true,
      })),
      ...customTemplates,
    ];

    // Filter by category if specified
    if (category) {
      allTemplates = allTemplates.filter((t) => t.category === category);
    }

    return NextResponse.json({ templates: allTemplates });
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Create a custom template
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description, category, content, variables, isPublic } = body;

    if (!userId || !name || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const template: Template = {
      name,
      description: description || "",
      category: category || "custom",
      content,
      variables: variables || [],
      public: isPublic || false,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection(collections.templates)
      .insertOne(template);

    return NextResponse.json({
      id: result.insertedId,
      template,
    });
  } catch (error) {
    console.error("Failed to create template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/templates
 * Delete a custom template
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const result = await db
      .collection(collections.templates)
      .deleteOne({ _id: new ObjectId(id), userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Template not found or not owned by user" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}

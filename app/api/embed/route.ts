/**
 * Embed API - Server-side URL preview fetcher
 * Fetches and sanitizes OG/meta tags for URL previews
 */

import { NextRequest, NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";

interface EmbedPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string;
}

/**
 * Extract meta tag content
 */
function extractMetaContent(html: string, property: string): string | undefined {
  const patterns = [
    new RegExp(`<meta\\s+property=["']${property}["']\\s+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+property=["']${property}["']`, "i"),
    new RegExp(`<meta\\s+name=["']${property}["']\\s+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+name=["']${property}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return undefined;
}

/**
 * Extract title from HTML
 */
function extractTitle(html: string): string | undefined {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return match ? match[1] : undefined;
}

/**
 * Parse OG and meta tags from HTML
 */
function parseMetaTags(html: string): Omit<EmbedPreview, "url"> {
  // Sanitize HTML first (only keep meta tags and title)
  const sanitized = sanitizeHtml(html, {
    allowedTags: ["meta", "title"],
    allowedAttributes: {
      meta: ["property", "name", "content"],
    },
  });

  return {
    title:
      extractMetaContent(sanitized, "og:title") ||
      extractMetaContent(sanitized, "twitter:title") ||
      extractTitle(sanitized),
    description:
      extractMetaContent(sanitized, "og:description") ||
      extractMetaContent(sanitized, "twitter:description") ||
      extractMetaContent(sanitized, "description"),
    image:
      extractMetaContent(sanitized, "og:image") ||
      extractMetaContent(sanitized, "twitter:image"),
    siteName: extractMetaContent(sanitized, "og:site_name"),
    type: extractMetaContent(sanitized, "og:type"),
  };
}

/**
 * Validate URL
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * GET - Fetch URL preview
 * Query: ?url=...
 * Returns: { url, title?, description?, image?, siteName?, type? }
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    if (!isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Fetch page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "4diary-embed-bot/1.0",
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch URL" },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "URL does not return HTML content" },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Parse meta tags
    const preview = parseMetaTags(html);

    return NextResponse.json(
      {
        url,
        ...preview,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timeout" },
          { status: 408 }
        );
      }
      console.error("Embed fetch error:", error.message);
    } else {
      console.error("Embed fetch error:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch embed preview" },
      { status: 500 }
    );
  }
}

/**
 * Embed API - Server-side URL preview fetcher
 * Fetches and sanitizes OG/meta tags for URL previews
 */

import { NextRequest, NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import { promises as dns } from "dns";

interface EmbedPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string;
}

/**
 * Retrieve the value of a meta tag's `content` attribute that matches the given property or name.
 *
 * @param html - HTML source to search for the meta tag
 * @param property - Meta `property` or `name` to match (for example `og:title` or `description`)
 * @returns The matched `content` value if present, `undefined` otherwise
 */
function extractMetaContent(html: string, property: string): string | undefined {
  // Validate property contains only safe characters
  if (!/^[a-zA-Z0-9:_-]+$/.test(property)) {
    return undefined;
  }
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
 * Retrieve the document title from an HTML string.
 *
 * @param html - The HTML source to search for a `<title>` element
 * @returns The text content of the first `<title>` element, or `undefined` if none is found
 */
function extractTitle(html: string): string | undefined {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return match ? match[1] : undefined;
}

/**
 * Extracts Open Graph, Twitter, and basic meta information from provided HTML and returns a preview object excluding the URL.
 *
 * The returned fields prefer Open Graph values, then Twitter card values, then generic meta/title fallbacks where applicable.
 *
 * @returns An object with extracted preview fields:
 * - `title` — the best available title (OG title, then Twitter title, then the document `<title>`), or `undefined` if none found.
 * - `description` — the best available description (OG description, then Twitter description, then generic `description` meta), or `undefined`.
 * - `image` — the preview image URL from OG or Twitter tags, or `undefined`.
 * - `siteName` — the site name from `og:site_name`, or `undefined`.
 * - `type` — the content type from `og:type`, or `undefined`.
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
 * Determine whether an IP address is private, reserved, loopback, link-local, unspecified, multicast, or otherwise non-routable.
 *
 * @param ip - The IP address string to test (IPv4 or IPv6 representation)
 * @returns `true` if the address is private, reserved, loopback, link-local, unspecified, multicast, or invalid; `false` otherwise.
 */
function isPrivateIP(ip: string): boolean {
  // Check for localhost
  if (ip === "127.0.0.1" || ip === "::1" || ip === "0.0.0.0") {
    return true;
  }

  // IPv4 checks
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipv4Pattern);
  if (match) {
    const [, a, b, c] = match.map(Number);
    
    // Validate each octet is 0-255
    if (a > 255 || b > 255 || c > 255) {
      return true; // Invalid IP, treat as private
    }

    // Block private ranges (RFC 1918)
    if (
      a === 10 || // 10.0.0.0/8
      (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
      (a === 192 && b === 168) || // 192.168.0.0/16
      a === 127 || // 127.0.0.0/8 loopback
      (a === 169 && b === 254) || // 169.254.0.0/16 link-local
      a === 0 || // 0.0.0.0/8 current network
      a >= 224 // 224.0.0.0/4 multicast and reserved
    ) {
      return true;
    }
  }

  // IPv6 checks
  const ipv6Lower = ip.toLowerCase();
  if (
    ipv6Lower.startsWith("::1") || // loopback
    ipv6Lower.startsWith("::ffff:127.") || // IPv4-mapped loopback
    ipv6Lower.startsWith("fc") || // Unique local address fc00::/7
    ipv6Lower.startsWith("fd") || // Unique local address fd00::/8
    ipv6Lower.startsWith("fe80:") || // Link-local fe80::/10
    ipv6Lower === "::" // Unspecified
  ) {
    return true;
  }

  return false;
}

/**
 * Validate a candidate URL and guard against SSRF by enforcing allowed schemes and ensuring resolved addresses are publicly routable.
 *
 * @param urlString - The URL to validate (as a string).
 * @returns `true` if the URL uses `http`/`https`, does not use localhost or other reserved hostnames, and does not resolve to any private or non-routable IP address; `false` otherwise.
 */
async function isValidUrl(urlString: string): Promise<boolean> {
  try {
    const url = new URL(urlString);
    
    // Only allow http and https protocols
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    const hostname = url.hostname.toLowerCase();
    
    // Block localhost variants immediately
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("127.") ||
      hostname === "::1" ||
      hostname === "[::1]"
    ) {
      return false;
    }

    // If hostname is already an IP, check it directly
    const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipv6Pattern = /^[0-9a-f:]+$/i;
    
    if (ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname)) {
      return !isPrivateIP(hostname);
    }

    // Resolve hostname to IP addresses
    try {
      const addresses = await dns.resolve(hostname);
      
      // Check all resolved IPs - reject if any are private
      for (const address of addresses) {
        if (isPrivateIP(address)) {
          return false;
        }
      }
    } catch (dnsError) {
      // DNS resolution failed - reject the URL
      console.error("DNS resolution failed for", hostname, dnsError);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Handle GET requests and return an embed preview for the URL given in the `url` query parameter.
 *
 * @param request - NextRequest containing a `url` query parameter pointing to the target page to preview.
 * @returns JSON response: on success (200) an object with `url` and optional `title`, `description`, `image`, `siteName`, and `type`; on client errors (400) an `{ error }` message for missing/invalid URL, non-HTML content, or redirects; on timeout (408) an `{ error: "Request timeout" }`; on server errors (500) an `{ error }` message.
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL and prevent SSRF (DNS resolution included)
    const urlValid = await isValidUrl(url);
    if (!urlValid) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Fetch page (SSRF risk mitigated by DNS resolution and IP blocking)
    // Disable redirects to prevent redirect-based SSRF bypass
    const response = await fetch(url, {
      headers: {
        "User-Agent": "4diary-embed-bot/1.0",
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
      redirect: "manual", // Don't follow redirects automatically
    });

    // Check for redirects and reject them
    if (response.status >= 300 && response.status < 400) {
      return NextResponse.json(
        { error: "Redirects are not allowed" },
        { status: 400 }
      );
    }

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
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * Serve markdown content and metadata for a documentation file specified by query parameters.
 *
 * Expects `category` and `file` query parameters (e.g., ?category=getting-started&file=introduction).
 * Returns specific error responses for missing parameters (400), paths outside the docs directory (403),
 * missing files (404), and internal failures (500).
 *
 * @returns A JSON object with:
 *  - `content`: the full markdown text of the file
 *  - `title`: the first H1 heading if present, otherwise the provided file name
 *  - `category`: the requested category
 *  - `file`: the requested file name
 * On error, returns an object with an `error` message and an appropriate HTTP status code.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const file = searchParams.get('file');

    if (!category || !file) {
      return NextResponse.json(
        { error: 'Category and file parameters are required' },
        { status: 400 }
      );
    }

    const docsPath = path.join(process.cwd(), 'docs');
    const filePath = path.join(docsPath, category, `${file}.md`);

    // Security check: ensure the path is within docs directory
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(docsPath)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 403 }
      );
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Documentation file not found' },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract title from first H1 heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : file;

    return NextResponse.json({
      content,
      title,
      category,
      file,
    });
  } catch (error) {
    console.error('Error reading documentation file:', error);
    return NextResponse.json(
      { error: 'Failed to read documentation file' },
      { status: 500 }
    );
  }
}
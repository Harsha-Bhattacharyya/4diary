import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * GET /api/docs
 * Returns the documentation structure (categories and files)
 */
export async function GET() {
  try {
    const docsPath = path.join(process.cwd(), 'docs');
    
    if (!fs.existsSync(docsPath)) {
      return NextResponse.json({ categories: [] });
    }

    const categories: Array<{
      name: string;
      slug: string;
      files: Array<{ name: string; slug: string; title: string }>;
    }> = [];

    // Read all directories in docs folder
    const entries = fs.readdirSync(docsPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const categoryPath = path.join(docsPath, entry.name);
        const files: Array<{ name: string; slug: string; title: string }> = [];

        // Read all .md files in the category
        const categoryFiles = fs.readdirSync(categoryPath);
        
        for (const file of categoryFiles) {
          if (file.endsWith('.md')) {
            const filePath = path.join(categoryPath, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // Extract title from first H1 heading
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1] : file.replace('.md', '');
            
            files.push({
              name: file,
              slug: file.replace('.md', ''),
              title,
            });
          }
        }

        if (files.length > 0) {
          categories.push({
            name: entry.name
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '),
            slug: entry.name,
            files: files.sort((a, b) => a.slug.localeCompare(b.slug)),
          });
        }
      }
    }

    return NextResponse.json({
      categories: categories.sort((a, b) => a.slug.localeCompare(b.slug)),
    });
  } catch (error) {
    console.error('Error reading docs structure:', error);
    return NextResponse.json(
      { error: 'Failed to read documentation structure' },
      { status: 500 }
    );
  }
}

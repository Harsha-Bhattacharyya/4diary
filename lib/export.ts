/**
 * Copyright © 2025 Harsha Bhattacharyya
 * 
 * This file is part of 4diary.
 * 
 * SPDX-License-Identifier: BSD-3-Clause
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the conditions in the LICENSE file are met.
 */

/**
 * Export system for markdown files
 * Supports single document and workspace exports
 */

import JSZip from "jszip";

// BlockNote block structure
interface BlockNoteBlock {
  type: string;
  props?: Record<string, unknown>;
  content?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ExportDocument {
  title: string;
  content: unknown; // BlockNote content
  folder?: string;
  tags?: string[];
}

/**
 * Convert BlockNote content to Markdown
 */
export function blockNoteToMarkdown(content: unknown[]): string {
  if (!Array.isArray(content)) {
    return "";
  }

  let markdown = "";

  content.forEach((blockUnknown) => {
    const block = blockUnknown as BlockNoteBlock;
    switch (block.type) {
      case "heading":
        const level = (block.props?.level as number) || 1;
        const headingText = extractText(block.content);
        markdown += `${"#".repeat(level)} ${headingText}\n\n`;
        break;

      case "paragraph":
        const paragraphText = extractText(block.content);
        if (paragraphText) {
          markdown += `${paragraphText}\n\n`;
        }
        break;

      case "bulletListItem":
        const bulletText = extractText(block.content);
        markdown += `- ${bulletText}\n`;
        break;

      case "numberedListItem":
        const numberedText = extractText(block.content);
        markdown += `1. ${numberedText}\n`;
        break;

      case "checkListItem":
        const checkText = extractText(block.content);
        const checked = block.props?.checked ? "x" : " ";
        markdown += `- [${checked}] ${checkText}\n`;
        break;

      case "codeBlock":
        const codeText = extractText(block.content);
        const language = block.props?.language || "";
        markdown += `\`\`\`${language}\n${codeText}\n\`\`\`\n\n`;
        break;

      case "quote":
        const quoteText = extractText(block.content);
        markdown += `> ${quoteText}\n\n`;
        break;

      default:
        const defaultText = extractText(block.content);
        if (defaultText) {
          markdown += `${defaultText}\n\n`;
        }
    }
  });

  return markdown.trim();
}

/**
 * Extract text from BlockNote content
 */
function extractText(content: unknown): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item.type === "text") {
          let text = item.text || "";
          // Apply text styles
          if (item.styles?.bold) text = `**${text}**`;
          if (item.styles?.italic) text = `*${text}*`;
          if (item.styles?.code) text = `\`${text}\``;
          if (item.styles?.strikethrough) text = `~~${text}~~`;
          return text;
        }
        return "";
      })
      .join("");
  }
  return "";
}

/**
 * Export a single document as markdown
 */
export function exportDocumentAsMarkdown(document: ExportDocument): string {
  let markdown = `# ${document.title}\n\n`;

  if (document.tags && document.tags.length > 0) {
    markdown += `Tags: ${document.tags.join(", ")}\n\n`;
  }

  markdown += "---\n\n";
  markdown += blockNoteToMarkdown(Array.isArray(document.content) ? document.content : []);

  return markdown;
}

/**
 * Download a single document as .md file
 */
export function downloadMarkdownFile(
  filename: string,
  content: string
): void {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFilename(filename)}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export workspace as ZIP with markdown files
 */
export async function exportWorkspaceAsZip(
  workspaceName: string,
  documents: ExportDocument[]
): Promise<Blob> {
  const zip = new JSZip();

  // Group documents by folder
  const documentsByFolder: Record<string, ExportDocument[]> = {};

  documents.forEach((doc) => {
    const folder = doc.folder || "root";
    if (!documentsByFolder[folder]) {
      documentsByFolder[folder] = [];
    }
    documentsByFolder[folder].push(doc);
  });

  // Add documents to ZIP with folder structure
  Object.entries(documentsByFolder).forEach(([folder, docs]) => {
    docs.forEach((doc) => {
      const markdown = exportDocumentAsMarkdown(doc);
      const filename = sanitizeFilename(doc.title);
      const path =
        folder === "root" ? `${filename}.md` : `${folder}/${filename}.md`;

      zip.file(path, markdown);
    });
  });

  // Add README
  const readme = `# ${workspaceName}\n\nExported from 4diary on ${new Date().toLocaleString()}\n\nTotal documents: ${documents.length}`;
  zip.file("README.md", readme);

  return await zip.generateAsync({ type: "blob" });
}

/**
 * Download workspace as ZIP file
 */
export async function downloadWorkspaceZip(
  workspaceName: string,
  documents: ExportDocument[]
): Promise<void> {
  const blob = await exportWorkspaceAsZip(workspaceName, documents);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFilename(workspaceName)}-export.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sanitize filename for safe file system usage
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9\s-_]/gi, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .substring(0, 100);
}

/**
 * Import markdown to BlockNote content
 */
export function markdownToBlockNote(markdown: string): unknown[] {
  const lines = markdown.split("\n");
  const blocks: unknown[] = [];

  // Track list type state for proper formatting
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let currentListType: "bullet" | "numbered" | null = null;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLanguage = "";

  lines.forEach((line) => {
    // Code blocks
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLanguage = line.substring(3).trim();
        codeBlockContent = [];
      } else {
        inCodeBlock = false;
        blocks.push({
          type: "codeBlock",
          props: { language: codeBlockLanguage },
          content: [{ type: "text", text: codeBlockContent.join("\n") }],
        });
        codeBlockContent = [];
        codeBlockLanguage = "";
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    // Headings
    if (line.startsWith("#")) {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        blocks.push({
          type: "heading",
          props: { level: match[1].length },
          content: [{ type: "text", text: match[2] }],
        });
        currentListType = null;
        return;
      }
    }

    // Bullet lists
    if (line.match(/^[-*]\s+(.+)$/)) {
      const text = line.replace(/^[-*]\s+/, "");
      blocks.push({
        type: "bulletListItem",
        content: [{ type: "text", text }],
      });
      currentListType = "bullet";
      return;
    }

    // Numbered lists
    if (line.match(/^\d+\.\s+(.+)$/)) {
      const text = line.replace(/^\d+\.\s+/, "");
      blocks.push({
        type: "numberedListItem",
        content: [{ type: "text", text }],
      });
      currentListType = "numbered";
      return;
    }

    // Blockquotes
    if (line.startsWith(">")) {
      const text = line.substring(1).trim();
      blocks.push({
        type: "quote",
        content: [{ type: "text", text }],
      });
      currentListType = null;
      return;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      currentListType = null;
      return;
    }

    // Empty line
    if (line.trim() === "") {
      currentListType = null;
      return;
    }

    // Regular paragraph
    blocks.push({
      type: "paragraph",
      content: [{ type: "text", text: line }],
    });
    currentListType = null;
  });

  return blocks;
}

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
 * Import system for notes from various sources
 * Supports: Markdown, Google Keep, Evernote, Notion, Standard Notes, Apple Notes
 */

import { XMLParser } from "fast-xml-parser";
import JSZip from "jszip";
import { markdownToBlockNote } from "./export";

/**
 * Imported note structure before encryption
 */
export interface ImportedNote {
  title: string;
  content: unknown[]; // BlockNote content format
  tags?: string[];
  folder?: string;
  createdAt?: string;
  updatedAt?: string;
  sourceApp: string;
}

/**
 * Import result with status
 */
export interface ImportResult {
  success: boolean;
  notes: ImportedNote[];
  errors: string[];
  warnings: string[];
}

/**
 * Supported import formats
 */
export type ImportFormat = 
  | "markdown"
  | "google-keep"
  | "evernote"
  | "notion"
  | "standard-notes"
  | "apple-notes";

/**
 * Detect import format from file(s)
 */
export function detectImportFormat(files: File[]): ImportFormat | null {
  if (files.length === 0) return null;
  
  const file = files[0];
  const fileName = file.name.toLowerCase();
  
  // Single markdown file
  if (fileName.endsWith(".md") || fileName.endsWith(".markdown")) {
    return "markdown";
  }
  
  // Evernote ENEX file
  if (fileName.endsWith(".enex")) {
    return "evernote";
  }
  
  // Standard Notes backup
  if (fileName.endsWith(".txt") && fileName.includes("standard-notes")) {
    return "standard-notes";
  }
  
  // ZIP file - could be multiple formats
  if (fileName.endsWith(".zip")) {
    // Will need to inspect contents to determine
    return null; // Will be detected after extraction
  }
  
  // HTML files - could be Google Keep or Apple Notes
  if (fileName.endsWith(".html") || fileName.endsWith(".htm")) {
    return null; // Will need content inspection
  }
  
  // JSON file - could be Google Keep or Standard Notes
  if (fileName.endsWith(".json")) {
    return null; // Will need content inspection
  }
  
  return null;
}

// ============ Helper Functions ============

/**
 * Check if a path is a macOS metadata file that should be skipped
 */
function isMacOSMetadataPath(path: string): boolean {
  return path.startsWith("__MACOSX/") || path.includes("/__MACOSX/");
}

/**
 * Detect if parsed JSON data is in Standard Notes format
 * Standard Notes has an "items" array with entries having content_type fields
 */
function isStandardNotesFormat(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  
  const obj = data as Record<string, unknown>;
  
  // Check for items array with Note content_type
  if (Array.isArray(obj.items)) {
    return obj.items.some((item: unknown) => {
      if (item && typeof item === "object") {
        return (item as Record<string, unknown>).content_type === "Note";
      }
      return false;
    });
  }
  
  // Check for top-level array with Note content_type
  if (Array.isArray(data)) {
    return data.some((item: unknown) => {
      if (item && typeof item === "object") {
        return (item as Record<string, unknown>).content_type === "Note";
      }
      return false;
    });
  }
  
  return false;
}

/**
 * Main import function - routes to appropriate parser
 */
export async function importNotes(
  files: File[],
  format: ImportFormat
): Promise<ImportResult> {
  switch (format) {
    case "markdown":
      return await importMarkdownFiles(files);
    case "google-keep":
      return await importGoogleKeep(files);
    case "evernote":
      return await importEvernote(files);
    case "notion":
      return await importNotion(files);
    case "standard-notes":
      return await importStandardNotes(files);
    case "apple-notes":
      return await importAppleNotes(files);
    default:
      return {
        success: false,
        notes: [],
        errors: [`Unsupported format: ${format}`],
        warnings: [],
      };
  }
}

/**
 * Import markdown files
 */
export async function importMarkdownFiles(files: File[]): Promise<ImportResult> {
  const notes: ImportedNote[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const file of files) {
    try {
      const content = await file.text();
      const title = extractTitleFromMarkdown(content, file.name);
      const blockNoteContent = markdownToBlockNote(content);
      const tags = extractTagsFromMarkdown(content);
      
      notes.push({
        title,
        content: blockNoteContent,
        tags: tags.length > 0 ? tags : undefined,
        sourceApp: "markdown",
      });
    } catch (err) {
      errors.push(`Failed to import ${file.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  
  return {
    success: errors.length === 0,
    notes,
    errors,
    warnings,
  };
}

/**
 * Extract title from markdown content or filename
 */
function extractTitleFromMarkdown(content: string, filename: string): string {
  // Try to extract H1 heading
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }
  
  // Try to extract from YAML frontmatter
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const titleMatch = frontmatterMatch[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
  }
  
  // Use filename without extension
  return filename.replace(/\.(md|markdown)$/i, "");
}

/**
 * Extract tags from markdown content
 */
function extractTagsFromMarkdown(content: string): string[] {
  const tags: string[] = [];
  
  // YAML frontmatter tags
  const yamlMatch = content.match(/^---[\s\S]*?tags:\s*\[([^\]]+)\][\s\S]*?---/);
  if (yamlMatch) {
    const tagList = yamlMatch[1].split(",").map(t => t.trim().replace(/["']/g, ""));
    tags.push(...tagList);
  }
  
  // Hashtag style tags at the end
  const hashtagMatch = content.match(/(?:^|\n)(?:tags?:|#)(.+)$/i);
  if (hashtagMatch) {
    const hashTags = hashtagMatch[1].match(/#\w+/g);
    if (hashTags) {
      tags.push(...hashTags.map(t => t.replace("#", "")));
    }
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Import Google Keep notes (from Google Takeout)
 * Supports both JSON and HTML exports
 */
export async function importGoogleKeep(files: File[]): Promise<ImportResult> {
  const notes: ImportedNote[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const file of files) {
    try {
      const fileName = file.name.toLowerCase();
      
      if (fileName.endsWith(".zip")) {
        // Handle Google Takeout ZIP
        const zipNotes = await extractGoogleKeepFromZip(file);
        notes.push(...zipNotes.notes);
        errors.push(...zipNotes.errors);
        warnings.push(...zipNotes.warnings);
      } else if (fileName.endsWith(".json")) {
        // Single JSON note
        const content = await file.text();
        const keepNote = JSON.parse(content);
        const importedNote = parseGoogleKeepJson(keepNote, file.name);
        if (importedNote) {
          notes.push(importedNote);
        }
      } else if (fileName.endsWith(".html")) {
        // HTML format from Takeout
        const content = await file.text();
        const importedNote = parseGoogleKeepHtml(content, file.name);
        if (importedNote) {
          notes.push(importedNote);
        }
      }
    } catch (err) {
      errors.push(`Failed to import ${file.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  
  return {
    success: errors.length === 0,
    notes,
    errors,
    warnings,
  };
}

/**
 * Extract Google Keep notes from Takeout ZIP
 */
async function extractGoogleKeepFromZip(file: File): Promise<ImportResult> {
  const notes: ImportedNote[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const zip = await JSZip.loadAsync(file);
    const jsonFiles = Object.keys(zip.files).filter(
      name => name.toLowerCase().endsWith(".json") && !isMacOSMetadataPath(name)
    );
    const htmlFiles = Object.keys(zip.files).filter(
      name => name.toLowerCase().endsWith(".html") && !isMacOSMetadataPath(name)
    );
    
    // Process JSON files (preferred)
    for (const jsonPath of jsonFiles) {
      try {
        const content = await zip.files[jsonPath].async("string");
        const keepNote = JSON.parse(content);
        const importedNote = parseGoogleKeepJson(keepNote, jsonPath);
        if (importedNote) {
          notes.push(importedNote);
        }
      } catch (err) {
        warnings.push(`Skipped ${jsonPath}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    // If no JSON files, try HTML
    if (jsonFiles.length === 0 && htmlFiles.length > 0) {
      for (const htmlPath of htmlFiles) {
        try {
          const content = await zip.files[htmlPath].async("string");
          const importedNote = parseGoogleKeepHtml(content, htmlPath);
          if (importedNote) {
            notes.push(importedNote);
          }
        } catch (err) {
          warnings.push(`Skipped ${htmlPath}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }
  } catch (err) {
    errors.push(`Failed to extract ZIP: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  return { success: errors.length === 0, notes, errors, warnings };
}

/**
 * Parse Google Keep JSON format
 */
function parseGoogleKeepJson(data: Record<string, unknown>, filename: string): ImportedNote | null {
  // Skip trashed notes
  if (data.isTrashed === true) {
    return null;
  }
  
  const title = (data.title as string) || extractFilename(filename);
  let contentText = "";
  
  // Handle text content
  if (data.textContent) {
    contentText = data.textContent as string;
  }
  
  // Handle list items (checkbox notes)
  if (data.listContent && Array.isArray(data.listContent)) {
    const listItems = (data.listContent as Array<{ text: string; isChecked?: boolean }>)
      .map(item => `- [${item.isChecked ? "x" : " "}] ${item.text}`)
      .join("\n");
    contentText = contentText ? `${contentText}\n\n${listItems}` : listItems;
  }
  
  // Convert to BlockNote format
  const content = markdownToBlockNote(contentText);
  
  // Extract labels as tags
  const tags: string[] = [];
  if (data.labels && Array.isArray(data.labels)) {
    tags.push(...(data.labels as Array<{ name: string }>).map(l => l.name));
  }
  
  // Extract timestamps
  const createdAt = data.createdTimestampUsec 
    ? new Date(Number(data.createdTimestampUsec) / 1000).toISOString()
    : undefined;
  const updatedAt = data.userEditedTimestampUsec
    ? new Date(Number(data.userEditedTimestampUsec) / 1000).toISOString()
    : undefined;
  
  return {
    title,
    content,
    tags: tags.length > 0 ? tags : undefined,
    createdAt,
    updatedAt,
    sourceApp: "google-keep",
  };
}

/**
 * Parse Google Keep HTML format
 */
function parseGoogleKeepHtml(html: string, filename: string): ImportedNote | null {
  // Extract title from heading or filename
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i) 
    || html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    || html.match(/<div class="title"[^>]*>([^<]+)<\/div>/i);
  const title = titleMatch ? decodeHtmlEntities(titleMatch[1]) : extractFilename(filename);
  
  // Extract content
  const contentMatch = html.match(/<div class="content"[^>]*>([\s\S]*?)<\/div>/i)
    || html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  
  let contentText = "";
  if (contentMatch) {
    contentText = stripHtmlTags(contentMatch[1]);
  }
  
  // Convert to BlockNote format
  const content = markdownToBlockNote(contentText);
  
  // Extract labels/tags from HTML
  const tags: string[] = [];
  const labelMatches = html.matchAll(/<span class="label"[^>]*>([^<]+)<\/span>/gi);
  for (const match of labelMatches) {
    tags.push(decodeHtmlEntities(match[1]));
  }
  
  return {
    title,
    content,
    tags: tags.length > 0 ? tags : undefined,
    sourceApp: "google-keep",
  };
}

/**
 * Import Evernote notes (ENEX format)
 */
export async function importEvernote(files: File[]): Promise<ImportResult> {
  const notes: ImportedNote[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    cdataPropName: "__cdata",
    ignoreDeclaration: true,
    parseTagValue: true,
    trimValues: true,
  });
  
  for (const file of files) {
    try {
      const content = await file.text();
      const enex = parser.parse(content);
      
      // Handle single note or multiple notes
      const enexNotes = enex["en-export"]?.note;
      if (!enexNotes) {
        warnings.push(`No notes found in ${file.name}`);
        continue;
      }
      
      const noteArray = Array.isArray(enexNotes) ? enexNotes : [enexNotes];
      
      for (const note of noteArray) {
        try {
          const importedNote = parseEvernoteNote(note);
          if (importedNote) {
            notes.push(importedNote);
          }
        } catch (err) {
          warnings.push(`Skipped note: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    } catch (err) {
      errors.push(`Failed to import ${file.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  
  return {
    success: errors.length === 0,
    notes,
    errors,
    warnings,
  };
}

/**
 * Parse single Evernote note
 */
function parseEvernoteNote(note: Record<string, unknown>): ImportedNote | null {
  const title = (note.title as string) || "Untitled";
  
  // Extract content from ENML
  let contentText = "";
  const enmlContent = note.content as string | { __cdata?: string };
  if (typeof enmlContent === "string") {
    contentText = convertEnmlToText(enmlContent);
  } else if (enmlContent?.__cdata) {
    contentText = convertEnmlToText(enmlContent.__cdata);
  }
  
  // Convert to BlockNote format
  const content = markdownToBlockNote(contentText);
  
  // Extract tags
  const tags: string[] = [];
  if (note.tag) {
    const tagArray = Array.isArray(note.tag) ? note.tag : [note.tag];
    tags.push(...tagArray.map(t => String(t)));
  }
  
  // Extract timestamps
  const createdAt = note.created ? parseEvernoteDate(note.created as string) : undefined;
  const updatedAt = note.updated ? parseEvernoteDate(note.updated as string) : undefined;
  
  return {
    title,
    content,
    tags: tags.length > 0 ? tags : undefined,
    createdAt,
    updatedAt,
    sourceApp: "evernote",
  };
}

/**
 * Convert ENML (Evernote Markup Language) to plain text
 */
function convertEnmlToText(enml: string): string {
  // Remove XML declaration and DOCTYPE
  let text = enml.replace(/<\?xml[^>]*\?>/gi, "");
  text = text.replace(/<!DOCTYPE[^>]*>/gi, "");
  
  // Remove en-note wrapper
  text = text.replace(/<\/?en-note[^>]*>/gi, "");
  
  // Convert common HTML elements to markdown
  text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n");
  text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n");
  text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<p[^>]*>/gi, "");
  text = text.replace(/<div[^>]*>/gi, "");
  text = text.replace(/<\/div>/gi, "\n");
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
  text = text.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
  text = text.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  text = text.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");
  text = text.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, "[$2]($1)");
  
  // Remove remaining HTML tags
  text = stripHtmlTags(text);
  
  // Decode HTML entities
  text = decodeHtmlEntities(text);
  
  // Clean up whitespace
  text = text.replace(/\n{3,}/g, "\n\n");
  
  return text.trim();
}

/**
 * Parse Evernote date format (yyyyMMddTHHmmssZ)
 */
function parseEvernoteDate(dateStr: string): string | undefined {
  try {
    const match = dateStr.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/);
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toISOString();
    }
  } catch {
    // Return undefined if parsing fails
  }
  return undefined;
}

/**
 * Import Notion exported notes
 * Supports markdown exports and CSV for databases
 */
export async function importNotion(files: File[]): Promise<ImportResult> {
  const notes: ImportedNote[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const file of files) {
    try {
      const fileName = file.name.toLowerCase();
      
      if (fileName.endsWith(".zip")) {
        // Handle Notion export ZIP
        const zipNotes = await extractNotionFromZip(file);
        notes.push(...zipNotes.notes);
        errors.push(...zipNotes.errors);
        warnings.push(...zipNotes.warnings);
      } else if (fileName.endsWith(".md")) {
        // Single markdown file
        const content = await file.text();
        const importedNote = parseNotionMarkdown(content, file.name);
        notes.push(importedNote);
      } else if (fileName.endsWith(".csv")) {
        // Notion database export
        const content = await file.text();
        const csvNotes = parseNotionCsv(content, file.name);
        notes.push(...csvNotes);
        if (csvNotes.length === 0) {
          warnings.push(`No notes extracted from ${file.name}`);
        }
      }
    } catch (err) {
      errors.push(`Failed to import ${file.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  
  return {
    success: errors.length === 0,
    notes,
    errors,
    warnings,
  };
}

/**
 * Extract Notion notes from export ZIP
 */
async function extractNotionFromZip(file: File): Promise<ImportResult> {
  const notes: ImportedNote[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const zip = await JSZip.loadAsync(file);
    const mdFiles = Object.keys(zip.files).filter(
      name => name.toLowerCase().endsWith(".md") && !isMacOSMetadataPath(name)
    );
    
    for (const mdPath of mdFiles) {
      try {
        const content = await zip.files[mdPath].async("string");
        const importedNote = parseNotionMarkdown(content, mdPath);
        notes.push(importedNote);
      } catch (err) {
        warnings.push(`Skipped ${mdPath}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  } catch (err) {
    errors.push(`Failed to extract ZIP: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  return { success: errors.length === 0, notes, errors, warnings };
}

/**
 * Parse Notion markdown with metadata
 */
function parseNotionMarkdown(content: string, filename: string): ImportedNote {
  // Notion adds unique ID to filenames like "Document Title abc123.md"
  const titleFromFile = filename
    .replace(/\.(md|markdown)$/i, "")
    .replace(/\s+[a-f0-9]{32}$/i, "") // Remove Notion's UUID suffix
    .split("/").pop() || "Untitled";
  
  // Try to get title from H1
  const h1Match = content.match(/^#\s+(.+)$/m);
  const title = h1Match ? h1Match[1].trim() : titleFromFile;
  
  // Extract folder from path
  const pathParts = filename.split("/");
  const folder = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : undefined;
  
  // Notion uses property tables at the top
  const tags: string[] = [];
  const propsMatch = content.match(/^\|[\s\S]*?\|\n\|[-\s|]+\|\n([\s\S]*?)\n\n/m);
  if (propsMatch) {
    // Try to extract tags from properties table
    const tagMatch = content.match(/\|\s*Tags?\s*\|\s*([^|]+)\s*\|/i);
    if (tagMatch) {
      const tagList = tagMatch[1].split(",").map(t => t.trim()).filter(t => t);
      tags.push(...tagList);
    }
  }
  
  // Convert to BlockNote format
  const blockNoteContent = markdownToBlockNote(content);
  
  return {
    title,
    content: blockNoteContent,
    tags: tags.length > 0 ? tags : undefined,
    folder: folder?.replace(/\s+[a-f0-9]{32}$/gi, ""), // Clean folder UUIDs too
    sourceApp: "notion",
  };
}

/**
 * Parse Notion CSV database export
 */
function parseNotionCsv(content: string, filename: string): ImportedNote[] {
  const notes: ImportedNote[] = [];
  const lines = content.split("\n");
  
  if (lines.length < 2) return notes;
  
  // Parse header to find column indices
  const headers = parseCsvLine(lines[0]);
  const nameIndex = headers.findIndex(h => h.toLowerCase() === "name" || h.toLowerCase() === "title");
  const tagsIndex = headers.findIndex(h => h.toLowerCase() === "tags" || h.toLowerCase() === "labels");
  
  // Folder from filename
  const folder = extractFilename(filename).replace(/\.(csv)$/i, "");
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCsvLine(line);
    const title = nameIndex >= 0 && values[nameIndex] ? values[nameIndex] : `Row ${i}`;
    
    // Create content from all columns
    let contentText = "";
    headers.forEach((header, idx) => {
      if (values[idx] && idx !== nameIndex) {
        contentText += `**${header}**: ${values[idx]}\n\n`;
      }
    });
    
    const blockNoteContent = markdownToBlockNote(contentText || title);
    
    // Extract tags
    const tags: string[] = [];
    if (tagsIndex >= 0 && values[tagsIndex]) {
      tags.push(...values[tagsIndex].split(",").map(t => t.trim()).filter(t => t));
    }
    
    notes.push({
      title,
      content: blockNoteContent,
      tags: tags.length > 0 ? tags : undefined,
      folder,
      sourceApp: "notion",
    });
  }
  
  return notes;
}

/**
 * Parse CSV line handling quoted values
 */
function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  
  return values;
}

/**
 * Import Standard Notes backup
 */
export async function importStandardNotes(files: File[]): Promise<ImportResult> {
  const notes: ImportedNote[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const file of files) {
    try {
      const content = await file.text();
      
      // Standard Notes exports as JSON or decrypted text backup
      if (file.name.toLowerCase().endsWith(".json")) {
        const backup = JSON.parse(content);
        
        // Handle Standard Notes backup format
        const items = backup.items || backup;
        if (!Array.isArray(items)) {
          warnings.push(`Invalid Standard Notes format in ${file.name}`);
          continue;
        }
        
        for (const item of items) {
          // Only import notes (content_type: "Note")
          if (item.content_type === "Note" && item.content) {
            try {
              const snContent = typeof item.content === "string" 
                ? JSON.parse(item.content) 
                : item.content;
              
              const title = snContent.title || "Untitled";
              const text = snContent.text || "";
              
              const blockNoteContent = markdownToBlockNote(text);
              
              notes.push({
                title,
                content: blockNoteContent,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
                sourceApp: "standard-notes",
              });
            } catch (noteErr) {
              warnings.push(`Skipped note: ${noteErr instanceof Error ? noteErr.message : String(noteErr)}`);
            }
          }
        }
      } else {
        // Try parsing as decrypted text backup (simple format)
        const textNotes = content.split(/\n---\n|\n={3,}\n/);
        for (const textNote of textNotes) {
          if (!textNote.trim()) continue;
          
          const lines = textNote.trim().split("\n");
          const title = lines[0] || "Untitled";
          const body = lines.slice(1).join("\n").trim();
          
          const blockNoteContent = markdownToBlockNote(body || title);
          
          notes.push({
            title,
            content: blockNoteContent,
            sourceApp: "standard-notes",
          });
        }
      }
    } catch (err) {
      errors.push(`Failed to import ${file.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  
  return {
    success: errors.length === 0,
    notes,
    errors,
    warnings,
  };
}

/**
 * Import Apple Notes (from exported HTML)
 * Apple Notes don't have a standard export format, so we support common HTML exports
 */
export async function importAppleNotes(files: File[]): Promise<ImportResult> {
  const notes: ImportedNote[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const file of files) {
    try {
      const content = await file.text();
      const fileName = file.name.toLowerCase();
      
      if (fileName.endsWith(".html") || fileName.endsWith(".htm")) {
        const importedNote = parseAppleNotesHtml(content, file.name);
        if (importedNote) {
          notes.push(importedNote);
        }
      } else if (fileName.endsWith(".txt")) {
        // Plain text export
        const title = extractFilename(file.name);
        const blockNoteContent = markdownToBlockNote(content);
        
        notes.push({
          title,
          content: blockNoteContent,
          sourceApp: "apple-notes",
        });
      } else if (fileName.endsWith(".zip")) {
        // Multiple exported notes
        const zipNotes = await extractAppleNotesFromZip(file);
        notes.push(...zipNotes.notes);
        errors.push(...zipNotes.errors);
        warnings.push(...zipNotes.warnings);
      }
    } catch (err) {
      errors.push(`Failed to import ${file.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  
  return {
    success: errors.length === 0,
    notes,
    errors,
    warnings,
  };
}

/**
 * Parse Apple Notes HTML export
 */
function parseAppleNotesHtml(html: string, filename: string): ImportedNote | null {
  // Extract title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
    || html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch ? decodeHtmlEntities(titleMatch[1]) : extractFilename(filename);
  
  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let contentText = "";
  
  if (bodyMatch) {
    // Convert HTML to markdown-like text
    let body = bodyMatch[1];
    
    // Handle Apple Notes specific formatting
    body = body.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n\n");
    body = body.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n\n");
    body = body.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n\n");
    body = body.replace(/<br\s*\/?>/gi, "\n");
    body = body.replace(/<\/p>/gi, "\n\n");
    body = body.replace(/<p[^>]*>/gi, "");
    body = body.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
    body = body.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
    body = body.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
    body = body.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");
    body = body.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
    
    contentText = stripHtmlTags(body);
    contentText = decodeHtmlEntities(contentText);
  }
  
  const blockNoteContent = markdownToBlockNote(contentText);
  
  // Try to extract folder from HTML metadata
  const folderMatch = html.match(/data-folder="([^"]+)"/i)
    || html.match(/<meta name="folder" content="([^"]+)"/i);
  const folder = folderMatch ? decodeHtmlEntities(folderMatch[1]) : undefined;
  
  return {
    title,
    content: blockNoteContent,
    folder,
    sourceApp: "apple-notes",
  };
}

/**
 * Extract Apple Notes from ZIP
 */
async function extractAppleNotesFromZip(file: File): Promise<ImportResult> {
  const notes: ImportedNote[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const zip = await JSZip.loadAsync(file);
    const htmlFiles = Object.keys(zip.files).filter(
      name => (name.toLowerCase().endsWith(".html") || name.toLowerCase().endsWith(".htm")) 
        && !isMacOSMetadataPath(name)
    );
    const txtFiles = Object.keys(zip.files).filter(
      name => name.toLowerCase().endsWith(".txt") && !isMacOSMetadataPath(name)
    );
    
    for (const htmlPath of htmlFiles) {
      try {
        const content = await zip.files[htmlPath].async("string");
        const importedNote = parseAppleNotesHtml(content, htmlPath);
        if (importedNote) {
          notes.push(importedNote);
        }
      } catch (err) {
        warnings.push(`Skipped ${htmlPath}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    for (const txtPath of txtFiles) {
      try {
        const content = await zip.files[txtPath].async("string");
        const title = extractFilename(txtPath);
        const blockNoteContent = markdownToBlockNote(content);
        
        notes.push({
          title,
          content: blockNoteContent,
          sourceApp: "apple-notes",
        });
      } catch (err) {
        warnings.push(`Skipped ${txtPath}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  } catch (err) {
    errors.push(`Failed to extract ZIP: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  return { success: errors.length === 0, notes, errors, warnings };
}

// ============ Utility Functions ============

/**
 * Strip HTML tags from string
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": "\"",
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
    "&ndash;": "\u2013",
    "&mdash;": "\u2014",
    "&lsquo;": "\u2018",
    "&rsquo;": "\u2019",
    "&ldquo;": "\u201C",
    "&rdquo;": "\u201D",
    "&hellip;": "\u2026",
    "&copy;": "\u00A9",
    "&reg;": "\u00AE",
    "&trade;": "\u2122",
  };
  
  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, "gi"), char);
  }
  
  // Handle numeric entities
  result = result.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  result = result.replace(/&#x([a-f0-9]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  
  return result;
}

/**
 * Extract filename without path and extension
 */
function extractFilename(path: string): string {
  const name = path.split("/").pop() || path;
  return name.replace(/\.[^.]+$/, "");
}

/**
 * Auto-detect and import from files
 */
export async function autoImportFiles(files: File[]): Promise<ImportResult> {
  if (files.length === 0) {
    return {
      success: false,
      notes: [],
      errors: ["No files provided"],
      warnings: [],
    };
  }
  
  const allNotes: ImportedNote[] = [];
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  // Group files by detected format
  const markdownFiles: File[] = [];
  const enexFiles: File[] = [];
  const jsonFiles: File[] = [];
  const htmlFiles: File[] = [];
  const zipFiles: File[] = [];
  const otherFiles: File[] = [];
  
  for (const file of files) {
    const name = file.name.toLowerCase();
    if (name.endsWith(".md") || name.endsWith(".markdown")) {
      markdownFiles.push(file);
    } else if (name.endsWith(".enex")) {
      enexFiles.push(file);
    } else if (name.endsWith(".json")) {
      jsonFiles.push(file);
    } else if (name.endsWith(".html") || name.endsWith(".htm")) {
      htmlFiles.push(file);
    } else if (name.endsWith(".zip")) {
      zipFiles.push(file);
    } else {
      otherFiles.push(file);
    }
  }
  
  // Import markdown files
  if (markdownFiles.length > 0) {
    const result = await importMarkdownFiles(markdownFiles);
    allNotes.push(...result.notes);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }
  
  // Import Evernote files
  if (enexFiles.length > 0) {
    const result = await importEvernote(enexFiles);
    allNotes.push(...result.notes);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }
  
  // Try to detect JSON format (Google Keep vs Standard Notes)
  for (const file of jsonFiles) {
    try {
      const content = await file.text();
      const data = JSON.parse(content);
      
      // Detect Standard Notes format using helper
      if (isStandardNotesFormat(data)) {
        const result = await importStandardNotes([file]);
        allNotes.push(...result.notes);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      } 
      // Detect Google Keep format
      else if (data.textContent !== undefined || data.listContent !== undefined || data.title !== undefined) {
        const result = await importGoogleKeep([file]);
        allNotes.push(...result.notes);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      }
      // Generic JSON - try as markdown
      else {
        allWarnings.push(`Unknown JSON format in ${file.name}, skipped`);
      }
    } catch (err) {
      allErrors.push(`Failed to parse JSON ${file.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  
  // Try to detect HTML format (Google Keep vs Apple Notes)
  for (const file of htmlFiles) {
    try {
      const content = await file.text();
      
      // Google Keep HTML usually has specific classes
      if (content.includes('class="content"') || content.includes('class="label"') || content.includes('data-note-id')) {
        const result = await importGoogleKeep([file]);
        allNotes.push(...result.notes);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      } else {
        // Assume Apple Notes or generic HTML
        const result = await importAppleNotes([file]);
        allNotes.push(...result.notes);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      }
    } catch (err) {
      allErrors.push(`Failed to parse HTML ${file.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  
  // Handle ZIP files - try to detect content
  for (const file of zipFiles) {
    try {
      const zip = await JSZip.loadAsync(file);
      const fileNames = Object.keys(zip.files);
      
      // Detect format by contents
      const hasEnex = fileNames.some(f => f.toLowerCase().endsWith(".enex"));
      const hasMd = fileNames.some(f => f.toLowerCase().endsWith(".md"));
      const hasJson = fileNames.some(f => f.toLowerCase().endsWith(".json"));
      const hasHtml = fileNames.some(f => f.toLowerCase().endsWith(".html"));
      
      if (hasEnex) {
        // Evernote export with ENEX inside
        for (const path of fileNames.filter(f => f.toLowerCase().endsWith(".enex"))) {
          const enexContent = await zip.files[path].async("blob");
          const enexFile = new File([enexContent], path.split("/").pop() || "export.enex");
          const result = await importEvernote([enexFile]);
          allNotes.push(...result.notes);
          allErrors.push(...result.errors);
          allWarnings.push(...result.warnings);
        }
      } else if (hasMd) {
        // Notion or generic markdown export
        const result = await importNotion([file]);
        allNotes.push(...result.notes);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      } else if (hasJson) {
        // Google Keep or Standard Notes - detect format by sampling first JSON file
        const jsonPaths = fileNames.filter(f => f.toLowerCase().endsWith(".json") && !isMacOSMetadataPath(f));
        let detectedFormat: "standard-notes" | "google-keep" = "google-keep";
        
        if (jsonPaths.length > 0) {
          try {
            const samplePath = jsonPaths[0];
            const sampleContent = await zip.files[samplePath].async("string");
            const sampleData = JSON.parse(sampleContent);
            
            if (isStandardNotesFormat(sampleData)) {
              detectedFormat = "standard-notes";
            }
          } catch {
            // Parsing error - fall back to Google Keep
            allWarnings.push(`Could not detect JSON format in ZIP file '${file.name}', assuming Google Keep`);
          }
        }
        
        if (detectedFormat === "standard-notes") {
          const result = await importStandardNotes([file]);
          allNotes.push(...result.notes);
          allErrors.push(...result.errors);
          allWarnings.push(...result.warnings);
        } else {
          const result = await importGoogleKeep([file]);
          allNotes.push(...result.notes);
          allErrors.push(...result.errors);
          allWarnings.push(...result.warnings);
        }
      } else if (hasHtml) {
        // Apple Notes or other HTML export
        const result = await importAppleNotes([file]);
        allNotes.push(...result.notes);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      } else {
        allWarnings.push(`Could not detect format of ZIP ${file.name}`);
      }
    } catch (err) {
      allErrors.push(`Failed to process ZIP ${file.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  
  // Report unsupported files
  for (const file of otherFiles) {
    allWarnings.push(`Unsupported file type: ${file.name}`);
  }
  
  return {
    success: allErrors.length === 0,
    notes: allNotes,
    errors: allErrors,
    warnings: allWarnings,
  };
}

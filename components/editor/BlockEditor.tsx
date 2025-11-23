"use client";

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

import React, { useEffect, useState } from "react";
import { useCreateBlockNote, BlockNoteViewRaw } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/react/style.css";
import "./editor.css";
import FormattingToolbar from "./FormattingToolbar";

interface BlockEditorProps {
  initialContent?: unknown[];
  onChange?: (content: unknown[]) => void;
  onSave?: (content: unknown[]) => void;
  autoSave?: boolean;
  autoSaveInterval?: number;
  editable?: boolean;
  showToolbar?: boolean;
  showLineNumbers?: boolean;
}

/**
 * Renders a BlockNote-based rich text editor with an optional formatting toolbar and auto-save.
 *
 * When `autoSave` is enabled and an `onSave` handler is provided, the editor will periodically invoke
 * `onSave` with the current document content. Changes to the document invoke `onChange` when provided.
 *
 * @param initialContent - Initial document blocks to populate the editor.
 * @param onChange - Callback invoked with the current document content after edits.
 * @param onSave - Callback invoked with the current document content for persistent saving.
 * @param autoSave - Whether the editor should automatically save changes (default: `true`).
 * @param autoSaveInterval - Time in milliseconds between automatic saves (default: `2000`).
 * @param editable - Whether the editor content is editable (default: `true`).
 * @param showToolbar - Whether to display the formatting toolbar (default: `true`).
 * @param showLineNumbers - Whether to display line numbers (default: `false`).
 * @returns The editor's JSX element.
 */
export default function BlockEditor({
  initialContent,
  onChange,
  onSave,
  autoSave = true,
  autoSaveInterval = 2000,
  editable = true,
  showToolbar = true,
  showLineNumbers = false,
}: BlockEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastContentHash, setLastContentHash] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Create editor instance
  const editor = useCreateBlockNote({
    initialContent: initialContent || undefined,
  });

  // Simple fast hash function for content comparison
  const hashContent = (content: unknown[]): number => {
    const str = JSON.stringify(content);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  };

  // Initialize lastContentHash when editor is ready with initialContent
  useEffect(() => {
    // Wait for next tick to ensure editor is initialized with initialContent
    const timer = setTimeout(() => {
      const hash = hashContent(editor.document);
      setLastContentHash(hash);
      setIsInitialized(true);
    }, 0);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save functionality - only save when there are changes
  useEffect(() => {
    if (!autoSave || !onSave || !hasChanges || !isInitialized) return;

    const timeoutId = setTimeout(async () => {
      const content = editor.document;
      
      // Double-check with full comparison before saving
      const currentHash = hashContent(content);
      
      // Only save if content has actually changed
      if (content && content.length > 0 && currentHash !== lastContentHash) {
        setIsSaving(true);
        try {
          await onSave(content);
          setLastSaved(new Date());
          setLastContentHash(currentHash);
          setHasChanges(false);
        } catch (error) {
          console.error("Failed to save:", error);
        } finally {
          setIsSaving(false);
        }
      } else {
        // Content hasn't actually changed, just reset the flag
        setHasChanges(false);
      }
    }, autoSaveInterval);

    return () => clearTimeout(timeoutId);
  }, [hasChanges, autoSave, onSave, autoSaveInterval, lastContentHash, isInitialized]);

  // Handle changes - lightweight change detection
  const handleChange = () => {
    const content = editor.document;
    
    // Just mark that there are changes without heavy serialization
    // The actual comparison will happen before save
    if (isInitialized) {
      setHasChanges(true);
    }
    
    if (onChange) {
      onChange(content);
    }
  };

  return (
    <div className="relative w-full h-full touch-auto">
      {/* Formatting Toolbar */}
      {showToolbar && <FormattingToolbar editor={editor} />}

      {/* Save status */}
      {autoSave && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full glass-card text-xs">
          {isSaving ? (
            <span className="text-aqua-600">💾 Saving...</span>
          ) : lastSaved ? (
            <span className="text-gray-600">
              ✓ Saved {lastSaved.toLocaleTimeString()}
            </span>
          ) : null}
        </div>
      )}

      {/* Editor */}
      <div 
        className={`touch-manipulation ${showLineNumbers ? 'editor-with-line-numbers' : ''}`} 
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <BlockNoteViewRaw
          editor={editor}
          onChange={handleChange}
          editable={editable}
          theme="light"
          sideMenu={false}
          slashMenu={true}
        />
      </div>
    </div>
  );
}
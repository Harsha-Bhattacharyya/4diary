"use client";

import React, { useEffect, useState } from "react";
import { useCreateBlockNote, BlockNoteViewRaw } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/react/style.css";
import FormattingToolbar from "./FormattingToolbar";

interface BlockEditorProps {
  initialContent?: unknown[];
  onChange?: (content: unknown[]) => void;
  onSave?: (content: unknown[]) => void;
  autoSave?: boolean;
  autoSaveInterval?: number;
  editable?: boolean;
  showToolbar?: boolean;
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
}: BlockEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastContent, setLastContent] = useState<string>("");

  // Create editor instance
  const editor = useCreateBlockNote({
    initialContent: initialContent || undefined,
  });

  // Initialize lastContent when editor is ready
  useEffect(() => {
    const content = JSON.stringify(editor.document);
    setLastContent(content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save functionality - only save when there are changes
  useEffect(() => {
    if (!autoSave || !onSave || !hasChanges) return;

    const timeoutId = setTimeout(async () => {
      const content = editor.document;
      const currentContent = JSON.stringify(content);
      
      // Only save if content has actually changed
      if (content && content.length > 0 && currentContent !== lastContent) {
        setIsSaving(true);
        try {
          await onSave(content);
          setLastSaved(new Date());
          setLastContent(currentContent);
          setHasChanges(false);
        } catch (error) {
          console.error("Failed to save:", error);
        } finally {
          setIsSaving(false);
        }
      }
    }, autoSaveInterval);

    return () => clearTimeout(timeoutId);
  }, [hasChanges, autoSave, onSave, autoSaveInterval, editor.document, lastContent]);

  // Handle changes
  const handleChange = () => {
    const content = editor.document;
    const currentContent = JSON.stringify(content);
    
    // Mark that there are changes if content differs from last saved
    if (currentContent !== lastContent) {
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
      <div className="touch-manipulation" style={{ WebkitTapHighlightColor: 'transparent' }}>
        <BlockNoteViewRaw
          editor={editor}
          onChange={handleChange}
          editable={editable}
          theme="light"
        />
      </div>
    </div>
  );
}
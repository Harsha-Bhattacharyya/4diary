"use client";

import React, { useEffect, useState } from "react";
import { useCreateBlockNote, BlockNoteViewRaw } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/react/style.css";

interface BlockEditorProps {
  initialContent?: unknown[];
  onChange?: (content: unknown[]) => void;
  onSave?: (content: unknown[]) => void;
  autoSave?: boolean;
  autoSaveInterval?: number;
  editable?: boolean;
}

export default function BlockEditor({
  initialContent,
  onChange,
  onSave,
  autoSave = true,
  autoSaveInterval = 2000,
  editable = true,
}: BlockEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Create editor instance
  const editor = useCreateBlockNote({
    initialContent: initialContent || undefined,
  });

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onSave) return;

    const timeoutId = setTimeout(async () => {
      const content = editor.document;
      if (content && content.length > 0) {
        setIsSaving(true);
        try {
          await onSave(content);
          setLastSaved(new Date());
        } catch (error) {
          console.error("Failed to save:", error);
        } finally {
          setIsSaving(false);
        }
      }
    }, autoSaveInterval);

    return () => clearTimeout(timeoutId);
  }, [editor.document, autoSave, onSave, autoSaveInterval]);

  // Handle changes
  const handleChange = () => {
    const content = editor.document;
    if (onChange) {
      onChange(content);
    }
  };

  return (
    <div className="relative w-full h-full">
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
      <BlockNoteViewRaw
        editor={editor}
        onChange={handleChange}
        editable={editable}
        theme="light"
      />
    </div>
  );
}

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

import React, { useState, useEffect, useRef } from "react";

interface EditableTitleProps {
  title: string;
  onSave: (newTitle: string) => Promise<void>;
  className?: string;
}

/**
 * Render an editable title that toggles between a heading and an inline text input.
 *
 * The component displays the provided `title` as a clickable heading; clicking enters edit mode and replaces the heading with a focused text input. Editing is saved on blur or Enter (trims whitespace and calls `onSave` only if the trimmed value is non-empty and changed), and cancelled with Escape or by providing an empty value (which resets to the original title).
 *
 * @param title - The initial and displayed title text.
 * @param onSave - Async callback invoked with the trimmed new title when a save occurs. On rejection, the title reverts to the original value.
 * @param className - Optional additional CSS classes applied to the rendered element.
 * @returns A heading element when not editing, or a text input element when editing.
 */
export default function EditableTitle({ title, onSave, className = "" }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmedTitle = currentTitle.trim();
    if (trimmedTitle && trimmedTitle !== title) {
      setIsSaving(true);
      try {
        await onSave(trimmedTitle);
        // Update local state immediately so the UI reflects the change
        setCurrentTitle(trimmedTitle);
        setIsEditing(false);
      } catch (err) {
        // On error, revert to the original title
        console.error("Failed to save title:", err);
        setCurrentTitle(title);
        setIsEditing(false);
      } finally {
        setIsSaving(false);
      }
    } else if (!trimmedTitle) {
      setCurrentTitle(title); // Reset to original if empty
      setIsEditing(false);
    } else {
      // No change, just exit edit mode
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setCurrentTitle(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={currentTitle}
        onChange={(e) => setCurrentTitle(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`bg-transparent border-b-2 border-leather-400 outline-none ${className}`}
        maxLength={100}
        disabled={isSaving}
      />
    );
  }

  return (
    <h2
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:text-leather-200 transition-colors ${className}`}
      title="Click to edit title"
    >
      {currentTitle}
    </h2>
  );
}
"use client";

import React, { useState, useEffect, useRef } from "react";

interface EditableTitleProps {
  title: string;
  onSave: (newTitle: string) => void;
  className?: string;
}

/**
 * Render an editable title that toggles between a heading and an inline text input.
 *
 * The component displays the provided `title` as a clickable heading; clicking enters edit mode and replaces the heading with a focused text input. Editing is saved on blur or Enter (trims whitespace and calls `onSave` only if the trimmed value is non-empty and changed), and cancelled with Escape or by providing an empty value (which resets to the original title).
 *
 * @param title - The initial and displayed title text.
 * @param onSave - Callback invoked with the trimmed new title when a save occurs.
 * @param className - Optional additional CSS classes applied to the rendered element.
 * @returns A heading element when not editing, or a text input element when editing.
 */
export default function EditableTitle({ title, onSave, className = "" }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
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

  const handleSave = () => {
    const trimmedTitle = currentTitle.trim();
    if (trimmedTitle && trimmedTitle !== title) {
      onSave(trimmedTitle);
    } else if (!trimmedTitle) {
      setCurrentTitle(title); // Reset to original if empty
    }
    setIsEditing(false);
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
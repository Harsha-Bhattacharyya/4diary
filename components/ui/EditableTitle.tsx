"use client";

import React, { useState, useEffect, useRef } from "react";

interface EditableTitleProps {
  title: string;
  onSave: (newTitle: string) => void;
  className?: string;
}

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

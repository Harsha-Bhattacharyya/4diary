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
 * Playwriter Mode Component
 * Distraction-free writing mode optimized for screenplay and play writing
 * Features centered text, screenplay formatting, and focused editing
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";

interface PlaywriterModeProps {
  content: string;
  title?: string;
  onClose: () => void;
  onSave?: (content: string) => void;
}

const FONT_SIZE_KEY = "playwriter-fontsize";
const DEFAULT_FONT_SIZE = 16;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 28;

/**
 * Displays a distraction-free writing interface optimized for screenplay and play writing.
 *
 * The component renders a full-screen editor with centered text, screenplay-style formatting,
 * adjustable font size (persisted to localStorage), keyboard support to exit via Escape,
 * and focus management on open/close.
 *
 * @param content - The initial text content to edit
 * @param title - Optional title shown above the content
 * @param onClose - Callback invoked to exit playwriter mode
 * @param onSave - Optional callback invoked when saving content
 * @returns The PlaywriterMode React element
 */
export function PlaywriterMode({
  content,
  title,
  onClose,
  onSave,
}: PlaywriterModeProps) {
  // Load font size from localStorage with lazy initialization
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(FONT_SIZE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_FONT_SIZE && parsed <= MAX_FONT_SIZE) {
          return parsed;
        }
      }
    }
    return DEFAULT_FONT_SIZE;
  });

  const [editableContent, setEditableContent] = useState(content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const increaseFontSize = useCallback(() => {
    setFontSize((s) => {
      const newSize = Math.min(s + 2, MAX_FONT_SIZE);
      if (typeof window !== "undefined") {
        localStorage.setItem(FONT_SIZE_KEY, String(newSize));
      }
      return newSize;
    });
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize((s) => {
      const newSize = Math.max(s - 2, MIN_FONT_SIZE);
      if (typeof window !== "undefined") {
        localStorage.setItem(FONT_SIZE_KEY, String(newSize));
      }
      return newSize;
    });
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableContent(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(editableContent);
      setHasUnsavedChanges(false);
    }
  }, [editableContent, onSave]);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirmClose) return;
    }
    onClose();
  }, [hasUnsavedChanges, onClose]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.code === "Escape") {
        handleClose();
      }
      // Ctrl/Cmd + S to save
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose, handleSave]);

  // Focus management - move focus to textarea on open and restore on close
  useEffect(() => {
    // Store the previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Move focus to the textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    // Restore focus on unmount
    return () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-[#0D0A07] z-50 overflow-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="playwriter-mode-label"
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#1A1410] border-b border-[#8B7355] z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleClose}
              className="text-[#E8DCC4] hover:text-[#C4B8A0] transition-colors"
              aria-label="Close playwriter mode"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <span id="playwriter-mode-label" className="text-xl text-[#E8DCC4] flex items-center gap-2">
              <Icon icon="flat-color-icons:document" width={24} height={24} /> Playwriter Mode
            </span>
            {hasUnsavedChanges && (
              <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Font size controls */}
            <button
              type="button"
              onClick={decreaseFontSize}
              className="px-3 py-1 bg-[#3D3426] text-[#E8DCC4] rounded-md hover:bg-[#4D4436] transition-colors"
              aria-label="Decrease font size"
            >
              A-
            </button>
            <span className="text-[#C4B8A0] min-w-[3rem] text-center">
              {fontSize}px
            </span>
            <button
              type="button"
              onClick={increaseFontSize}
              className="px-3 py-1 bg-[#3D3426] text-[#E8DCC4] rounded-md hover:bg-[#4D4436] transition-colors"
              aria-label="Increase font size"
            >
              A+
            </button>

            {/* Save button */}
            {onSave && (
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className="ml-4 px-4 py-1 bg-[#8B7355] text-[#E8DCC4] rounded-md hover:bg-[#A08465] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {title && (
          <h1 className="text-3xl font-bold text-[#E8DCC4] mb-6 text-center uppercase tracking-wider">
            {title}
          </h1>
        )}

        {/* Screenplay format info */}
        <div className="mb-6 p-4 bg-[#1A1410] border border-[#8B7355] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">
              <Icon icon="flat-color-icons:document" width={24} height={24} />
            </span>
            <span className="font-semibold text-[#E8DCC4]">Screenplay Tips</span>
          </div>
          <ul className="text-sm text-[#C4B8A0] space-y-1">
            <li>• Use ALL CAPS for character names</li>
            <li>• Indent dialogue with 4 spaces</li>
            <li>• Scene headings: INT./EXT. LOCATION - TIME</li>
            <li>• Parentheticals in (parentheses) below character name</li>
          </ul>
        </div>

        {/* Text editor area */}
        <textarea
          ref={textareaRef}
          value={editableContent}
          onChange={handleContentChange}
          className="w-full min-h-[60vh] bg-[#0D0A07] text-[#E8DCC4] border border-[#8B7355] rounded-lg p-6 resize-none focus:outline-none focus:ring-2 focus:ring-[#8B7355] font-mono leading-relaxed"
          style={{ fontSize: `${fontSize}px` }}
          placeholder={`INT. COFFEE SHOP - DAY

JANE sits at a corner table, nervously tapping her fingers. A WAITER approaches.

                    WAITER
        Can I get you anything while you wait?

                    JANE
        Just water, please.
            (checking her phone)
        And maybe a miracle.

The door OPENS. JOHN enters, scanning the room...`}
          spellCheck={true}
        />

        {/* Word count */}
        <div className="mt-4 text-sm text-[#A08465] text-right">
          {editableContent.trim() ? editableContent.trim().split(/\s+/).filter(w => w.length > 0).length : 0} words
        </div>
      </div>

      {/* Footer hint */}
      <div className="fixed bottom-4 right-4 text-sm text-[#A08465] bg-[#1A1410] px-4 py-2 rounded-md border border-[#8B7355]">
        Press ESC to exit • Ctrl+S to save
      </div>
    </div>
  );
}

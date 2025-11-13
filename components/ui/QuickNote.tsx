/**
 * Quick Note Component
 * Modal for quickly jotting down notes with auto-save
 * Supports hotkey activation and local-first storage
 */

"use client";

import React, { useState, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface QuickNoteProps {
  workspaceId?: string;
  userId?: string;
  onSave?: (content: string) => Promise<void>;
}

const QUICK_NOTE_KEY = "4diary_quick_note";

export function QuickNote({ onSave }: QuickNoteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(QUICK_NOTE_KEY);
      if (saved) {
        setContent(saved);
      }
    }
  }, [isOpen]);

  // Auto-save to localStorage
  useEffect(() => {
    if (content) {
      localStorage.setItem(QUICK_NOTE_KEY, content);
    }
  }, [content]);

  // Hotkey to toggle quick note (Ctrl/Cmd + Q)
  useHotkeys("mod+q", () => {
    setIsOpen((prev) => !prev);
  });

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSaveToServer = async () => {
    if (!onSave || !content.trim()) return;

    setIsSaving(true);
    try {
      await onSave(content);
      localStorage.removeItem(QUICK_NOTE_KEY);
      setContent("");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save quick note:", error);
      alert("Failed to save note. Your note is saved locally.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    if (confirm("Clear this quick note?")) {
      setContent("");
      localStorage.removeItem(QUICK_NOTE_KEY);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
        onKeyDown={(e) => e.key === 'Escape' && handleClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-50">
        <div className="bg-[#2D2416] border-2 border-[#8B7355] rounded-lg shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#8B7355]">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <h2 className="text-xl font-semibold text-[#E8DCC4]">
                Quick Note
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-[#C4B8A0] hover:text-[#E8DCC4] transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing... (auto-saved locally)"
              className="w-full h-64 bg-[#1A1410] text-[#E8DCC4] border border-[#8B7355] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#A08465] resize-none"
              autoFocus
            />

            {/* Info */}
            <div className="mt-2 text-sm text-[#A08465]">
              💾 Auto-saved locally • Press <kbd className="px-2 py-1 bg-[#3D3426] rounded border border-[#8B7355]">Ctrl+Q</kbd> to toggle
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-[#8B7355]">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-[#C4B8A0] hover:text-[#E8DCC4] transition-colors"
            >
              Clear
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-[#3D3426] text-[#E8DCC4] rounded-md hover:bg-[#4D4436] transition-colors"
              >
                Close
              </button>
              {onSave && (
                <button
                  onClick={handleSaveToServer}
                  disabled={isSaving || !content.trim()}
                  className="px-4 py-2 bg-[#8B7355] text-[#E8DCC4] rounded-md hover:bg-[#A08465] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? "Saving..." : "Save to Workspace"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

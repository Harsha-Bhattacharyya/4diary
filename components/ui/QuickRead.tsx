/**
 * Quick Read Component
 * Reader-mode UI for distraction-free reading
 * Optional privacy-preserving summarizer (disabled by default)
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface QuickReadProps {
  content: string;
  title?: string;
  onClose: () => void;
  enableSummarizer?: boolean; // Disabled by default for privacy
}

const FONT_SIZE_KEY = "quickread-fontsize";
const DEFAULT_FONT_SIZE = 16;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 32;

/**
 * Displays content in a distraction-free reader UI with adjustable, persisted font size and an optional privacy-preserving summarizer.
 *
 * The component renders a full-screen reader-mode dialog with controls to increase/decrease font size (persisted to localStorage), keyboard support to exit via Escape, focus management on open/close, and an optional summarizer action.
 *
 * @param content - The main text content to display in reader mode
 * @param title - Optional title shown above the content
 * @param onClose - Callback invoked to exit reader mode
 * @param enableSummarizer - When true, shows a "Summarize" button to generate a privacy-preserving summary; defaults to `false`
 * @returns The QuickRead reader-mode React element
 */
export function QuickRead({
  content,
  title,
  onClose,
  enableSummarizer = false,
}: QuickReadProps) {
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
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
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

  const generateSummary = async () => {
    if (!enableSummarizer) {
      alert("Summarizer is disabled for privacy. Enable it in settings.");
      return;
    }

    setIsGeneratingSummary(true);
    try {
      // Placeholder for summarizer API call
      // In a real implementation, this would call a privacy-preserving endpoint
      // that doesn't log content or send it to third parties
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSummary(
        "Summary feature is not yet implemented. When enabled, it will provide privacy-preserving summaries without sending your content to third parties."
      );
    } catch (error) {
      console.error("Failed to generate summary:", error);
      alert("Failed to generate summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.code === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Focus management - move focus to close button on open and restore on close
  useEffect(() => {
    // Store the previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Move focus to the close button
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
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
      className="fixed inset-0 bg-[#1A1410] z-50 overflow-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-mode-label"
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#2D2416] border-b border-[#8B7355] z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="text-[#E8DCC4] hover:text-[#C4B8A0] transition-colors"
              aria-label="Close reader mode"
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
            <span id="reader-mode-label" className="text-xl text-[#E8DCC4]">
              📖 Reader Mode
            </span>
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

            {/* Summarizer */}
            {enableSummarizer && (
              <button
                type="button"
                onClick={generateSummary}
                disabled={isGeneratingSummary}
                className="ml-4 px-4 py-1 bg-[#8B7355] text-[#E8DCC4] rounded-md hover:bg-[#A08465] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGeneratingSummary ? "Generating..." : "Summarize"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {title && (
          <h1 className="text-3xl font-bold text-[#E8DCC4] mb-6">{title}</h1>
        )}

        {summary && (
          <div className="mb-8 p-4 bg-[#2D2416] border border-[#8B7355] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">✨</span>
              <span className="font-semibold text-[#E8DCC4]">Summary</span>
            </div>
            <p className="text-[#C4B8A0]">{summary}</p>
          </div>
        )}

        <div
          className="text-[#E8DCC4] leading-relaxed whitespace-pre-wrap"
          style={{ fontSize: `${fontSize}px` }}
        >
          {content}
        </div>
      </div>

      {/* Footer hint */}
      <div className="fixed bottom-4 right-4 text-sm text-[#A08465] bg-[#2D2416] px-4 py-2 rounded-md border border-[#8B7355]">
        Press ESC or click ✕ to exit reader mode
      </div>
    </div>
  );
}
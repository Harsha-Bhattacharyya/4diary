/**
 * Quick Read Component
 * Reader-mode UI for distraction-free reading
 * Optional privacy-preserving summarizer (disabled by default)
 */

"use client";

import React, { useState } from "react";

interface QuickReadProps {
  content: string;
  title?: string;
  onClose: () => void;
  enableSummarizer?: boolean; // Disabled by default for privacy
}

export function QuickRead({
  content,
  title,
  onClose,
  enableSummarizer = false,
}: QuickReadProps) {
  const [fontSize, setFontSize] = useState(16);
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const increaseFontSize = () => setFontSize((s) => Math.min(s + 2, 32));
  const decreaseFontSize = () => setFontSize((s) => Math.max(s - 2, 12));

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

  return (
    <div className="fixed inset-0 bg-[#1A1410] z-50 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#2D2416] border-b border-[#8B7355] z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
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
            <span className="text-xl text-[#E8DCC4]">📖 Reader Mode</span>
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

/**
 * Emoji Picker Component
 * Allows users to select emoji icons for documents
 */

"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import type { EmojiClickData, Theme } from "emoji-picker-react";

// Dynamic import to avoid SSR issues with emoji-picker-react
const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => <div className="w-[350px] h-[450px] bg-[#222] rounded-lg animate-pulse" />,
});

interface EmojiPickerComponentProps {
  selectedEmoji?: string;
  onEmojiSelect: (emoji: string) => void;
}

/**
 * Render an emoji selection button that opens a dark-themed emoji picker dropdown.
 *
 * @param selectedEmoji - Optional emoji character to display on the button; shows a default smiley when omitted
 * @param onEmojiSelect - Callback invoked with the selected emoji string when the user picks an emoji
 * @returns A UI element containing the emoji button and, when open, a fullscreen backdrop and a positioned dark-themed emoji picker dropdown
 */
export function EmojiPickerComponent({
  selectedEmoji,
  onEmojiSelect,
}: EmojiPickerComponentProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-md border border-[#8B7355] bg-[#2D2416] text-2xl hover:bg-[#3D3426] transition-colors"
        aria-label="Select emoji"
      >
        {selectedEmoji || "😀"}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Picker */}
          <div className="absolute z-50 mt-2 left-0">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={"dark" as Theme}
              previewConfig={{ showPreview: false }}
            />
          </div>
        </>
      )}
    </div>
  );
}
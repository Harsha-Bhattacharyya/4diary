/**
 * Emoji Picker Component
 * Allows users to select emoji icons for documents
 */

"use client";

import React, { useState } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface EmojiPickerComponentProps {
  selectedEmoji?: string;
  onEmojiSelect: (emoji: string) => void;
}

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
              theme="dark"
              previewConfig={{ showPreview: false }}
            />
          </div>
        </>
      )}
    </div>
  );
}

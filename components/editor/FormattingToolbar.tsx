"use client";

import React from "react";
import type { BlockNoteEditor } from "@blocknote/core";

interface FormattingToolbarProps {
  editor: BlockNoteEditor | null;
}

/**
 * Renders a formatting toolbar for a BlockNote editor with text and block controls.
 *
 * @param editor - The BlockNote editor instance to operate on; when `null`, the toolbar renders nothing.
 * @returns The toolbar JSX element when `editor` is provided, otherwise `null`.
 */
export default function FormattingToolbar({ editor }: FormattingToolbarProps) {
  if (!editor) return null;

  const handleTextStyle = (style: string) => {
    try {
      const marks = editor.getActiveStyles();
      const isActive = marks[style as keyof typeof marks];
      
      if (isActive) {
        editor.removeStyles({ [style]: true });
      } else {
        editor.addStyles({ [style]: true });
      }
    } catch (error) {
      console.error("Error toggling text style:", error);
    }
  };

  const handleBlockType = (type: string, props?: Record<string, unknown>) => {
    try {
      const selection = editor.getSelection();
      if (selection && selection.blocks.length > 0) {
        editor.updateBlock(selection.blocks[0], {
          type,
          props,
        } as never);
      }
    } catch (error) {
      console.error("Error changing block type:", error);
    }
  };

  const toolbarButtons = [
    {
      icon: "B",
      title: "Bold (Ctrl+B)",
      action: () => handleTextStyle("bold"),
      style: "font-bold",
    },
    {
      icon: "I",
      title: "Italic (Ctrl+I)",
      action: () => handleTextStyle("italic"),
      style: "italic",
    },
    {
      icon: "U",
      title: "Underline (Ctrl+U)",
      action: () => handleTextStyle("underline"),
      style: "underline",
    },
    {
      icon: "S",
      title: "Strikethrough",
      action: () => handleTextStyle("strike"),
      style: "line-through",
    },
    {
      icon: "⟨/⟩",
      title: "Code (Ctrl+E)",
      action: () => handleTextStyle("code"),
      style: "",
    },
  ];

  const blockButtons = [
    {
      icon: "H1",
      title: "Heading 1",
      action: () => handleBlockType("heading", { level: 1 }),
    },
    {
      icon: "H2",
      title: "Heading 2",
      action: () => handleBlockType("heading", { level: 2 }),
    },
    {
      icon: "H3",
      title: "Heading 3",
      action: () => handleBlockType("heading", { level: 3 }),
    },
    {
      icon: "•",
      title: "Bullet List",
      action: () => handleBlockType("bulletListItem"),
    },
    {
      icon: "1.",
      title: "Numbered List",
      action: () => handleBlockType("numberedListItem"),
    },
    {
      icon: "{ }",
      title: "Code Block",
      action: () => handleBlockType("codeBlock"),
    },
    {
      icon: "P",
      title: "Paragraph",
      action: () => handleBlockType("paragraph"),
    },
  ];

  return (
    <div className="sticky top-0 z-20 glass-card p-2 mb-4 rounded-lg shadow-md touch-manipulation overflow-x-auto scrollbar-hide">
      <div className="flex flex-wrap items-center gap-1">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 pr-2 border-r border-leather-500">
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              onPointerDown={(e) => {
                e.preventDefault();
                button.action();
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-all duration-200 
                hover:bg-leather-600 hover:text-leather-100 text-black active:bg-leather-700
                ${button.style}`}
              title={button.title}
              type="button"
              style={{ touchAction: 'none' }}
            >
              {button.icon}
            </button>
          ))}
        </div>

        {/* Block Formatting */}
        <div className="flex items-center gap-1 flex-wrap">
          {blockButtons.map((button, index) => (
            <button
              key={index}
              onPointerDown={(e) => {
                e.preventDefault();
                button.action();
              }}
              className="px-3 py-1.5 text-sm font-medium rounded transition-all duration-200 
                hover:bg-leather-600 hover:text-leather-100 text-black active:bg-leather-700"
              title={button.title}
              type="button"
              style={{ touchAction: 'none' }}
            >
              {button.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
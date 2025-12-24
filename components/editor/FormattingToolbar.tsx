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

import React, { useEffect, useState } from "react";
import type { BlockNoteEditor } from "@blocknote/core";

interface FormattingToolbarProps {
  editor: BlockNoteEditor | null;
  position?: 'top' | 'bottom';
}

/**
 * Renders a formatting toolbar for a BlockNote editor with text and block controls.
 *
 * @param editor - The BlockNote editor instance to operate on; when `null`, the toolbar renders nothing.
 * @param position - Position of the toolbar: 'top' (default) or 'bottom'.
 * @returns The toolbar JSX element when `editor` is provided, otherwise `null`.
 */
export default function FormattingToolbar({ editor, position = 'top' }: FormattingToolbarProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Handle mobile keyboard visibility using visualViewport API
  useEffect(() => {
    if (position !== 'bottom' || typeof window === 'undefined') return;

    const handleViewportResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const newKeyboardHeight = Math.max(0, windowHeight - viewportHeight);
        setKeyboardHeight(newKeyboardHeight);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
      window.visualViewport.addEventListener('scroll', handleViewportResize);
      // Initial check
      handleViewportResize();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
        window.visualViewport.removeEventListener('scroll', handleViewportResize);
      }
    };
  }, [position]);

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

  // Bottom toolbar position with mobile keyboard support
  if (position === 'bottom') {
    return (
      <div 
        className="fixed left-0 right-0 z-50 bg-white dark:bg-leather-800 border-t border-gray-200 dark:border-leather-600 shadow-lg transition-all duration-200 pb-safe"
        style={{ 
          bottom: keyboardHeight,
          paddingBottom: keyboardHeight > 0 ? '8px' : undefined
        }}
        data-formatting-toolbar="bottom"
      >
        <div className="max-w-4xl mx-auto px-4 py-2 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 min-w-max">
            {/* Text Formatting */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-300 dark:border-leather-500">
              {toolbarButtons.map((button, index) => (
                <button
                  key={index}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    button.action();
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded transition-all duration-200 
                    hover:bg-gray-100 active:bg-gray-200 text-gray-800
                    dark:text-white dark:hover:bg-leather-700 dark:active:bg-leather-600
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
            <div className="flex items-center gap-1">
              {blockButtons.map((button, index) => (
                <button
                  key={index}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    button.action();
                  }}
                  className="px-3 py-2 text-sm font-medium rounded transition-all duration-200 
                    hover:bg-gray-100 active:bg-gray-200 text-gray-800
                    dark:text-white dark:hover:bg-leather-700 dark:active:bg-leather-600"
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
      </div>
    );
  }

  // Top toolbar (default)
  return (
    <div className="sticky top-0 z-20 glass-card p-2 mb-4 rounded-lg shadow-md touch-manipulation overflow-x-auto scrollbar-hide bg-leather-100/90 dark:bg-leather-800/90 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-1">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 pr-2 border-r border-leather-500 dark:border-leather-400">
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              onPointerDown={(e) => {
                e.preventDefault();
                button.action();
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-all duration-200 
                bg-leather-200 text-leather-800 hover:bg-leather-600 hover:text-leather-100 active:bg-leather-700
                dark:bg-leather-700 dark:text-white dark:hover:bg-leather-500 dark:active:bg-leather-400
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
                bg-leather-200 text-leather-800 hover:bg-leather-600 hover:text-leather-100 active:bg-leather-700
                dark:bg-leather-700 dark:text-white dark:hover:bg-leather-500 dark:active:bg-leather-400"
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
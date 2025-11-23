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

"use client";

import React, { useState, useEffect, useMemo } from "react";

interface NoteSettingsProps {
  content: unknown[];
  lastModified?: Date | string;
  isOpen: boolean;
  onClose: () => void;
  showLineNumbers: boolean;
  onToggleLineNumbers: (show: boolean) => void;
}

/**
 * Displays note statistics and settings in a modal dialog.
 * 
 * Shows word count, line count, character count, file size, and last modified date.
 * Allows toggling line numbers on/off.
 * 
 * @param content - The document content to analyze
 * @param lastModified - Last modified date/time
 * @param isOpen - Whether the settings modal is open
 * @param onClose - Callback to close the modal
 * @param showLineNumbers - Current state of line numbers toggle
 * @param onToggleLineNumbers - Callback to toggle line numbers
 */
export default function NoteSettings({
  content,
  lastModified,
  isOpen,
  onClose,
  showLineNumbers,
  onToggleLineNumbers,
}: NoteSettingsProps) {
  const [stats, setStats] = useState({
    wordCount: 0,
    lineCount: 0,
    characterCount: 0,
    fileSizeKB: 0,
  });

  // Calculate statistics
  useEffect(() => {
    if (!content || !Array.isArray(content)) {
      setStats({
        wordCount: 0,
        lineCount: 0,
        characterCount: 0,
        fileSizeKB: 0,
      });
      return;
    }

    // Convert content to text for analysis
    const extractText = (blocks: unknown[]): string => {
      let text = "";
      
      const processBlock = (block: any): void => {
        if (!block) return;
        
        // Handle text content directly in block
        if (block.text) {
          text += block.text + "\n";
        }
        
        // Handle content array
        if (Array.isArray(block.content)) {
          block.content.forEach((item: any) => {
            if (typeof item === "string") {
              text += item;
            } else if (item && typeof item === "object") {
              if (item.text) {
                text += item.text;
              }
              if (Array.isArray(item.content)) {
                processBlock(item);
              }
            }
          });
          text += "\n";
        }
        
        // Handle children/nested blocks
        if (Array.isArray(block.children)) {
          block.children.forEach(processBlock);
        }
      };
      
      blocks.forEach(processBlock);
      return text;
    };

    const text = extractText(content);
    const lines = text.split("\n").filter((line) => line.trim().length > 0);
    const words = text
      .split(/\s+/)
      .filter((word) => word.trim().length > 0);
    
    // Calculate file size (approximate JSON size in KB)
    const jsonString = JSON.stringify(content);
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInKB = sizeInBytes / 1024;

    setStats({
      wordCount: words.length,
      lineCount: lines.length,
      characterCount: text.length,
      fileSizeKB: parseFloat(sizeInKB.toFixed(2)),
    });
  }, [content]);

  // Format date for display
  const formattedDate = useMemo(() => {
    if (!lastModified) return "Not saved yet";
    
    const date = typeof lastModified === "string" ? new Date(lastModified) : lastModified;
    
    if (isNaN(date.getTime())) return "Invalid date";
    
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [lastModified]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-settings-title"
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="note-settings-title"
            className="text-2xl font-bold text-gray-900"
          >
            ⚙️ Note Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <svg
              className="w-5 h-5 text-gray-700"
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
        </div>

        {/* Statistics */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Word Count</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.wordCount.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Line Count</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.lineCount.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Characters</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.characterCount.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">File Size</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.fileSizeKB} KB
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Last Modified</div>
            <div className="text-base font-medium text-gray-900">
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Display Settings
          </h3>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Line Numbers</div>
              <div className="text-sm text-gray-600">
                Show line numbers in editor
              </div>
            </div>
            <button
              type="button"
              onClick={() => onToggleLineNumbers(!showLineNumbers)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showLineNumbers ? "bg-leather-600" : "bg-gray-300"
              }`}
              role="switch"
              aria-checked={showLineNumbers}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showLineNumbers ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 bg-leather-600 text-white rounded-lg hover:bg-leather-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

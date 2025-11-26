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

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { generateAllHashes } from "@/lib/crypto/hash";

interface NoteSettingsProps {
  content: unknown[];
  lastModified?: Date | string;
  isOpen: boolean;
  onClose: () => void;
  showLineNumbers: boolean;
  onToggleLineNumbers: (show: boolean) => void;
  folder?: string;
  tags?: string[];
  onUpdateFolder?: (folder: string) => void;
  onUpdateTags?: (tags: string[]) => void;
}

/**
 * Displays note statistics, settings, folder, and tags in a modal dialog.
 * 
 * Shows word count, line count, character count, file size, and last modified date.
 * Allows toggling line numbers on/off, setting folder, and managing tags.
 * 
 * @param content - The document content to analyze
 * @param lastModified - Last modified date/time
 * @param isOpen - Whether the settings modal is open
 * @param onClose - Callback to close the modal
 * @param showLineNumbers - Current state of line numbers toggle
 * @param onToggleLineNumbers - Callback to toggle line numbers
 * @param folder - Current folder of the document
 * @param tags - Current tags of the document
 * @param onUpdateFolder - Callback to update the folder
 * @param onUpdateTags - Callback to update the tags
 */
export default function NoteSettings({
  content,
  lastModified,
  isOpen,
  onClose,
  showLineNumbers,
  onToggleLineNumbers,
  folder = "",
  tags = [],
  onUpdateFolder,
  onUpdateTags,
}: NoteSettingsProps) {
  // For folder and tags, we work directly with props
  // The parent component manages the state and passes callbacks
  const [tagInput, setTagInput] = useState("");
  
  // Hash generation state
  const [hashes, setHashes] = useState<{
    md5: string;
    sha1: string;
    sha256: string;
    sha512: string;
  } | null>(null);
  const [generatingHashes, setGeneratingHashes] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!content || !Array.isArray(content)) {
      return {
        wordCount: 0,
        lineCount: 0,
        characterCount: 0,
        fileSizeKB: 0,
      };
    }

    // Convert content to text for analysis
    const extractText = (blocks: unknown[]): string => {
      let text = "";
      const stack: unknown[] = [...blocks];
      
      while (stack.length > 0) {
        const block = stack.pop();
        if (!block || typeof block !== "object") continue;
        
        const objBlock = block as Record<string, unknown>;
        
        // Handle text content directly in block
        if (objBlock.text) {
          text += objBlock.text + "\n";
        }
        
        // Handle content array
        if (Array.isArray(objBlock.content)) {
          objBlock.content.forEach((item: unknown) => {
            if (typeof item === "string") {
              text += item;
            } else if (item && typeof item === "object") {
              stack.push(item);
            }
          });
          text += "\n";
        }
        
        // Handle children/nested blocks
        if (Array.isArray(objBlock.children)) {
          stack.push(...objBlock.children);
        }
      }
      
      return text;
    };

    const text = extractText(content);
    const lines = text.split("\n").filter((line) => line.trim().length > 0);
    const words = text
      .split(/\s+/)
      .filter((word) => word.trim().length > 0);
    
    // Calculate file size (approximate JSON size in KB)
    const jsonString = JSON.stringify(content);
    const sizeInBytes = new TextEncoder().encode(jsonString).length;
    const sizeInKB = sizeInBytes / 1024;

    return {
      wordCount: words.length,
      lineCount: lines.length,
      characterCount: text.length,
      fileSizeKB: parseFloat(sizeInKB.toFixed(2)),
    };
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

  // Handle adding a tag
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTagInput("");
      if (onUpdateTags) {
        onUpdateTags(newTags);
      }
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    if (onUpdateTags) {
      onUpdateTags(newTags);
    }
  };

  // Handle folder change
  const handleFolderChange = (newFolder: string) => {
    if (onUpdateFolder) {
      onUpdateFolder(newFolder);
    }
  };

  // Handle tag input keydown
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Generate hashes for the content
  const handleGenerateHashes = useCallback(async () => {
    if (!content || !Array.isArray(content)) return;
    
    setGeneratingHashes(true);
    try {
      const contentString = JSON.stringify(content);
      const generatedHashes = await generateAllHashes(contentString);
      setHashes(generatedHashes);
    } catch (err) {
      console.error("Error generating hashes:", err);
    } finally {
      setGeneratingHashes(false);
    }
  }, [content]);

  // Copy hash to clipboard
  const copyHashToClipboard = async (hash: string, type: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(type);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {
      console.error("Failed to copy hash:", err);
    }
  };

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
        className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
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

        {/* Organization */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Organization
          </h3>

          {/* Folder */}
          <div className="mb-4">
            <label
              htmlFor="note-folder"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              📁 Folder
            </label>
            <input
              id="note-folder"
              type="text"
              value={folder}
              onChange={(e) => handleFolderChange(e.target.value)}
              placeholder="Enter folder name (e.g., Work, Personal)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leather-500 focus:border-leather-500 text-gray-900 placeholder-gray-400"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to keep note in &quot;Unfiled&quot;
            </p>
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="note-tags"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              🏷️ Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                id="note-tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag and press Enter"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leather-500 focus:border-leather-500 text-gray-900 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                className="px-4 py-2 bg-leather-600 text-white rounded-lg hover:bg-leather-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            {/* Tags list */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-leather-100 text-leather-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-leather-200 transition-colors"
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
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

        {/* Hash Generation */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔐 Hash Generation
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            Generate cryptographic hashes of your note content for verification or integrity checking.
          </p>

          <button
            type="button"
            onClick={handleGenerateHashes}
            disabled={generatingHashes}
            className="w-full px-4 py-2 bg-leather-600 text-white rounded-lg hover:bg-leather-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {generatingHashes ? "Generating..." : "Generate Hashes"}
          </button>

          {hashes && (
            <div className="space-y-3">
              {/* MD5 */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">MD5</span>
                  <button
                    type="button"
                    onClick={() => copyHashToClipboard(hashes.md5, "md5")}
                    className="text-xs text-leather-600 hover:text-leather-800"
                  >
                    {copiedHash === "md5" ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
                <code className="text-xs text-gray-600 break-all font-mono">
                  {hashes.md5}
                </code>
              </div>

              {/* SHA-1 */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">SHA-1</span>
                  <button
                    type="button"
                    onClick={() => copyHashToClipboard(hashes.sha1, "sha1")}
                    className="text-xs text-leather-600 hover:text-leather-800"
                  >
                    {copiedHash === "sha1" ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
                <code className="text-xs text-gray-600 break-all font-mono">
                  {hashes.sha1}
                </code>
              </div>

              {/* SHA-256 */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">SHA-256</span>
                  <button
                    type="button"
                    onClick={() => copyHashToClipboard(hashes.sha256, "sha256")}
                    className="text-xs text-leather-600 hover:text-leather-800"
                  >
                    {copiedHash === "sha256" ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
                <code className="text-xs text-gray-600 break-all font-mono">
                  {hashes.sha256}
                </code>
              </div>

              {/* SHA-512 */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">SHA-512</span>
                  <button
                    type="button"
                    onClick={() => copyHashToClipboard(hashes.sha512, "sha512")}
                    className="text-xs text-leather-600 hover:text-leather-800"
                  >
                    {copiedHash === "sha512" ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
                <code className="text-xs text-gray-600 break-all font-mono">
                  {hashes.sha512}
                </code>
              </div>
            </div>
          )}
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

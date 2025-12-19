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

import React, { useMemo, useState, useCallback } from "react";
import { generateAllHashes } from "@/lib/crypto/hash";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

export type EditorFontType = "normal" | "serif" | "condensed";

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
  editorFont?: EditorFontType;
  onFontChange?: (font: EditorFontType) => void;
  backgroundColor?: string;
  onBackgroundColorChange?: (color: string) => void;
  readOnly?: boolean;
  onToggleReadOnly?: (readOnly: boolean) => void;
  archived?: boolean;
  onToggleArchived?: (archived: boolean) => void;
}

/**
 * Displays note statistics, settings, folder, and tags in a modal dialog.
 * 
 * Shows word count, line count, character count, file size, and last modified date.
 * Allows toggling line numbers on/off, setting folder, managing tags, and choosing editor font.
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
 * @param editorFont - Current editor font selection
 * @param onFontChange - Callback to change the editor font
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
  editorFont = "normal",
  onFontChange,
  backgroundColor = "",
  onBackgroundColorChange,
  readOnly = false,
  onToggleReadOnly,
  archived = false,
  onToggleArchived,
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
  
  // Password protection state
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader className="text-left">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-2xl font-bold">
                <span role="img" aria-label="Settings">⚙️</span> Note Settings
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DrawerClose>
            </div>
            <DrawerDescription>
              View statistics and manage note settings
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 pb-6 overflow-y-auto max-h-[70vh]">

            {/* Statistics */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Word Count</div>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    {stats.wordCount.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Line Count</div>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    {stats.lineCount.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Characters</div>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    {stats.characterCount.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">File Size</div>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    {stats.fileSizeKB} KB
                  </div>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Last Modified</div>
                <div className="text-base font-medium text-neutral-900 dark:text-neutral-50">
                  {formattedDate}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Organization */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
                Organization
              </h3>

              {/* Folder */}
              <div className="mb-4">
                <label
                  htmlFor="note-folder"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  📁 Folder
                </label>
                <input
                  id="note-folder"
                  type="text"
                  value={folder}
                  onChange={(e) => handleFolderChange(e.target.value)}
                  placeholder="Enter folder name (e.g., Work, Personal)"
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-950 dark:focus:ring-neutral-300 focus:border-neutral-950 dark:focus:border-neutral-300 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 placeholder-neutral-400"
                />
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Leave empty to keep note in &quot;Unfiled&quot;
                </p>
              </div>

              {/* Tags */}
              <div>
                <label
                  htmlFor="note-tags"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
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
                    className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-950 dark:focus:ring-neutral-300 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 placeholder-neutral-400"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                {/* Tags list */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
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

            <Separator className="my-6" />

            {/* Settings */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
                Display Settings
              </h3>

              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-50">Line Numbers</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Show line numbers in editor
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleLineNumbers(!showLineNumbers)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showLineNumbers ? "bg-neutral-900 dark:bg-neutral-50" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                  role="switch"
                  aria-checked={showLineNumbers}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-900 transition-transform ${
                      showLineNumbers ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Font Selection */}
              <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <div className="mb-3">
                  <div className="font-medium text-neutral-900 dark:text-neutral-50">Editor Font</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Choose your preferred font style
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={editorFont === "normal" ? "default" : "outline"}
                    onClick={() => onFontChange?.("normal")}
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Normal
                  </Button>
                  <Button
                    type="button"
                    variant={editorFont === "serif" ? "default" : "outline"}
                    onClick={() => onFontChange?.("serif")}
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    Serif
                  </Button>
                  <Button
                    type="button"
                    variant={editorFont === "condensed" ? "default" : "outline"}
                    onClick={() => onFontChange?.("condensed")}
                    style={{ fontFamily: "'Roboto Condensed', 'Arial Narrow', sans-serif" }}
                  >
                    Condensed
                  </Button>
                </div>
              </div>

              {/* Background Color */}
              <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <div className="mb-3">
                  <div className="font-medium text-neutral-900 dark:text-neutral-50">Background Color</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Choose a background color for this note
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Color presets inspired by Google Keep */}
                  {[
                    { name: "Default", color: "" },
                    { name: "Coral", color: "#f28b82" },
                    { name: "Peach", color: "#fbbc04" },
                    { name: "Sand", color: "#fff475" },
                    { name: "Mint", color: "#ccff90" },
                    { name: "Sage", color: "#a7ffeb" },
                    { name: "Fog", color: "#cbf0f8" },
                    { name: "Storm", color: "#aecbfa" },
                    { name: "Dusk", color: "#d7aefb" },
                    { name: "Blossom", color: "#fdcfe8" },
                    { name: "Clay", color: "#e6c9a8" },
                    { name: "Chalk", color: "#e8eaed" },
                  ].map(({ name, color }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => onBackgroundColorChange?.(color)}
                      className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                        backgroundColor === color
                          ? "border-neutral-900 dark:border-neutral-50 ring-2 ring-offset-2 ring-neutral-900 dark:ring-neutral-50"
                          : "border-neutral-300 dark:border-neutral-600"
                      }`}
                      style={{ backgroundColor: color || "#ffffff" }}
                      title={name}
                      aria-label={`Set background color to ${name}`}
                    >
                      {!color && <span className="text-xl">🚫</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Note State Settings */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
                Note State
              </h3>

              {/* Read-Only Toggle */}
              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg mb-4">
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-50">Read-Only Mode</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Prevent editing this note
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleReadOnly?.(!readOnly)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    readOnly ? "bg-neutral-900 dark:bg-neutral-50" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                  role="switch"
                  aria-checked={readOnly}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-900 transition-transform ${
                      readOnly ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Archived Toggle */}
              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-50">Archive Note</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Hide this note from your main workspace
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleArchived?.(!archived)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    archived ? "bg-neutral-900 dark:bg-neutral-50" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                  role="switch"
                  aria-checked={archived}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-900 transition-transform ${
                      archived ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Password Protection */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
                Password Protection
              </h3>

              {!passwordProtected ? (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    Lock this note with a password for extra security.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setShowPasswordDialog(true)}
                  >
                    Set Password
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🔒</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                      This note is password protected
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setPasswordProtected(false)}
                  >
                    Remove Password
                  </Button>
                </div>
              )}

              {/* Password Dialog */}
              {showPasswordDialog && (
                <div className="mt-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg border-2 border-neutral-300 dark:border-neutral-600">
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-50 mb-3">
                    Set Note Password
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-neutral-700 dark:text-neutral-300 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-950 dark:focus:ring-neutral-300 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-700 dark:text-neutral-300 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-950 dark:focus:ring-neutral-300 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          if (password !== confirmPassword) {
                            alert("Passwords do not match");
                            return;
                          }
                          if (password.length < 4) {
                            alert("Password must be at least 4 characters");
                            return;
                          }
                          setPasswordProtected(true);
                          setShowPasswordDialog(false);
                          setPassword("");
                          setConfirmPassword("");
                        }}
                      >
                        Set Password
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowPasswordDialog(false);
                          setPassword("");
                          setConfirmPassword("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Hash Generation */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
                🔐 Hash Generation
              </h3>
              
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Generate cryptographic hashes of your note content for verification or integrity checking.
              </p>

              <Button
                type="button"
                onClick={handleGenerateHashes}
                disabled={generatingHashes}
                className="w-full mb-4"
              >
                {generatingHashes ? "Generating..." : "Generate Hashes"}
              </Button>

              {hashes && (
                <div className="space-y-3">
                  {/* MD5 */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">MD5</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyHashToClipboard(hashes.md5, "md5")}
                      >
                        {copiedHash === "md5" ? "✓ Copied!" : "Copy"}
                      </Button>
                    </div>
                    <code className="text-xs text-neutral-600 dark:text-neutral-400 break-all font-mono">
                      {hashes.md5}
                    </code>
                  </div>

                  {/* SHA-1 */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">SHA-1</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyHashToClipboard(hashes.sha1, "sha1")}
                      >
                        {copiedHash === "sha1" ? "✓ Copied!" : "Copy"}
                      </Button>
                    </div>
                    <code className="text-xs text-neutral-600 dark:text-neutral-400 break-all font-mono">
                      {hashes.sha1}
                    </code>
                  </div>

                  {/* SHA-256 */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">SHA-256</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyHashToClipboard(hashes.sha256, "sha256")}
                      >
                        {copiedHash === "sha256" ? "✓ Copied!" : "Copy"}
                      </Button>
                    </div>
                    <code className="text-xs text-neutral-600 dark:text-neutral-400 break-all font-mono">
                      {hashes.sha256}
                    </code>
                  </div>

                  {/* SHA-512 */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">SHA-512</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyHashToClipboard(hashes.sha512, "sha512")}
                      >
                        {copiedHash === "sha512" ? "✓ Copied!" : "Copy"}
                      </Button>
                    </div>
                    <code className="text-xs text-neutral-600 dark:text-neutral-400 break-all font-mono">
                      {hashes.sha512}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

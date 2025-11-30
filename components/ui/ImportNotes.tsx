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

import React, { useState, useRef, useCallback } from "react";
import GlassCard from "@/components/ui/GlassCard";
import LeatherButton from "@/components/ui/LeatherButton";
import {
  autoImportFiles,
  importNotes,
  type ImportFormat,
  type ImportResult,
  type ImportedNote,
} from "@/lib/import";

interface ImportNotesProps {
  /** Callback when import is completed successfully */
  onImportComplete: (notes: ImportedNote[]) => Promise<void>;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
}

type ImportStep = "select" | "preview" | "importing" | "complete";

/**
 * Import Notes Modal Component
 * Allows users to import notes from various sources
 */
export function ImportNotes({ onImportComplete, isOpen, onClose }: ImportNotesProps) {
  const [step, setStep] = useState<ImportStep>("select");
  const [selectedFormat, setSelectedFormat] = useState<ImportFormat | "auto">("auto");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats: { id: ImportFormat | "auto"; name: string; description: string; extensions: string }[] = [
    {
      id: "auto",
      name: "Auto-detect",
      description: "Automatically detect format from file contents",
      extensions: ".md, .enex, .json, .html, .zip",
    },
    {
      id: "markdown",
      name: "Markdown",
      description: "Standard markdown files (.md)",
      extensions: ".md, .markdown",
    },
    {
      id: "google-keep",
      name: "Google Keep",
      description: "Export from Google Takeout",
      extensions: ".json, .html, .zip",
    },
    {
      id: "evernote",
      name: "Evernote",
      description: "Evernote export files (ENEX)",
      extensions: ".enex",
    },
    {
      id: "notion",
      name: "Notion",
      description: "Exported from Notion workspace",
      extensions: ".md, .csv, .zip",
    },
    {
      id: "standard-notes",
      name: "Standard Notes",
      description: "Standard Notes backup files",
      extensions: ".json, .txt",
    },
    {
      id: "apple-notes",
      name: "Apple Notes",
      description: "Exported Apple Notes (HTML/text)",
      extensions: ".html, .txt, .zip",
    },
  ];

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
      setError(null);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFiles(Array.from(files));
      setError(null);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handlePreview = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select files to import");
      return;
    }

    setImporting(true);
    setError(null);

    try {
      let result: ImportResult;
      
      if (selectedFormat === "auto") {
        result = await autoImportFiles(selectedFiles);
      } else {
        result = await importNotes(selectedFiles, selectedFormat);
      }

      setImportResult(result);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse files");
    } finally {
      setImporting(false);
    }
  };

  const handleImport = async () => {
    if (!importResult || importResult.notes.length === 0) {
      setError("No notes to import");
      return;
    }

    setStep("importing");
    setImporting(true);
    setImportProgress(0);
    setError(null);

    try {
      // Import notes in batches for progress tracking
      const total = importResult.notes.length;
      const batchSize = 5;
      
      for (let i = 0; i < total; i += batchSize) {
        const batch = importResult.notes.slice(i, Math.min(i + batchSize, total));
        await onImportComplete(batch);
        setImportProgress(Math.min(100, Math.round(((i + batch.length) / total) * 100)));
      }

      setStep("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import notes");
      setStep("preview");
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setStep("select");
    setSelectedFormat("auto");
    setSelectedFiles([]);
    setImportResult(null);
    setImporting(false);
    setImportProgress(0);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 fade-in">
      <GlassCard className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-leather-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-leather-100">
                📥 Import Notes
              </h2>
              <p className="text-sm text-leather-300 mt-1">
                Import notes from other apps
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 hover:bg-leather-700/50 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6 text-leather-300"
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

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            {["select", "preview", "complete"].map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step === s || (step === "importing" && s === "preview")
                      ? "bg-leather-500 text-white"
                      : step === "complete" || (step === "preview" && s === "select") || (step === "importing" && s === "select")
                      ? "bg-green-600 text-white"
                      : "bg-leather-800 text-leather-400"
                  }`}
                >
                  {step === "complete" || (step === "preview" && s === "select") || (step === "importing" && s === "select")
                    ? "✓"
                    : i + 1}
                </div>
                {i < 2 && (
                  <div className={`flex-1 h-1 ${
                    (step === "preview" && i === 0) || (step === "importing" && i <= 1) || step === "complete"
                      ? "bg-green-600"
                      : "bg-leather-800"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {/* Step 1: Select Format and Files */}
          {step === "select" && (
            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-leather-200 mb-3">
                  Import Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {supportedFormats.map((format) => (
                    <button
                      key={format.id}
                      type="button"
                      onClick={() => setSelectedFormat(format.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedFormat === format.id
                          ? "border-leather-500 bg-leather-800/50"
                          : "border-leather-700 hover:border-leather-600 bg-leather-900/30"
                      }`}
                    >
                      <div className="font-semibold text-leather-100">
                        {format.name}
                      </div>
                      <div className="text-xs text-leather-400 mt-1">
                        {format.description}
                      </div>
                      <div className="text-xs text-leather-500 mt-1">
                        {format.extensions}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-leather-200 mb-3">
                  Select Files
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-leather-600 rounded-lg p-8 text-center cursor-pointer hover:border-leather-500 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".md,.markdown,.enex,.json,.html,.htm,.txt,.csv,.zip"
                  />
                  <div className="text-4xl mb-3">📁</div>
                  <p className="text-leather-200 font-medium">
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm text-leather-400 mt-2">
                    Supports: Markdown, Evernote, Google Keep, Notion, Standard Notes, Apple Notes
                  </p>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 p-4 bg-leather-900/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-leather-200">
                        Selected Files ({selectedFiles.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        className="text-xs text-leather-400 hover:text-leather-200"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {selectedFiles.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm text-leather-300"
                        >
                          <span className="text-lg">
                            {file.name.endsWith(".md") ? "📝" :
                             file.name.endsWith(".enex") ? "🐘" :
                             file.name.endsWith(".json") ? "📋" :
                             file.name.endsWith(".html") ? "🌐" :
                             file.name.endsWith(".zip") ? "📦" : "📄"}
                          </span>
                          <span className="truncate flex-1">{file.name}</span>
                          <span className="text-leather-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === "preview" && importResult && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-200">
                    {importResult.notes.length}
                  </div>
                  <div className="text-sm text-green-300">Notes to import</div>
                </div>
                <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-200">
                    {importResult.warnings.length}
                  </div>
                  <div className="text-sm text-yellow-300">Warnings</div>
                </div>
                <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-200">
                    {importResult.errors.length}
                  </div>
                  <div className="text-sm text-red-300">Errors</div>
                </div>
              </div>

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
                  <h4 className="font-semibold text-red-200 mb-2">Errors</h4>
                  <ul className="text-sm text-red-300 space-y-1">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {importResult.warnings.length > 0 && (
                <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                  <h4 className="font-semibold text-yellow-200 mb-2">Warnings</h4>
                  <ul className="text-sm text-yellow-300 space-y-1 max-h-32 overflow-y-auto">
                    {importResult.warnings.map((warn, i) => (
                      <li key={i}>• {warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes Preview */}
              <div>
                <h4 className="font-semibold text-leather-200 mb-3">
                  Notes Preview
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {importResult.notes.map((note, i) => (
                    <div
                      key={i}
                      className="p-3 bg-leather-900/40 rounded-lg flex items-center gap-3"
                    >
                      <span className="text-xl">📝</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-leather-100 truncate">
                          {note.title}
                        </div>
                        <div className="text-xs text-leather-400 flex items-center gap-2">
                          <span>From: {note.sourceApp}</span>
                          {note.folder && <span>• 📁 {note.folder}</span>}
                          {note.tags && note.tags.length > 0 && (
                            <span>• 🏷️ {note.tags.join(", ")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Importing */}
          {step === "importing" && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">⏳</div>
              <h3 className="text-xl font-bold text-leather-100 mb-2">
                Importing Notes...
              </h3>
              <p className="text-leather-300 mb-6">
                Please wait while your notes are being encrypted and saved.
              </p>
              <div className="w-full bg-leather-800 rounded-full h-4 mb-2">
                <div
                  className="bg-leather-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <p className="text-sm text-leather-400">{importProgress}% complete</p>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === "complete" && importResult && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-leather-100 mb-2">
                Import Complete!
              </h3>
              <p className="text-leather-300 mb-6">
                Successfully imported {importResult.notes.length} notes.
              </p>
              <div className="text-sm text-leather-400 space-y-1">
                <p>All notes have been encrypted and saved to your workspace.</p>
                {importResult.warnings.length > 0 && (
                  <p className="text-yellow-400">
                    {importResult.warnings.length} files were skipped (see warnings above)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-leather-700 flex items-center justify-between">
          {step === "select" && (
            <>
              <LeatherButton variant="parchment" onClick={handleClose}>
                Cancel
              </LeatherButton>
              <LeatherButton
                variant="leather"
                onClick={handlePreview}
                disabled={selectedFiles.length === 0 || importing}
              >
                {importing ? "Parsing..." : "Preview Import"}
              </LeatherButton>
            </>
          )}

          {step === "preview" && (
            <>
              <LeatherButton variant="parchment" onClick={() => setStep("select")}>
                ← Back
              </LeatherButton>
              <LeatherButton
                variant="leather"
                onClick={handleImport}
                disabled={!importResult || importResult.notes.length === 0}
              >
                Import {importResult?.notes.length || 0} Notes
              </LeatherButton>
            </>
          )}

          {step === "importing" && (
            <div className="w-full text-center text-leather-400">
              Please wait...
            </div>
          )}

          {step === "complete" && (
            <LeatherButton variant="leather" onClick={handleClose} className="mx-auto">
              Done
            </LeatherButton>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

export default ImportNotes;

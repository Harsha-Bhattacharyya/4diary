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

/**
 * Save Template Modal Component
 * Allows users to save current document as a custom template
 */

"use client";

import React, { useState } from "react";
import LeatherButton from "./LeatherButton";

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateData: {
    name: string;
    description: string;
    category: string;
    isPublic: boolean;
  }) => Promise<void>;
  initialTitle?: string;
}

/**
 * Render a modal dialog for saving the current document as a custom template.
 *
 * Displays form fields for template name, description, category, and public/private toggle.
 * Validates input and invokes the onSave callback when the user submits the form.
 *
 * @param isOpen - Controls modal visibility
 * @param onClose - Callback invoked when modal should close
 * @param onSave - Async callback invoked with template data when user saves
 * @param initialTitle - Optional initial value for template name
 * @returns The modal React element or null when closed
 */
export default function SaveTemplateModal({
  isOpen,
  onClose,
  onSave,
  initialTitle = "",
}: SaveTemplateModalProps) {
  const [name, setName] = useState(initialTitle);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("custom");
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Template name is required");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        category,
        isPublic,
      });
      
      // Reset form
      setName("");
      setDescription("");
      setCategory("custom");
      setIsPublic(false);
      onClose();
    } catch (err) {
      console.error("Failed to save template:", err);
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          className="bg-leather-700 border-2 border-leather-600 rounded-none shadow-deep max-w-lg w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-leather-100 mb-2">
              Save as Template
            </h2>
            <p className="text-leather-300 text-sm">
              Create a reusable template from this document
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-200 rounded text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Template Name */}
            <div className="mb-4">
              <label className="block text-leather-200 text-sm font-semibold mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-leather-800 border-2 border-leather-600 text-leather-100 placeholder-leather-400 focus:border-leather-500 focus:outline-none"
                placeholder="My Custom Template"
                maxLength={100}
                disabled={isSaving}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-leather-200 text-sm font-semibold mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-leather-800 border-2 border-leather-600 text-leather-100 placeholder-leather-400 focus:border-leather-500 focus:outline-none resize-vertical"
                placeholder="Describe what this template is for..."
                rows={3}
                maxLength={500}
                disabled={isSaving}
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-leather-200 text-sm font-semibold mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-leather-800 border-2 border-leather-600 text-leather-100 focus:border-leather-500 focus:outline-none"
                disabled={isSaving}
              >
                <option value="custom">Custom</option>
                <option value="journal">Journal</option>
                <option value="work">Work</option>
                <option value="productivity">Productivity</option>
                <option value="notes">Notes</option>
                <option value="planning">Planning</option>
              </select>
            </div>

            {/* Public Toggle */}
            <div className="mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 bg-leather-800 border-2 border-leather-600 text-leather-500 focus:ring-leather-500"
                  disabled={isSaving}
                />
                <span className="ml-2 text-leather-200 text-sm">
                  Make this template public (accessible to all users)
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 bg-leather-800 text-leather-200 border-2 border-leather-700 hover:bg-leather-900 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                Cancel
              </button>
              <LeatherButton
                type="submit"
                variant="leather"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Template"}
              </LeatherButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

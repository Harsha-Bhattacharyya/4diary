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

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LeatherBackground from "@/components/ui/LeatherBackground";
import GlassCard from "@/components/ui/GlassCard";
import LeatherButton from "@/components/ui/LeatherButton";
import TopMenu from "@/components/ui/TopMenu";
import { useTheme } from "@/components/ui/ThemeProvider";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/translationTypes";

/**
 * Render the application Settings page with security, export, privacy, appearance, and self-hosting sections.
 *
 * Includes an "Export Workspace" action that simulates exporting workspace data by toggling an in-progress state and showing a notification.
 *
 * @returns A React element representing the Settings page.
 */
export default function SettingsPage() {
  const [exportInProgress, setExportInProgress] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
  const [languageSaving, setLanguageSaving] = useState(false);
  const [languageSaved, setLanguageSaved] = useState(false);
  const [translationAvailable, setTranslationAvailable] = useState(false);

  const handleExportWorkspace = async () => {
    setExportInProgress(true);
    // This would be implemented with actual export logic
    setTimeout(() => {
      alert("Export functionality will be implemented with workspace data");
      setExportInProgress(false);
    }, 1000);
  };

  // Load current language preference and check translation service availability
  useEffect(() => {
    const abortController = new AbortController();
    
    const loadLanguageSettings = async () => {
      try {
        // Check if translation service is available
        const statusResponse = await fetch("/api/translate", {
          signal: abortController.signal,
        });
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setTranslationAvailable(statusData.available);
        }

        // Load user's workspace to get language preference
        const userId = localStorage.getItem("userId");
        if (userId) {
          const workspaceResponse = await fetch(
            `/api/workspaces?userId=${encodeURIComponent(userId)}`,
            { signal: abortController.signal }
          );
          if (workspaceResponse.ok) {
            const data = await workspaceResponse.json();
            if (data.workspaces && data.workspaces.length > 0) {
              const workspace = data.workspaces[0];
              if (workspace.language) {
                setSelectedLanguage(workspace.language as LanguageCode);
              }
            }
          }
        }
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error("Failed to load language settings:", error);
      }
    };

    loadLanguageSettings();

    // Cleanup function to abort fetch on unmount
    return () => {
      abortController.abort();
    };
  }, []);

  const handleLanguageChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newLanguage = event.target.value as LanguageCode;
    const previousLanguage = selectedLanguage;
    
    setSelectedLanguage(newLanguage);
    setLanguageSaving(true);
    setLanguageSaved(false);

    try {
      // Get user's workspace
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const workspaceResponse = await fetch(
        `/api/workspaces?userId=${encodeURIComponent(userId)}`
      );
      if (!workspaceResponse.ok) {
        throw new Error("Failed to fetch workspace");
      }

      const data = await workspaceResponse.json();
      if (!data.workspaces || data.workspaces.length === 0) {
        throw new Error("No workspace found");
      }

      const workspace = data.workspaces[0];

      // Update workspace with new language
      const updateResponse = await fetch("/api/workspaces", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: workspace._id,
          userId,
          language: newLanguage,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || "Failed to update language preference");
      }

      setLanguageSaved(true);
      // Auto-hide success message after 3 seconds
      setTimeout(() => setLanguageSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save language preference:", error);
      
      // Rollback to previous language on failure
      setSelectedLanguage(previousLanguage);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to save language preference. Please try again.";
      alert(errorMessage);
    } finally {
      setLanguageSaving(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <LeatherBackground />
      
      {/* Top Menu */}
      <div className="relative z-[350]">
        <TopMenu currentPage="Settings" />
      </div>

      <main className="relative z-0 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 fade-in">
            <h1 className="text-5xl font-bold mb-4 text-leather-100">
              Settings
            </h1>
            <p className="text-lg text-leather-300">
              Manage your preferences, security, and data export options
            </p>
          </div>

          {/* Security Settings */}
          <GlassCard className="mb-6 settings-card">
            <h2 className="text-2xl font-bold mb-4 text-leather-100">
              🔒 Security
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-leather-700">
                <div>
                  <h3 className="font-bold text-leather-100">
                    End-to-End Encryption
                  </h3>
                  <p className="text-sm text-leather-300">
                    All documents are encrypted with AES-256-GCM
                  </p>
                </div>
                <div className="px-4 py-2 bg-green-700/40 text-green-200 text-sm font-bold border-2 border-green-600">
                  Enabled
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-leather-700">
                <div>
                  <h3 className="font-bold text-leather-100">
                    Master Key Storage
                  </h3>
                  <p className="text-sm text-leather-300">
                    Keys stored locally in IndexedDB
                  </p>
                </div>
                <div className="px-4 py-2 bg-green-700/40 text-green-200 text-sm font-bold border-2 border-green-600">
                  Local
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-bold text-leather-100">
                    Server Knowledge
                  </h3>
                  <p className="text-sm text-leather-300">
                    Server only sees encrypted data
                  </p>
                </div>
                <div className="px-4 py-2 bg-green-700/40 text-green-200 text-sm font-bold border-2 border-green-600">
                  Zero Knowledge
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Appearance Settings */}
          <GlassCard className="mb-6 settings-card">
            <h2 className="text-2xl font-bold mb-4 text-leather-100">
              🎨 Appearance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-leather-700">
                <div>
                  <h3 className="font-bold text-leather-100">
                    Theme
                  </h3>
                  <p className="text-sm text-leather-300">
                    Choose between light and dark mode for the editor
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  role="switch"
                  aria-checked={theme === "dark"}
                  aria-label={`Theme: ${theme === "light" ? "Light mode" : "Dark mode"}. Click to toggle.`}
                  className="px-4 py-2 bg-leather-600 hover:bg-leather-700 text-leather-100 rounded-lg transition-colors font-medium"
                >
                  {theme === "light" ? "☀️ Light" : "🌙 Dark"}
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <h3 className="font-bold text-leather-100">
                    Language
                  </h3>
                  <p className="text-sm text-leather-300">
                    Choose your preferred language for the interface
                  </p>
                  {!translationAvailable && (
                    <p className="text-xs text-amber-400 mt-1">
                      ⚠️ Translation service not configured. Set LINGO_API_KEY to enable.
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                    disabled={languageSaving}
                    className="px-4 py-2 bg-leather-600 hover:bg-leather-700 text-leather-100 rounded-lg transition-colors font-medium border-2 border-leather-500 focus:border-leather-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Select language"
                  >
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                      <option key={code} value={code}>
                        {lang.nativeName}
                      </option>
                    ))}
                  </select>
                  {languageSaved && (
                    <span className="text-green-400 text-sm">✓ Saved</span>
                  )}
                  {languageSaving && (
                    <span className="text-leather-300 text-sm">Saving...</span>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Export Settings */}
          <GlassCard className="mb-6 settings-card">
            <h2 className="text-2xl font-bold mb-4 text-leather-100">
              📥 Import & Export
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2 text-leather-100">
                  Import Notes
                </h3>
                <p className="text-sm text-leather-300 mb-4">
                  Import notes from Google Keep, Evernote, Notion, Apple Notes, Standard Notes, or Markdown files
                </p>
                <Link href="/workspace">
                  <LeatherButton
                    variant="parchment"
                    size="md"
                  >
                    Go to Workspace to Import
                  </LeatherButton>
                </Link>
              </div>

              <div className="pt-4 border-t border-leather-700">
                <h3 className="font-bold mb-2 text-leather-100">
                  Export All Documents
                </h3>
                <p className="text-sm text-leather-300 mb-4">
                  Download all your documents as Markdown files in a ZIP archive
                </p>
                <LeatherButton
                  variant="leather"
                  size="md"
                  onClick={handleExportWorkspace}
                  disabled={exportInProgress}
                >
                  {exportInProgress ? "Exporting..." : "Export Workspace"}
                </LeatherButton>
              </div>

              <div className="pt-4 border-t border-leather-700">
                <h3 className="font-bold mb-2 text-leather-100">
                  Supported Import Formats
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-leather-300">
                    <span>📝</span> Markdown (.md)
                  </div>
                  <div className="flex items-center gap-2 text-leather-300">
                    <span>📋</span> Google Keep (Takeout)
                  </div>
                  <div className="flex items-center gap-2 text-leather-300">
                    <span>🐘</span> Evernote (.enex)
                  </div>
                  <div className="flex items-center gap-2 text-leather-300">
                    <span>📓</span> Notion Export
                  </div>
                  <div className="flex items-center gap-2 text-leather-300">
                    <span>🍎</span> Apple Notes (HTML)
                  </div>
                  <div className="flex items-center gap-2 text-leather-300">
                    <span>🔒</span> Standard Notes
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Privacy Settings */}
          <GlassCard className="mb-6 settings-card">
            <h2 className="text-2xl font-bold mb-4 text-leather-100">
              🕵️ Privacy
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-leather-700">
                <div>
                  <h3 className="font-bold text-leather-100">
                    Analytics
                  </h3>
                  <p className="text-sm text-leather-300">
                    Privacy-respecting analytics without PII
                  </p>
                </div>
                <div className="px-4 py-2 bg-blue-700/40 text-blue-200 text-sm font-bold border-2 border-blue-600">
                  Anonymous
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-bold text-leather-100">
                    Data Collection
                  </h3>
                  <p className="text-sm text-leather-300">
                    Only event types and counts, no content or PII
                  </p>
                </div>
                <div className="px-4 py-2 bg-green-700/40 text-green-200 text-sm font-bold border-2 border-green-600">
                  Minimal
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Self-Hosting Info */}
          <GlassCard className="fade-in">
            <h2 className="text-2xl font-bold mb-4 text-leather-100">
              🐳 Self-Hosting
            </h2>
            <p className="text-leather-300 mb-4">
              4diary supports self-hosting with Docker. Check the README for deployment instructions.
            </p>
            <div className="bg-leather-900 text-leather-200 p-4 border-2 border-leather-800 font-mono text-sm overflow-x-auto">
              <div>docker-compose up -d</div>
            </div>
            <p className="text-sm text-leather-300 mt-4">
              Requirements: Docker, MongoDB, Redis (optional)
            </p>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
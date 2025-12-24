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
import { useAnalytics } from "@/components/ui/AnalyticsProvider";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/translationTypes";
import { Icon } from "@iconify/react";

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
  const { analyticsEnabled, toggleAnalytics } = useAnalytics();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
  const [languageSaving, setLanguageSaving] = useState(false);
  const [languageSaved, setLanguageSaved] = useState(false);
  const [translationAvailable, setTranslationAvailable] = useState(false);
  
  // Security settings state
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);

  const handleExportWorkspace = async () => {
    setExportInProgress(true);
    // This would be implemented with actual export logic
    setTimeout(() => {
      alert("Export functionality will be implemented with workspace data");
      setExportInProgress(false);
    }, 1000);
  };

  const handleEncryptionToggle = async () => {
    const newValue = !encryptionEnabled;
    
    // Show warning when disabling encryption
    if (!newValue) {
      const confirmed = confirm(
        "Warning: Disabling encryption will make new documents unencrypted. " +
        "Existing encrypted documents will remain encrypted. " +
        "Are you sure you want to continue?"
      );
      if (!confirmed) return;
    }

    setSettingsSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptionEnabled: newValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to update encryption setting");
      }

      setEncryptionEnabled(newValue);
      alert(`Encryption ${newValue ? "enabled" : "disabled"} successfully`);
    } catch (error) {
      console.error("Failed to toggle encryption:", error);
      alert("Failed to update encryption setting. Please try again.");
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleSetup2FA = async () => {
    try {
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to setup 2FA");
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      setBackupCodes(data.backupCodes);
      setShow2FASetup(true);
    } catch (error) {
      console.error("Failed to setup 2FA:", error);
      alert(error instanceof Error ? error.message : "Failed to setup 2FA");
    }
  };

  const handleEnable2FA = async () => {
    if (!verificationCode) {
      alert("Please enter the verification code from your authenticator app");
      return;
    }

    try {
      const response = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to enable 2FA");
      }

      setTwoFactorEnabled(true);
      setShow2FASetup(false);
      setVerificationCode("");
      alert("2FA enabled successfully! Please save your backup codes in a safe place.");
    } catch (error) {
      console.error("Failed to enable 2FA:", error);
      alert(error instanceof Error ? error.message : "Failed to enable 2FA");
    }
  };

  const handleDisable2FA = async () => {
    const password = prompt("Enter your password to disable 2FA:");
    if (!password) return;

    try {
      const response = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to disable 2FA");
      }

      setTwoFactorEnabled(false);
      alert("2FA disabled successfully");
    } catch (error) {
      console.error("Failed to disable 2FA:", error);
      alert(error instanceof Error ? error.message : "Failed to disable 2FA");
    }
  };

  // Load settings and 2FA status
  useEffect(() => {
    const abortController = new AbortController();
    
    const loadAllSettings = async () => {
      try {
        // Load encryption settings
        const settingsResponse = await fetch("/api/settings", {
          signal: abortController.signal,
        });
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setEncryptionEnabled(settingsData.encryptionEnabled !== false);
        }

        // Load 2FA status
        const twoFactorResponse = await fetch("/api/auth/2fa/status", {
          signal: abortController.signal,
        });
        if (twoFactorResponse.ok) {
          const twoFactorData = await twoFactorResponse.json();
          setTwoFactorEnabled(twoFactorData.enabled || false);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error("Failed to load security settings:", error);
      }
    };
    
    loadAllSettings();
    
    return () => {
      abortController.abort();
    };
  }, []);

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
            <h2 className="text-2xl font-bold mb-4 text-leather-100 flex items-center gap-2">
              <Icon icon="flat-color-icons:key" width={32} height={32} /> Security
            </h2>
            <div className="space-y-4">
              {/* Encryption Toggle */}
              <div className="flex items-center justify-between py-3 border-b border-leather-700">
                <div>
                  <h3 className="font-bold text-leather-100">
                    End-to-End Encryption
                  </h3>
                  <p className="text-sm text-leather-300">
                    Encrypt all documents with AES-256-GCM
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleEncryptionToggle}
                  disabled={settingsSaving}
                  className={`px-4 py-2 text-sm font-bold border-2 rounded transition-colors ${
                    encryptionEnabled
                      ? "bg-green-700/40 text-green-200 border-green-600"
                      : "bg-red-700/40 text-red-200 border-red-600"
                  } ${settingsSaving ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
                >
                  {settingsSaving ? "Saving..." : encryptionEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>

              {/* 2FA Section */}
              <div className="py-3 border-b border-leather-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-leather-100">
                      Two-Factor Authentication (2FA)
                    </h3>
                    <p className="text-sm text-leather-300">
                      Add an extra layer of security with TOTP
                    </p>
                  </div>
                  <div className={`px-4 py-2 text-sm font-bold border-2 ${
                    twoFactorEnabled
                      ? "bg-green-700/40 text-green-200 border-green-600"
                      : "bg-neutral-700/40 text-neutral-200 border-neutral-600"
                  }`}>
                    {twoFactorEnabled ? "Enabled" : "Disabled"}
                  </div>
                </div>
                
                {!twoFactorEnabled ? (
                  <LeatherButton
                    variant="parchment"
                    size="md"
                    onClick={handleSetup2FA}
                  >
                    Setup 2FA
                  </LeatherButton>
                ) : (
                  <LeatherButton
                    variant="leather"
                    size="md"
                    onClick={handleDisable2FA}
                  >
                    Disable 2FA
                  </LeatherButton>
                )}
              </div>

              {/* 2FA Setup Modal */}
              {show2FASetup && (
                <div className="p-4 bg-leather-900 border-2 border-leather-700 rounded-lg">
                  <h4 className="font-bold text-leather-100 mb-3">Setup Two-Factor Authentication</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-leather-300 mb-2">
                        1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                      </p>
                      {qrCode && (
                        <div className="bg-white p-4 rounded inline-block">
                          <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-leather-300 mb-2">
                        2. Save these backup codes in a safe place:
                      </p>
                      <div className="bg-leather-950 p-3 rounded text-sm font-mono text-leather-200 max-h-32 overflow-y-auto">
                        {backupCodes.map((code, idx) => (
                          <div key={idx}>{code}</div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-leather-300 mb-2">
                        3. Enter the 6-digit code from your app to verify:
                      </p>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-2 bg-leather-800 text-leather-100 border-2 border-leather-600 rounded focus:border-leather-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <LeatherButton
                        variant="gradient"
                        size="md"
                        onClick={handleEnable2FA}
                      >
                        Verify & Enable
                      </LeatherButton>
                      <LeatherButton
                        variant="leather"
                        size="md"
                        onClick={() => setShow2FASetup(false)}
                      >
                        Cancel
                      </LeatherButton>
                    </div>
                  </div>
                </div>
              )}

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
            <h2 className="text-2xl font-bold mb-4 text-leather-100 flex items-center gap-2">
              <Icon icon="flat-color-icons:settings" width={32} height={32} /> Appearance
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
                    <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                      <Icon icon="flat-color-icons:disclaimer" width={16} height={16} /> Translation service not configured. Set LINGO_API_KEY to enable.
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
            <h2 className="text-2xl font-bold mb-4 text-leather-100 flex items-center gap-2">
              <Icon icon="flat-color-icons:package" width={32} height={32} /> Import & Export
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
                    <Icon icon="flat-color-icons:document" width={20} height={20} /> Markdown (.md)
                  </div>
                  <div className="flex items-center gap-2 text-leather-300">
                    <Icon icon="flat-color-icons:document" width={20} height={20} /> Google Keep (Takeout)
                  </div>
                  <div className="flex items-center gap-2 text-leather-300">
                    <Icon icon="flat-color-icons:document" width={20} height={20} /> Evernote (.enex)
                  </div>
                  <div className="flex items-center gap-2 text-leather-300">
                    <Icon icon="flat-color-icons:document" width={20} height={20} /> Notion Export
                  </div>
                  <div className="flex items-center gap-2 text-leather-300">
                    <Icon icon="flat-color-icons:document" width={20} height={20} /> Apple Notes (HTML)
                  </div>
                  <div className="flex items-center gap-2 text-leather-300">
                    <Icon icon="flat-color-icons:key" width={20} height={20} /> Standard Notes
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Privacy Settings */}
          <GlassCard className="mb-6 settings-card">
            <h2 className="text-2xl font-bold mb-4 text-leather-100 flex items-center gap-2">
              <Icon icon="flat-color-icons:privacy" width={32} height={32} /> Privacy
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-leather-700">
                <div className="flex-1">
                  <h3 className="font-bold text-leather-100">
                    Privacy-Focused Analytics
                  </h3>
                  <p className="text-sm text-leather-300 mb-2">
                    Optional telemetry using TelemetryDeck (no PII, no tracking, fully anonymous)
                  </p>
                  <p className="text-xs text-leather-400">
                    ✓ Self-hostable compatible • ✓ No vendor lock-in • ✓ Opt-in only
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleAnalytics(!analyticsEnabled)}
                  role="switch"
                  aria-checked={analyticsEnabled}
                  aria-label={`Analytics: ${analyticsEnabled ? "Enabled" : "Disabled"}. Click to toggle.`}
                  className={`px-6 py-3 rounded-lg transition-all font-medium border-2 ${
                    analyticsEnabled
                      ? "bg-green-700/40 text-green-200 border-green-600 hover:bg-green-700/50"
                      : "bg-red-700/40 text-red-200 border-red-600 hover:bg-red-700/50"
                  }`}
                >
                  {analyticsEnabled ? "✓ Enabled" : "✗ Disabled"}
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-leather-700">
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
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-bold text-leather-100">
                    User Identification
                  </h3>
                  <p className="text-sm text-leather-300">
                    All analytics sent anonymously with no user tracking
                  </p>
                </div>
                <div className="px-4 py-2 bg-green-700/40 text-green-200 text-sm font-bold border-2 border-green-600">
                  Anonymous
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Self-Hosting Info */}
          <GlassCard className="fade-in">
            <h2 className="text-2xl font-bold mb-4 text-leather-100 flex items-center gap-2">
              <Icon icon="flat-color-icons:multiple-devices" width={32} height={32} /> Self-Hosting
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
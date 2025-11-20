"use client";

import React, { useState } from "react";
import LeatherBackground from "@/components/ui/LeatherBackground";
import GlassCard from "@/components/ui/GlassCard";
import LeatherButton from "@/components/ui/LeatherButton";
import TopMenu from "@/components/ui/TopMenu";

/**
 * Render the application Settings page with security, export, privacy, and self-hosting sections.
 *
 * Includes an "Export Workspace" action that simulates exporting workspace data by toggling an in-progress state and showing a notification.
 *
 * @returns A React element representing the Settings page.
 */
export default function SettingsPage() {
  const [exportInProgress, setExportInProgress] = useState(false);

  const handleExportWorkspace = async () => {
    setExportInProgress(true);
    // This would be implemented with actual export logic
    setTimeout(() => {
      alert("Export functionality will be implemented with workspace data");
      setExportInProgress(false);
    }, 1000);
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

          {/* Export Settings */}
          <GlassCard className="mb-6 settings-card">
            <h2 className="text-2xl font-bold mb-4 text-leather-100">
              📥 Export & Backup
            </h2>
            <div className="space-y-4">
              <div>
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
                  Export Format
                </h3>
                <p className="text-sm text-leather-300">
                  Documents are exported as standard Markdown (.md) files with metadata
                </p>
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
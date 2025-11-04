"use client";

import React, { useState } from "react";
import Link from "next/link";
import FruityBackground from "@/components/ui/FruityBackground";
import GlassCard from "@/components/ui/GlassCard";
import FruityButton from "@/components/ui/FruityButton";

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
      <FruityBackground />

      <main className="relative z-10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Link href="/">
              <FruityButton variant="glass" size="sm">
                ← Back to Home
              </FruityButton>
            </Link>

            <h1 className="text-5xl font-bold mt-8 mb-4 bg-gradient-to-r from-aqua-600 to-purple-600 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Manage your preferences, security, and data export options
            </p>
          </div>

          {/* Security Settings */}
          <GlassCard className="mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              🔒 Security
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    End-to-End Encryption
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All documents are encrypted with AES-256-GCM
                  </p>
                </div>
                <div className="px-4 py-2 rounded-full bg-green-500/20 text-green-700 dark:text-green-300 text-sm font-semibold">
                  Enabled
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Master Key Storage
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Keys stored locally in IndexedDB
                  </p>
                </div>
                <div className="px-4 py-2 rounded-full bg-green-500/20 text-green-700 dark:text-green-300 text-sm font-semibold">
                  Local
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Server Knowledge
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Server only sees encrypted data
                  </p>
                </div>
                <div className="px-4 py-2 rounded-full bg-green-500/20 text-green-700 dark:text-green-300 text-sm font-semibold">
                  Zero Knowledge
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Export Settings */}
          <GlassCard className="mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              📥 Export & Backup
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  Export All Documents
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Download all your documents as Markdown files in a ZIP archive
                </p>
                <FruityButton
                  variant="aqua"
                  size="md"
                  onClick={handleExportWorkspace}
                  disabled={exportInProgress}
                >
                  {exportInProgress ? "Exporting..." : "Export Workspace"}
                </FruityButton>
              </div>

              <div className="pt-4 border-t border-white/10">
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  Export Format
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Documents are exported as standard Markdown (.md) files with metadata
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Privacy Settings */}
          <GlassCard className="mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              🕵️ Privacy
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Analytics
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Privacy-respecting analytics without PII
                  </p>
                </div>
                <div className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                  Anonymous
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Data Collection
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Only event types and counts, no content or PII
                  </p>
                </div>
                <div className="px-4 py-2 rounded-full bg-green-500/20 text-green-700 dark:text-green-300 text-sm font-semibold">
                  Minimal
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Self-Hosting Info */}
          <GlassCard>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              🐳 Self-Hosting
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              4diary supports self-hosting with Docker. Check the README for deployment instructions.
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div>docker-compose up -d</div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Requirements: Docker, MongoDB, Redis (optional)
            </p>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

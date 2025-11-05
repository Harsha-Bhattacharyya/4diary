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
          <div className="mb-12 fade-in">
            <Link href="/">
              <FruityButton variant="parchment" size="sm">
                ← Back to Home
              </FruityButton>
            </Link>

            <h1 className="text-5xl font-bold mt-8 mb-4 text-leather-100">
              Settings
            </h1>
            <p className="text-lg text-leather-300">
              Manage your preferences, security, and data export options
            </p>
          </div>

          {/* Security Settings */}
          <GlassCard className="mb-6 fade-in-delay-1">
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
          <GlassCard className="mb-6 fade-in-delay-2">
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
                <FruityButton
                  variant="leather"
                  size="md"
                  onClick={handleExportWorkspace}
                  disabled={exportInProgress}
                >
                  {exportInProgress ? "Exporting..." : "Export Workspace"}
                </FruityButton>
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
          <GlassCard className="mb-6 fade-in-delay-3">
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

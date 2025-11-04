"use client";

import React, { useState } from "react";
import Link from "next/link";
import FruityBackground from "@/components/ui/FruityBackground";
import Sidebar from "@/components/ui/Sidebar";
import GlassCard from "@/components/ui/GlassCard";
import FruityButton from "@/components/ui/FruityButton";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with BlockNote
const BlockEditor = dynamic(() => import("@/components/editor/BlockEditor"), {
  ssr: false,
});

export default function WorkspacePage() {
  const [currentDocument] = useState<unknown[] | null>(null);
  const [documents] = useState([
    { id: "1", title: "Welcome to 4diary", folder: "Getting Started" },
    { id: "2", title: "Quick Start Guide", folder: "Getting Started" },
    { id: "3", title: "My First Note", folder: "Personal" },
  ]);

  const handleSave = async (content: unknown[]) => {
    console.log("Saving document:", content);
    // Here you would implement the encryption and API call
    // 1. Get document key or generate new one
    // 2. Encrypt content with document key
    // 3. Encrypt document key with master key
    // 4. Send to API
  };

  const handleCreateDocument = () => {
    alert("Creating new document - this will be implemented with full encryption flow");
  };

  return (
    <div className="min-h-screen relative flex">
      <FruityBackground />

      {/* Sidebar */}
      <div className="relative z-10">
        <Sidebar workspaceId="demo" documents={documents} />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Toolbar */}
          <GlassCard className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                  {currentDocument ? "Document Editor" : "Workspace"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <FruityButton variant="glass" size="sm" onClick={handleCreateDocument}>
                  ➕ New Document
                </FruityButton>
                <Link href="/templates">
                  <FruityButton variant="glass" size="sm">
                    📄 Templates
                  </FruityButton>
                </Link>
                <Link href="/settings">
                  <FruityButton variant="glass" size="sm">
                    ⚙️ Settings
                  </FruityButton>
                </Link>
              </div>
            </div>
          </GlassCard>

          {/* Editor or Welcome */}
          {currentDocument ? (
            <GlassCard className="min-h-[600px]">
              <BlockEditor
                initialContent={currentDocument}
                onSave={handleSave}
                autoSave={true}
              />
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard hover>
                <div className="p-4">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Create Your First Note
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start writing with end-to-end encryption. Your notes are secure from the moment you type them.
                  </p>
                  <FruityButton variant="aqua" size="sm" onClick={handleCreateDocument}>
                    Create Note
                  </FruityButton>
                </div>
              </GlassCard>

              <GlassCard hover>
                <div className="p-4">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Use a Template
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Get started quickly with pre-built templates for journals, meetings, projects, and more.
                  </p>
                  <Link href="/templates">
                    <FruityButton variant="aqua" size="sm">
                      Browse Templates
                    </FruityButton>
                  </Link>
                </div>
              </GlassCard>

              <GlassCard hover>
                <div className="p-4">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Your Privacy Matters
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    All documents use AES-256-GCM encryption. Master keys are stored locally in your browser.
                  </p>
                  <Link href="/settings">
                    <FruityButton variant="glass" size="sm">
                      Security Settings
                    </FruityButton>
                  </Link>
                </div>
              </GlassCard>

              <GlassCard hover>
                <div className="p-4">
                  <div className="text-4xl mb-4">📥</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Export Anytime
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Your data is yours. Export as Markdown or ZIP files whenever you want.
                  </p>
                  <Link href="/settings">
                    <FruityButton variant="glass" size="sm">
                      Export Options
                    </FruityButton>
                  </Link>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Info Banner */}
          <GlassCard className="mt-6">
            <div className="flex items-center gap-4">
              <div className="text-3xl">ℹ️</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                  Demo Mode
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This is a demonstration workspace. Configure MONGODB_URI in .env.local to enable full functionality.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

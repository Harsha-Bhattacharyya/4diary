"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FruityBackground from "@/components/ui/FruityBackground";
import Sidebar from "@/components/ui/Sidebar";
import GlassCard from "@/components/ui/GlassCard";
import FruityButton from "@/components/ui/FruityButton";
import EditableTitle from "@/components/ui/EditableTitle";
import dynamic from "next/dynamic";
import { keyManager } from "@/lib/crypto/keyManager";
import {
  createDocument,
  updateDocument,
  listDocuments,
  getDocument,
  type Document,
} from "@/lib/documentService";
import { getOrCreateDefaultWorkspace } from "@/lib/workspaceService";
import { createDocumentFromTemplate } from "@/lib/templateService";
import { exportDocumentAsMarkdown, exportDocumentsAsZip } from "@/lib/exportService";

// Dynamic import to avoid SSR issues with BlockNote
const BlockEditor = dynamic(() => import("@/components/editor/BlockEditor"), {
  ssr: false,
});

// Demo user ID - in production, this would come from auth
// SECURITY NOTE: This is a demo implementation. In production:
// 1. Implement proper authentication (e.g., NextAuth.js, Auth0, Clerk)
// 2. Get user ID from authenticated session
// 3. Never hard-code user identifiers
const DEMO_USER_ID = "demo-user";

/**
 * Render the workspace UI, initialize encryption keys, and manage workspace and document state including creation, opening, editing, title updates, and export.
 *
 * Renders a sidebar of documents, a toolbar with document and workspace actions, an editor for the active document (or a welcome grid when none is open), and informational banners. Handles initialization, loading, and error states.
 *
 * @returns The workspace content as a JSX element.
 */
function WorkspaceContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");

  const [initialized, setInitialized] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initialize workspace and load documents
  useEffect(() => {
    async function initialize() {
      try {
        // Initialize key manager
        await keyManager.initialize();
        setInitialized(true);

        // Get or create workspace
        const workspace = await getOrCreateDefaultWorkspace(DEMO_USER_ID);
        setWorkspaceId(workspace.id);

        // Load documents
        const docs = await listDocuments(workspace.id, DEMO_USER_ID);
        setDocuments(docs);

        // If template is specified, create document from template
        if (templateId) {
          const docId = await createDocumentFromTemplate({
            templateId,
            workspaceId: workspace.id,
            userId: DEMO_USER_ID,
          });

          // Load the newly created document
          const doc = await getDocument(docId, DEMO_USER_ID);
          setCurrentDocument(doc);

          // Reload documents list
          const updatedDocs = await listDocuments(workspace.id, DEMO_USER_ID);
          setDocuments(updatedDocs);
        }

        setLoading(false);
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize");
        setLoading(false);
      }
    }

    initialize();
  }, [templateId]);

  const handleSave = async (content: unknown[]) => {
    if (!currentDocument || !workspaceId) return;

    try {
      await updateDocument({
        id: currentDocument.id,
        userId: DEMO_USER_ID,
        content,
        metadata: currentDocument.metadata,
      });

      // Update local state
      setCurrentDocument({
        ...currentDocument,
        content,
      });
    } catch (err) {
      console.error("Save error:", err);
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleCreateDocument = async () => {
    if (!workspaceId) return;

    try {
      const doc = await createDocument({
        workspaceId,
        userId: DEMO_USER_ID,
        content: [
          {
            type: "heading",
            props: { level: 1 },
            content: [{ type: "text", text: "Untitled" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "" }],
          },
        ],
        metadata: {
          title: "Untitled",
        },
      });

      setCurrentDocument(doc);

      // Reload documents list
      const updatedDocs = await listDocuments(workspaceId, DEMO_USER_ID);
      setDocuments(updatedDocs);
    } catch (err) {
      console.error("Create error:", err);
      setError(err instanceof Error ? err.message : "Failed to create document");
    }
  };

  const handleOpenDocument = async (docId: string) => {
    try {
      const doc = await getDocument(docId, DEMO_USER_ID);
      setCurrentDocument(doc);
    } catch (err) {
      console.error("Open error:", err);
      setError(err instanceof Error ? err.message : "Failed to open document");
    }
  };

  const handleTitleChange = async (newTitle: string) => {
    if (!currentDocument) return;

    try {
      const updatedMetadata = {
        ...currentDocument.metadata,
        title: newTitle,
      };

      await updateDocument({
        id: currentDocument.id,
        userId: DEMO_USER_ID,
        content: currentDocument.content,
        metadata: updatedMetadata,
      });

      // Update local state
      setCurrentDocument({
        ...currentDocument,
        metadata: updatedMetadata,
      });

      // Reload documents list to reflect the title change
      if (workspaceId) {
        const updatedDocs = await listDocuments(workspaceId, DEMO_USER_ID);
        setDocuments(updatedDocs);
      }
    } catch (err) {
      console.error("Title update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update title");
      throw err instanceof Error ? err : new Error(String(err));
    }
  };

  const handleExportDocument = async () => {
    if (!currentDocument) return;

    try {
      // Fetch the encrypted document data from API
      const response = await fetch(
        `/api/documents/${currentDocument.id}?userId=${encodeURIComponent(DEMO_USER_ID)}`
      );
      const data = await response.json();

      await exportDocumentAsMarkdown(data.document);
    } catch (err) {
      console.error("Export error:", err);
      setError(err instanceof Error ? err.message : "Failed to export document");
    }
  };

  const handleExportWorkspace = async () => {
    if (!workspaceId) return;

    try {
      // Fetch all encrypted documents
      const response = await fetch(
        `/api/documents?workspaceId=${encodeURIComponent(workspaceId)}&userId=${encodeURIComponent(DEMO_USER_ID)}`
      );
      const data = await response.json();

      await exportDocumentsAsZip("My Workspace", data.documents);
    } catch (err) {
      console.error("Export error:", err);
      setError(err instanceof Error ? err.message : "Failed to export workspace");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <FruityBackground />
        <GlassCard className="relative z-10">
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">🔐</div>
            <p className="text-leather-300">Initializing encryption keys...</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <FruityBackground />
        <GlassCard className="relative z-10">
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2 text-leather-100">Error</h2>
            <p className="text-leather-300 mb-4">{error}</p>
            <FruityButton variant="leather" onClick={() => window.location.reload()}>
              Retry
            </FruityButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex">
      <FruityBackground />

      {/* Sidebar */}
      <div className="relative z-10 fade-in">
        <Sidebar
          workspaceId={workspaceId || "demo"}
          documents={documents.map((doc) => ({
            id: doc.id,
            title: doc.metadata.title,
            folder: doc.metadata.folder,
          }))}
          onDocumentClick={handleOpenDocument}
          collapsed={sidebarCollapsed}
          onToggle={setSidebarCollapsed}
        />
      </div>

      {/* Main Content */}
      <main className={`relative z-10 flex-1 p-8 overflow-y-auto transition-all duration-300 ${
        sidebarCollapsed ? 'ml-0' : ''
      }`}>
        <div className="max-w-5xl mx-auto">
          {/* Toolbar */}
          <GlassCard className="mb-6 fade-in-delay-1">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {currentDocument ? (
                  <EditableTitle
                    title={currentDocument.metadata.title}
                    onSave={handleTitleChange}
                    className="text-2xl font-bold text-leather-100"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-leather-100">Workspace</h2>
                )}
                {initialized && (
                  <span className="text-xs text-leather-300 px-2 py-1 rounded-full glass-card">
                    🔐 Encrypted
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <FruityButton variant="parchment" size="sm" onClick={handleCreateDocument}>
                  ➕ New Document
                </FruityButton>
                <Link href="/templates">
                  <FruityButton variant="parchment" size="sm">
                    📄 Templates
                  </FruityButton>
                </Link>
                {currentDocument && (
                  <FruityButton variant="parchment" size="sm" onClick={handleExportDocument}>
                    📥 Export
                  </FruityButton>
                )}
                {documents.length > 0 && (
                  <FruityButton variant="parchment" size="sm" onClick={handleExportWorkspace}>
                    📦 Export All
                  </FruityButton>
                )}
                <Link href="/settings">
                  <FruityButton variant="parchment" size="sm">
                    ⚙️ Settings
                  </FruityButton>
                </Link>
              </div>
            </div>
          </GlassCard>

          {/* Editor or Welcome */}
          {currentDocument ? (
            <GlassCard className="min-h-[600px] fade-in-delay-2">
              <BlockEditor
                initialContent={currentDocument.content}
                onSave={handleSave}
                autoSave={true}
              />
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard hover className="fade-in-delay-2">
                <div className="p-4">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-xl font-bold mb-2 text-leather-100">
                    Create Your First Note
                  </h3>
                  <p className="text-leather-300 mb-4">
                    Start writing with end-to-end encryption. Your notes are secure from the moment you type them.
                  </p>
                  <FruityButton variant="leather" size="sm" onClick={handleCreateDocument}>
                    Create Note
                  </FruityButton>
                </div>
              </GlassCard>

              <GlassCard hover className="fade-in-delay-3">
                <div className="p-4">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-xl font-bold mb-2 text-leather-100">
                    Use a Template
                  </h3>
                  <p className="text-leather-300 mb-4">
                    Get started quickly with pre-built templates for journals, meetings, projects, and more.
                  </p>
                  <Link href="/templates">
                    <FruityButton variant="leather" size="sm">
                      Browse Templates
                    </FruityButton>
                  </Link>
                </div>
              </GlassCard>

              <GlassCard hover className="fade-in">
                <div className="p-4">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-xl font-bold mb-2 text-leather-100">
                    Your Privacy Matters
                  </h3>
                  <p className="text-leather-300 mb-4">
                    All documents use AES-256-GCM encryption. Master keys are stored locally in your browser.
                  </p>
                  <Link href="/settings">
                    <FruityButton variant="parchment" size="sm">
                      Security Settings
                    </FruityButton>
                  </Link>
                </div>
              </GlassCard>

              <GlassCard hover className="fade-in-delay-1">
                <div className="p-4">
                  <div className="text-4xl mb-4">📥</div>
                  <h3 className="text-xl font-bold mb-2 text-leather-100">
                    Export Anytime
                  </h3>
                  <p className="text-leather-300 mb-4">
                    Your data is yours. Export as Markdown or ZIP files whenever you want.
                  </p>
                  {documents.length > 0 ? (
                    <FruityButton variant="parchment" size="sm" onClick={handleExportWorkspace}>
                      Export Workspace
                    </FruityButton>
                  ) : (
                    <FruityButton variant="parchment" size="sm" disabled>
                      No Documents Yet
                    </FruityButton>
                  )}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Info Banner */}
          <GlassCard className="mt-6 fade-in-delay-2">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{initialized ? "✅" : "ℹ️"}</div>
              <div className="flex-1">
                <h4 className="font-bold text-leather-100">
                  {initialized ? "Encryption Active" : "Demo Mode"}
                </h4>
                <p className="text-sm text-leather-300">
                  {initialized
                    ? "All documents are encrypted with AES-256-GCM. Master key stored in IndexedDB."
                    : "Configure MONGODB_URI environment variable to enable full functionality."}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen relative flex items-center justify-center">
          <FruityBackground />
          <GlassCard className="relative z-10">
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-leather-300">Loading workspace...</p>
            </div>
          </GlassCard>
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}

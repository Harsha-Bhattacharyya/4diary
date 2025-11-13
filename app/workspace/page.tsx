"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import LeatherBackground from "@/components/ui/LeatherBackground";
import Sidebar from "@/components/ui/Sidebar";
import GlassCard from "@/components/ui/GlassCard";
import LeatherButton from "@/components/ui/LeatherButton";
import EditableTitle from "@/components/ui/EditableTitle";
import { QuickNote } from "@/components/ui/QuickNote";
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

/**
 * Render the workspace UI and manage encryption initialization, workspace lifecycle, and document operations.
 *
 * Manages authentication, initializes local encryption keys, loads or creates the default workspace, lists and opens documents, and provides handlers for creating, saving, sharing, renaming, and exporting documents or the entire workspace. Handles loading and error states and switches between a full-screen editor and a workspace overview.
 *
 * @returns The rendered workspace UI as a JSX element
 */
function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get("template");

  const [initialized, setInitialized] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);

  // Check authentication
  useEffect(() => {
    /**
     * Checks the current user session and redirects to the sign-in page if not authenticated.
     *
     * If the session is authenticated, updates the component state with the user's email.
     * If the session is not authenticated or the request fails, navigates to `/auth`.
     */
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();

        if (!data.authenticated) {
          router.push("/auth");
          return;
        }

        setUserEmail(data.email);
      } catch (err) {
        console.error("Auth check error:", err);
        router.push("/auth");
      }
    }

    checkAuth();
  }, [router]);

  // Initialize workspace and load documents
  useEffect(() => {
    if (!userEmail) return;

    /**
     * Initializes encryption keys and the user's workspace, then loads documents.
     *
     * Performs client-side initialization: sets up the key manager, obtains or creates
     * the default workspace for the current user, loads the workspace's documents,
     * and — when a templateId is present in scope — creates a document from that template
     * and opens it. Updates local component state (initialization flag, workspaceId,
     * documents list, currentDocument, loading, and error) to reflect progress and failure.
     */
    async function initialize() {
      try {
        // Initialize key manager
        await keyManager.initialize();
        setInitialized(true);

        // Get or create workspace
        const workspace = await getOrCreateDefaultWorkspace(userEmail);
        setWorkspaceId(workspace.id);

        // Load documents
        const docs = await listDocuments(workspace.id, userEmail);
        setDocuments(docs);

        // If template is specified, create document from template
        if (templateId) {
          const docId = await createDocumentFromTemplate({
            templateId,
            workspaceId: workspace.id,
            userId: userEmail,
          });

          // Load the newly created document
          const doc = await getDocument(docId, userEmail);
          setCurrentDocument(doc);

          // Reload documents list
          const updatedDocs = await listDocuments(workspace.id, userEmail);
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
  }, [templateId, userEmail]);

  const handleSave = async (content: unknown[]) => {
    if (!currentDocument || !workspaceId) return;

    try {
      await updateDocument({
        id: currentDocument.id,
        userId: userEmail,
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

  const handleShareDocument = async () => {
    if (!currentDocument) return;

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: currentDocument.id,
          title: currentDocument.metadata.title,
          content: currentDocument.content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create share link");
      }

      setShareUrl(data.shareUrl);
      setShowShareToast(true);

      // Copy to clipboard
      await navigator.clipboard.writeText(data.shareUrl);

      // Hide toast after 5 seconds
      setTimeout(() => setShowShareToast(false), 5000);
    } catch (err) {
      console.error("Share error:", err);
      setError(err instanceof Error ? err.message : "Failed to create share link");
    }
  };

  const handleCreateDocument = async () => {
    if (!workspaceId) return;

    try {
      const doc = await createDocument({
        workspaceId,
        userId: userEmail,
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
      const updatedDocs = await listDocuments(workspaceId, userEmail);
      setDocuments(updatedDocs);
    } catch (err) {
      console.error("Create error:", err);
      setError(err instanceof Error ? err.message : "Failed to create document");
    }
  };

  const handleOpenDocument = async (docId: string) => {
    try {
      const doc = await getDocument(docId, userEmail);
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
        userId: userEmail,
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
        const updatedDocs = await listDocuments(workspaceId, userEmail);
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
        `/api/documents/${currentDocument.id}?userId=${encodeURIComponent(userEmail)}`
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
        `/api/documents?workspaceId=${encodeURIComponent(workspaceId)}&userId=${encodeURIComponent(userEmail)}`
      );
      const data = await response.json();

      await exportDocumentsAsZip("My Workspace", data.documents);
    } catch (err) {
      console.error("Export error:", err);
      setError(err instanceof Error ? err.message : "Failed to export workspace");
    }
  };

  const handleSaveQuickNote = async (content: string) => {
    if (!workspaceId || !userEmail) {
      throw new Error("Workspace not initialized");
    }

    try {
      // Create a new document with the quick note content
      const newDoc = await createDocument({
        workspaceId,
        userId: userEmail,
        content: [{ type: "paragraph", content: [{ type: "text", text: content }] }],
        metadata: {
          title: "Quick Note",
          type: "quick",
        },
      });

      // Reload documents list
      await loadDocuments(workspaceId, userEmail);

      return newDoc;
    } catch (err) {
      console.error("Quick note save error:", err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <LeatherBackground />
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
        <LeatherBackground />
        <GlassCard className="relative z-10">
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2 text-leather-100">Error</h2>
            <p className="text-leather-300 mb-4">{error}</p>
            <LeatherButton variant="leather" onClick={() => window.location.reload()}>
              Retry
            </LeatherButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  const handleCloseDocument = () => {
    setCurrentDocument(null);
  };

  // Full-screen editor mode when a document is open
  if (currentDocument) {
    return (
      <div className="min-h-screen relative bg-white">
        {/* Top Bar with Menu and Title */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Menu Button */}
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-gray-700"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Title and Share Button */}
            <div className="flex-1 mx-6 flex items-center justify-center gap-3">
              <EditableTitle
                title={currentDocument.metadata.title}
                onSave={handleTitleChange}
                className="text-2xl font-bold text-gray-900 text-center"
              />
              <button
                type="button"
                onClick={handleShareDocument}
                className="px-3 py-1 text-sm bg-leather-300 hover:bg-leather-400 text-white rounded-lg transition-colors flex items-center gap-1"
                title="Share this note (24h link)"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseDocument}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close document"
            >
              <svg
                className="w-6 h-6 text-gray-700"
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

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 ml-4 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] fade-in">
              <button
                type="button"
                onClick={handleCreateDocument}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                ➕ New Document
              </button>
              <Link href="/templates">
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  📄 Templates
                </button>
              </Link>
              <button
                type="button"
                onClick={handleExportDocument}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                📥 Export
              </button>
              {documents.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportWorkspace}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  📦 Export All
                </button>
              )}
              <Link href="/settings">
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  ⚙️ Settings
                </button>
              </Link>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="px-4 py-2 text-sm text-gray-500">
                🔐 End-to-end encrypted
              </div>
            </div>
          )}
        </div>

        {/* Editor Content */}
        <div className="pt-20 pb-24 px-6 max-w-4xl mx-auto min-h-screen">
          <BlockEditor
            initialContent={currentDocument.content}
            onSave={handleSave}
            autoSave={true}
            showToolbar={false}
          />
        </div>

        {/* Bottom Formatting Toolbar - Scrollable */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-4xl mx-auto px-6 py-3 overflow-x-auto">
            <div className="flex items-center justify-start gap-2 min-w-max">
              {/* Text Formatting */}
              <button type="button" className="px-3 py-2 hover:bg-gray-100 rounded transition-colors font-bold flex-shrink-0">
                B
              </button>
              <button type="button" className="px-3 py-2 hover:bg-gray-100 rounded transition-colors italic flex-shrink-0">
                I
              </button>
              <button type="button" className="px-3 py-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0">
                ⟨/⟩
              </button>
              <div className="h-6 w-px bg-gray-300 mx-2 flex-shrink-0"></div>
              {/* Block Formatting */}
              <button type="button" className="px-3 py-2 hover:bg-gray-100 rounded transition-colors text-sm flex-shrink-0">
                H1
              </button>
              <button type="button" className="px-3 py-2 hover:bg-gray-100 rounded transition-colors text-sm flex-shrink-0">
                H2
              </button>
              <button type="button" className="px-3 py-2 hover:bg-gray-100 rounded transition-colors text-sm flex-shrink-0">
                H3
              </button>
              <div className="h-6 w-px bg-gray-300 mx-2 flex-shrink-0"></div>
              <button type="button" className="px-3 py-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0">
                •
              </button>
              <button type="button" className="px-3 py-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0">
                1.
              </button>
              <button type="button" className="px-3 py-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0">
                ☑
              </button>
            </div>
          </div>
        </div>

        {/* Share Toast Notification */}
        {showShareToast && (
          <div className="fixed bottom-20 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <svg
                aria-hidden="true"
                focusable="false"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Share link copied to clipboard!</span>
            </div>
            <p className="text-xs mt-1 opacity-90">Link expires in 24 hours</p>
          </div>
        )}

        {/* QuickNote Modal - Available globally with Ctrl+Q */}
        <QuickNote
          workspaceId={workspaceId}
          userId={userEmail}
          onSave={handleSaveQuickNote}
        />
      </div>
    );
  }

  // Workspace view when no document is open
  return (
    <div className="min-h-screen relative flex">
      <LeatherBackground />

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
                <h2 className="text-2xl font-bold text-leather-100">Workspace</h2>
                {initialized && (
                  <span className="text-xs text-leather-300 px-2 py-1 rounded-full glass-card">
                    🔐 Encrypted
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <LeatherButton variant="parchment" size="sm" onClick={handleCreateDocument}>
                  ➕ New Document
                </LeatherButton>
                <Link href="/templates">
                  <LeatherButton variant="parchment" size="sm">
                    📄 Templates
                  </LeatherButton>
                </Link>
                {documents.length > 0 && (
                  <LeatherButton variant="parchment" size="sm" onClick={handleExportWorkspace}>
                    📦 Export All
                  </LeatherButton>
                )}
                <Link href="/settings">
                  <LeatherButton variant="parchment" size="sm">
                    ⚙️ Settings
                  </LeatherButton>
                </Link>
              </div>
            </div>
          </GlassCard>

          {/* Welcome Cards */}
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
                <LeatherButton variant="leather" size="sm" onClick={handleCreateDocument}>
                  Create Note
                </LeatherButton>
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
                  <LeatherButton variant="leather" size="sm">
                    Browse Templates
                  </LeatherButton>
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
                  <LeatherButton variant="parchment" size="sm">
                    Security Settings
                  </LeatherButton>
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
                  <LeatherButton variant="parchment" size="sm" onClick={handleExportWorkspace}>
                    Export Workspace
                  </LeatherButton>
                ) : (
                  <LeatherButton variant="parchment" size="sm" disabled>
                    No Documents Yet
                  </LeatherButton>
                )}
              </div>
            </GlassCard>
          </div>

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

      {/* QuickNote Modal - Available globally with Ctrl+Q */}
      <QuickNote
        workspaceId={workspaceId}
        userId={userEmail}
        onSave={handleSaveQuickNote}
      />
    </div>
  );
}

/**
 * Renders the workspace page wrapped in a Suspense boundary, providing a loading fallback UI.
 *
 * @returns The workspace page React element that displays a loading card until WorkspaceContent is ready.
 */
export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen relative flex items-center justify-center">
          <LeatherBackground />
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
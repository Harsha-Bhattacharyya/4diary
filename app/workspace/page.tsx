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

import React, { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import LeatherBackground from "@/components/ui/LeatherBackground";
import SidebarNew from "@/components/ui/SidebarNew";
import GlassCard from "@/components/ui/GlassCard";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import LeatherButton from "@/components/ui/LeatherButton";
import EditableTitle from "@/components/ui/EditableTitle";
import { EmojiPickerComponent } from "@/components/ui/EmojiPicker";
import { QuickNote } from "@/components/ui/QuickNote";
import SaveTemplateModal from "@/components/ui/SaveTemplateModal";
import NoteSettings, { type EditorFontType } from "@/components/ui/NoteSettings";
import PWAInstallPrompt from "@/components/ui/PWAInstallPrompt";
import PWAInit from "@/components/ui/PWAInit";
import dynamic from "next/dynamic";
import { keyManager } from "@/lib/crypto/keyManager";
import {
  createDocument,
  updateDocument,
  listDocuments,
  getDocument,
  deleteDocument,
  type Document,
} from "@/lib/documentService";
import { getOrCreateDefaultWorkspace } from "@/lib/workspaceService";
import { createDocumentFromTemplate } from "@/lib/templateService";
import { exportDocumentAsMarkdown, exportEncryptedWorkspaceAsZip } from "@/lib/exportService";
import { saveDocumentVersion } from "@/lib/versionService";
import type { KanbanBoardData } from "@/components/kanban/Board";
import type { ImportedNote } from "@/lib/import";

// Dynamic import to avoid SSR issues with BlockNote
const BlockEditor = dynamic(() => import("@/components/editor/BlockEditor"), {
  ssr: false,
});

// Dynamic import for KanbanEditor
const KanbanEditor = dynamic(() => import("@/components/kanban/KanbanEditor").then(mod => ({ default: mod.KanbanEditor })), {
  ssr: false,
});

// Dynamic imports for new features
const CalendarView = dynamic(() => import("@/components/ui/CalendarView"), {
  ssr: false,
});

const VersionHistory = dynamic(() => import("@/components/ui/VersionHistory"), {
  ssr: false,
});

const Backlinks = dynamic(() => import("@/components/ui/Backlinks"), {
  ssr: false,
});

const PlaywriterMode = dynamic(() => import("@/components/ui/PlaywriterMode").then(mod => ({ default: mod.PlaywriterMode })), {
  ssr: false,
});

const ImportNotes = dynamic(() => import("@/components/ui/ImportNotes").then(mod => ({ default: mod.ImportNotes })), {
  ssr: false,
});

// Dynamic imports for new math and search features
const Calculator = dynamic(() => import("@/components/ui/Calculator"), {
  ssr: false,
});

const SearchModal = dynamic(() => import("@/components/ui/SearchModal"), {
  ssr: false,
});

/**
 * Extracts plain text from BlockNote content structure.
 * Uses forward-order iteration to preserve original block order and empty lines.
 * @param content - BlockNote content array
 * @returns Plain text string with line breaks preserved
 */
function extractTextFromContent(content: unknown[]): string {
  if (!content || !Array.isArray(content)) return "";
  
  const textParts: string[] = [];
  
  // Process blocks in forward order using a queue (FIFO)
  const queue: unknown[] = [...content];
  
  while (queue.length > 0) {
    const block = queue.shift(); // Use shift for FIFO order
    if (!block || typeof block !== "object") continue;
    
    const objBlock = block as Record<string, unknown>;
    
    // Handle text content directly in block
    if (objBlock.text && typeof objBlock.text === "string") {
      textParts.push(objBlock.text);
    }
    
    // Handle content array (inline content)
    if (Array.isArray(objBlock.content)) {
      const inlineText = objBlock.content
        .map((item: unknown) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object" && (item as Record<string, unknown>).text) {
            return (item as Record<string, unknown>).text as string;
          }
          return "";
        })
        .join("");
      // Always push the line (even if empty) to preserve blank paragraphs
      textParts.push(inlineText);
    }
    
    // Handle children/nested blocks - add to end of queue to maintain order
    if (Array.isArray(objBlock.children)) {
      queue.push(...objBlock.children);
    }
  }
  
  return textParts.join("\n").trim();
}

/**
 * Converts plain text back to BlockNote content structure.
 * Preserves line breaks as separate paragraphs for screenplay formatting.
 * @param text - Plain text string
 * @returns BlockNote content array
 */
function convertTextToContent(text: string): unknown[] {
  if (!text.trim()) {
    return [{ type: "paragraph", content: [] }];
  }
  
  // Split by line breaks and create a paragraph for each line
  const lines = text.split("\n");
  return lines.map(line => ({
    type: "paragraph",
    content: line ? [{ type: "text", text: line }] : [],
  }));
}

/**
 * Render the workspace UI and manage authentication, encryption initialization, workspace lifecycle, and document operations.
 *
 * Shows a full-screen editor when a document is open; otherwise presents the workspace overview including the sidebar, stats, quick actions, and document lists. Exposes handlers for creating, opening, saving, sharing, renaming, exporting, and templating documents and surfaces loading/error states.
 *
 * @returns A JSX element representing the workspace UI
 */
function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get("template");
  const newType = searchParams.get("new");

  const [initialized, setInitialized] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showBacklinks, setShowBacklinks] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showNoteSettings, setShowNoteSettings] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPlaywriterMode, setShowPlaywriterMode] = useState(false);
  const [showImportNotes, setShowImportNotes] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [editorFont, setEditorFont] = useState<EditorFontType>(() => {
    // Hydrate from localStorage on initial mount (client-side only)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('4diary-editor-font');
      if (saved === 'normal' || saved === 'serif' || saved === 'condensed') {
        return saved;
      }
    }
    return "normal";
  });

  // Persist font preference to localStorage
  const handleFontChange = useCallback((font: EditorFontType) => {
    setEditorFont(font);
    if (typeof window !== 'undefined') {
      localStorage.setItem('4diary-editor-font', font);
    }
  }, []);

  // Keyboard shortcuts for new features
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + F for search (avoid conflict with Ctrl+K for links)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setShowSearch(true);
      }
      
      // Ctrl/Cmd + Shift + C for calculator
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setShowCalculator(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check authentication
  useEffect(() => {
    /**
     * Checks the current user session and redirects to the sign-in page if not authenticated.
     *
     * If the session is authenticated, updates the component state with the user's username.
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

        if (!data.username) {
          console.error("Authenticated but no username provided");
          router.push("/auth");
          return;
        }

        setUserEmail(data.username);
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
          try {
            // First try as a built-in template
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
          } catch {
            // If it fails, try as a custom template from database
            try {
              const templateResponse = await fetch(`/api/templates?userId=${encodeURIComponent(userEmail)}`);
              const templateData = await templateResponse.json();
              
              const customTemplate = templateData.templates.find(
                (t: { _id: string }) => t._id === templateId
              );

              if (customTemplate) {
                // Create document from custom template
                const doc = await createDocument({
                  workspaceId: workspace.id,
                  userId: userEmail,
                  content: customTemplate.content || [],
                  metadata: {
                    title: customTemplate.name || "Untitled",
                    tags: [customTemplate.category],
                  },
                });

                setCurrentDocument(doc);

                // Reload documents list
                const updatedDocs = await listDocuments(workspace.id, userEmail);
                setDocuments(updatedDocs);
              } else {
                throw new Error("Template not found");
              }
            } catch (customErr) {
              console.error("Failed to load custom template:", customErr);
              setError("Failed to load template");
            }
          }
        }

        // If new=kanban, create a kanban board
        if (newType === 'kanban') {
          const doc = await createDocument({
            workspaceId: workspace.id,
            userId: userEmail,
            content: [{ board: { columns: [], cards: {} } }],
            metadata: {
              title: "New Kanban Board",
              type: "board",
            },
          });

          // Navigate to the board page
          router.push(`/workspace/${workspace.id}/board/${doc.id}`);
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize");
        setLoading(false);
      }
    }

    initialize();
  }, [templateId, newType, userEmail, router]);

  const handleSave = async (content: unknown[]) => {
    if (!currentDocument || !workspaceId) return;

    try {
      await updateDocument({
        id: currentDocument.id,
        userId: userEmail!,
        content,
        metadata: currentDocument.metadata,
      });

      // Save version history
      await saveDocumentVersion(
        currentDocument.id,
        content,
        currentDocument.metadata.title
      );

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
      setIsEditMode(true); // Start in edit mode for new documents

      // Reload documents list
      const updatedDocs = await listDocuments(workspaceId, userEmail);
      setDocuments(updatedDocs);
    } catch (err) {
      console.error("Create error:", err);
      setError(err instanceof Error ? err.message : "Failed to create document");
    }
  };

  const handleOpenDocument = async (docId: string) => {
    if (!userEmail) return;
    
    try {
      const doc = await getDocument(docId, userEmail);
      setCurrentDocument(doc);
      setIsEditMode(false); // Start in read mode
    } catch (err) {
      console.error("Open error:", err);
      setError(err instanceof Error ? err.message : "Failed to open document");
    }
  };

  const handleTitleChange = async (newTitle: string) => {
    if (!currentDocument || !userEmail) return;

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

  const handleEmojiChange = async (newEmoji: string) => {
    if (!currentDocument || !userEmail) return;

    try {
      const updatedMetadata = {
        ...currentDocument.metadata,
        emojiIcon: newEmoji,
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

      // Reload documents list to reflect the emoji change
      if (workspaceId) {
        const updatedDocs = await listDocuments(workspaceId, userEmail);
        setDocuments(updatedDocs);
      }
    } catch (err) {
      console.error("Emoji update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update emoji");
    }
  };

  const handleFolderChange = async (newFolder: string) => {
    if (!currentDocument || !userEmail) return;

    try {
      const updatedMetadata = {
        ...currentDocument.metadata,
        folder: newFolder || undefined, // Don't store empty string
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

      // Reload documents list to reflect the folder change
      if (workspaceId) {
        const updatedDocs = await listDocuments(workspaceId, userEmail);
        setDocuments(updatedDocs);
      }
    } catch (err) {
      console.error("Folder update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update folder");
    }
  };

  const handleTagsChange = async (newTags: string[]) => {
    if (!currentDocument || !userEmail) return;

    try {
      const updatedMetadata = {
        ...currentDocument.metadata,
        tags: newTags,
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

      // Reload documents list to reflect the tags change
      if (workspaceId) {
        const updatedDocs = await listDocuments(workspaceId, userEmail);
        setDocuments(updatedDocs);
      }
    } catch (err) {
      console.error("Tags update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update tags");
    }
  };

  const handleBackgroundColorChange = async (newColor: string) => {
    if (!currentDocument || !userEmail) return;

    try {
      const updatedMetadata = {
        ...currentDocument.metadata,
        backgroundColor: newColor || undefined,
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

      // Reload documents list
      if (workspaceId) {
        const updatedDocs = await listDocuments(workspaceId, userEmail);
        setDocuments(updatedDocs);
      }
    } catch (err) {
      console.error("Background color update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update background color");
    }
  };

  const handleToggleReadOnly = async (newReadOnly: boolean) => {
    if (!currentDocument || !userEmail) return;

    try {
      await updateDocument({
        id: currentDocument.id,
        userId: userEmail,
        readOnly: newReadOnly,
      });

      // Update local state
      setCurrentDocument({
        ...currentDocument,
        readOnly: newReadOnly,
      });

      // Reload documents list
      if (workspaceId) {
        const updatedDocs = await listDocuments(workspaceId, userEmail);
        setDocuments(updatedDocs);
      }
    } catch (err) {
      console.error("Read-only toggle error:", err);
      setError(err instanceof Error ? err.message : "Failed to toggle read-only mode");
    }
  };

  const handleToggleArchived = async (newArchived: boolean) => {
    if (!currentDocument || !userEmail) return;

    try {
      await updateDocument({
        id: currentDocument.id,
        userId: userEmail,
        archived: newArchived,
      });

      // Update local state
      setCurrentDocument({
        ...currentDocument,
        archived: newArchived,
      });

      // Reload documents list and close the document if archived
      if (workspaceId) {
        const updatedDocs = await listDocuments(workspaceId, userEmail);
        setDocuments(updatedDocs);
        
        if (newArchived) {
          // Close the document when archiving
          setCurrentDocument(null);
        }
      }
    } catch (err) {
      console.error("Archive toggle error:", err);
      setError(err instanceof Error ? err.message : "Failed to toggle archive");
    }
  };

  const handleExportDocument = async () => {
    if (!currentDocument || !userEmail) return;

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
    if (!workspaceId || !userEmail) return;

    try {
      // Fetch all encrypted documents
      const response = await fetch(
        `/api/documents?workspaceId=${encodeURIComponent(workspaceId)}&userId=${encodeURIComponent(userEmail)}`
      );
      const data = await response.json();

      // Export encrypted blobs and master key
      await exportEncryptedWorkspaceAsZip("My Workspace", data.documents);
    } catch (err) {
      console.error("Export error:", err);
      setError(err instanceof Error ? err.message : "Failed to export workspace");
    }
  };

  const handleSaveQuickNote = async (content: string): Promise<void> => {
    if (!workspaceId || !userEmail) {
      throw new Error("Workspace not initialized");
    }

    try {
      // Create a new document with the quick note content
      await createDocument({
        workspaceId,
        userId: userEmail,
        content: [{ type: "paragraph", content: [{ type: "text", text: content }] }],
        metadata: {
          title: "Quick Note",
          type: "quick",
        },
      });

      // Reload documents list
      const updatedDocs = await listDocuments(workspaceId, userEmail);
      setDocuments(updatedDocs);
    } catch (err) {
      console.error("Quick note save error:", err);
      throw err;
    }
  };

  const handleSaveAsTemplate = async (templateData: {
    name: string;
    description: string;
    category: string;
    isPublic: boolean;
  }) => {
    if (!currentDocument || !userEmail) {
      throw new Error("No document open or user not authenticated");
    }

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userEmail,
          name: templateData.name,
          description: templateData.description,
          category: templateData.category,
          content: currentDocument.content,
          variables: [],
          isPublic: templateData.isPublic,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save template");
      }

      // Show success message
      alert("Template saved successfully!");
    } catch (err) {
      console.error("Save template error:", err);
      throw err;
    }
  };

  const handleToggleFavorite = async (docId: string, favorite: boolean) => {
    if (!userEmail) return;

    try {
      await updateDocument({
        id: docId,
        userId: userEmail,
        favorite,
      });

      // Update local state
      setDocuments(prevDocs =>
        prevDocs.map(doc =>
          doc.id === docId ? { ...doc, favorite } : doc
        )
      );
    } catch (err) {
      console.error("Toggle favorite error:", err);
      setError(err instanceof Error ? err.message : "Failed to toggle favorite");
    }
  };

  const handleReorder = async (docId: string, newSortOrder: number) => {
    if (!userEmail) return;

    try {
      await updateDocument({
        id: docId,
        userId: userEmail,
        sortOrder: newSortOrder,
      });

      // Update local state
      setDocuments(prevDocs =>
        prevDocs.map(doc =>
          doc.id === docId ? { ...doc, sortOrder: newSortOrder } : doc
        )
      );
    } catch (err) {
      console.error("Reorder error:", err);
      setError(err instanceof Error ? err.message : "Failed to reorder document");
    }
  };

  const handleDeleteDocument = async () => {
    if (!currentDocument || !userEmail) return;

    try {
      await deleteDocument(currentDocument.id, userEmail);

      // Close the document and reload the list
      setCurrentDocument(null);
      setShowDeleteConfirm(false);

      // Reload documents list
      if (workspaceId) {
        const updatedDocs = await listDocuments(workspaceId, userEmail);
        setDocuments(updatedDocs);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete document");
      setShowDeleteConfirm(false);
    }
  };

  const handleImportNotes = async (importedNotes: ImportedNote[]): Promise<void> => {
    if (!workspaceId || !userEmail) {
      throw new Error("Workspace not initialized");
    }

    const failedNotes: string[] = [];

    // Create documents from imported notes
    for (const note of importedNotes) {
      try {
        await createDocument({
          workspaceId,
          userId: userEmail,
          content: note.content as unknown[],
          metadata: {
            title: note.title,
            tags: note.tags,
            folder: note.folder,
            type: "doc",
          },
        });
      } catch (err) {
        console.error(`Failed to import note "${note.title}":`, err);
        failedNotes.push(note.title);
      }
    }

    // Reload documents list
    const updatedDocs = await listDocuments(workspaceId, userEmail);
    setDocuments(updatedDocs);

    if (failedNotes.length > 0) {
      throw new Error(`Failed to import ${failedNotes.length} note(s): ${failedNotes.join(", ")}`);
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

  const handleCloseDocument = async () => {
    // Reload documents list to show any new or updated documents
    if (workspaceId && userEmail) {
      try {
        const updatedDocs = await listDocuments(workspaceId, userEmail);
        setDocuments(updatedDocs);
      } catch (err) {
        console.error("Failed to reload documents:", err);
      }
    }
    setCurrentDocument(null);
  };

  // Full-screen editor mode when a document is open
  if (currentDocument) {
    return (
      <>
        <div className="min-h-screen relative bg-white">
        {/* Top Bar with Menu and Title */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Menu Button */}
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 hover:bg-leather-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-leather-800"
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

            {/* Title, Emoji and Share Button */}
            <div className="flex-1 mx-6 flex items-center justify-center gap-3">
              <EmojiPickerComponent
                selectedEmoji={currentDocument.metadata.emojiIcon || "📄"}
                onEmojiSelect={handleEmojiChange}
              />
              <EditableTitle
                title={currentDocument.metadata.title}
                onSave={handleTitleChange}
                className="text-2xl font-bold text-gray-900 text-center"
              />
              <button
                type="button"
                onClick={() => handleToggleFavorite(currentDocument.id, !currentDocument.favorite)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                title={currentDocument.favorite ? "Unstar this note" : "Star this note"}
              >
                <span className="text-lg">
                  {currentDocument.favorite ? "⭐" : "☆"}
                </span>
              </button>
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
              className="p-2 hover:bg-leather-100 rounded-lg transition-colors"
              aria-label="Close document"
            >
              <svg
                className="w-6 h-6 text-leather-800"
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
              <div className="border-t border-gray-200 my-2"></div>
              <button
                type="button"
                onClick={() => {
                  setShowNoteSettings(true);
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                ⚙️ Note Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowVersionHistory(true);
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                📚 Version History
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBacklinks(!showBacklinks);
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                🔗 {showBacklinks ? "Hide" : "Show"} Backlinks
              </button>
              {currentDocument.metadata.type !== 'board' && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPlaywriterMode(true);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  🎭 Playwriter Mode
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowCalculator(true);
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                title="Calculator (Ctrl+Shift+C)"
              >
                🔢 Calculator
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSearch(true);
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                title="Search (Ctrl+Shift+F)"
              >
                🔍 Search Notes
              </button>
              <div className="border-t border-gray-200 my-2"></div>
              <button
                type="button"
                onClick={handleExportDocument}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                📥 Export
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSaveTemplateModal(true);
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                💾 Save as Template
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
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition-colors"
              >
                🗑️ Delete Note
              </button>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="px-4 py-2 text-sm text-gray-500">
                🔐 End-to-end encrypted
              </div>
            </div>
          )}
        </div>

        {/* Editor Content */}
        <div 
          className="pt-20 pb-24 px-6 mx-auto min-h-screen flex gap-6"
          style={currentDocument.metadata.backgroundColor ? {
            backgroundColor: currentDocument.metadata.backgroundColor,
          } : undefined}
        >
          <div className="flex-1 max-w-4xl relative">
            {currentDocument.metadata.type === 'board' ? (
              // Render Kanban board for board-type documents
              <KanbanEditor
                initialData={
                  Array.isArray(currentDocument.content) && 
                  currentDocument.content.length > 0 && 
                  (currentDocument.content[0] as { board?: KanbanBoardData })?.board
                    ? (currentDocument.content[0] as { board: KanbanBoardData }).board
                    : { columns: [] }
                }
                onBoardChange={async (newBoard) => {
                  if (!userEmail) return;
                  await updateDocument({
                    id: currentDocument.id,
                    userId: userEmail,
                    content: [{ board: newBoard }],
                    metadata: currentDocument.metadata,
                  });
                  setCurrentDocument({
                    ...currentDocument,
                    content: [{ board: newBoard }],
                  });
                }}
              />
            ) : (
              // Render regular BlockEditor for other documents
              <BlockEditor
                initialContent={currentDocument.content}
                onSave={handleSave}
                autoSave={true}
                showToolbar={isEditMode && !currentDocument.readOnly}
                editable={isEditMode && !currentDocument.readOnly}
                showLineNumbers={showLineNumbers}
                toolbarPosition="bottom"
                editorFont={editorFont}
              />
            )}
            
            {/* Read-Only Indicator */}
            {currentDocument.readOnly && (
              <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500/90 text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-2 z-50">
                <span>🔒</span>
                <span>Read-Only</span>
              </div>
            )}
          </div>

          {/* Backlinks Sidebar */}
          {showBacklinks && currentDocument.metadata.type !== 'board' && workspaceId && userEmail && (
            <div className="w-80 flex-shrink-0">
              <Backlinks
                documentTitle={currentDocument.metadata.title}
                workspaceId={workspaceId}
                userId={userEmail}
                keyManager={keyManager}
              />
            </div>
          )}
        </div>

        {/* Floating Edit Button - Only show in read mode for non-board documents */}
        {!isEditMode && currentDocument.metadata.type !== 'board' && (
          <button
            type="button"
            onClick={() => setIsEditMode(true)}
            className="fixed bottom-6 right-6 z-50 p-4 bg-leather-600 hover:bg-leather-700 text-white rounded-full shadow-2xl transition-all hover:scale-110"
            aria-label="Enter edit mode"
            title="Enter edit mode"
          >
            <svg
              className="w-6 h-6"
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
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        )}

        {/* Edit Mode Bar - Only show for non-board documents in edit mode */}
        {isEditMode && currentDocument.metadata.type !== 'board' && (
          <div className="fixed bottom-14 left-0 right-0 z-40 pointer-events-none">
            <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
              {/* Edit Mode Indicator */}
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium shadow-md pointer-events-auto">
                <svg
                  className="w-4 h-4"
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
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Edit Mode
              </div>
              {/* Exit Edit Mode Button */}
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="px-3 py-1 bg-white hover:bg-gray-100 rounded-lg transition-colors text-sm shadow-md border border-gray-200 pointer-events-auto"
              >
                Exit Edit Mode
              </button>
            </div>
          </div>
        )}

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
      </div>

      {/* Save Template Modal */}
      <SaveTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSave={handleSaveAsTemplate}
        initialTitle={currentDocument.metadata.title}
      />

      {/* Note Settings Modal */}
      <NoteSettings
        content={currentDocument.content}
        lastModified={currentDocument.updatedAt}
        isOpen={showNoteSettings}
        onClose={() => setShowNoteSettings(false)}
        showLineNumbers={showLineNumbers}
        onToggleLineNumbers={setShowLineNumbers}
        folder={currentDocument.metadata.folder}
        tags={currentDocument.metadata.tags}
        onUpdateFolder={handleFolderChange}
        onUpdateTags={handleTagsChange}
        editorFont={editorFont}
        onFontChange={handleFontChange}
        backgroundColor={currentDocument.metadata.backgroundColor}
        onBackgroundColorChange={handleBackgroundColorChange}
        readOnly={currentDocument.readOnly}
        onToggleReadOnly={handleToggleReadOnly}
        archived={currentDocument.archived}
        onToggleArchived={handleToggleArchived}
      />

      {/* Version History Modal */}
      {showVersionHistory && (
        <VersionHistory
          documentId={currentDocument.id}
          onRestore={async (content) => {
            await handleSave(content);
            setShowVersionHistory(false);
          }}
          onClose={() => setShowVersionHistory(false)}
        />
      )}

      {/* Playwriter Mode Modal */}
      {showPlaywriterMode && currentDocument && (
        <PlaywriterMode
          content={extractTextFromContent(currentDocument.content)}
          title={currentDocument.metadata.title}
          onClose={() => setShowPlaywriterMode(false)}
          onSave={async (textContent) => {
            // Convert the text back to BlockNote content format preserving line breaks
            const newContent = convertTextToContent(textContent);
            await handleSave(newContent);
          }}
        />
      )}

      {/* QuickNote Modal - Available globally with Ctrl+Q */}
      <QuickNote onSave={handleSaveQuickNote} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{currentDocument?.metadata.title || "this note"}&quot;? 
              This action cannot be undone and the note will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDocument}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PWA Components */}
      <PWAInit />
      <PWAInstallPrompt />
    </>
    );
  }

  // Workspace view when no document is open
  return (
    <>
      <div className="min-h-screen relative">
      <LeatherBackground />

      {/* Sidebar - Overlay */}
      <div className="fade-in">
        <SidebarNew
          workspaceId={workspaceId || "demo"}
          documents={documents.map((doc) => ({
            id: doc.id,
            title: doc.metadata.title,
            folder: doc.metadata.folder,
            favorite: doc.favorite,
            sortOrder: doc.sortOrder,
            tags: doc.metadata.tags,
          }))}
          onDocumentClick={handleOpenDocument}
          collapsed={sidebarCollapsed}
          onToggle={setSidebarCollapsed}
          onToggleFavorite={handleToggleFavorite}
          onReorder={handleReorder}
          userEmail={userEmail || undefined}
        />
      </div>

      {/* Main Content - Dynamic left margin based on sidebar state */}
      <main className={`relative z-0 flex-1 overflow-y-auto transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-80'
      }`}>
        <div className="max-w-7xl mx-auto p-6 sm:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-leather-100 mb-2">
                  My Workspace
                </h1>
                <p className="text-leather-300 text-sm sm:text-base">
                  {userEmail && `Welcome back, ${userEmail.split('@')[0]}`}
                  {initialized && " • All data encrypted"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <LeatherButton variant="leather" size="sm" onClick={handleCreateDocument}>
                  <span className="hidden sm:inline">➕ New Document</span>
                  <span className="sm:hidden">➕</span>
                </LeatherButton>
                <Link href="/templates">
                  <LeatherButton variant="parchment" size="sm">
                    <span className="hidden sm:inline">📄 Templates</span>
                    <span className="sm:hidden">📄</span>
                  </LeatherButton>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <GlassCard className="p-4">
                <div className="text-2xl sm:text-3xl font-bold text-leather-100 mb-1">
                  {documents.length}
                </div>
                <div className="text-xs sm:text-sm text-leather-300">
                  Total Documents
                </div>
              </GlassCard>
              
              <GlassCard className="p-4">
                <div className="text-2xl sm:text-3xl font-bold text-leather-100 mb-1">
                  {documents.filter(d => {
                    const lastWeek = Date.now() - 7 * 24 * 60 * 60 * 1000;
                    return d.updatedAt && new Date(d.updatedAt).getTime() > lastWeek;
                  }).length}
                </div>
                <div className="text-xs sm:text-sm text-leather-300">
                  Active This Week
                </div>
              </GlassCard>
              
              <GlassCard className="p-4">
                <div className="text-2xl sm:text-3xl font-bold text-leather-100 mb-1">
                  {new Set(documents.map(d => d.metadata.folder).filter(Boolean)).size}
                </div>
                <div className="text-xs sm:text-sm text-leather-300">
                  Folders
                </div>
              </GlassCard>
              
              <GlassCard className="p-4">
                <div className="text-2xl sm:text-3xl font-bold text-leather-100 mb-1">
                  {initialized ? '🔐' : '⚠️'}
                </div>
                <div className="text-xs sm:text-sm text-leather-300">
                  {initialized ? 'Encrypted' : 'Demo Mode'}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Quick Actions */}
          <GlassCard className="mb-8 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-leather-100">
                Quick Actions
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === "list"
                      ? "bg-leather-600 text-white"
                      : "bg-leather-900/30 text-leather-200 hover:bg-leather-900/50"
                  }`}
                >
                  📋 List
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === "calendar"
                      ? "bg-leather-600 text-white"
                      : "bg-leather-900/30 text-leather-200 hover:bg-leather-900/50"
                  }`}
                >
                  📅 Calendar
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <button
                onClick={handleCreateDocument}
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-leather-900/30 hover:bg-leather-900/50 transition-all border border-leather-700/30 hover:border-leather-600"
              >
                <span className="text-3xl mb-2">📝</span>
                <span className="text-xs sm:text-sm text-leather-200 text-center">New Note</span>
              </button>
              
              <Link href="/templates" className="flex flex-col items-center justify-center p-4 rounded-lg bg-leather-900/30 hover:bg-leather-900/50 transition-all border border-leather-700/30 hover:border-leather-600">
                <span className="text-3xl mb-2">📄</span>
                <span className="text-xs sm:text-sm text-leather-200 text-center">Templates</span>
              </Link>
              
              <button
                onClick={() => router.push('/workspace?new=kanban')}
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-leather-900/30 hover:bg-leather-900/50 transition-all border border-leather-700/30 hover:border-leather-600"
              >
                <span className="text-3xl mb-2">📊</span>
                <span className="text-xs sm:text-sm text-leather-200 text-center">Kanban</span>
              </button>
              
              <button
                type="button"
                onClick={() => setShowImportNotes(true)}
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-leather-900/30 hover:bg-leather-900/50 transition-all border border-leather-700/30 hover:border-leather-600"
              >
                <span className="text-3xl mb-2">📥</span>
                <span className="text-xs sm:text-sm text-leather-200 text-center">Import</span>
              </button>
              
              {documents.length > 0 && (
                <button
                  onClick={handleExportWorkspace}
                  className="flex flex-col items-center justify-center p-4 rounded-lg bg-leather-900/30 hover:bg-leather-900/50 transition-all border border-leather-700/30 hover:border-leather-600"
                >
                  <span className="text-3xl mb-2">📦</span>
                  <span className="text-xs sm:text-sm text-leather-200 text-center">Export</span>
                </button>
              )}
              
              <Link href="/settings" className="flex flex-col items-center justify-center p-4 rounded-lg bg-leather-900/30 hover:bg-leather-900/50 transition-all border border-leather-700/30 hover:border-leather-600">
                <span className="text-3xl mb-2">⚙️</span>
                <span className="text-xs sm:text-sm text-leather-200 text-center">Settings</span>
              </Link>
              
              <Link href="/docs" className="flex flex-col items-center justify-center p-4 rounded-lg bg-leather-900/30 hover:bg-leather-900/50 transition-all border border-leather-700/30 hover:border-leather-600">
                <span className="text-3xl mb-2">📚</span>
                <span className="text-xs sm:text-sm text-leather-200 text-center">Help</span>
              </Link>
            </div>
          </GlassCard>

          {/* Documents Section */}
          {documents.length > 0 ? (
            <div className="space-y-6">
              {viewMode === "calendar" ? (
                /* Calendar View */
                <CalendarView documents={documents} />
              ) : (
                /* List View */
                <>
                  {/* Recent Documents */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl sm:text-2xl font-bold text-leather-100">
                        Recent Documents
                      </h2>
                      <LeatherButton 
                        variant="parchment" 
                        size="sm"
                        onClick={() => {
                          const sorted = [...documents].sort((a, b) => 
                        new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
                      );
                      setDocuments(sorted);
                    }}
                  >
                    Sort by Date
                  </LeatherButton>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents
                    .sort((a, b) => 
                      new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
                    )
                    .slice(0, 6)
                    .map((doc) => (
                      <div 
                        key={doc.id}
                        onClick={() => handleOpenDocument(doc.id)}
                        className="cursor-pointer group"
                      >
                        <GlassCard 
                          hover
                          className="p-4 h-full"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-semibold text-leather-100 mb-1 truncate group-hover:text-leather-50 transition-colors">
                                {doc.metadata.title || "Untitled"}
                              </h3>
                              {doc.metadata.folder && (
                                <span className="text-xs text-leather-400 px-2 py-1 rounded-full bg-leather-900/40">
                                  📁 {doc.metadata.folder}
                                </span>
                              )}
                            </div>
                            <span className="text-2xl ml-2">
                              {doc.metadata.emojiIcon || "📄"}
                            </span>
                          </div>
                          
                          <div className="text-xs sm:text-sm text-leather-300 mb-3 line-clamp-2">
                            {doc.content && doc.content.length > 0 
                              ? JSON.stringify(doc.content).substring(0, 100).replace(/[{}"[\]]/g, '') 
                              : "No content yet..."}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-leather-400">
                            <span>
                              {doc.updatedAt 
                                ? new Date(doc.updatedAt).toLocaleDateString()
                                : "Today"}
                            </span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                              Open →
                            </span>
                          </div>
                        </GlassCard>
                      </div>
                    ))}
                </div>
              </div>

              {/* All Documents List */}
              {documents.length > 6 && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-leather-100 mb-4">
                    All Documents ({documents.length})
                  </h2>
                  
                  <GlassCard className="overflow-hidden">
                    <div className="divide-y divide-leather-700/30">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => handleOpenDocument(doc.id)}
                          className="p-4 hover:bg-leather-900/30 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">
                              {doc.metadata.emojiIcon || "📄"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm sm:text-base font-semibold text-leather-100 truncate group-hover:text-leather-50 transition-colors">
                                  {doc.metadata.title || "Untitled"}
                                </h3>
                                {doc.metadata.type === 'board' && (
                                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                                    Kanban
                                  </span>
                                )}
                                {doc.metadata.type === 'quick' && (
                                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                                    Quick Note
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-leather-400">
                                {doc.metadata.folder && (
                                  <span>📁 {doc.metadata.folder}</span>
                                )}
                                <span>
                                  {doc.updatedAt 
                                    ? new Date(doc.updatedAt).toLocaleDateString()
                                    : "Today"}
                                </span>
                              </div>
                            </div>
                            <span className="text-leather-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}
                </>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <GlassCard className="max-w-2xl mx-auto p-8 sm:p-12">
                <div className="text-6xl sm:text-7xl mb-6">📝</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-leather-100 mb-4">
                  Welcome to 4diary
                </h2>
                <p className="text-base sm:text-lg text-leather-300 mb-8">
                  Your private, encrypted note-taking workspace. Start by creating your first document or choose from our templates.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                  <LeatherButton 
                    variant="leather" 
                    onClick={handleCreateDocument}
                    className="w-full sm:w-auto"
                  >
                    ➕ Create First Document
                  </LeatherButton>
                  <Link href="/templates" className="w-full sm:w-auto">
                    <LeatherButton variant="parchment" className="w-full">
                      📄 Browse Templates
                    </LeatherButton>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="p-4 rounded-lg bg-leather-900/20 border border-leather-700/20">
                    <div className="text-3xl mb-2">🔐</div>
                    <h3 className="font-semibold text-leather-100 mb-1 text-sm">
                      End-to-End Encrypted
                    </h3>
                    <p className="text-xs text-leather-300">
                      AES-256-GCM encryption keeps your notes private
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-leather-900/20 border border-leather-700/20">
                    <div className="text-3xl mb-2">⚡</div>
                    <h3 className="font-semibold text-leather-100 mb-1 text-sm">
                      Quick Capture
                    </h3>
                    <p className="text-xs text-leather-300">
                      Press Ctrl+Q anytime for instant note-taking
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-leather-900/20 border border-leather-700/20">
                    <div className="text-3xl mb-2">📊</div>
                    <h3 className="font-semibold text-leather-100 mb-1 text-sm">
                      Powerful Features
                    </h3>
                    <p className="text-xs text-leather-300">
                      Kanban boards, templates, and export options
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </main>
    </div>

    {/* QuickNote Modal - Available globally with Ctrl+Q */}
    <QuickNote onSave={handleSaveQuickNote} />

    {/* Import Notes Modal */}
    <ImportNotes
      isOpen={showImportNotes}
      onClose={() => setShowImportNotes(false)}
      onImportComplete={handleImportNotes}
    />

    {/* Calculator Modal */}
    {showCalculator && (
      <Calculator
        onClose={() => setShowCalculator(false)}
        onInsert={(result) => {
          // Insert result into editor if document is open
          if (currentDocument) {
            // Note: This is a simple implementation. For full integration,
            // we'd need to expose an insertText method from BlockEditor
            console.log("Insert into editor:", result);
          }
          setShowCalculator(false);
        }}
      />
    )}

    {/* Search Modal */}
    {showSearch && (
      <SearchModal
        documents={documents}
        onClose={() => setShowSearch(false)}
        onSelectDocument={(doc) => {
          handleOpenDocument(doc.id);
          setShowSearch(false);
        }}
      />
    )}

    {/* PWA Components */}
    <PWAInit />
    <PWAInstallPrompt />
  </>
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
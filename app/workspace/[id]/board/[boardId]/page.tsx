/**
 * Kanban Board Page
 * Displays and manages encrypted kanban boards
 */

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  KanbanBoard,
  KanbanBoardData,
  createEmptyBoard,
} from "@/components/kanban/Board";
import { getDocument, updateDocument } from "@/lib/documentService";

/**
 * Renders the client-side Kanban board page and manages authentication, loading, and saving of board data.
 *
 * The component verifies the user session and redirects to /auth if unauthenticated, loads the board document
 * for the current route and user, displays loading and error states, and renders the KanbanBoard when data is ready.
 * Changes to the board are persisted via updateDocument with a queued save flow that coalesces updates while a save is in progress.
 *
 * @returns The page's JSX element containing the header, status indicators, and the Kanban board UI
 */
export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;

  const [boardData, setBoardData] = useState<KanbanBoardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingBoard, setPendingBoard] = useState<KanbanBoardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();

        if (!data.authenticated) {
          router.push("/auth");
          return;
        }

        setUserId(data.email);
      } catch (err) {
        console.error("Auth check error:", err);
        router.push("/auth");
      }
    }

    checkAuth();
  }, [router]);

  const loadBoard = React.useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const doc = await getDocument(boardId, userId);
      if (!doc) {
        setError("Board not found");
        return;
      }

      // Parse board data from document content
      if (Array.isArray(doc.content) && doc.content.length > 0) {
        const boardContent = doc.content[0] as { board?: KanbanBoardData };
        setBoardData(boardContent.board || createEmptyBoard());
      } else {
        setBoardData(createEmptyBoard());
      }
    } catch (err) {
      console.error("Failed to load board:", err);
      setError("Failed to load board");
    } finally {
      setIsLoading(false);
    }
  }, [boardId, userId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const handleBoardChange = async (newBoard: KanbanBoardData) => {
    setBoardData(newBoard);

    // If a save is already in progress, store the latest board state
    if (isSaving) {
      setPendingBoard(newBoard);
      return;
    }

    // Start saving
    setIsSaving(true);
    let boardToSave = newBoard;

    try {
      // Save the board
      while (boardToSave) {
        await updateDocument({
          id: boardId,
          userId: userId!,
          content: [{ board: boardToSave }],
        });

        // Check if there's a pending update
        if (pendingBoard && pendingBoard !== boardToSave) {
          boardToSave = pendingBoard;
          setPendingBoard(null);
        } else {
          boardToSave = null;
          setPendingBoard(null);
        }
      }
    } catch (err) {
      console.error("Failed to save board:", err);
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1410] flex items-center justify-center">
        <div className="text-[#E8DCC4] text-xl">Loading board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1A1410] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#E8DCC4] text-xl mb-4">{error}</div>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#8B7355] text-[#E8DCC4] rounded-md hover:bg-[#A08465] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1410]">
      {/* Header */}
      <div className="bg-[#2D2416] border-b border-[#8B7355] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-[#E8DCC4] hover:text-[#C4B8A0] transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold text-[#E8DCC4]">
              Kanban Board
            </h1>
          </div>

          {isSaving && (
            <div className="text-sm text-[#A08465]">Saving...</div>
          )}
        </div>
      </div>

      {/* Board */}
      {boardData && (
        <KanbanBoard
          initialData={boardData}
          onBoardChange={handleBoardChange}
        />
      )}
    </div>
  );
}
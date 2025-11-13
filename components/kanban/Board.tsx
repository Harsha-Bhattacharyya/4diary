/**
 * Kanban Board Component
 * Displays a kanban board with columns and cards
 * Data is encrypted client-side before being saved
 */

"use client";

import React, { useState } from "react";
import Board from "@asseinfo/react-kanban";
import "@asseinfo/react-kanban/dist/styles.css";

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

export interface KanbanBoardData {
  columns: KanbanColumn[];
}

interface KanbanBoardProps {
  initialData: KanbanBoardData;
  onBoardChange: (board: KanbanBoardData) => void;
  readOnly?: boolean;
}

export function KanbanBoard({
  initialData,
  onBoardChange,
  readOnly = false,
}: KanbanBoardProps) {
  const [board, setBoard] = useState(initialData);

  const handleBoardChange = (newBoard: KanbanBoardData) => {
    setBoard(newBoard);
    onBoardChange(newBoard);
  };

  return (
    <div className="kanban-wrapper">
      <style jsx global>{`
        .kanban-wrapper {
          padding: 1rem;
          background: #1A1410;
          min-height: 100vh;
        }

        .react-kanban-board {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding: 1rem 0;
        }

        .react-kanban-column {
          background: #2D2416;
          border: 1px solid #8B7355;
          border-radius: 8px;
          min-width: 300px;
          max-width: 300px;
          padding: 1rem;
        }

        .react-kanban-column-header {
          font-size: 1.125rem;
          font-weight: 600;
          color: #E8DCC4;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #8B7355;
        }

        .react-kanban-card {
          background: #3D3426;
          border: 1px solid #8B7355;
          border-radius: 6px;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          cursor: ${readOnly ? "default" : "pointer"};
          transition: all 0.2s;
        }

        .react-kanban-card:hover {
          background: ${readOnly ? "#3D3426" : "#4D4436"};
          border-color: ${readOnly ? "#8B7355" : "#A08465"};
        }

        .react-kanban-card__title {
          color: #E8DCC4;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .react-kanban-card__description {
          color: #C4B8A0;
          font-size: 0.875rem;
        }

        .react-kanban-card--dragging {
          opacity: 0.5;
        }
      `}</style>

      <Board
        initialBoard={board}
        onCardDragEnd={(newBoard: KanbanBoardData) => {
          if (!readOnly) {
            handleBoardChange(newBoard);
          }
        }}
        disableColumnDrag
        renderCard={(card: KanbanCard) => (
          <div>
            <div className="react-kanban-card__title">{card.title}</div>
            {card.description && (
              <div className="react-kanban-card__description">
                {card.description}
              </div>
            )}
          </div>
        )}
        renderColumnHeader={(column: KanbanColumn) => (
          <div className="react-kanban-column-header">{column.title}</div>
        )}
      />
    </div>
  );
}

/**
 * Default empty board structure
 */
export function createEmptyBoard(): KanbanBoardData {
  return {
    columns: [
      {
        id: "todo",
        title: "To Do",
        cards: [],
      },
      {
        id: "in-progress",
        title: "In Progress",
        cards: [],
      },
      {
        id: "done",
        title: "Done",
        cards: [],
      },
    ],
  };
}

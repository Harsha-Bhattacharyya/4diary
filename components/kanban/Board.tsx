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

/**
 * Kanban Board Component
 * Displays a kanban board with columns and cards
 * Data is encrypted client-side before being saved
 */

"use client";

import React, { useState, useEffect } from "react";
import { Board } from "@caldwell619/react-kanban";
import "@caldwell619/react-kanban/dist/styles.css";

export interface KanbanCard {
  id: string | number;
  title: string;
  description?: string;
}

export interface KanbanColumn {
  id: string | number;
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

/**
 * Render an interactive Kanban board and synchronize its state with external data.
 *
 * The component maintains local board state initialized from `initialData`, updates the state
 * when `initialData` changes, and invokes `onBoardChange` with the updated board when cards
 * are moved (unless `readOnly` is true).
 *
 * @param initialData - Initial Kanban board data used to populate columns and cards; updates to this prop replace the local board state.
 * @param onBoardChange - Called with the new `KanbanBoardData` after a card is moved between columns.
 * @param readOnly - When `true`, disables card dragging and applies read-only styling.
 * @returns The Kanban board React element.
 */
export function KanbanBoard({
  initialData,
  onBoardChange,
  readOnly = false,
}: KanbanBoardProps) {
  const [board, setBoard] = useState(initialData);

  useEffect(() => {
    setBoard(initialData);
  }, [initialData]);

  const handleCardDragEnd = (
    card: KanbanCard,
    source?: { fromPosition: number; fromColumnId?: string | number },
    destination?: { toPosition: number; toColumnId?: string | number }
  ) => {
    if (readOnly || !source?.fromColumnId || !destination?.toColumnId) return;

    const newColumns = board.columns.map(col => ({
      ...col,
      cards: [...col.cards]
    }));

    // Find source and destination columns
    const sourceCol = newColumns.find(col => col.id === source.fromColumnId);
    const destCol = newColumns.find(col => col.id === destination.toColumnId);

    if (!sourceCol || !destCol) return;

    // Remove card from source
    const cardIndex = sourceCol.cards.findIndex(c => c.id === card.id);
    if (cardIndex > -1) {
      sourceCol.cards.splice(cardIndex, 1);
    }

    // Add card to destination
    destCol.cards.splice(destination.toPosition, 0, card);

    const newBoard = { columns: newColumns };
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
          cursor: ${readOnly ? "default" : "grab"};
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
          cursor: grabbing !important;
        }
      `}</style>

      <Board
        initialBoard={board}
        onCardDragEnd={handleCardDragEnd}
        disableColumnDrag
        disableCardDrag={readOnly}
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
 * Create a default Kanban board with three empty columns.
 *
 * The board contains columns titled "To Do", "In Progress", and "Done", each with no cards.
 *
 * @returns A `KanbanBoardData` object with the three empty columns
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
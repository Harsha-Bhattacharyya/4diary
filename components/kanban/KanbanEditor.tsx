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
 * Unified Kanban Board Editor Component
 * Single interface combining drag-and-drop with inline editing capabilities
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { KanbanBoardData, KanbanCard, KanbanColumn } from "./Board";

interface KanbanEditorProps {
  initialData: KanbanBoardData;
  onBoardChange: (board: KanbanBoardData) => void;
  readOnly?: boolean;
}

/**
 * Render a unified Kanban board with integrated drag-and-drop and editing capabilities.
 *
 * Provides a single, slick interface for managing cards and columns with:
 * - Drag-and-drop reordering of cards between columns
 * - Inline add/edit/delete for cards
 * - Add/delete columns
 *
 * @param initialData - Initial board data with columns and cards
 * @param onBoardChange - Callback invoked with updated board data after changes
 * @param readOnly - When true, disables all editing controls and drag-and-drop
 * @returns The unified Kanban editor React element
 */
export function KanbanEditor({
  initialData,
  onBoardChange,
  readOnly = false,
}: KanbanEditorProps) {
  const [board, setBoard] = useState(initialData);
  const [isAddingCard, setIsAddingCard] = useState<string | number | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingCard, setEditingCard] = useState<{ columnId: string | number; cardId: string | number } | null>(null);
  const [editCardTitle, setEditCardTitle] = useState("");
  const [editCardDescription, setEditCardDescription] = useState("");

  useEffect(() => {
    setBoard(initialData);
  }, [initialData]);

  const updateBoard = useCallback((newBoard: KanbanBoardData) => {
    setBoard(newBoard);
    onBoardChange(newBoard);
  }, [onBoardChange]);

  // Helper function to determine if a card should have drag disabled
  const isCardDragDisabled = useCallback((cardId: string | number): boolean => {
    return readOnly || editingCard?.cardId === cardId;
  }, [readOnly, editingCard]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newColumns = board.columns.map(col => ({
      ...col,
      cards: [...col.cards]
    }));

    const sourceCol = newColumns.find(col => col.id.toString() === source.droppableId);
    const destCol = newColumns.find(col => col.id.toString() === destination.droppableId);

    if (!sourceCol || !destCol) return;

    // Find and remove the card from source
    const cardIndex = sourceCol.cards.findIndex(c => c.id.toString() === draggableId);
    if (cardIndex === -1) return;
    
    const [movedCard] = sourceCol.cards.splice(cardIndex, 1);

    // Add the card to destination
    destCol.cards.splice(destination.index, 0, movedCard);

    updateBoard({ columns: newColumns });
  };

  const handleAddCard = (columnId: string | number) => {
    if (!newCardTitle.trim()) return;

    const newColumns = board.columns.map((col) => {
      if (col.id === columnId) {
        const newCard: KanbanCard = {
          id: `card-${Date.now()}`,
          title: newCardTitle.trim(),
          description: newCardDescription.trim() || undefined,
        };
        return {
          ...col,
          cards: [...col.cards, newCard],
        };
      }
      return col;
    });

    updateBoard({ columns: newColumns });
    setIsAddingCard(null);
    setNewCardTitle("");
    setNewCardDescription("");
  };

  const handleEditCard = (columnId: string | number, cardId: string | number) => {
    if (!editCardTitle.trim()) return;

    const newColumns = board.columns.map((col) => {
      if (col.id === columnId) {
        const updatedCards = col.cards.map((card) => {
          if (card.id === cardId) {
            return {
              ...card,
              title: editCardTitle.trim(),
              description: editCardDescription.trim() || undefined,
            };
          }
          return card;
        });
        return { ...col, cards: updatedCards };
      }
      return col;
    });

    updateBoard({ columns: newColumns });
    setEditingCard(null);
    setEditCardTitle("");
    setEditCardDescription("");
  };

  const handleDeleteCard = (columnId: string | number, cardId: string | number) => {
    if (!confirm('Delete this card?')) return;

    const newColumns = board.columns.map((col) => {
      if (col.id === columnId) {
        return {
          ...col,
          cards: col.cards.filter((card) => card.id !== cardId),
        };
      }
      return col;
    });

    updateBoard({ columns: newColumns });
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;

    const newColumn: KanbanColumn = {
      id: `col-${Date.now()}`,
      title: newColumnTitle.trim(),
      cards: [],
    };

    updateBoard({
      columns: [...board.columns, newColumn],
    });
    setIsAddingColumn(false);
    setNewColumnTitle("");
  };

  const handleDeleteColumn = (columnId: string | number) => {
    if (!confirm("Are you sure you want to delete this column? All cards in it will be lost.")) {
      return;
    }

    updateBoard({
      columns: board.columns.filter((col) => col.id !== columnId),
    });
  };

  const startEditCard = (columnId: string | number, card: KanbanCard) => {
    setEditingCard({ columnId, cardId: card.id });
    setEditCardTitle(card.title);
    setEditCardDescription(card.description || "");
  };

  // Render card content
  const renderCardContent = (card: KanbanCard, columnId: string | number, isDragging: boolean) => {
    // If this card is being edited, show edit form
    if (editingCard?.columnId === columnId && editingCard?.cardId === card.id) {
      return (
        <div className="unified-card-form" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            className="unified-form-input"
            value={editCardTitle}
            onChange={(e) => setEditCardTitle(e.target.value)}
            placeholder="Card title"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleEditCard(columnId, card.id);
              } else if (e.key === 'Escape') {
                setEditingCard(null);
                setEditCardTitle("");
                setEditCardDescription("");
              }
            }}
          />
          <textarea
            className="unified-form-textarea"
            value={editCardDescription}
            onChange={(e) => setEditCardDescription(e.target.value)}
            placeholder="Description (optional)"
          />
          <div className="unified-form-actions">
            <button
              type="button"
              className="unified-card-btn"
              onClick={() => handleEditCard(columnId, card.id)}
            >
              💾 Save
            </button>
            <button
              type="button"
              className="unified-card-btn"
              onClick={() => {
                setEditingCard(null);
                setEditCardTitle("");
                setEditCardDescription("");
              }}
            >
              ✖️ Cancel
            </button>
          </div>
        </div>
      );
    }

    // Normal card view
    return (
      <div className={`unified-card-content ${isDragging ? 'dragging' : ''}`}>
        <div className="unified-card-title">{card.title}</div>
        {card.description && (
          <div className="unified-card-description">{card.description}</div>
        )}
        {!readOnly && (
          <div className="unified-card-controls">
            <button
              type="button"
              className="unified-card-btn"
              onClick={(e) => {
                e.stopPropagation();
                startEditCard(columnId, card);
              }}
            >
              ✏️ Edit
            </button>
            <button
              type="button"
              className="unified-card-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCard(columnId, card.id);
              }}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="unified-kanban-wrapper">
      <style jsx global>{`
        .unified-kanban-wrapper {
          background: #1A1410;
          min-height: 100vh;
          padding: 1rem;
        }

        /* Board container */
        .unified-board {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding: 1rem 0;
          align-items: flex-start;
        }

        /* Column styling */
        .unified-column {
          background: #2D2416;
          border: 1px solid #8B7355;
          border-radius: 8px;
          min-width: 320px;
          max-width: 320px;
          display: flex;
          flex-direction: column;
        }

        /* Column header */
        .unified-column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #8B7355;
        }

        .unified-column-title {
          font-size: 1rem;
          font-weight: 600;
          color: #E8DCC4;
        }

        .unified-column-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .unified-column-count {
          background: #4D4436;
          color: #C4B8A0;
          padding: 0.125rem 0.5rem;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .unified-column-delete-btn {
          padding: 0.25rem 0.5rem;
          background: transparent;
          color: #C4B8A0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s;
          opacity: 0.6;
        }

        .unified-column-delete-btn:hover {
          background: #8B4513;
          opacity: 1;
        }

        /* Cards container */
        .unified-cards-container {
          flex: 1;
          min-height: 100px;
          padding: 0.5rem;
        }

        /* Card styling */
        .unified-card {
          background: #3D3426;
          border: 1px solid #5D4E3A;
          border-radius: 6px;
          margin-bottom: 0.5rem;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .unified-card.draggable {
          cursor: grab;
        }

        .unified-card.readonly {
          cursor: default;
        }

        .unified-card:hover {
          border-color: #8B7355;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .unified-card.dragging {
          opacity: 0.9;
          cursor: grabbing !important;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
          transform: rotate(2deg);
          border-color: #A08465;
        }

        /* Card content */
        .unified-card-content {
          padding: 0.75rem;
        }

        .unified-card-title {
          color: #E8DCC4;
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
          word-break: break-word;
        }

        .unified-card-description {
          color: #A89880;
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
          word-break: break-word;
          line-height: 1.4;
        }

        .unified-card-controls {
          display: flex;
          gap: 0.25rem;
          padding-top: 0.5rem;
          border-top: 1px solid #4D4436;
          margin-top: 0.5rem;
        }

        .unified-card-btn {
          padding: 0.25rem 0.5rem;
          background: #4D4436;
          color: #C4B8A0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.7rem;
          transition: all 0.2s;
          flex: 1;
        }

        .unified-card-btn:hover {
          background: #6B5539;
          color: #E8DCC4;
        }

        .unified-card-btn.delete:hover {
          background: #8B4513;
        }

        /* Card form (add/edit) */
        .unified-card-form {
          padding: 0.75rem;
        }

        .unified-form-input {
          width: 100%;
          padding: 0.5rem;
          background: #2D2416;
          border: 1px solid #6B5539;
          border-radius: 4px;
          color: #E8DCC4;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
        }

        .unified-form-input:focus {
          outline: none;
          border-color: #8B7355;
        }

        .unified-form-textarea {
          width: 100%;
          padding: 0.5rem;
          background: #2D2416;
          border: 1px solid #6B5539;
          border-radius: 4px;
          color: #E8DCC4;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
          resize: vertical;
          min-height: 60px;
        }

        .unified-form-textarea:focus {
          outline: none;
          border-color: #8B7355;
        }

        .unified-form-actions {
          display: flex;
          gap: 0.5rem;
        }

        /* Add card section */
        .unified-add-card-section {
          padding: 0.5rem;
          border-top: 1px solid #3D3426;
        }

        .unified-add-card-btn {
          width: 100%;
          padding: 0.5rem;
          background: transparent;
          color: #8B7355;
          border: 1px dashed #5D4E3A;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.85rem;
        }

        .unified-add-card-btn:hover {
          background: #3D3426;
          border-color: #8B7355;
          color: #E8DCC4;
        }

        .unified-add-card-form {
          background: #3D3426;
          border: 1px solid #6B5539;
          border-radius: 6px;
          padding: 0.75rem;
        }

        /* Add column section */
        .unified-add-column-wrapper {
          min-width: 320px;
          max-width: 320px;
          align-self: flex-start;
        }

        .unified-add-column-btn {
          width: 100%;
          padding: 1rem;
          background: transparent;
          color: #8B7355;
          border: 2px dashed #5D4E3A;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .unified-add-column-btn:hover {
          background: #2D2416;
          border-color: #8B7355;
          color: #E8DCC4;
        }

        .unified-add-column-form {
          background: #2D2416;
          border: 1px solid #8B7355;
          border-radius: 8px;
          padding: 1rem;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .unified-column {
            min-width: 280px;
            max-width: 280px;
          }

          .unified-add-column-wrapper {
            min-width: 280px;
            max-width: 280px;
          }
        }
      `}</style>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="unified-board">
          {board.columns.map((column) => (
            <div key={column.id} className="unified-column">
              {/* Column Header */}
              <div className="unified-column-header">
                <span className="unified-column-title">{column.title}</span>
                <div className="unified-column-actions">
                  <span className="unified-column-count">{column.cards.length}</span>
                  {!readOnly && board.columns.length > 1 && (
                    <button
                      type="button"
                      className="unified-column-delete-btn"
                      onClick={() => handleDeleteColumn(column.id)}
                      title="Delete column"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {/* Droppable Cards Area */}
              <Droppable droppableId={column.id.toString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="unified-cards-container"
                    style={{
                      background: snapshot.isDraggingOver ? '#3D3426' : 'transparent',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    {column.cards.map((card, index) => {
                      const dragDisabled = isCardDragDisabled(card.id);
                      return (
                        <Draggable
                          key={card.id.toString()}
                          draggableId={card.id.toString()}
                          index={index}
                          isDragDisabled={dragDisabled}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`unified-card ${snapshot.isDragging ? 'dragging' : ''} ${dragDisabled ? 'readonly' : 'draggable'}`}
                            >
                              {renderCardContent(card, column.id, snapshot.isDragging)}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Add Card Section - Inside the column */}
              {!readOnly && (
                <div className="unified-add-card-section">
                  {isAddingCard === column.id ? (
                    <div className="unified-add-card-form">
                      <input
                        type="text"
                        className="unified-form-input"
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        placeholder="Enter card title..."
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddCard(column.id);
                          } else if (e.key === 'Escape') {
                            setIsAddingCard(null);
                            setNewCardTitle("");
                            setNewCardDescription("");
                          }
                        }}
                      />
                      <textarea
                        className="unified-form-textarea"
                        value={newCardDescription}
                        onChange={(e) => setNewCardDescription(e.target.value)}
                        placeholder="Description (optional)"
                      />
                      <div className="unified-form-actions">
                        <button
                          type="button"
                          className="unified-card-btn"
                          onClick={() => handleAddCard(column.id)}
                        >
                          ➕ Add Card
                        </button>
                        <button
                          type="button"
                          className="unified-card-btn"
                          onClick={() => {
                            setIsAddingCard(null);
                            setNewCardTitle("");
                            setNewCardDescription("");
                          }}
                        >
                          ✖️ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="unified-add-card-btn"
                      onClick={() => setIsAddingCard(column.id)}
                    >
                      ➕ Add Card
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add Column Section */}
          {!readOnly && (
            <div className="unified-add-column-wrapper">
              {isAddingColumn ? (
                <div className="unified-add-column-form">
                  <input
                    type="text"
                    className="unified-form-input"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Enter column title..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddColumn();
                      } else if (e.key === 'Escape') {
                        setIsAddingColumn(false);
                        setNewColumnTitle("");
                      }
                    }}
                  />
                  <div className="unified-form-actions">
                    <button
                      type="button"
                      className="unified-card-btn"
                      onClick={handleAddColumn}
                    >
                      ➕ Add Column
                    </button>
                    <button
                      type="button"
                      className="unified-card-btn"
                      onClick={() => {
                        setIsAddingColumn(false);
                        setNewColumnTitle("");
                      }}
                    >
                      ✖️ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="unified-add-column-btn"
                  onClick={() => setIsAddingColumn(true)}
                >
                  ➕ Add Column
                </button>
              )}
            </div>
          )}
        </div>
      </DragDropContext>
    </div>
  );
}

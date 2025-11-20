/**
 * Enhanced Kanban Board Editor Component
 * Allows adding, editing, and deleting cards and columns
 */

"use client";

import React, { useState } from "react";
import { KanbanBoard, KanbanBoardData, KanbanCard, KanbanColumn } from "./Board";

interface KanbanEditorProps {
  initialData: KanbanBoardData;
  onBoardChange: (board: KanbanBoardData) => void;
  readOnly?: boolean;
}

/**
 * Render an enhanced Kanban board with editor controls for managing cards and columns.
 *
 * Provides UI for adding/editing/deleting cards and columns, and wraps the base KanbanBoard
 * with additional editing capabilities.
 *
 * @param initialData - Initial board data with columns and cards
 * @param onBoardChange - Callback invoked with updated board data after changes
 * @param readOnly - When true, disables all editing controls
 * @returns The enhanced Kanban editor React element
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

  const handleBoardChange = (newBoard: KanbanBoardData) => {
    setBoard(newBoard);
    onBoardChange(newBoard);
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

    const newBoard = { columns: newColumns };
    setBoard(newBoard);
    onBoardChange(newBoard);
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

    const newBoard = { columns: newColumns };
    setBoard(newBoard);
    onBoardChange(newBoard);
    setEditingCard(null);
    setEditCardTitle("");
    setEditCardDescription("");
  };

  const handleDeleteCard = (columnId: string | number, cardId: string | number) => {
    const newColumns = board.columns.map((col) => {
      if (col.id === columnId) {
        return {
          ...col,
          cards: col.cards.filter((card) => card.id !== cardId),
        };
      }
      return col;
    });

    const newBoard = { columns: newColumns };
    setBoard(newBoard);
    onBoardChange(newBoard);
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;

    const newColumn: KanbanColumn = {
      id: `col-${Date.now()}`,
      title: newColumnTitle.trim(),
      cards: [],
    };

    const newBoard = {
      columns: [...board.columns, newColumn],
    };

    setBoard(newBoard);
    onBoardChange(newBoard);
    setIsAddingColumn(false);
    setNewColumnTitle("");
  };

  const handleDeleteColumn = (columnId: string | number) => {
    if (!confirm("Are you sure you want to delete this column? All cards in it will be lost.")) {
      return;
    }

    const newBoard = {
      columns: board.columns.filter((col) => col.id !== columnId),
    };

    setBoard(newBoard);
    onBoardChange(newBoard);
  };

  const startEditCard = (columnId: string | number, card: KanbanCard) => {
    setEditingCard({ columnId, cardId: card.id });
    setEditCardTitle(card.title);
    setEditCardDescription(card.description || "");
  };

  return (
    <div className="kanban-editor-wrapper">
      <style jsx global>{`
        .kanban-editor-wrapper {
          background: #1A1410;
          min-height: 100vh;
        }

        .editor-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: #2D2416;
          border: 1px solid #8B7355;
          border-radius: 8px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .editor-button {
          padding: 0.5rem 1rem;
          background: #6B5539;
          color: #E8DCC4;
          border: 1px solid #8B7355;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .editor-button:hover {
          background: #8B7355;
        }

        .editor-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .column-delete-btn {
          padding: 0.25rem 0.5rem;
          background: #8B4513;
          color: #E8DCC4;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s;
          margin-left: 0.5rem;
        }

        .column-delete-btn:hover {
          background: #A0522D;
        }

        .card-controls {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #8B7355;
        }

        .card-btn {
          padding: 0.25rem 0.5rem;
          background: #6B5539;
          color: #E8DCC4;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s;
        }

        .card-btn:hover {
          background: #8B7355;
        }

        .card-btn.delete {
          background: #8B4513;
        }

        .card-btn.delete:hover {
          background: #A0522D;
        }

        .add-card-form {
          background: #3D3426;
          border: 1px solid #8B7355;
          border-radius: 6px;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .form-input {
          width: 100%;
          padding: 0.5rem;
          background: #2D2416;
          border: 1px solid #8B7355;
          border-radius: 4px;
          color: #E8DCC4;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .form-textarea {
          width: 100%;
          padding: 0.5rem;
          background: #2D2416;
          border: 1px solid #8B7355;
          border-radius: 4px;
          color: #E8DCC4;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          resize: vertical;
          min-height: 60px;
        }

        .form-actions {
          display: flex;
          gap: 0.5rem;
        }

        .add-card-btn {
          width: 100%;
          padding: 0.5rem;
          background: #4D4436;
          color: #C4B8A0;
          border: 1px dashed #8B7355;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .add-card-btn:hover {
          background: #5D5446;
          border-color: #A08465;
        }

        .react-kanban-column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      `}</style>

      {!readOnly && (
        <div className="editor-controls">
          <button
            type="button"
            className="editor-button"
            onClick={() => setIsAddingColumn(true)}
          >
            ➕ Add Column
          </button>
        </div>
      )}

      <KanbanBoard
        initialData={board}
        onBoardChange={handleBoardChange}
        readOnly={readOnly}
        renderCard={(card: KanbanCard, columnId?: string | number) => (
          <div>
            {editingCard?.columnId === columnId && editingCard?.cardId === card.id ? (
              <div className="add-card-form" style={{ marginBottom: 0 }}>
                <input
                  type="text"
                  className="form-input"
                  value={editCardTitle}
                  onChange={(e) => setEditCardTitle(e.target.value)}
                  placeholder="Card title"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleEditCard(columnId!, card.id);
                    } else if (e.key === 'Escape') {
                      setEditingCard(null);
                      setEditCardTitle("");
                      setEditCardDescription("");
                    }
                  }}
                />
                <textarea
                  className="form-textarea"
                  value={editCardDescription}
                  onChange={(e) => setEditCardDescription(e.target.value)}
                  placeholder="Description (optional)"
                />
                <div className="form-actions">
                  <button
                    type="button"
                    className="card-btn"
                    onClick={() => handleEditCard(columnId!, card.id)}
                  >
                    💾 Save
                  </button>
                  <button
                    type="button"
                    className="card-btn"
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
            ) : (
              <>
                <div className="react-kanban-card__title">{card.title}</div>
                {card.description && (
                  <div className="react-kanban-card__description">
                    {card.description}
                  </div>
                )}
                {!readOnly && (
                  <div className="card-controls">
                    <button
                      type="button"
                      className="card-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditCard(columnId!, card);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="card-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this card?')) {
                          handleDeleteCard(columnId!, card.id);
                        }
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        renderColumnHeader={(column: KanbanColumn) => (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{column.title}</span>
            {!readOnly && board.columns.length > 1 && (
              <button
                type="button"
                className="column-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteColumn(column.id);
                }}
                title="Delete column"
              >
                🗑️
              </button>
            )}
          </div>
        )}
        renderColumnAddon={(columnId: string | number) => (
          <>
            {!readOnly && (
              <>
                {isAddingCard === columnId ? (
                  <div className="add-card-form">
                    <input
                      type="text"
                      className="form-input"
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      placeholder="Card title"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddCard(columnId);
                        } else if (e.key === 'Escape') {
                          setIsAddingCard(null);
                          setNewCardTitle("");
                          setNewCardDescription("");
                        }
                      }}
                    />
                    <textarea
                      className="form-textarea"
                      value={newCardDescription}
                      onChange={(e) => setNewCardDescription(e.target.value)}
                      placeholder="Description (optional)"
                    />
                    <div className="form-actions">
                      <button
                        type="button"
                        className="card-btn"
                        onClick={() => handleAddCard(columnId)}
                      >
                        ➕ Add
                      </button>
                      <button
                        type="button"
                        className="card-btn"
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
                    className="add-card-btn"
                    onClick={() => setIsAddingCard(columnId)}
                  >
                    ➕ Add Card
                  </button>
                )}
              </>
            )}
            {!readOnly && isAddingColumn && columnId === board.columns[board.columns.length - 1].id && (
              <div style={{ position: 'absolute', left: '100%', top: 0, marginLeft: '1rem', width: '300px' }}>
                <div className="add-card-form">
                  <input
                    type="text"
                    className="form-input"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Column title"
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
                  <div className="form-actions">
                    <button
                      type="button"
                      className="card-btn"
                      onClick={handleAddColumn}
                    >
                      ➕ Add Column
                    </button>
                    <button
                      type="button"
                      className="card-btn"
                      onClick={() => {
                        setIsAddingColumn(false);
                        setNewColumnTitle("");
                      }}
                    >
                      ✖️ Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      />
    </div>
  );
}

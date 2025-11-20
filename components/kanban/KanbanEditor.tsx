/**
 * Enhanced Kanban Board Editor Component
 * Allows adding, editing, and deleting cards and columns
 */

"use client";

import React, { useState, useEffect } from "react";
import { KanbanBoard, KanbanBoardData, KanbanCard, KanbanColumn } from "./Board";

interface KanbanEditorProps {
  initialData: KanbanBoardData;
  onBoardChange: (board: KanbanBoardData) => void;
  readOnly?: boolean;
}

/**
 * Render an enhanced Kanban board with editor controls for managing cards and columns.
 *
 * Provides UI for adding/editing/deleting cards and columns using a custom implementation
 * that integrates with the drag-and-drop KanbanBoard component.
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

  useEffect(() => {
    setBoard(initialData);
  }, [initialData]);

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
          padding: 1rem;
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

        .custom-board-container {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding: 1rem 0;
        }

        .custom-column {
          background: #2D2416;
          border: 1px solid #8B7355;
          border-radius: 8px;
          min-width: 300px;
          max-width: 300px;
          padding: 1rem;
        }

        .custom-column-header {
          font-size: 1.125rem;
          font-weight: 600;
          color: #E8DCC4;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #8B7355;
          display: flex;
          justify-content: space-between;
          align-items: center;
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
        }

        .column-delete-btn:hover {
          background: #A0522D;
        }

        .custom-card {
          background: #3D3426;
          border: 1px solid #8B7355;
          border-radius: 6px;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .custom-card-title {
          color: #E8DCC4;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .custom-card-description {
          color: #C4B8A0;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .card-controls {
          display: flex;
          gap: 0.5rem;
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

      <div className="custom-board-container">
        {/* Render columns with editing capabilities */}
        {board.columns.map((column) => (
          <div key={column.id} className="custom-column">
            <div className="custom-column-header">
              <span>{column.title}</span>
              {!readOnly && board.columns.length > 1 && (
                <button
                  type="button"
                  className="column-delete-btn"
                  onClick={() => handleDeleteColumn(column.id)}
                  title="Delete column"
                >
                  🗑️
                </button>
              )}
            </div>

            {/* Render cards */}
            {column.cards.map((card) => (
              <div key={card.id}>
                {editingCard?.columnId === column.id && editingCard?.cardId === card.id ? (
                  <div className="add-card-form">
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
                          handleEditCard(column.id, card.id);
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
                        onClick={() => handleEditCard(column.id, card.id)}
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
                  <div className="custom-card">
                    <div className="custom-card-title">{card.title}</div>
                    {card.description && (
                      <div className="custom-card-description">
                        {card.description}
                      </div>
                    )}
                    {!readOnly && (
                      <div className="card-controls">
                        <button
                          type="button"
                          className="card-btn"
                          onClick={() => startEditCard(column.id, card)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="card-btn delete"
                          onClick={() => handleDeleteCard(column.id, card.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Add card button/form */}
            {!readOnly && (
              <>
                {isAddingCard === column.id ? (
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
                          handleAddCard(column.id);
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
                        onClick={() => handleAddCard(column.id)}
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
                    onClick={() => setIsAddingCard(column.id)}
                  >
                    ➕ Add Card
                  </button>
                )}
              </>
            )}
          </div>
        ))}

        {/* Add column button/form */}
        {!readOnly && isAddingColumn && (
          <div className="custom-column">
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

        {!readOnly && !isAddingColumn && (
          <div className="custom-column" style={{ minHeight: 'fit-content' }}>
            <button
              type="button"
              className="add-card-btn"
              onClick={() => setIsAddingColumn(true)}
            >
              ➕ Add Column
            </button>
          </div>
        )}
      </div>

      {/* Render the draggable board below for drag-and-drop functionality */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ 
          padding: '1rem', 
          background: '#2D2416', 
          border: '1px solid #8B7355', 
          borderRadius: '8px',
          marginBottom: '1rem',
          color: '#E8DCC4'
        }}>
          <strong>💡 Tip:</strong> Use the controls above to add/edit cards and columns. The board below supports drag-and-drop to reorder cards between columns.
        </div>
        <KanbanBoard
          initialData={board}
          onBoardChange={handleBoardChange}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}

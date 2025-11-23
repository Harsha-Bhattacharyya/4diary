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
 * Sidebar component for workspace navigation
 * Displays list of documents with folders, starring, and drag-and-drop reordering
 */

"use client";

import React, { useState } from "react";

interface Document {
  id: string;
  title: string;
  folder?: string;
  favorite?: boolean;
  sortOrder?: number;
}

interface SidebarProps {
  workspaceId?: string;
  documents: Document[];
  onDocumentClick: (docId: string) => void;
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
  onToggleFavorite?: (docId: string, favorite: boolean) => void;
  onReorder?: (docId: string, newOrder: number) => void;
}

/**
 * Render the workspace sidebar that groups documents by folder and provides document selection and collapse/expand controls.
 *
 * When a document has no `folder` it appears under "Unfiled". In the expanded state the sidebar shows folder headers with document rows; in the collapsed state it displays up to five document icon buttons.
 * 
 * Starred documents appear at the top. Documents can be reordered via drag and drop.
 *
 * @param documents - The list of documents to display; each document may include optional `folder`, `favorite`, and `sortOrder` properties.
 * @param onDocumentClick - Called with a document's `id` when the user selects that document.
 * @param collapsed - Whether the sidebar is currently collapsed.
 * @param onToggle - Called with the updated `collapsed` value when the user toggles the sidebar.
 * @param onToggleFavorite - Called with document ID and new favorite state when user stars/unstars a document.
 * @param onReorder - Called with document ID and new sort order when user reorders documents.
 * @returns The React element rendering the sidebar UI.
 */
export default function Sidebar({
  documents,
  onDocumentClick,
  collapsed,
  onToggle,
  onToggleFavorite,
  onReorder,
}: SidebarProps) {
  const [draggedDoc, setDraggedDoc] = useState<string | null>(null);
  const [dragOverDoc, setDragOverDoc] = useState<string | null>(null);

  // Sort documents: starred first, then by sortOrder, then by title
  const sortedDocs = [...documents].sort((a, b) => {
    // Starred documents first
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    
    // Then by sortOrder if available
    if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
      return a.sortOrder - b.sortOrder;
    }
    if (a.sortOrder !== undefined) return -1;
    if (b.sortOrder !== undefined) return 1;
    
    // Finally by title
    return a.title.localeCompare(b.title);
  });

  // Group documents by folder
  const groupedDocs = sortedDocs.reduce(
    (acc, doc) => {
      const folder = doc.folder || "Unfiled";
      if (!acc[folder]) {
        acc[folder] = [];
      }
      acc[folder].push(doc);
      return acc;
    },
    {} as Record<string, Document[]>
  );

  const handleDragStart = (e: React.DragEvent, docId: string) => {
    setDraggedDoc(docId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, docId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDoc(docId);
  };

  const handleDragLeave = () => {
    setDragOverDoc(null);
  };

  const handleDrop = (e: React.DragEvent, targetDocId: string) => {
    e.preventDefault();
    setDragOverDoc(null);

    if (!draggedDoc || draggedDoc === targetDocId || !onReorder) return;

    // Find the indices in the sorted array
    const draggedIndex = sortedDocs.findIndex(d => d.id === draggedDoc);
    const targetIndex = sortedDocs.findIndex(d => d.id === targetDocId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Calculate new sort order - place before or after target
    const newSortOrder = targetIndex * 1000;
    onReorder(draggedDoc, newSortOrder);

    setDraggedDoc(null);
  };

  const handleDragEnd = () => {
    setDraggedDoc(null);
    setDragOverDoc(null);
  };

  const handleStarClick = (e: React.MouseEvent, docId: string, currentFavorite: boolean) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(docId, !currentFavorite);
    }
  };

  return (
    <div
      className={`fixed left-0 top-0 h-screen transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } ${
        collapsed ? "z-10" : "z-40"
      } bg-[#2D2416]/80 backdrop-blur-md border-r border-[#8B7355]/30 shadow-2xl`}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#8B7355] flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-[#E8DCC4]">Workspace</h2>
        )}
        <button
          type="button"
          onClick={() => onToggle(!collapsed)}
          className="text-[#E8DCC4] hover:text-[#C4B8A0] transition-colors p-2"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {collapsed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Documents List */}
      {!collapsed && (
        <div className="overflow-y-auto h-[calc(100vh-5rem)] p-2">
          {Object.keys(groupedDocs).length === 0 ? (
            <div className="p-4 text-center text-[#A08465]">
              <p className="text-sm">No documents yet</p>
            </div>
          ) : (
            Object.entries(groupedDocs).map(([folder, docs]) => (
              <div key={folder} className="mb-4">
                {/* Folder Header */}
                <div className="px-2 py-1 text-xs font-semibold text-[#A08465] uppercase">
                  {folder}
                </div>

                {/* Documents in Folder */}
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    draggable={!!onReorder}
                    onDragStart={(e) => handleDragStart(e, doc.id)}
                    onDragOver={(e) => handleDragOver(e, doc.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, doc.id)}
                    onDragEnd={handleDragEnd}
                    className={`w-full rounded-md transition-all ${
                      dragOverDoc === doc.id ? 'border-2 border-[#8B7355] bg-[#3D3426]/50' : ''
                    } ${draggedDoc === doc.id ? 'opacity-50' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => onDocumentClick(doc.id)}
                      className="w-full text-left px-3 py-2 text-[#E8DCC4] hover:bg-[#3D3426] transition-colors flex items-center gap-2 rounded-md"
                    >
                      {/* Star icon */}
                      {onToggleFavorite && (
                        <button
                          type="button"
                          onClick={(e) => handleStarClick(e, doc.id, doc.favorite || false)}
                          className="flex-shrink-0 text-base hover:scale-110 transition-transform"
                          aria-label={doc.favorite ? "Unstar" : "Star"}
                          title={doc.favorite ? "Unstar" : "Star"}
                        >
                          {doc.favorite ? "⭐" : "☆"}
                        </button>
                      )}
                      
                      <span className="text-sm">📄</span>
                      <span className="text-sm truncate flex-1">{doc.title}</span>
                      
                      {/* Drag handle */}
                      {onReorder && (
                        <span className="text-xs text-[#A08465] opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                          ⋮⋮
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* Collapsed view - just icons with star indicator */}
      {collapsed && (
        <div className="p-2 flex flex-col items-center gap-2">
          {sortedDocs.slice(0, 5).map((doc) => (
            <button
              type="button"
              key={doc.id}
              onClick={() => onDocumentClick(doc.id)}
              className="w-10 h-10 flex items-center justify-center rounded-md text-[#E8DCC4] hover:bg-[#3D3426] transition-colors relative"
              title={doc.title}
              aria-label={doc.title}
            >
              📄
              {doc.favorite && (
                <span className="absolute top-0 right-0 text-xs">⭐</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
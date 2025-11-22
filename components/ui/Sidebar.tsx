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
 * Displays list of documents with folders
 */

"use client";

import React from "react";

interface Document {
  id: string;
  title: string;
  folder?: string;
}

interface SidebarProps {
  workspaceId?: string;
  documents: Document[];
  onDocumentClick: (docId: string) => void;
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

/**
 * Render the workspace sidebar that groups documents by folder and provides document selection and collapse/expand controls.
 *
 * When a document has no `folder` it appears under "Unfiled". In the expanded state the sidebar shows folder headers with document rows; in the collapsed state it displays up to five document icon buttons.
 *
 * @param documents - The list of documents to display; each document may include an optional `folder` property.
 * @param onDocumentClick - Called with a document's `id` when the user selects that document.
 * @param collapsed - Whether the sidebar is currently collapsed.
 * @param onToggle - Called with the updated `collapsed` value when the user toggles the sidebar.
 * @returns The React element rendering the sidebar UI.
 */
export default function Sidebar({
  documents,
  onDocumentClick,
  collapsed,
  onToggle,
}: SidebarProps) {
  // Group documents by folder
  const groupedDocs = documents.reduce(
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
                  <button
                    type="button"
                    key={doc.id}
                    onClick={() => onDocumentClick(doc.id)}
                    className="w-full text-left px-3 py-2 rounded-md text-[#E8DCC4] hover:bg-[#3D3426] transition-colors flex items-center gap-2"
                  >
                    <span className="text-sm">📄</span>
                    <span className="text-sm truncate">{doc.title}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* Collapsed view - just icons */}
      {collapsed && (
        <div className="p-2 flex flex-col items-center gap-2">
          {documents.slice(0, 5).map((doc) => (
            <button
              type="button"
              key={doc.id}
              onClick={() => onDocumentClick(doc.id)}
              className="w-10 h-10 flex items-center justify-center rounded-md text-[#E8DCC4] hover:bg-[#3D3426] transition-colors"
              title={doc.title}
              aria-label={doc.title}
            >
              📄
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
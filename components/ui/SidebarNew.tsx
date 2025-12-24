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
 * Revamped Sidebar component using shadcn/ui
 * Features:
 * - User profile section with avatar and initials
 * - Current date display
 * - Navigation to other pages
 * - Documents and folders list
 * - Drag and drop reordering
 * - Star/favorite documents
 */

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight,
  Home,
  BookOpen,
  FileText,
  Settings,
  Star,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

interface Document {
  id: string;
  title: string;
  folder?: string;
  favorite?: boolean;
  sortOrder?: number;
  tags?: string[];
  emojiIcon?: string;
}

interface SidebarNewProps {
  workspaceId?: string;
  documents: Document[];
  onDocumentClick: (docId: string) => void;
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
  onToggleFavorite?: (docId: string, favorite: boolean) => void;
  onReorder?: (docId: string, newOrder: number) => void;
  userEmail?: string;
}

/**
 * Render the enhanced workspace sidebar with user profile, date, navigation, and documents.
 */
export default function SidebarNew({
  documents,
  onDocumentClick,
  collapsed,
  onToggle,
  onToggleFavorite,
  onReorder,
  userEmail,
}: SidebarNewProps) {
  const [draggedDoc, setDraggedDoc] = useState<string | null>(null);
  const [dragOverDoc, setDragOverDoc] = useState<string | null>(null);

  // Get user initials from email
  const userInitials = useMemo(() => {
    if (!userEmail) return "U";
    const name = userEmail.split('@')[0];
    const parts = name.split(/[._-]/).filter(p => p.length > 0);
    if (parts.length >= 2 && parts[0].length > 0 && parts[1].length > 0) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, [userEmail]);

  // Get username from email
  const username = useMemo(() => {
    if (!userEmail) return "User";
    return userEmail.split('@')[0];
  }, [userEmail]);

  // Get current date formatted
  const currentDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  // Sort documents: starred first, then by sortOrder, then by title
  const sortedDocs = useMemo(() => {
    return [...documents].sort((a, b) => {
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
  }, [documents]);

  // Group documents by folder
  const groupedDocs = useMemo(() => {
    return sortedDocs.reduce((acc, doc) => {
      const folder = doc.folder || "Unfiled";
      if (!acc[folder]) {
        acc[folder] = [];
      }
      acc[folder].push(doc);
      return acc;
    }, {} as Record<string, Document[]>);
  }, [sortedDocs]);

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

    // Calculate new sort order - place between target and its neighbor
    const targetDoc = sortedDocs[targetIndex];
    const prevDoc = sortedDocs[targetIndex - 1];
    const targetOrder = targetDoc.sortOrder ?? targetIndex * 1000;
    const prevOrder = prevDoc?.sortOrder ?? (targetIndex - 1) * 1000;
    const newSortOrder = Math.floor((prevOrder + targetOrder) / 2);
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
      className={cn(
        "fixed left-0 top-0 h-screen transition-all duration-300 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col",
        collapsed ? "w-16 z-10" : "w-80 z-[1000]"
      )}
    >
      {/* Header with Toggle */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between flex-shrink-0">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Workspace
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggle(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
          <span className="sr-only">{collapsed ? "Expand" : "Collapse"} sidebar</span>
        </Button>
      </div>

      {/* User Profile Section */}
      {!collapsed && (
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-12 w-12 bg-neutral-900 dark:bg-neutral-50">
              <AvatarFallback className="bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900 font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50 truncate">
                {username}
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                {userEmail}
              </p>
            </div>
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
            <Icon icon="flat-color-icons:calendar" width={16} height={16} /> {currentDate}
          </div>
        </div>
      )}

      {/* Navigation Section */}
      {!collapsed && (
        <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <nav className="space-y-1">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link href="/workspace">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Workspace
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </nav>
        </div>
      )}

      {/* Collapsed view - just icons */}
      {collapsed && (
        <div className="p-2 flex flex-col items-center gap-2 flex-shrink-0">
          {sortedDocs.slice(0, 5).map((doc) => (
            <Button
              key={doc.id}
              variant="ghost"
              size="icon"
              onClick={() => onDocumentClick(doc.id)}
              className="relative"
              title={doc.title}
            >
              <Icon 
                icon={`flat-color-icons:${doc.emojiIcon || "document"}`} 
                width={20} 
                height={20} 
              />
              {doc.favorite && (
                <Star className="absolute top-0 right-0 h-3 w-3 fill-yellow-500 text-yellow-500" />
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Documents List */}
      {!collapsed && (
        <div className="overflow-y-auto flex-1 p-2">
          {Object.keys(groupedDocs).length === 0 ? (
            <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
              <p className="text-sm">No documents yet</p>
            </div>
          ) : (
            Object.entries(groupedDocs).map(([folder, docs]) => (
              <div key={folder} className="mb-4">
                {/* Folder Header */}
                <div className="px-2 py-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wide flex items-center gap-1">
                  <Icon icon="flat-color-icons:opened-folder" width={16} height={16} /> {folder}
                </div>

                {/* Documents in Folder */}
                <div className="space-y-1">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      role="listitem"
                      draggable={!!onReorder}
                      onDragStart={(e) => handleDragStart(e, doc.id)}
                      onDragOver={(e) => handleDragOver(e, doc.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, doc.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "group relative rounded-md transition-all",
                        dragOverDoc === doc.id && "border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900",
                        draggedDoc === doc.id && "opacity-50"
                      )}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto py-2"
                        onClick={() => onDocumentClick(doc.id)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          {/* Drag handle */}
                          {onReorder && (
                            <GripVertical className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-move" />
                          )}
                          
                          {/* Star icon */}
                          {onToggleFavorite && (
                            <button
                              type="button"
                              onClick={(e) => handleStarClick(e, doc.id, doc.favorite || false)}
                              className="flex-shrink-0"
                              aria-label={doc.favorite ? "Unstar" : "Star"}
                            >
                              <Star 
                                className={cn(
                                  "h-4 w-4",
                                  doc.favorite ? "fill-yellow-500 text-yellow-500" : "text-neutral-400"
                                )}
                              />
                            </button>
                          )}
                          
                          {/* Document icon - use selected icon or default */}
                          <Icon 
                            icon={`flat-color-icons:${doc.emojiIcon || "document"}`} 
                            width={16} 
                            height={16} 
                            className="flex-shrink-0"
                          />
                          <span className="text-sm truncate flex-1 text-left">{doc.title}</span>
                        </div>
                      </Button>
                      
                      {/* Tags display under document name */}
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 px-10 pb-2">
                          {doc.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-block px-1.5 py-0.5 text-[10px] bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center flex items-center justify-center gap-1">
            <Icon icon="flat-color-icons:data-encryption" width={16} height={16} /> End-to-end encrypted
          </p>
        </div>
      )}
    </div>
  );
}

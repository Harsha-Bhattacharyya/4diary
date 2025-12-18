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

import React, { useState, useEffect, useRef, useMemo } from "react";
import GlassCard from "./GlassCard";
import { X, Search, FileText, Tag, Folder, Calendar } from "lucide-react";
import type { Document } from "@/lib/documentService";

interface SearchModalProps {
  documents: Document[];
  onClose: () => void;
  onSelectDocument: (doc: Document) => void;
}

type SearchFilter = "all" | "title" | "content" | "tags" | "folder";

interface SearchResult {
  doc: Document;
  score: number;
  highlights: {
    title?: number[];
    content?: number[];
    tags?: number[];
    folder?: number[];
  };
}

/**
 * A powerful search modal with fuzzy matching and filtering.
 * Supports searching by title, content, tags, and folders.
 * 
 * @param documents - Array of documents to search
 * @param onClose - Callback when closing the modal
 * @param onSelectDocument - Callback when selecting a document
 */
export default function SearchModal({ 
  documents, 
  onClose, 
  onSelectDocument 
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input when component mounts
    inputRef.current?.focus();
  }, []);

  // Fuzzy match function
  // Fuzzy match scoring constants
  const SCORE_EXACT_MATCH = 1000;
  const SCORE_CONSECUTIVE_BONUS = 5;
  const SCORE_WORD_START_BONUS = 3;
  const SCORE_BASE = 1;

  const fuzzyMatch = (text: string, search: string): { matches: boolean; score: number; highlights: number[] } => {
    if (!search) return { matches: true, score: 0, highlights: [] };
    
    const searchLower = search.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact match gets highest score
    if (textLower.includes(searchLower)) {
      const index = textLower.indexOf(searchLower);
      const highlights = Array.from({ length: search.length }, (_, i) => index + i);
      return { matches: true, score: SCORE_EXACT_MATCH, highlights };
    }
    
    // Fuzzy match
    let searchIndex = 0;
    let textIndex = 0;
    let score = 0;
    const highlights: number[] = [];
    let lastMatchIndex = -1;
    
    while (searchIndex < searchLower.length && textIndex < textLower.length) {
      if (searchLower[searchIndex] === textLower[textIndex]) {
        highlights.push(textIndex);
        
        // Bonus for consecutive matches
        if (lastMatchIndex === textIndex - 1) {
          score += SCORE_CONSECUTIVE_BONUS;
        }
        
        // Bonus for start of word
        if (textIndex === 0 || textLower[textIndex - 1] === ' ') {
          score += SCORE_WORD_START_BONUS;
        }
        
        score += SCORE_BASE;
        lastMatchIndex = textIndex;
        searchIndex++;
      }
      textIndex++;
    }
    
    const matches = searchIndex === searchLower.length;
    return { matches, score, highlights };
  };

  // Extract text content from document content
  const extractTextContent = (content: unknown[]): string => {
    if (!content || !Array.isArray(content)) return "";
    
    const texts: string[] = [];
    const queue = [...content];
    
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item || typeof item !== "object") continue;
      
      const obj = item as Record<string, unknown>;
      
      if (obj.text && typeof obj.text === "string") {
        texts.push(obj.text);
      }
      
      if (Array.isArray(obj.content)) {
        queue.push(...obj.content);
      }
      
      if (Array.isArray(obj.children)) {
        queue.push(...obj.children);
      }
    }
    
    return texts.join(" ");
  };

  // Search and filter documents
  const searchResults = useMemo((): SearchResult[] => {
    if (!query.trim()) {
      return documents.map(doc => ({ doc, score: 0, highlights: {} }));
    }

    const results = documents
      .map((doc): SearchResult | null => {
        let totalScore = 0;
        const highlights: SearchResult['highlights'] = {};

        // Search in title
        if (filter === "all" || filter === "title") {
          const titleMatch = fuzzyMatch(doc.metadata?.title || "", query);
          if (titleMatch.matches) {
            totalScore += titleMatch.score * 3; // Title matches are most important
            highlights.title = titleMatch.highlights;
          } else if (filter === "title") {
            return null; // If filtering by title only, skip non-matches
          }
        }

        // Search in content
        if (filter === "all" || filter === "content") {
          const textContent = extractTextContent(doc.content);
          const contentMatch = fuzzyMatch(textContent, query);
          if (contentMatch.matches) {
            totalScore += contentMatch.score;
            highlights.content = contentMatch.highlights;
          } else if (filter === "content") {
            return null;
          }
        }

        // Search in tags
        if (filter === "all" || filter === "tags") {
          const tags = doc.metadata?.tags || [];
          for (const tag of tags) {
            const tagMatch = fuzzyMatch(tag, query);
            if (tagMatch.matches) {
              totalScore += tagMatch.score * 2;
              highlights.tags = highlights.tags || [];
              highlights.tags.push(...tagMatch.highlights);
            }
          }
          if (filter === "tags" && totalScore === 0) {
            return null;
          }
        }

        // Search in folder
        if (filter === "all" || filter === "folder") {
          const folder = doc.metadata?.folder || "";
          const folderMatch = fuzzyMatch(folder, query);
          if (folderMatch.matches) {
            totalScore += folderMatch.score * 2;
            highlights.folder = folderMatch.highlights;
          } else if (filter === "folder") {
            return null;
          }
        }

        // If no matches found in any field, exclude the document
        if (totalScore === 0) {
          return null;
        }

        return { doc, score: totalScore, highlights };
      })
      .filter((result): result is NonNullable<typeof result> => result !== null)
      .sort((a, b) => b.score - a.score);

    return results;
  }, [documents, query, filter]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && searchResults[selectedIndex]) {
      e.preventDefault();
      onSelectDocument(searchResults[selectedIndex].doc);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // Reset selected index when query or filter changes
  // Using setTimeout to avoid synchronous setState in effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedIndex(0);
    }, 0);
    return () => clearTimeout(timer);
  }, [query, filter]);

  // Highlight text based on match positions
  const highlightText = (text: string, highlights: number[] = []): React.ReactNode => {
    if (!highlights.length) return text;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    const sortedHighlights = [...new Set(highlights)].sort((a, b) => a - b);

    sortedHighlights.forEach((index, i) => {
      if (index > lastIndex) {
        parts.push(text.substring(lastIndex, index));
      }
      parts.push(
        <mark key={`h-${i}`} className="bg-yellow-300 text-yellow-900 px-0.5 rounded">
          {text[index]}
        </mark>
      );
      lastIndex = index + 1;
    });

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return <>{parts}</>;
  };

  const filterOptions: { value: SearchFilter; label: string; icon: React.ReactNode }[] = [
    { value: "all", label: "All", icon: <Search className="w-4 h-4" /> },
    { value: "title", label: "Title", icon: <FileText className="w-4 h-4" /> },
    { value: "content", label: "Content", icon: <FileText className="w-4 h-4" /> },
    { value: "tags", label: "Tags", icon: <Tag className="w-4 h-4" /> },
    { value: "folder", label: "Folder", icon: <Folder className="w-4 h-4" /> },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <GlassCard className="w-full max-w-3xl max-h-[70vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-leather-200">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search documents..."
              className="flex-1 px-2 py-1 text-lg bg-transparent focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-leather-200 transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2 overflow-x-auto">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === option.value
                    ? "bg-leather-600 text-white"
                    : "bg-leather-100 text-leather-900 hover:bg-leather-200"
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {searchResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {query ? "No documents found" : "Start typing to search"}
            </div>
          ) : (
            <div className="space-y-1">
              {searchResults.map((result, index) => (
                <button
                  key={result.doc.id}
                  onClick={() => onSelectDocument(result.doc)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === selectedIndex
                      ? "bg-leather-200"
                      : "hover:bg-leather-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{result.doc.metadata?.emojiIcon || "📄"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-leather-900 truncate">
                        {highlightText(
                          result.doc.metadata?.title || "Untitled",
                          result.highlights.title || []
                        )}
                      </div>
                      {result.highlights.content && (
                        <div className="text-sm text-gray-600 truncate mt-1">
                          {highlightText(
                            extractTextContent(result.doc.content).substring(0, 100),
                            result.highlights.content.filter(i => i < 100)
                          )}
                          {extractTextContent(result.doc.content).length > 100 && "..."}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        {result.doc.metadata?.folder && (
                          <span className="flex items-center gap-1">
                            <Folder className="w-3 h-3" />
                            {highlightText(result.doc.metadata.folder, result.highlights.folder || [])}
                          </span>
                        )}
                        {result.doc.metadata?.tags && result.doc.metadata.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {result.doc.metadata.tags.slice(0, 3).map((tag, i) => (
                              <span key={i}>
                                {highlightText(tag, result.highlights.tags || [])}
                                {i < Math.min(2, result.doc.metadata!.tags!.length - 1) && ", "}
                              </span>
                            ))}
                          </span>
                        )}
                        {result.doc.updatedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(result.doc.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-leather-200 bg-leather-50 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <div>
              {searchResults.length} {searchResults.length === 1 ? "result" : "results"}
            </div>
            <div className="flex gap-4">
              <span><kbd className="px-1 py-0.5 bg-white border rounded text-xs">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1 py-0.5 bg-white border rounded text-xs">Enter</kbd> Open</span>
              <span><kbd className="px-1 py-0.5 bg-white border rounded text-xs">Esc</kbd> Close</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

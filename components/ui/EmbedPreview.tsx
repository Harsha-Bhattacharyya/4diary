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
 * Embed Preview Component
 * Shows preview of embedded URLs with option to load full page
 */

"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

interface EmbedPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string;
}

interface EmbedPreviewProps {
  url: string;
  onLoad?: (preview: EmbedPreview) => void;
}

/**
 * Renders an embeddable preview card for a URL with an option to open the original page in a full-page iframe.
 *
 * Fetches preview metadata from `/api/embed?url=...`, displays a loading skeleton while fetching, shows an error block on failure, and renders either a compact preview card or a full-page sandboxed iframe when requested.
 *
 * @param url - The target URL to fetch preview metadata for and to use as the link/iframe source.
 * @param onLoad - Optional callback invoked with the fetched preview object once it is successfully loaded.
 * @returns The preview UI element or `null` when no preview data is available.
 */
export function EmbedPreview({ url, onLoad }: EmbedPreviewProps) {
  const [preview, setPreview] = useState<EmbedPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullPage, setShowFullPage] = useState(false);

  const fetchPreview = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/embed?url=${encodeURIComponent(url)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch preview");
      }

      const data = await response.json();
      setPreview(data);
      if (onLoad) {
        onLoad(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [url, onLoad]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  if (isLoading) {
    return (
      <div className="border border-[#8B7355] rounded-lg p-4 bg-[#2D2416] animate-pulse">
        <div className="h-4 bg-[#3D3426] rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-[#3D3426] rounded w-full mb-2"></div>
        <div className="h-3 bg-[#3D3426] rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[#8B7355] rounded-lg p-4 bg-[#2D2416]">
        <div className="flex items-center gap-2 text-[#C4B8A0]">
          <Icon icon="flat-color-icons:disclaimer" width={20} height={20} />
          <span>Failed to load preview: {error}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8B7355] hover:text-[#A08465] underline mt-2 inline-block"
        >
          Open link manually →
        </a>
      </div>
    );
  }

  if (!preview) {
    return null;
  }

  if (showFullPage) {
    return (
      <div className="border border-[#8B7355] rounded-lg overflow-hidden bg-[#2D2416]">
        <div className="p-2 bg-[#3D3426] flex items-center justify-between">
          <span className="text-sm text-[#C4B8A0]">Embedded: {url}</span>
          <button
            type="button"
            aria-label="Close full-page embed"
            onClick={() => setShowFullPage(false)}
            className="text-[#E8DCC4] hover:text-[#C4B8A0] transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <iframe
          src={url}
          className="w-full h-96"
          title={preview.title || "Embedded content"}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    );
  }

  return (
    <div className="border border-[#8B7355] rounded-lg overflow-hidden bg-[#2D2416] hover:border-[#A08465] transition-colors group">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {preview.image && (
          <div className="aspect-video w-full overflow-hidden bg-[#3D3426]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.image}
              alt={preview.title || "Preview"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-4">
          {preview.title && (
            <h3 className="text-lg font-semibold text-[#E8DCC4] mb-2 line-clamp-2">
              {preview.title}
            </h3>
          )}

          {preview.description && (
            <p className="text-sm text-[#C4B8A0] mb-2 line-clamp-3">
              {preview.description}
            </p>
          )}
        </div>
      </a>

      <div className="flex items-center justify-between px-4 pb-4">
        <span className="text-xs text-[#A08465]">
          {preview.siteName || new URL(url).hostname}
        </span>

        <button
          type="button"
          onClick={() => setShowFullPage(true)}
          className="text-xs text-[#8B7355] hover:text-[#A08465] underline"
        >
          Load full page
        </button>
      </div>
    </div>
  );
}
/**
 * Backlinks component - Shows documents that link to the current document
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getBacklinks } from "@/lib/backlinkService";

interface BacklinksProps {
  documentTitle: string;
  workspaceId: string;
  userId: string;
  keyManager: {
    getCachedDocumentKey: (id: string) => CryptoKey | null;
    getDocumentKey: (encryptedKey: string) => Promise<CryptoKey>;
    cacheDocumentKey: (id: string, key: CryptoKey) => void;
  };
}

interface Backlink {
  id: string;
  title: string;
  snippet: string;
}

export default function Backlinks({
  documentTitle,
  workspaceId,
  userId,
  keyManager,
}: BacklinksProps) {
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBacklinks() {
      try {
        setLoading(true);
        const links = await getBacklinks(
          documentTitle,
          workspaceId,
          userId,
          keyManager
        );
        setBacklinks(links);
      } catch (error) {
        console.error("Error loading backlinks:", error);
      } finally {
        setLoading(false);
      }
    }

    if (documentTitle && workspaceId && userId) {
      fetchBacklinks();
    }
  }, [documentTitle, workspaceId, userId, keyManager]);

  if (loading) {
    return (
      <div className="p-4 glass-card rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Backlinks</h3>
        <p className="text-xs text-gray-500">Loading...</p>
      </div>
    );
  }

  if (backlinks.length === 0) {
    return (
      <div className="p-4 glass-card rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">🔗 Backlinks</h3>
        <p className="text-xs text-gray-500">
          No documents link to this page yet
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 glass-card rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        🔗 Backlinks ({backlinks.length})
      </h3>
      <div className="space-y-2">
        {backlinks.map((backlink) => (
          <Link
            key={backlink.id}
            href={`/workspace?doc=${backlink.id}`}
            className="block p-2 rounded hover:bg-amber-50 transition-colors"
          >
            <div className="text-sm font-medium text-gray-800">
              {backlink.title}
            </div>
            {backlink.snippet && (
              <div className="text-xs text-gray-500 truncate mt-1">
                {backlink.snippet}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

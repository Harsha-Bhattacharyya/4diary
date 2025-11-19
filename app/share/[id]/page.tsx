"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LeatherBackground from "@/components/ui/LeatherBackground";
import GlassCard from "@/components/ui/GlassCard";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with BlockNote
const BlockEditor = dynamic(() => import("@/components/editor/BlockEditor"), {
  ssr: false,
});

/**
 * Render a shared document view page that fetches and displays read-only content by share ID.
 *
 * Retrieves document data from the share API endpoint, displays loading and error states,
 * and shows the document title and content in a read-only editor when available.
 *
 * @returns The rendered share page UI as a JSX element
 */
export default function SharePage() {
  const params = useParams();
  const shareId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<{
    title: string;
    content: unknown[];
    createdAt: string;
    expiresAt: string;
  } | null>(null);

  useEffect(() => {
    /**
     * Fetches the shared document identified by `shareId` and updates component state.
     *
     * On success, stores the retrieved data in `shareData`. On failure, stores an error
     * message in `error`. Always clears the `loading` flag when finished.
     */
    async function fetchShare() {
      try {
        const response = await fetch(`/api/share?id=${encodeURIComponent(shareId)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load shared document");
        }

        setShareData(data);
      } catch (err) {
        console.error("Share fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load shared document");
      } finally {
        setLoading(false);
      }
    }

    if (shareId) {
      fetchShare();
    }
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <LeatherBackground />
        <GlassCard className="relative z-10">
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-leather-300">Loading shared document...</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <LeatherBackground />
        <GlassCard className="relative z-10">
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2 text-leather-100">Error</h2>
            <p className="text-leather-300 mb-4">{error}</p>
            <p className="text-sm text-leather-400">
              This link may have expired or been removed.
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!shareData) {
    return null;
  }

  const expiresDate = new Date(shareData.expiresAt);
  const createdDate = new Date(shareData.createdAt);

  return (
    <div className="min-h-screen relative bg-white">
      <LeatherBackground />
      
      {/* Header */}
      <div className="relative z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {shareData.title}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Shared on {createdDate.toLocaleDateString()} • Expires {expiresDate.toLocaleDateString()}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              🔗 Read-only
            </div>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <GlassCard className="p-8">
          <BlockEditor
            initialContent={shareData.content}
            editable={false}
            autoSave={false}
            showToolbar={false}
          />
        </GlassCard>
      </div>

      {/* Footer Notice */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-4">
        <p className="text-center text-sm text-leather-400">
          🔐 This is a temporary share link powered by 4diary
        </p>
      </div>
    </div>
  );
}
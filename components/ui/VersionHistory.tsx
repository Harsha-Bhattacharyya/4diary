/**
 * Version history component - Shows and restores document versions
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  getDocumentVersions,
  clearDocumentVersions,
  type DocumentVersion,
} from "@/lib/versionService";

interface VersionHistoryProps {
  documentId: string;
  onRestore?: (content: unknown[]) => void;
  onClose?: () => void;
}

export default function VersionHistory({
  documentId,
  onRestore,
  onClose,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(
    null
  );

  useEffect(() => {
    async function fetchVersions() {
      try {
        setLoading(true);
        const versionList = await getDocumentVersions(documentId);
        setVersions(versionList);
      } catch (error) {
        console.error("Error loading versions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchVersions();
  }, [documentId]);

  async function loadVersions() {
    try {
      setLoading(true);
      const versionList = await getDocumentVersions(documentId);
      setVersions(versionList);
    } catch (error) {
      console.error("Error loading versions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(version: DocumentVersion) {
    if (
      confirm(
        `Restore this version from ${new Date(
          version.metadata.timestamp
        ).toLocaleString()}?`
      )
    ) {
      onRestore?.(version.content);
      onClose?.();
    }
  }

  async function handleClearAll() {
    if (
      confirm(
        "Are you sure you want to delete all version history for this document?"
      )
    ) {
      await clearDocumentVersions(documentId);
      await loadVersions();
    }
  }

  function formatTimestamp(timestamp: Date): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            📚 Version History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-500 py-8">
              Loading versions...
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="mb-2">No version history available</p>
              <p className="text-sm">
                Versions are saved automatically as you edit
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedVersion?.id === version.id
                      ? "border-aqua-500 bg-aqua-50"
                      : "border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                  }`}
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {version.metadata.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatTimestamp(version.metadata.timestamp)}
                      </div>
                      {version.metadata.changeDescription && (
                        <div className="text-sm text-gray-500 mt-1 italic">
                          {version.metadata.changeDescription}
                        </div>
                      )}
                    </div>
                    {selectedVersion?.id === version.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(version);
                        }}
                        className="ml-4 px-4 py-2 bg-aqua-500 text-white rounded hover:bg-aqua-600 transition-colors"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <div className="text-sm text-gray-600">
            {versions.length} version{versions.length !== 1 ? "s" : ""} saved
          </div>
          <div className="flex gap-2">
            {versions.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

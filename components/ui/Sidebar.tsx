"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

interface SidebarProps {
  workspaceId?: string;
  documents?: Array<{ id: string; title: string; folder?: string }>;
  onDocumentClick?: (docId: string) => void;
}

export default function Sidebar({ workspaceId, documents = [], onDocumentClick }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: "🏠 Home", href: "/" },
    { label: "📚 Workspaces", href: workspaceId ? `/workspace/${workspaceId}` : "/workspace" },
    { label: "📄 Templates", href: "/templates" },
    { label: "⚙️ Settings", href: "/settings" },
  ];

  return (
    <aside className="leather-card w-64 h-screen p-4 flex flex-col gap-4 sticky top-0 fade-in">
      {/* Logo */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-leather-100">
          4diary
        </h1>
        <p className="text-xs text-leather-300 mt-1">
          Privacy-first notes
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 transition-all duration-200 ${
                isActive
                  ? "bg-leather-600 text-leather-100 font-bold border-l-4 border-leather-400"
                  : "hover:bg-leather-700 text-leather-200 border-l-4 border-transparent"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Documents list (if in workspace) */}
      {workspaceId && documents.length > 0 && (
        <div className="flex-1 overflow-y-auto mt-4">
          <h3 className="text-sm font-bold text-leather-200 mb-2">
            Recent Documents
          </h3>
          <div className="flex flex-col gap-1">
            {documents.slice(0, 10).map((doc) => (
              <button
                key={doc.id}
                onClick={() => onDocumentClick?.(doc.id)}
                className="px-3 py-2 text-sm hover:bg-leather-700 text-leather-300 truncate transition-all duration-200 text-left w-full"
                title={doc.title}
              >
                📄 {doc.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-leather-700">
        <p className="text-xs text-center text-leather-400">
          End-to-end encrypted
        </p>
      </div>
    </aside>
  );
}

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
}

export default function Sidebar({ workspaceId, documents = [] }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: "🏠 Home", href: "/" },
    { label: "📚 Workspaces", href: workspaceId ? `/workspace/${workspaceId}` : "/workspace" },
    { label: "📄 Templates", href: "/templates" },
    { label: "⚙️ Settings", href: "/settings" },
  ];

  return (
    <aside className="glass-card w-64 h-screen p-4 flex flex-col gap-4 sticky top-0">
      {/* Logo */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-aqua-500 to-purple-600 bg-clip-text text-transparent">
          4diary
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-aqua-500/20 text-aqua-700 dark:text-aqua-300 font-semibold"
                  : "hover:bg-white/10 text-gray-700 dark:text-gray-300"
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
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Recent Documents
          </h3>
          <div className="flex flex-col gap-1">
            {documents.slice(0, 10).map((doc) => (
              <Link
                key={doc.id}
                href={`/workspace/${workspaceId}?doc=${doc.id}`}
                className="px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-gray-700 dark:text-gray-300 truncate"
                title={doc.title}
              >
                📄 {doc.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-white/20">
        <p className="text-xs text-center text-gray-500 dark:text-gray-500">
          End-to-end encrypted
        </p>
      </div>
    </aside>
  );
}

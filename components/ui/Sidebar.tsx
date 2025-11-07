"use client";

import React, { useState, useEffect } from "react";
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
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

/**
 * Render the application sidebar with navigation links, optional workspace documents, and collapsible layout.
 *
 * @param workspaceId - Optional workspace identifier; when present and documents are provided, shows the Recent Documents section.
 * @param documents - Array of recent documents to display when inside a workspace; at most the first 10 documents are rendered.
 * @param onDocumentClick - Callback invoked with a document `id` when a document entry is clicked.
 * @param controlledCollapsed - If provided, controls the sidebar's collapsed state; when omitted the component manages collapse internally.
 * @param onToggle - Optional callback called with the new collapsed state whenever the sidebar is toggled (including automatic collapse on small screens).
 * @returns The rendered sidebar React element.
 */
export default function Sidebar({ 
  workspaceId, 
  documents = [], 
  onDocumentClick,
  collapsed: controlledCollapsed,
  onToggle 
}: SidebarProps) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  
  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !collapsed) {
        const newCollapsed = true;
        setInternalCollapsed(newCollapsed);
        onToggle?.(newCollapsed);
      }
    };
    
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed, onToggle]);

  const handleToggle = () => {
    const newCollapsed = !collapsed;
    setInternalCollapsed(newCollapsed);
    onToggle?.(newCollapsed);
  };

  const navItems: NavItem[] = [
    { label: "🏠 Home", href: "/" },
    { label: "📚 Workspaces", href: workspaceId ? `/workspace/${workspaceId}` : "/workspace" },
    { label: "📄 Templates", href: "/templates" },
    { label: "⚙️ Settings", href: "/settings" },
  ];

  return (
    <aside 
      className={`leather-card h-screen p-4 flex flex-col gap-4 sticky top-0 fade-in transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="absolute -right-3 top-8 z-20 w-6 h-6 bg-leather-600 hover:bg-leather-500 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border border-leather-400"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <span className="text-xs">{collapsed ? '→' : '←'}</span>
      </button>

      {/* Logo */}
      <div className="mb-4">
        <h1 className={`text-2xl font-bold text-leather-100 transition-all duration-300 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '4D' : '4diary'}
        </h1>
        {!collapsed && (
          <p className="text-xs text-leather-300 mt-1">
            Privacy-first notes
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const emoji = item.label.split(' ')[0];
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 transition-all duration-200 ${
                isActive
                  ? "bg-leather-600 text-leather-100 font-bold border-l-4 border-leather-400"
                  : "hover:bg-leather-700 text-leather-200 border-l-4 border-transparent"
              } ${collapsed ? 'flex justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              {collapsed ? emoji : item.label}
            </Link>
          );
        })}
      </nav>

      {/* Documents list (if in workspace) */}
      {workspaceId && documents.length > 0 && !collapsed && (
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
        {!collapsed ? (
          <p className="text-xs text-center text-leather-400">
            End-to-end encrypted
          </p>
        ) : (
          <p className="text-xs text-center text-leather-400" title="End-to-end encrypted">
            🔐
          </p>
        )}
      </div>
    </aside>
  );
}
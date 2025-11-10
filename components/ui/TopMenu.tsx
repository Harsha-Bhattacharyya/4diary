"use client";

import { useState } from "react";
import Link from "next/link";
import LeatherButton from "./LeatherButton";

interface TopMenuProps {
  currentPage?: string;
}

/**
 * Top navigation bar with a hamburger toggle, current page label, login button, and a dropdown of navigation links.
 *
 * Renders a top bar button that toggles a dropdown menu with links to Home, Workspace, Templates, Docs, and About.
 * Selecting any menu item or clicking the backdrop closes the dropdown.
 *
 * @param currentPage - Label shown next to the hamburger icon; defaults to "Home"
 * @returns A JSX element representing the top navigation bar and its dropdown
 */
export default function TopMenu({ currentPage = "Home" }: TopMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="relative z-[9999]">
        {/* Top Bar */}
        <div className="flex justify-between items-center px-6 py-4">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-leather-200 hover:text-leather-100 transition-colors p-2 flex items-center gap-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <span className="font-semibold">{currentPage}</span>
          </button>
          
          <Link href="/workspace">
            <LeatherButton variant="parchment" size="sm">
              Log in
            </LeatherButton>
          </Link>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute top-full left-4 mt-2 bg-leather-500 rounded-lg shadow-lg border-2 border-leather-400 py-2 min-w-[200px] z-[9999]">
            <Link href="/">
              <button
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-leather-600 transition-colors text-leather-100"
                onClick={() => setMenuOpen(false)}
              >
                🏠 Home
              </button>
            </Link>
            <Link href="/workspace">
              <button
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-leather-600 transition-colors text-leather-100"
                onClick={() => setMenuOpen(false)}
              >
                📚 Workspace
              </button>
            </Link>
            <Link href="/templates">
              <button
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-leather-600 transition-colors text-leather-100"
                onClick={() => setMenuOpen(false)}
              >
                📄 Templates
              </button>
            </Link>
            <Link href="/docs">
              <button
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-leather-600 transition-colors text-leather-100"
                onClick={() => setMenuOpen(false)}
              >
                📖 Docs
              </button>
            </Link>
            <Link href="/about">
              <button
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-leather-600 transition-colors text-leather-100"
                onClick={() => setMenuOpen(false)}
              >
                ℹ️ About
              </button>
            </Link>
          </div>
        )}
      </div>
      
      {/* Backdrop - outside the relative container */}
      {menuOpen && (
        <div
          className="fixed inset-0"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
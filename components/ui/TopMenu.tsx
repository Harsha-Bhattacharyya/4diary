"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LeatherButton from "./LeatherButton";

interface TopMenuProps {
  currentPage?: string;
}

/**
 * Render the top navigation bar with a hamburger toggle, current page label, authentication controls, and a dropdown menu.
 *
 * @param currentPage - Label displayed next to the hamburger icon; defaults to `"Home"`
 * @returns A JSX element containing the top navigation bar and its dropdown menu
 */
export default function TopMenu({ currentPage = "Home" }: TopMenuProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Check the current authentication session and update the component's authentication state.
     *
     * Updates `isAuthenticated` to reflect the session; when authenticated, sets `userEmail` to the session email.
     * If the session check fails, sets `isAuthenticated` to `false`.
     */
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        if (data.authenticated) {
          setUserEmail(data.email);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

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
          
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-leather-200 text-sm">
                {userEmail?.split('@')[0]}
              </span>
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  setIsAuthenticated(false);
                  setUserEmail(null);
                  router.push("/auth");
                }}
                className="text-leather-300 hover:text-leather-100 text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/auth">
              <LeatherButton variant="parchment" size="sm">
                Log in
              </LeatherButton>
            </Link>
          )}
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
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 cursor-default"
          onClick={() => setMenuOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
              setMenuOpen(false);
            }
          }}
        ></button>
      )}
    </>
  );
}
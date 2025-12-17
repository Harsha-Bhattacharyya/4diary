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

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { 
  Menu, 
  Home, 
  BookOpen, 
  FileText, 
  BookMarked, 
  Info,
  LogOut 
} from "lucide-react";

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
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Check the current authentication session and update the component's authentication state.
     *
     * Updates `isAuthenticated` to reflect the session; when authenticated, sets `username` to the session username.
     * If the session check fails, sets `isAuthenticated` to `false`.
     */
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        if (data.authenticated) {
          setUsername(data.username);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  return (
    <div className="relative z-[9999]">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-leather-200 hover:text-leather-100 hover:bg-leather-900/30"
              >
                <Menu className="w-5 h-5 mr-2" />
                <span className="font-semibold">{currentPage}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start"
              className="w-56 bg-leather-500 border-leather-400 border-2"
            >
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center gap-2 text-leather-100 cursor-pointer">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/workspace" className="flex items-center gap-2 text-leather-100 cursor-pointer">
                  <BookOpen className="w-4 h-4" />
                  <span>Workspace</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/templates" className="flex items-center gap-2 text-leather-100 cursor-pointer">
                  <FileText className="w-4 h-4" />
                  <span>Templates</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-leather-600" />
              
              <DropdownMenuItem asChild>
                <Link href="/docs" className="flex items-center gap-2 text-leather-100 cursor-pointer">
                  <BookMarked className="w-4 h-4" />
                  <span>Docs</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/about" className="flex items-center gap-2 text-leather-100 cursor-pointer">
                  <Info className="w-4 h-4" />
                  <span>About</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-leather-200 text-sm">
              {username || 'User'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  const response = await fetch("/api/auth/logout", { method: "POST" });
                  
                  if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    throw new Error(data.error || "Logout failed");
                  }
                  
                  // Only clear state and redirect on successful logout
                  setIsAuthenticated(false);
                  setUsername(null);
                  router.push("/auth");
                } catch (err) {
                  console.error("Logout error:", err);
                  alert(err instanceof Error ? err.message : "Failed to logout. Please try again.");
                }
              }}
              className="text-leather-300 hover:text-leather-100 text-sm hover:bg-leather-900/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <Link href="/auth">
            <Button variant="outline" size="sm">
              Log in
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
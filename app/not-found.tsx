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

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import LeatherBackground from "@/components/ui/LeatherBackground";
import GlassCard from "@/components/ui/GlassCard";
import LeatherButton from "@/components/ui/LeatherButton";
import PrivacySaur from "@/components/ui/PrivacySaur";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Custom 404 Not Found page with leather-themed styling.
 * 
 * Renders an animated, leather-styled error page when users navigate to a non-existent route.
 * Includes a hidden easter egg game (Privacy Saur) that can be triggered by pressing Space.
 * 
 * @returns The 404 page React element with leather background, animated icon, and navigation options
 */
export default function NotFound() {
  const [showGame, setShowGame] = useState(false);

  // Listen for space key to toggle game
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only toggle game visibility if space is pressed and game is not shown yet
    // Once game is shown, let the game component handle space presses
    if (e.code === "Space" && !showGame) {
      e.preventDefault();
      setShowGame(true);
    }
    // ESC to close the game
    if (e.code === "Escape" && showGame) {
      e.preventDefault();
      setShowGame(false);
    }
  }, [showGame]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <LeatherBackground />
      
      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <GlassCard className="text-center py-12 px-8">
          {/* Animated 404 Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            className="text-8xl mb-6"
          >
            📜
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-leather-100 mb-4">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-leather-200 mb-6">
              Page Not Found
            </h2>
            <p className="text-leather-300 text-lg mb-8 max-w-md mx-auto">
              The page you are looking for has vanished into the leather-bound archives. 
              It might have been moved, deleted, or never existed.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/workspace">
              <LeatherButton variant="leather" size="lg">
                🏠 Go to Workspace
              </LeatherButton>
            </Link>
            <Link href="/">
              <LeatherButton variant="parchment" size="lg">
                📖 Home Page
              </LeatherButton>
            </Link>
          </motion.div>

          {/* Additional Help */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-12 pt-8 border-t border-leather-700/30"
          >
            <p className="text-leather-400 text-sm mb-4">
              Looking for something specific?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <Link 
                href="/templates" 
                className="text-leather-300 hover:text-leather-100 underline transition-colors"
              >
                Templates
              </Link>
              <span className="text-leather-600">•</span>
              <Link 
                href="/docs" 
                className="text-leather-300 hover:text-leather-100 underline transition-colors"
              >
                Documentation
              </Link>
              <span className="text-leather-600">•</span>
              <Link 
                href="/settings" 
                className="text-leather-300 hover:text-leather-100 underline transition-colors"
              >
                Settings
              </Link>
            </div>
          </motion.div>

          {/* Hidden hint for easter egg */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="mt-6 text-leather-500/50 text-xs italic"
          >
            Feeling bored? Press SPACE for a surprise...
          </motion.p>
        </GlassCard>
      </div>

      {/* Privacy Saur Easter Egg Game */}
      <AnimatePresence>
        {showGame && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <div className="relative">
              <button
                onClick={() => setShowGame(false)}
                className="absolute -top-10 right-0 text-leather-200 hover:text-leather-100 text-sm transition-colors"
                aria-label="Close game"
              >
                Press ESC to close
              </button>
              <PrivacySaur />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

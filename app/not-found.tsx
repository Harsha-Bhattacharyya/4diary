"use client";

import React from "react";
import Link from "next/link";
import LeatherBackground from "@/components/ui/LeatherBackground";
import GlassCard from "@/components/ui/GlassCard";
import LeatherButton from "@/components/ui/LeatherButton";
import { motion } from "framer-motion";

/**
 * Custom 404 Not Found page with leather-themed styling.
 * 
 * Renders an animated, leather-styled error page when users navigate to a non-existent route.
 * 
 * @returns The 404 page React element with leather background, animated icon, and navigation options
 */
export default function NotFound() {
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
              The page you're looking for has vanished into the leather-bound archives. 
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
        </GlassCard>
      </div>
    </div>
  );
}

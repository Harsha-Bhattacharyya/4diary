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

import Link from "next/link";
import LeatherBackground from "@/components/ui/LeatherBackground";
import TopMenu from "@/components/ui/TopMenu";

/**
 * Renders the About page for the application.
 *
 * Displays a leather-styled background, the top navigation with the "About" page active,
 * and centered page content including the page heading, project information, Hack This Fall 2025
 * section, lead developer placeholder, and social links.
 *
 * @returns The About page JSX element.
 */
export default function About() {
  return (
    <div className="min-h-screen relative">
      <LeatherBackground />
      
      {/* Top Menu */}
      <div className="relative z-[350]">
        <TopMenu currentPage="About" />
      </div>

      <main className="relative z-10 px-6 py-12">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center fade-in pt-8 pb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-leather-100 mb-6">
            About 4diary
          </h1>
          <p className="text-lg md:text-xl text-leather-200 max-w-2xl mx-auto">
            A privacy-focused solution for the modern world. Built with end-to-end encryption, 
            zero-knowledge architecture, and open-source freedom.
          </p>
        </section>

        {/* Project Description Section */}
        <section className="max-w-4xl mx-auto py-12 fade-in-delay-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Privacy & Security */}
            <div className="p-6 rounded-lg bg-leather-600 bg-opacity-30 border border-leather-500/30">
              <h3 className="text-2xl font-bold text-leather-100 mb-4">🔒 Privacy & Security</h3>
              <ul className="text-leather-200 space-y-2 text-left">
                <li>• End-to-End Encryption with AES-256-GCM</li>
                <li>• Zero-Knowledge Architecture</li>
                <li>• Client-side only encryption</li>
                <li>• Master keys never leave your device</li>
              </ul>
            </div>

            {/* Features */}
            <div className="p-6 rounded-lg bg-leather-600 bg-opacity-30 border border-leather-500/30">
              <h3 className="text-2xl font-bold text-leather-100 mb-4">✨ Features</h3>
              <ul className="text-leather-200 space-y-2 text-left">
                <li>• Notion-like Rich Text Editor</li>
                <li>• Kanban Boards for Task Management</li>
                <li>• Ephemeral Share Links</li>
                <li>• PWA Support with Offline Capabilities</li>
              </ul>
            </div>

            {/* Self-Hostable */}
            <div className="p-6 rounded-lg bg-leather-600 bg-opacity-30 border border-leather-500/30">
              <h3 className="text-2xl font-bold text-leather-100 mb-4">🐳 Self-Hostable</h3>
              <ul className="text-leather-200 space-y-2 text-left">
                <li>• Docker-ready deployment</li>
                <li>• Complete data ownership</li>
                <li>• Open-source (BSD-3-Clause)</li>
                <li>• No vendor lock-in</li>
              </ul>
            </div>

            {/* Tech Stack */}
            <div className="p-6 rounded-lg bg-leather-600 bg-opacity-30 border border-leather-500/30">
              <h3 className="text-2xl font-bold text-leather-100 mb-4">🛠️ Tech Stack</h3>
              <ul className="text-leather-200 space-y-2 text-left">
                <li>• Next.js 16 (App Router)</li>
                <li>• MongoDB & Redis</li>
                <li>• Tailwind CSS v4</li>
                <li>• Web Crypto API</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Lead Developer Section */}
        <section className="max-w-4xl mx-auto py-12 fade-in-delay-2">
          <div className="text-center p-8 rounded-lg bg-leather-700 bg-opacity-40 border border-leather-500/30">
            <h2 className="text-3xl font-bold text-leather-100 mb-6">💻 The Lead Dev</h2>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-leather-500 bg-opacity-50 border-4 border-leather-400 flex items-center justify-center mb-4">
              </div>
              <h3 className="text-2xl font-bold text-leather-100 mb-2">Harsha Bhattacharyya</h3>
              <p className="text-leather-200 max-w-md">
                Passionate about privacy, security, and building tools that respect user data. 
                Creating 4diary to give everyone a secure space for their thoughts.
              </p>
              <Link 
                href="https://github.com/Harsha-Bhattacharyya" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 text-leather-300 hover:text-leather-100 transition-colors"
              >
                @Harsha-Bhattacharyya
              </Link>
            </div>
          </div>
        </section>

        {/* Hack This Fall 2025 Section */}
        <section className="max-w-4xl mx-auto py-12 fade-in-delay-2">
          <div className="text-center p-8 rounded-lg border-2 border-amber-500/60 bg-gradient-to-br from-amber-900/20 via-amber-800/10 to-amber-900/20 relative overflow-hidden">
            {/* Gilded corner decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
                🏆 Hack This Fall 2025
              </h2>
              <p className="text-amber-200/90 text-lg mb-6">
                Proudly built for and submitted to Hack This Fall 2025 — one of India&apos;s largest hackathons.
              </p>
              <div className="flex items-center justify-center gap-2 text-amber-300/80">
                <span className="text-2xl">✨</span>
                <span className="font-serif italic text-xl">Where privacy meets innovation</span>
                <span className="text-2xl">✨</span>
              </div>
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="max-w-4xl mx-auto py-12 text-center fade-in-delay-3">
          <h2 className="text-2xl font-bold text-leather-100 mb-6">Connect With Us</h2>
          <div className="flex justify-center gap-8">
            {/* GitHub Link */}
            <Link 
              href="https://github.com/Harsha-Bhattacharyya/4diary" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 text-leather-200 hover:text-leather-100 transition-colors group"
            >
              <svg 
                className="w-12 h-12 group-hover:scale-110 transition-transform" 
                fill="currentColor" 
                viewBox="0 0 24 24" 
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span className="text-sm font-medium">GitHub</span>
            </Link>

            {/* Discord Link */}
            <Link 
              href="https://discord.gg/a3VaGxD9qn"
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 text-leather-200 hover:text-leather-100 transition-colors group"
            >
              <svg 
                className="w-12 h-12 group-hover:scale-110 transition-transform" 
                fill="currentColor" 
                viewBox="0 0 24 24" 
                aria-hidden="true"
              >
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
              </svg>
              <span className="text-sm font-medium">Discord</span>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-leather-300 text-sm py-12">
          <p>Made with ❤️ in 🇮🇳</p>
        </footer>
      </main>
    </div>
  );
}

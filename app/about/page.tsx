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

import LeatherBackground from "@/components/ui/LeatherBackground";
import TopMenu from "@/components/ui/TopMenu";

/**
 * Renders the About page for the application.
 *
 * Displays a leather-styled background, the top navigation with the "About" page active,
 * and centered page content including the page heading and a brief privacy-focused description.
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

      <main className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
        <div className="max-w-3xl mx-auto text-center fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-leather-100 mb-6">
            About 4diary
          </h1>
          <p className="text-lg md:text-xl text-leather-200 max-w-2xl mx-auto">
            A privacy-focused solution for the modern world. Built with end-to-end encryption, 
            zero-knowledge architecture, and open-source freedom.
          </p>
        </div>
      </main>
    </div>
  );
}
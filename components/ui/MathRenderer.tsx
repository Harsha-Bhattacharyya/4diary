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

import React, { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathRendererProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

/**
 * Renders LaTeX math notation using KaTeX.
 * 
 * @param math - The LaTeX expression to render
 * @param displayMode - If true, renders as a block equation; otherwise inline
 * @param className - Additional CSS classes
 */
export default function MathRenderer({ 
  math, 
  displayMode = false,
  className = ""
}: MathRendererProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current && math) {
      try {
        katex.render(math, containerRef.current, {
          displayMode,
          throwOnError: false,
          errorColor: "#cc0000",
          strict: false,
        });
      } catch (error) {
        console.error("KaTeX rendering error:", error);
        if (containerRef.current) {
          containerRef.current.textContent = `Error rendering math: ${math}`;
        }
      }
    }
  }, [math, displayMode]);

  return (
    <span 
      ref={containerRef}
      className={`math-renderer ${displayMode ? 'block' : 'inline'} ${className}`}
      style={{ 
        display: displayMode ? 'block' : 'inline-block',
        margin: displayMode ? '1em 0' : '0 0.2em',
      }}
    />
  );
}

/**
 * Parses text content and renders LaTeX math notation.
 * Supports inline math ($...$) and display math ($$...$$).
 * 
 * @param content - Text content potentially containing LaTeX
 */
export function parseAndRenderMath(content: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Match both display math ($$...$$) and inline math ($...$)
  const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\n]*?\$)/g;
  
  let match;
  while ((match = mathRegex.exec(content)) !== null) {
    // Add text before math
    if (match.index > lastIndex) {
      nodes.push(content.substring(lastIndex, match.index));
    }
    
    const fullMatch = match[0];
    const isDisplayMode = fullMatch.startsWith('$$');
    const mathContent = isDisplayMode 
      ? fullMatch.slice(2, -2).trim()
      : fullMatch.slice(1, -1).trim();
    
    nodes.push(
      <MathRenderer 
        key={`math-${match.index}`}
        math={mathContent}
        displayMode={isDisplayMode}
      />
    );
    
    lastIndex = match.index + fullMatch.length;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    nodes.push(content.substring(lastIndex));
  }
  
  return nodes.length > 0 ? nodes : [content];
}

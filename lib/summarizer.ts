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

/**
 * Text Summarizer Utility
 * 
 * Privacy-preserving text summarization using node-summarizer.
 * All summarization happens locally - no data is sent to external services.
 */

// Note: node-summarizer uses CommonJS, imported dynamically for Next.js compatibility

export interface SummaryResult {
  summary: string;
  reductionPercentage: number;
  originalLength: number;
  summaryLength: number;
  method: 'frequency' | 'textrank';
}

/**
 * Calculates the optimal number of sentences for a summary based on text length.
 * 
 * @param text - The text to summarize
 * @returns Optimal number of sentences (between 1 and 5)
 */
function calculateOptimalSentenceCount(text: string): number {
  // Count approximate sentences in the original text
  const sentenceCount = (text.match(/[.!?]+/g) || []).length;
  
  if (sentenceCount <= 2) {
    return 1;
  } else if (sentenceCount <= 5) {
    return 2;
  } else if (sentenceCount <= 10) {
    return 3;
  } else if (sentenceCount <= 20) {
    return 4;
  }
  return 5;
}

/**
 * Summarizes text using the frequency-based method.
 * This is faster but may be less accurate for complex texts.
 * 
 * @param text - The text to summarize
 * @param numSentences - Optional number of sentences for the summary (auto-calculated if not provided)
 * @returns Promise resolving to the summary result
 */
export async function summarizeByFrequency(
  text: string,
  numSentences?: number
): Promise<SummaryResult> {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot summarize empty text');
  }

  const sentences = numSentences || calculateOptimalSentenceCount(text);
  
  // Dynamic import for node-summarizer (CommonJS module)
  const { SummarizerManager } = await import('node-summarizer');
  
  const summarizer = new SummarizerManager(text, sentences);
  const result = summarizer.getSummaryByFrequency();
  
  return {
    summary: result.summary || text.substring(0, 200) + '...',
    reductionPercentage: result.reduction ? parseFloat(result.reduction) : 0,
    originalLength: text.length,
    summaryLength: result.summary?.length || 0,
    method: 'frequency',
  };
}

/**
 * Summarizes text using the TextRank algorithm.
 * This is more accurate but slower than frequency-based summarization.
 * 
 * @param text - The text to summarize
 * @param numSentences - Optional number of sentences for the summary (auto-calculated if not provided)
 * @returns Promise resolving to the summary result
 */
export async function summarizeByRank(
  text: string,
  numSentences?: number
): Promise<SummaryResult> {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot summarize empty text');
  }

  const sentences = numSentences || calculateOptimalSentenceCount(text);
  
  // Dynamic import for node-summarizer (CommonJS module)
  const { SummarizerManager } = await import('node-summarizer');
  
  const summarizer = new SummarizerManager(text, sentences);
  const result = await summarizer.getSummaryByRank();
  
  return {
    summary: result.summary || text.substring(0, 200) + '...',
    reductionPercentage: result.reduction ? parseFloat(result.reduction) : 0,
    originalLength: text.length,
    summaryLength: result.summary?.length || 0,
    method: 'textrank',
  };
}

/**
 * Summarizes text using the best available method.
 * Uses frequency-based method for short texts, TextRank for longer texts.
 * 
 * @param text - The text to summarize
 * @param numSentences - Optional number of sentences for the summary
 * @returns Promise resolving to the summary result
 */
export async function summarize(
  text: string,
  numSentences?: number
): Promise<SummaryResult> {
  // For very short texts, use frequency (faster)
  // For longer texts, use TextRank (more accurate)
  const wordCount = text.split(/\s+/).length;
  
  if (wordCount < 100) {
    return summarizeByFrequency(text, numSentences);
  }
  
  return summarizeByRank(text, numSentences);
}

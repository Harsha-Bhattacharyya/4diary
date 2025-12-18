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
 * Translation service using lingo.dev SDK (server-side only)
 * Provides multi-language support with caching to reduce API calls
 * 
 * NOTE: This module uses @lingo.dev/_sdk which has Node.js dependencies (jsdom).
 * It should only be imported in server-side code (API routes).
 * For client-side usage, import types from './translationTypes' instead.
 */

// Re-export types from translationTypes for convenience
export type { LanguageCode, TranslationRequest, TranslationResponse } from './translationTypes';
export { SUPPORTED_LANGUAGES } from './translationTypes';

// Import for internal use
import { SUPPORTED_LANGUAGES, type LanguageCode, type TranslationRequest, type TranslationResponse } from './translationTypes';

// Import SDK - this will only work server-side
import type { LingoDotDevEngine as LingoDotDevEngineType } from '@lingo.dev/_sdk';

// Simple console logger for server-side
const log = {
  debug: (msg: string, data?: object) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Translation] ${msg}`, data || '');
    }
  },
  info: (msg: string, data?: object) => {
    console.log(`[Translation] ${msg}`, data || '');
  },
  error: (msg: string, data?: object) => {
    console.error(`[Translation] ${msg}`, data || '');
  },
};

/**
 * LRU (Least Recently Used) cache for translations
 * When cache is full, removes the least recently accessed item
 */
class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    // Remove if exists to reinsert at end
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get size(): number {
    return this.cache.size;
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * In-memory LRU translation cache to reduce API calls
 * Key format: `${sourceLang}:${targetLang}:${text}`
 */
const translationCache = new LRUCache<string, string>(1000);

// Maximum cache size to prevent memory issues
const MAX_CACHE_SIZE = 1000;

/**
 * Generate cache key for a translation request
 */
function getCacheKey(
  text: string,
  sourceLang: LanguageCode,
  targetLang: LanguageCode
): string {
  return `${sourceLang}:${targetLang}:${text}`;
}

/**
 * Check if lingo.dev API is configured
 */
export function isTranslationServiceAvailable(): boolean {
  return !!process.env.LINGO_API_KEY;
}

/**
 * Translate text using lingo.dev API
 * 
 * @param request Translation request parameters
 * @returns Translation response with translated text
 * @throws Error if API key is not configured or API call fails
 */
export async function translateText(
  request: TranslationRequest
): Promise<TranslationResponse> {
  const { text, sourceLang, targetLang } = request;

  // Validate inputs
  if (!text || text.trim().length === 0) {
    throw new Error("Text cannot be empty");
  }

  if (!SUPPORTED_LANGUAGES[sourceLang]) {
    throw new Error(`Unsupported source language: ${sourceLang}`);
  }

  if (!SUPPORTED_LANGUAGES[targetLang]) {
    throw new Error(`Unsupported target language: ${targetLang}`);
  }

  // If source and target are the same, return original text
  if (sourceLang === targetLang) {
    return {
      translatedText: text,
      sourceLang,
      targetLang,
      cached: false,
    };
  }

  // Check cache first
  const cacheKey = getCacheKey(text, sourceLang, targetLang);
  const cachedTranslation = translationCache.get(cacheKey);
  
  if (cachedTranslation) {
    log.debug("Translation cache hit", { sourceLang, targetLang });
    return {
      translatedText: cachedTranslation,
      sourceLang,
      targetLang,
      cached: true,
    };
  }

  // Check if API key is configured
  const apiKey = process.env.LINGO_API_KEY;
  if (!apiKey) {
    throw new Error(
      "LINGO_API_KEY not configured. Translation service is unavailable."
    );
  }

  try {
    log.info("Translating text via lingo.dev SDK", {
      sourceLang,
      targetLang,
      textLength: text.length,
    });

    // Dynamically import SDK to avoid client-side bundling issues
    const { LingoDotDevEngine } = await import('@lingo.dev/_sdk');
    
    // Initialize SDK engine
    const engine = new LingoDotDevEngine({
      apiKey: apiKey,
    });

    // Call lingo.dev SDK
    const translatedText = await engine.localizeText(text, {
      sourceLocale: sourceLang,
      targetLocale: targetLang,
    });

    // Cache the translation (LRU cache handles size limit automatically)
    translationCache.set(cacheKey, translatedText);

    log.info("Translation successful", { sourceLang, targetLang });

    return {
      translatedText,
      sourceLang,
      targetLang,
      cached: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log.error("Translation failed", {
      error: errorMessage,
      sourceLang,
      targetLang,
    });
    
    // Re-throw with clear error message
    throw new Error(`Translation failed: ${errorMessage}`);
  }
}

/**
 * Translate multiple texts in batch
 * Processes translations sequentially to avoid rate limits
 * 
 * @param texts Array of texts to translate
 * @param sourceLang Source language
 * @param targetLang Target language
 * @returns Array of translation responses
 */
export async function translateBatch(
  texts: string[],
  sourceLang: LanguageCode,
  targetLang: LanguageCode
): Promise<TranslationResponse[]> {
  // Validate inputs
  if (!texts || texts.length === 0) {
    throw new Error("Texts array cannot be empty");
  }

  // Filter out empty strings and validate
  const validTexts = texts.filter((text) => {
    if (typeof text !== "string") {
      log.error("Invalid text type in batch", { type: typeof text });
      return false;
    }
    return text.trim().length > 0;
  });

  if (validTexts.length === 0) {
    throw new Error("No valid texts to translate in batch");
  }

  const results: TranslationResponse[] = [];

  for (const text of validTexts) {
    try {
      const result = await translateText({ text, sourceLang, targetLang });
      results.push(result);
    } catch (error) {
      log.error("Batch translation item failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        text: text.substring(0, 50), // Log first 50 chars
      });
      // Push original text on error
      results.push({
        translatedText: text,
        sourceLang,
        targetLang,
        cached: false,
      });
    }
  }

  return results;
}

/**
 * Clear translation cache
 * Useful for testing or when memory is constrained
 */
export function clearTranslationCache(): void {
  translationCache.clear();
  log.info("Translation cache cleared");
}

/**
 * Get translation cache statistics
 */
export function getTranslationCacheStats() {
  return {
    size: translationCache.size,
    maxSize: MAX_CACHE_SIZE,
    utilizationPercent: (translationCache.size / MAX_CACHE_SIZE) * 100,
  };
}

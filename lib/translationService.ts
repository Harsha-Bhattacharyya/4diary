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
 * Translation service using lingo.dev API
 * Provides multi-language support with caching to reduce API calls
 */

// Simple console logger for client-side (avoiding server-only logger)
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

// Supported languages (implementing first 3 as per requirement)
export const SUPPORTED_LANGUAGES = {
  en: { code: "en", name: "English", nativeName: "English" },
  bn: { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  hi: { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  // Future languages (not yet implemented):
  // ta: { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  // zh: { code: "zh", name: "Mandarin", nativeName: "中文" },
  // ru: { code: "ru", name: "Russian", nativeName: "Русский" },
  // fr: { code: "fr", name: "French", nativeName: "Français" },
  // de: { code: "de", name: "German", nativeName: "Deutsch" },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export interface TranslationRequest {
  text: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  cached: boolean;
}

/**
 * In-memory translation cache to reduce API calls
 * Key format: `${sourceLang}:${targetLang}:${text}`
 */
const translationCache = new Map<string, string>();

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
    log.info("Translating text via lingo.dev", {
      sourceLang,
      targetLang,
      textLength: text.length,
    });

    // Call lingo.dev API
    // Note: This is a generic implementation. Adjust based on actual lingo.dev API
    const response = await fetch("https://api.lingo.dev/v1/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text,
        source_language: sourceLang,
        target_language: targetLang,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `lingo.dev API error: ${response.status} ${response.statusText} - ${
          errorData.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();
    const translatedText = data.translated_text || data.text || text;

    // Cache the translation (with size limit)
    if (translationCache.size >= MAX_CACHE_SIZE) {
      // Remove oldest entry (first entry in the Map)
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }
    translationCache.set(cacheKey, translatedText);

    log.info("Translation successful", { sourceLang, targetLang });

    return {
      translatedText,
      sourceLang,
      targetLang,
      cached: false,
    };
  } catch (error) {
    log.error("Translation failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      sourceLang,
      targetLang,
    });
    throw error;
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
  const results: TranslationResponse[] = [];

  for (const text of texts) {
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

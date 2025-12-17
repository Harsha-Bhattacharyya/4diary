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

import { NextRequest, NextResponse } from "next/server";
import {
  translateText,
  translateBatch,
  isTranslationServiceAvailable,
  SUPPORTED_LANGUAGES,
  LanguageCode,
} from "@/lib/translationService";
import { logger } from "@/lib/logger";

/**
 * GET /api/translate
 * Get translation service status and supported languages
 */
export async function GET(request: NextRequest) {
  try {
    const available = isTranslationServiceAvailable();

    return NextResponse.json({
      available,
      supportedLanguages: SUPPORTED_LANGUAGES,
      message: available
        ? "Translation service is available"
        : "Translation service is not configured. Set LINGO_API_KEY environment variable.",
    });
  } catch (error) {
    logger.error("Failed to get translation service status", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to get translation service status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/translate
 * Translate text from one language to another
 * 
 * Body parameters:
 * - text: string | string[] - Text to translate (single or array)
 * - sourceLang: string - Source language code (e.g., 'en', 'bn', 'hi')
 * - targetLang: string - Target language code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, sourceLang, targetLang } = body;

    // Validate required fields
    if (!text) {
      return NextResponse.json(
        { error: "Missing required field: text" },
        { status: 400 }
      );
    }

    if (!sourceLang || !targetLang) {
      return NextResponse.json(
        { error: "Missing required fields: sourceLang, targetLang" },
        { status: 400 }
      );
    }

    // Validate language codes
    if (!SUPPORTED_LANGUAGES[sourceLang as LanguageCode]) {
      return NextResponse.json(
        {
          error: `Unsupported source language: ${sourceLang}`,
          supportedLanguages: Object.keys(SUPPORTED_LANGUAGES),
        },
        { status: 400 }
      );
    }

    if (!SUPPORTED_LANGUAGES[targetLang as LanguageCode]) {
      return NextResponse.json(
        {
          error: `Unsupported target language: ${targetLang}`,
          supportedLanguages: Object.keys(SUPPORTED_LANGUAGES),
        },
        { status: 400 }
      );
    }

    // Check if service is available
    if (!isTranslationServiceAvailable()) {
      return NextResponse.json(
        {
          error:
            "Translation service not configured. Please set LINGO_API_KEY environment variable.",
        },
        { status: 503 }
      );
    }

    // Handle batch translation
    if (Array.isArray(text)) {
      const results = await translateBatch(
        text,
        sourceLang as LanguageCode,
        targetLang as LanguageCode
      );
      return NextResponse.json({
        translations: results,
        count: results.length,
      });
    }

    // Handle single translation
    const result = await translateText({
      text,
      sourceLang: sourceLang as LanguageCode,
      targetLang: targetLang as LanguageCode,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Translation request failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Return appropriate error message
    const errorMessage =
      error instanceof Error ? error.message : "Translation failed";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

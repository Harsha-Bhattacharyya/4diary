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
 * Translation types that can be safely imported in client components
 */

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

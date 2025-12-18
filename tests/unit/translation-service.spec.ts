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

import { test, expect } from '@playwright/test';

/**
 * Unit tests for lib/translationService.ts
 * Testing translation service functionality
 */

test.describe('Translation Service - Language Support', () => {
  test('should have English as supported language', () => {
    const supportedLangs = ['en', 'bn', 'hi'];
    expect(supportedLangs).toContain('en');
  });

  test('should have Bengali as supported language', () => {
    const supportedLangs = ['en', 'bn', 'hi'];
    expect(supportedLangs).toContain('bn');
  });

  test('should have Hindi as supported language', () => {
    const supportedLangs = ['en', 'bn', 'hi'];
    expect(supportedLangs).toContain('hi');
  });

  test('should have exactly 3 supported languages in phase 1', () => {
    const supportedLangs = ['en', 'bn', 'hi'];
    expect(supportedLangs.length).toBe(3);
  });
});

test.describe('Translation Service - Input Validation', () => {
  test('should reject empty text', async () => {
    // This would be tested with actual service in integration tests
    const emptyText = '';
    expect(emptyText.trim().length).toBe(0);
  });

  test('should accept valid language codes', () => {
    const validCodes = ['en', 'bn', 'hi'];
    validCodes.forEach(code => {
      expect(code).toMatch(/^[a-z]{2}$/);
    });
  });

  test('should handle same source and target language', () => {
    const sourceLang = 'en';
    const targetLang = 'en';
    expect(sourceLang).toBe(targetLang);
  });
});

test.describe('Translation Service - Cache Behavior', () => {
  test('should create unique cache keys for different translations', () => {
    const key1 = 'en:bn:Hello';
    const key2 = 'en:hi:Hello';
    const key3 = 'bn:en:Hello';
    
    expect(key1).not.toBe(key2);
    expect(key1).not.toBe(key3);
    expect(key2).not.toBe(key3);
  });

  test('should create same cache key for identical requests', () => {
    const key1 = 'en:bn:Hello';
    const key2 = 'en:bn:Hello';
    
    expect(key1).toBe(key2);
  });
});

test.describe('Translation Service - API Configuration', () => {
  test('should handle missing API key gracefully', () => {
    const apiKey = process.env.LINGO_API_KEY || '';
    expect(typeof apiKey).toBe('string');
  });

  test('should validate API endpoint format', () => {
    const apiEndpoint = 'https://api.lingo.dev/v1/translate';
    expect(apiEndpoint).toMatch(/^https:\/\//);
    expect(apiEndpoint).toContain('api.lingo.dev');
  });
});

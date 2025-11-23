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
 * Unit tests for IndexedDB key storage
 * Tests the fixed storeMasterKey and retrieveMasterKey functions
 * These tests verify the transaction handling bug is resolved
 */

test.describe('IndexedDB Key Storage - Transaction Handling', () => {
  test('should store and retrieve master key without transaction errors', async ({ page }) => {
    // Navigate to a page that will load our crypto modules
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Test the key storage flow in the browser context
    const result = await page.evaluate(async () => {
      // Import the functions (they're available in the browser context)
      const { storeMasterKey, retrieveMasterKey, generateMasterKey } = await import('/lib/crypto/keys');
      
      try {
        // Generate a test key
        const { key, salt } = await generateMasterKey();
        
        // Store the key - this should not throw a transaction error
        await storeMasterKey(key, salt);
        
        // Retrieve the key to verify it was stored correctly
        const retrieved = await retrieveMasterKey();
        
        if (!retrieved) {
          return { success: false, error: 'Failed to retrieve key' };
        }
        
        // Verify the salt matches
        const saltMatches = retrieved.salt.length === salt.length &&
          retrieved.salt.every((val, idx) => val === salt[idx]);
        
        return { 
          success: true, 
          saltMatches,
          keyRetrieved: !!retrieved.key 
        };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.saltMatches).toBe(true);
      expect(result.keyRetrieved).toBe(true);
    } else {
      // If there's an error, fail with the error message
      throw new Error(`Key storage test failed: ${result.error}`);
    }
  });

  test('should handle multiple sequential store operations', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(async () => {
      const { storeMasterKey, generateMasterKey } = await import('/lib/crypto/keys');
      
      try {
        // Store key multiple times in sequence
        for (let i = 0; i < 3; i++) {
          const { key, salt } = await generateMasterKey();
          await storeMasterKey(key, salt);
        }
        
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });

    expect(result.success).toBe(true);
  });

  test('should handle retrieve when no key exists', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(async () => {
      const { retrieveMasterKey } = await import('/lib/crypto/keys');
      
      try {
        // Clear the database first
        const deleteRequest = indexedDB.deleteDatabase('4diary-keys');
        await new Promise<void>((resolve, reject) => {
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(deleteRequest.error);
        });
        
        // Try to retrieve when nothing exists
        const retrieved = await retrieveMasterKey();
        
        return { 
          success: true,
          isNull: retrieved === null
        };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.isNull).toBe(true);
    }
  });

  test('should not throw "transaction not active" error during signup flow', async ({ page }) => {
    // This test simulates the signup flow which was causing the error
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    // Mock the signup API
    await page.route('**/api/auth/signup', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true, 
          message: 'Account created successfully' 
        }),
        headers: {
          'Set-Cookie': 'session=test-token; Path=/; HttpOnly; SameSite=Lax'
        }
      });
    });

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Fill in signup form
    await page.fill('input[type="text"]', 'testuser');
    await page.fill('input[type="password"]', 'TestPass123!');
    
    // Check the terms checkbox if in signup mode
    const termsCheckbox = page.locator('input[type="checkbox"]#terms');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait a bit for any async operations
    await page.waitForTimeout(2000);

    // Check for transaction errors
    const hasTransactionError = consoleErrors.some(
      err => err.includes('transaction') && 
             (err.includes('not active') || err.includes('finished'))
    );

    expect(hasTransactionError).toBe(false);
  });
});

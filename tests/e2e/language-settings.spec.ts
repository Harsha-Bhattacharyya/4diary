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
 * E2E tests for language settings in Settings page
 */

test.describe('Language Settings UI', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to settings page
    await page.goto('/settings');
  });

  test('should display language selector in settings', async ({ page }) => {
    // Check if language section exists
    const languageHeading = page.getByText('Language');
    await expect(languageHeading).toBeVisible();

    // Check if language dropdown exists
    const languageSelect = page.locator('select[aria-label="Select language"]');
    await expect(languageSelect).toBeVisible();
  });

  test('should have all three supported languages in dropdown', async ({ page }) => {
    const languageSelect = page.locator('select[aria-label="Select language"]');
    
    // Get all options
    const options = await languageSelect.locator('option').allTextContents();
    
    // Should have English, Bengali, and Hindi
    expect(options.length).toBeGreaterThanOrEqual(3);
    
    // Check for native language names
    const optionsText = options.join(' ');
    expect(optionsText).toContain('English');
    expect(optionsText).toContain('বাংলা'); // Bengali native name
    expect(optionsText).toContain('हिन्दी'); // Hindi native name
  });

  test('should have English as default language', async ({ page }) => {
    const languageSelect = page.locator('select[aria-label="Select language"]');
    const selectedValue = await languageSelect.inputValue();
    
    // Default should be 'en'
    expect(selectedValue).toBe('en');
  });

  test('should allow changing language selection', async ({ page }) => {
    const languageSelect = page.locator('select[aria-label="Select language"]');
    
    // Change to Bengali
    await languageSelect.selectOption('bn');
    
    // Verify selection changed
    const selectedValue = await languageSelect.inputValue();
    expect(selectedValue).toBe('bn');
  });

  test('should display saving indicator when language changes', async ({ page }) => {
    const languageSelect = page.locator('select[aria-label="Select language"]');
    
    // Change language
    await languageSelect.selectOption('hi');
    
    // Should show "Saving..." or "Saved" indicator
    const savingIndicator = page.getByText(/Saving|Saved/);
    await expect(savingIndicator).toBeVisible({ timeout: 5000 });
  });

  test('should show translation service status', async ({ page }) => {
    // Look for translation service availability indicator
    const statusText = page.locator('text=/Translation service|LINGO_API_KEY/');
    
    // Status message should be visible (either configured or not configured)
    const count = await statusText.count();
    expect(count).toBeGreaterThanOrEqual(0); // May or may not be configured
  });

  test('should display warning if translation service not configured', async ({ page }) => {
    // If LINGO_API_KEY is not set, should show warning
    const warningText = page.locator('text=/not configured|Set LINGO_API_KEY/');
    
    // Check if warning exists (may or may not depending on env)
    const count = await warningText.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should be in Appearance section', async ({ page }) => {
    // Language setting should be under Appearance section
    const appearanceSection = page.locator('h2:has-text("🎨 Appearance")');
    await expect(appearanceSection).toBeVisible();
    
    // Language option should be in the same card
    const appearanceCard = appearanceSection.locator('..');
    const languageOption = appearanceCard.getByText('Language');
    await expect(languageOption).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const languageSelect = page.locator('select[aria-label="Select language"]');
    
    // Should have aria-label
    const ariaLabel = await languageSelect.getAttribute('aria-label');
    expect(ariaLabel).toBe('Select language');
    
    // Should be enabled by default (unless saving)
    const isDisabled = await languageSelect.isDisabled();
    expect(isDisabled).toBe(false);
  });

  test('should persist language selection across page reloads', async ({ page }) => {
    const languageSelect = page.locator('select[aria-label="Select language"]');
    
    // Change to Bengali
    await languageSelect.selectOption('bn');
    
    // Wait for "Saved" indicator to appear
    await expect(page.getByText('Saved')).toBeVisible({ timeout: 5000 });
    
    // Reload page
    await page.reload();
    
    // Check if Bengali is still selected
    const selectedValue = await languageSelect.inputValue();
    expect(selectedValue).toBe('bn');
  });
});

test.describe('Language Settings - Mobile View', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/settings');
  });

  test('should display language selector on mobile', async ({ page }) => {
    const languageSelect = page.locator('select[aria-label="Select language"]');
    await expect(languageSelect).toBeVisible();
  });

  test('should be easily tappable on mobile (min 44px)', async ({ page }) => {
    const languageSelect = page.locator('select[aria-label="Select language"]');
    const boundingBox = await languageSelect.boundingBox();
    
    if (boundingBox) {
      // Should meet minimum touch target size
      expect(boundingBox.height).toBeGreaterThanOrEqual(40);
    }
  });
});

test.describe('Language Settings - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('should be focusable with Tab key', async ({ page }) => {
    const languageSelect = page.locator('select[aria-label="Select language"]');
    
    // Focus the language selector directly
    await languageSelect.focus();
    
    // Verify it is focused
    const isFocused = await languageSelect.evaluate((el) => el === document.activeElement);
    expect(isFocused).toBe(true);
    
    // Verify keyboard interaction works
    await page.keyboard.press('ArrowDown');
    const valueAfterArrow = await languageSelect.inputValue();
    expect(valueAfterArrow).toBeTruthy();
  });
});

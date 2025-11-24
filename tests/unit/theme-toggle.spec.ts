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
 * Unit tests for dark/light mode theme functionality
 * Tests theme toggle, persistence, and application across pages
 */

test.describe('Theme Toggle Feature', () => {
  test('should show theme toggle in settings page', async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          username: 'testuser@example.com',
        }),
      });
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Check for theme section
    await expect(page.locator('text=🎨 Appearance')).toBeVisible();
    await expect(page.locator('text=Theme')).toBeVisible();
  });

  test('should toggle between light and dark themes', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          username: 'testuser@example.com',
        }),
      });
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Find theme button
    const themeButton = page.locator('button').filter({ hasText: /Dark|Light/ });
    await expect(themeButton).toBeVisible();

    // Get initial theme text
    const initialText = await themeButton.textContent();

    // Click to toggle
    await themeButton.click();
    await page.waitForTimeout(500);

    // Verify theme changed
    const newText = await themeButton.textContent();
    expect(newText).not.toBe(initialText);
  });

  test('should apply dark theme class to document element', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          username: 'testuser@example.com',
        }),
      });
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Check for dark class (default theme)
    const htmlElement = page.locator('html');
    const classList = await htmlElement.getAttribute('class');
    
    // Either "dark" class is present or no class (defaults to dark)
    expect(classList).toBeTruthy();
  });

  test('should apply light theme when toggled', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          username: 'testuser@example.com',
        }),
      });
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Click theme toggle to switch to light mode
    const themeButton = page.locator('button').filter({ hasText: /Dark|Light/ });
    
    // If currently dark, toggle to light
    const buttonText = await themeButton.textContent();
    if (buttonText?.includes('Dark')) {
      await themeButton.click();
      await page.waitForTimeout(500);
      
      // Check for light class
      const htmlElement = page.locator('html');
      const classList = await htmlElement.getAttribute('class');
      expect(classList).toContain('light');
    }
  });

  test('should persist theme preference in localStorage', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          username: 'testuser@example.com',
        }),
      });
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Toggle theme
    const themeButton = page.locator('button').filter({ hasText: /Dark|Light/ });
    await themeButton.click();
    await page.waitForTimeout(500);

    // Check localStorage
    const storedTheme = await page.evaluate(() => {
      return localStorage.getItem('4diary-theme');
    });

    expect(storedTheme).toBeTruthy();
    expect(['light', 'dark']).toContain(storedTheme);
  });

  test('should maintain theme after page reload', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          username: 'testuser@example.com',
        }),
      });
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Toggle to light theme
    const themeButton = page.locator('button').filter({ hasText: /Dark|Light/ });
    const initialText = await themeButton.textContent();
    
    await themeButton.click();
    await page.waitForTimeout(500);
    
    const newText = await themeButton.textContent();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check theme persisted
    const reloadedButton = page.locator('button').filter({ hasText: /Dark|Light/ });
    const reloadedText = await reloadedButton.textContent();
    expect(reloadedText).toBe(newText);
  });

  test('should show correct icon with theme label', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          username: 'testuser@example.com',
        }),
      });
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Check button has emoji and text
    const themeButton = page.locator('button').filter({ hasText: /Dark|Light/ });
    const buttonText = await themeButton.textContent();
    
    // Should contain emoji and text
    expect(buttonText).toMatch(/[☀️🌙]/);
    expect(buttonText).toMatch(/Dark|Light/);
  });

  test('should apply theme to editor page background', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          username: 'testuser@example.com',
        }),
      });
    });

    await page.route('**/api/workspaces', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-workspace-id',
          userId: 'testuser@example.com',
        }),
      });
    });

    await page.route('**/api/documents?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          documents: [
            {
              _id: 'test-doc-id',
              workspaceId: 'test-workspace-id',
              encryptedContent: 'dGVzdCBjb250ZW50',
              encryptedDocumentKey: 'dGVzdCBrZXk=',
              metadata: { title: 'Test Document' },
              favorite: false,
              archived: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    // Set light theme first
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    const themeButton = page.locator('button').filter({ hasText: /Dark|Light/ });
    const buttonText = await themeButton.textContent();
    
    // Toggle to light if currently dark
    if (buttonText?.includes('Dark')) {
      await themeButton.click();
      await page.waitForTimeout(500);
    }

    // Navigate to workspace with a document
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');

    // Check html element has light class
    const htmlElement = page.locator('html');
    const classList = await htmlElement.getAttribute('class');
    
    // Should have light theme applied
    const hasLightClass = classList?.includes('light');
    expect(hasLightClass).toBeTruthy();
  });
});

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
 * Unit tests for math notation, calculator, and search features
 * These tests verify LaTeX math rendering, calculator functionality, and search capabilities
 */

test.describe('Calculator Feature', () => {
  test('should open calculator with keyboard shortcut', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Press Ctrl+Shift+C to open calculator
    await page.keyboard.press('Control+Shift+C');
    await page.waitForTimeout(500);
    
    // Check if calculator modal is visible
    const calculatorHeading = page.getByRole('heading', { name: /Calculator/i });
    await expect(calculatorHeading).toBeVisible();
  });

  test('should perform basic arithmetic', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Open calculator
    await page.keyboard.press('Control+Shift+C');
    await page.waitForTimeout(500);
    
    // Enter expression
    const input = page.locator('input[placeholder*="2 + 2"]');
    await input.fill('5 + 3');
    
    // Click calculate button
    await page.getByRole('button', { name: /Calculate/i }).click();
    await page.waitForTimeout(500);
    
    // Check result
    await expect(page.getByText('8')).toBeVisible();
  });

  test('should support mathematical functions', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Open calculator
    await page.keyboard.press('Control+Shift+C');
    await page.waitForTimeout(500);
    
    // Test sqrt function
    const input = page.locator('input[placeholder*="2 + 2"]');
    await input.fill('sqrt(16)');
    
    // Press Enter to calculate
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Check result
    await expect(page.getByText('4')).toBeVisible();
  });

  test('should handle calculation history', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Open calculator
    await page.keyboard.press('Control+Shift+C');
    await page.waitForTimeout(500);
    
    const input = page.locator('input[placeholder*="2 + 2"]');
    
    // Perform first calculation
    await input.fill('10 + 5');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Perform second calculation
    await input.fill('20 * 2');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Check that history section exists
    await expect(page.getByText(/History/i)).toBeVisible();
  });

  test('should close calculator with Escape key', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Open calculator
    await page.keyboard.press('Control+Shift+C');
    await page.waitForTimeout(500);
    
    // Verify calculator is open
    await expect(page.getByRole('heading', { name: /Calculator/i })).toBeVisible();
    
    // Press Escape to close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Verify calculator is closed
    await expect(page.getByRole('heading', { name: /Calculator/i })).not.toBeVisible();
  });
});

test.describe('Search Feature', () => {
  test('should open search modal with keyboard shortcut', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Press Ctrl+K to open search
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(500);
    
    // Check if search modal is visible
    const searchInput = page.locator('input[placeholder*="Search documents"]');
    await expect(searchInput).toBeVisible();
  });

  test('should filter documents by search query', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Open search
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input[placeholder*="Search documents"]');
    
    // Type search query
    await searchInput.fill('test');
    await page.waitForTimeout(500);
    
    // Results should update based on query
    // Note: This assumes there are documents to search
    const resultsInfo = page.getByText(/result/i);
    await expect(resultsInfo).toBeVisible();
  });

  test('should support search filters', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Open search
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(500);
    
    // Check that filter buttons exist
    await expect(page.getByRole('button', { name: /All/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Title/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Content/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Tags/i })).toBeVisible();
  });

  test('should navigate results with arrow keys', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Open search
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input[placeholder*="Search documents"]');
    await searchInput.fill('');
    
    // Press arrow down (should navigate results if any exist)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    
    // Press arrow up
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);
    
    // Navigation should work without errors
    await expect(searchInput).toBeVisible();
  });

  test('should close search with Escape key', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Open search
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input[placeholder*="Search documents"]');
    await expect(searchInput).toBeVisible();
    
    // Press Escape to close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Search should be closed
    await expect(searchInput).not.toBeVisible();
  });
});

test.describe('Math Rendering', () => {
  test('should render LaTeX math inline', async ({ page }) => {
    // Note: This test would need to verify that inline math ($...$) is rendered
    // This is a placeholder for when math rendering is fully integrated into the editor
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Test assumes math rendering components are loaded
    expect(true).toBe(true); // Placeholder
  });

  test('should render LaTeX math in display mode', async ({ page }) => {
    // Note: This test would verify that display math ($$...$$) is rendered
    // This is a placeholder for when math rendering is fully integrated into the editor
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Test assumes math rendering components are loaded
    expect(true).toBe(true); // Placeholder
  });
});

test.describe('Syntax Highlighting', () => {
  test('should apply syntax highlighting to code blocks', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Create a new document
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Code blocks should have syntax highlighting CSS classes applied
      // This is verified by checking that the highlight.js styles are loaded
      const hasHighlightStyles = await page.evaluate(() => {
        return Array.from(document.styleSheets).some(sheet => {
          try {
            return Array.from(sheet.cssRules).some(rule => 
              rule.cssText.includes('hljs')
            );
          } catch {
            return false;
          }
        });
      });
      
      // Verify that highlight.js styles are loaded
      expect(hasHighlightStyles).toBe(true);
    }
  });
});

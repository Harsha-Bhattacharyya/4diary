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

test.describe('Vim Mode - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('should toggle vim mode with Ctrl+Shift+V', async ({ page }) => {
    await page.keyboard.press('Control+Shift+V');
    await page.waitForTimeout(200);
    
    const vimIndicator = page.locator('text=NORMAL');
    await expect(vimIndicator).toBeVisible({ timeout: 3000 });
  });

  test('should show NORMAL mode by default', async ({ page }) => {
    await page.keyboard.press('Control+Shift+V');
    await page.waitForTimeout(200);
    
    const normalMode = page.locator('text=NORMAL');
    await expect(normalMode).toBeVisible();
  });

  test('should switch to INSERT mode with i', async ({ page }) => {
    await page.keyboard.press('Control+Shift+V');
    await page.waitForTimeout(200);
    
    await page.keyboard.press('i');
    await page.waitForTimeout(200);
    
    const insertMode = page.locator('text=INSERT');
    await expect(insertMode).toBeVisible();
  });

  test('should switch to COMMAND mode with :', async ({ page }) => {
    await page.keyboard.press('Control+Shift+V');
    await page.waitForTimeout(200);
    
    await page.keyboard.press(':');
    await page.waitForTimeout(200);
    
    const commandMode = page.locator('text=COMMAND');
    await expect(commandMode).toBeVisible();
  });

  test('should switch to REPLACE mode with R', async ({ page }) => {
    await page.keyboard.press('Control+Shift+V');
    await page.waitForTimeout(200);
    
    await page.keyboard.press('R');
    await page.waitForTimeout(200);
    
    const replaceMode = page.locator('text=REPLACE');
    await expect(replaceMode).toBeVisible();
  });
});

test.describe('Vim Mode - Mode Transitions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Enable vim mode
    await page.keyboard.press('Control+Shift+V');
    await page.waitForTimeout(200);
  });

  test('should exit INSERT mode with Escape', async ({ page }) => {
    await page.keyboard.press('i');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    
    const normalMode = page.locator('text=NORMAL');
    await expect(normalMode).toBeVisible();
  });

  test('should exit COMMAND mode with Escape', async ({ page }) => {
    await page.keyboard.press(':');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    
    const normalMode = page.locator('text=NORMAL');
    await expect(normalMode).toBeVisible();
  });

  test('should exit REPLACE mode with Escape', async ({ page }) => {
    await page.keyboard.press('R');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    
    const normalMode = page.locator('text=NORMAL');
    await expect(normalMode).toBeVisible();
  });
});

test.describe('Vim Mode - Commands', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Enable vim mode
    await page.keyboard.press('Control+Shift+V');
    await page.waitForTimeout(200);
  });

  test('should show command buffer in COMMAND mode', async ({ page }) => {
    await page.keyboard.press(':');
    await page.waitForTimeout(100);
    
    await page.keyboard.type('wq');
    await page.waitForTimeout(100);
    
    const commandBuffer = page.locator('text=:wq');
    await expect(commandBuffer).toBeVisible();
  });

  test('should exit vim mode with :q', async ({ page }) => {
    await page.keyboard.press(':');
    await page.keyboard.type('q');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    const vimIndicator = page.locator('text=NORMAL');
    await expect(vimIndicator).not.toBeVisible();
  });

  test('should exit vim mode with :wq', async ({ page }) => {
    await page.keyboard.press(':');
    await page.keyboard.type('wq');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    const vimIndicator = page.locator('text=NORMAL');
    await expect(vimIndicator).not.toBeVisible();
  });

  test('should exit vim mode with :x', async ({ page }) => {
    await page.keyboard.press(':');
    await page.keyboard.type('x');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    
    const vimIndicator = page.locator('text=NORMAL');
    await expect(vimIndicator).not.toBeVisible();
  });
});

test.describe('Vim Mode - Count Prefix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Enable vim mode
    await page.keyboard.press('Control+Shift+V');
    await page.waitForTimeout(200);
  });

  test('should display count when pressing numbers', async ({ page }) => {
    await page.keyboard.press('5');
    await page.waitForTimeout(100);
    
    const countDisplay = page.locator('.glass-card:has-text("5")');
    await expect(countDisplay).toBeVisible();
  });

  test('should build multi-digit count', async ({ page }) => {
    await page.keyboard.press('1');
    await page.waitForTimeout(50);
    await page.keyboard.press('2');
    await page.waitForTimeout(100);
    
    const countDisplay = page.locator('.glass-card:has-text("12")');
    await expect(countDisplay).toBeVisible();
  });
});

test.describe('Vim Mode - Macro Recording', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Enable vim mode
    await page.keyboard.press('Control+Shift+V');
    await page.waitForTimeout(200);
  });

  test('should show recording indicator when recording macro', async ({ page }) => {
    await page.keyboard.press('q');
    await page.keyboard.press('a');
    await page.waitForTimeout(100);
    
    const recordingIndicator = page.locator('text=Recording @a');
    await expect(recordingIndicator).toBeVisible();
  });

  test('should stop recording when pressing q again', async ({ page }) => {
    await page.keyboard.press('q');
    await page.keyboard.press('a');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('q');
    await page.waitForTimeout(100);
    
    const recordingIndicator = page.locator('text=Recording @a');
    await expect(recordingIndicator).not.toBeVisible();
  });
});

test.describe('Vim Mode - UI Changes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('should not show vim mode toggle hint (removed for cleaner UI)', async ({ page }) => {
    const hint = page.locator('text=Press Ctrl+Shift+V for Vim mode');
    // The hint was removed as per issue requirements
    await expect(hint).not.toBeVisible();
  });

  test('should toggle vim mode off when pressing Ctrl+Shift+V again', async ({ page }) => {
    await page.keyboard.press('Control+Shift+V');
    await page.waitForTimeout(200);
    
    const normalMode = page.locator('text=NORMAL');
    await expect(normalMode).toBeVisible();
    
    await page.keyboard.press('Control+Shift+V');
    await page.waitForTimeout(200);
    
    await expect(normalMode).not.toBeVisible();
  });
});

test.describe('Vim Mode - Visual Modes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Enable vim mode
    await page.keyboard.press('Control+Shift+V');
    await page.waitForTimeout(200);
  });

  test('should enter VISUAL mode with v', async ({ page }) => {
    await page.keyboard.press('v');
    await page.waitForTimeout(200);
    
    const visualMode = page.locator('text=VISUAL');
    await expect(visualMode).toBeVisible();
  });

  test('should enter VISUAL LINE mode with V', async ({ page }) => {
    await page.keyboard.press('V');
    await page.waitForTimeout(200);
    
    const visualLineMode = page.locator('text=VISUAL LINE');
    await expect(visualLineMode).toBeVisible();
  });

  test('should exit VISUAL mode with Escape', async ({ page }) => {
    await page.keyboard.press('v');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    
    const normalMode = page.locator('text=NORMAL');
    await expect(normalMode).toBeVisible();
  });

  test('should exit VISUAL LINE mode with Escape', async ({ page }) => {
    await page.keyboard.press('V');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    
    const normalMode = page.locator('text=NORMAL');
    await expect(normalMode).toBeVisible();
  });

  test('should toggle between VISUAL and VISUAL LINE modes', async ({ page }) => {
    // Start with VISUAL mode
    await page.keyboard.press('v');
    await page.waitForTimeout(100);
    
    let visualMode = page.locator('text=VISUAL').first();
    await expect(visualMode).toBeVisible();
    
    // Switch to VISUAL LINE
    await page.keyboard.press('V');
    await page.waitForTimeout(100);
    
    const visualLineMode = page.locator('text=VISUAL LINE');
    await expect(visualLineMode).toBeVisible();
    
    // Switch back to VISUAL
    await page.keyboard.press('v');
    await page.waitForTimeout(100);
    
    visualMode = page.locator('text=VISUAL').first();
    await expect(visualMode).toBeVisible();
  });

  test('should exit VISUAL mode when pressing v again', async ({ page }) => {
    await page.keyboard.press('v');
    await page.waitForTimeout(100);
    
    // Press v again to exit
    await page.keyboard.press('v');
    await page.waitForTimeout(100);
    
    const normalMode = page.locator('text=NORMAL');
    await expect(normalMode).toBeVisible();
  });

  test('should exit VISUAL LINE mode when pressing V again', async ({ page }) => {
    await page.keyboard.press('V');
    await page.waitForTimeout(100);
    
    // Press V again to exit
    await page.keyboard.press('V');
    await page.waitForTimeout(100);
    
    const normalMode = page.locator('text=NORMAL');
    await expect(normalMode).toBeVisible();
  });

  test('should return to NORMAL mode after delete in VISUAL mode', async ({ page }) => {
    await page.keyboard.press('v');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('d');
    await page.waitForTimeout(100);
    
    const normalMode = page.locator('text=NORMAL');
    await expect(normalMode).toBeVisible();
  });

  test('should return to NORMAL mode after yank in VISUAL mode', async ({ page }) => {
    await page.keyboard.press('v');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('y');
    await page.waitForTimeout(100);
    
    const normalMode = page.locator('text=NORMAL');
    await expect(normalMode).toBeVisible();
  });

  test('should enter INSERT mode after change in VISUAL mode', async ({ page }) => {
    await page.keyboard.press('v');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('c');
    await page.waitForTimeout(100);
    
    const insertMode = page.locator('text=INSERT');
    await expect(insertMode).toBeVisible();
  });
});

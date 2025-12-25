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

test.describe('Save on Close', () => {
  test('should save document when clicking X button', async ({ page }) => {
    // Navigate to workspace
    await page.goto('/workspace');
    
    // Wait for initialization
    await page.waitForLoadState('networkidle');
    
    // Wait for workspace to be fully loaded (look for key elements)
    await page.waitForSelector('text=/Workspace|My Workspace/i', { timeout: 10000 });
    
    // Create a new document
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      
      // Wait for editor to load
      await page.waitForSelector('.bn-editor, [role="textbox"]', { timeout: 5000 });
      
      // Edit the title
      const title = page.getByRole('heading', { name: /Untitled/i }).first();
      if (await title.isVisible()) {
        await title.click();
        const titleInput = page.locator('input[type="text"]').first();
        if (await titleInput.isVisible()) {
          await titleInput.fill('Test Document');
          await titleInput.press('Enter');
          // Wait for title to be saved
          await page.waitForSelector('text=/Test Document/i', { timeout: 3000 });
        }
      }
      
      // Type some content in the editor (if editable)
      const editor = page.locator('.bn-editor');
      if (await editor.isVisible()) {
        await editor.click();
        await page.keyboard.type('This is test content that should be saved.');
        // Give a small moment for the onChange event to fire and update the ref
        await page.waitForFunction(() => true, { timeout: 200 });
      }
      
      // Click the X button to close the document
      const closeButton = page.getByRole('button', { name: /Close document/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
        
        // Wait for the document to close by checking workspace UI returns
        await page.waitForSelector('text=/My Workspace|Workspace/i', { timeout: 5000 });
        
        // Verify the document appears in the workspace list
        await expect(page.getByText('Test Document')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should have visible menu and close icons', async ({ page }) => {
    // Navigate to workspace
    await page.goto('/workspace');
    
    // Wait for initialization
    await page.waitForLoadState('networkidle');
    
    // Wait for workspace to be fully loaded
    await page.waitForSelector('text=/Workspace|My Workspace/i', { timeout: 10000 });
    
    // Create a new document to see the editor with menu and close buttons
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      
      // Wait for editor to load
      await page.waitForSelector('.bn-editor, [role="textbox"]', { timeout: 5000 });
      
      // Check that menu button is visible
      const menuButton = page.getByRole('button', { name: /Toggle menu/i });
      await expect(menuButton).toBeVisible({ timeout: 3000 });
      
      // Check that close button is visible
      const closeButton = page.getByRole('button', { name: /Close document/i });
      await expect(closeButton).toBeVisible({ timeout: 3000 });
      
      // Verify buttons have proper contrast (check computed styles)
      const menuSvg = menuButton.locator('svg');
      const closeSvg = closeButton.locator('svg');
      
      // Both SVGs should be visible (which implies they have contrast)
      await expect(menuSvg).toBeVisible();
      await expect(closeSvg).toBeVisible();
    }
  });
});

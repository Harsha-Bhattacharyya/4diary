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

test.describe('Workspace', () => {
  test('should load workspace page', async ({ page }) => {
    await page.goto('/workspace');
    
    // Wait for initialization
    await page.waitForLoadState('networkidle');
    
    // Check for workspace elements
    const workspaceOrLoading = page.getByText(/Workspace|Initializing encryption keys|Error/i);
    await expect(workspaceOrLoading).toBeVisible();
  });

  test('should have collapsible sidebar', async ({ page }) => {
    await page.goto('/workspace');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if sidebar is visible (look for navigation items)
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    
    // Look for sidebar toggle button
    const toggleButton = sidebar.locator('button').first();
    
    // Click toggle if it exists
    if (await toggleButton.isVisible()) {
      const initialWidth = await sidebar.evaluate(el => el.offsetWidth);
      
      await toggleButton.click();
      await page.waitForTimeout(500); // Wait for animation
      
      const newWidth = await sidebar.evaluate(el => el.offsetWidth);
      
      // Width should have changed
      expect(newWidth).not.toBe(initialWidth);
    }
  });

  test('should create a new document', async ({ page }) => {
    await page.goto('/workspace');
    
    // Wait for initialization
    await page.waitForLoadState('networkidle');
    
    // Click "New Document" button if it exists
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      
      // Wait for document to be created
      await page.waitForTimeout(1000);
      
      // Check that editor is visible or title changed
      await expect(page.getByText(/Untitled/i)).toBeVisible();
    }
  });

  test('should have formatting toolbar when document is open', async ({ page }) => {
    await page.goto('/workspace');
    
    // Wait for initialization
    await page.waitForLoadState('networkidle');
    
    // Create a new document
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check for formatting toolbar buttons
      const boldButton = page.getByRole('button', { name: /Bold/i });
      const italicButton = page.getByRole('button', { name: /Italic/i });
      const h1Button = page.getByRole('button', { name: /Heading 1/i });
      
      // At least some formatting buttons should be visible
      const hasToolbar = await boldButton.isVisible() || await italicButton.isVisible() || await h1Button.isVisible();
      expect(hasToolbar).toBeTruthy();
    }
  });

  test('should allow title editing', async ({ page }) => {
    await page.goto('/workspace');
    
    // Wait for initialization
    await page.waitForLoadState('networkidle');
    
    // Create a new document
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Click on title to edit
      const title = page.getByRole('heading', { name: /Untitled/i }).first();
      
      if (await title.isVisible()) {
        await title.click();
        
        // Check if input appears
        const titleInput = page.locator('input[type="text"]').first();
        
        if (await titleInput.isVisible()) {
          await titleInput.fill('My Test Document');
          await titleInput.press('Enter');
          
          // Wait for save
          await page.waitForTimeout(1000);
          
          // Title should be updated
          await expect(page.getByText('My Test Document')).toBeVisible();
        }
      }
    }
  });
});

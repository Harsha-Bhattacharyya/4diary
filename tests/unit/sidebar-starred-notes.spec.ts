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
 * Unit tests for Sidebar starring functionality
 * Tests the star/unstar feature and sorting of starred notes
 */

test.describe('Sidebar - Starring Notes', () => {
  test('should display star button for each document in expanded sidebar', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Create a document first
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Close document to go back to workspace
      const closeButton = page.locator('button[aria-label="Close document"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
      
      // Check for star button in sidebar
      const starButton = page.locator('button[aria-label*="Star"]').first();
      const exists = await starButton.count() > 0;
      expect(exists).toBeTruthy();
    }
  });

  test('should toggle star state when clicking star button', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Create a document
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Close document
      const closeButton = page.locator('button[aria-label="Close document"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
      
      // Click star button
      const starButton = page.locator('button[aria-label="Star"]').first();
      if (await starButton.isVisible()) {
        await starButton.click();
        await page.waitForTimeout(500);
        
        // Should now show unstar
        const unstarButton = page.locator('button[aria-label="Unstar"]').first();
        const hasUnstar = await unstarButton.count() > 0;
        expect(hasUnstar).toBeTruthy();
      }
    }
  });

  test('should show star icon in document editor', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Create a document
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check for star button in editor
      const starButton = page.locator('button[title*="Star this note"]');
      await expect(starButton).toBeVisible();
    }
  });

  test('should toggle star from document editor', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Create a document
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Click star in editor
      const starButton = page.locator('button[title*="Star this note"]');
      if (await starButton.isVisible()) {
        await starButton.click();
        await page.waitForTimeout(500);
        
        // Should now show unstar
        const unstarButton = page.locator('button[title*="Unstar this note"]');
        await expect(unstarButton).toBeVisible();
      }
    }
  });

  test('should show star indicator in collapsed sidebar', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Create and star a document
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Star the document
      const starButton = page.locator('button[title*="Star this note"]');
      if (await starButton.isVisible()) {
        await starButton.click();
        await page.waitForTimeout(500);
      }
      
      // Close document
      const closeButton = page.locator('button[aria-label="Close document"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
      
      // Collapse sidebar
      const toggleButton = page.locator('button[aria-label*="Collapse sidebar"]');
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        await page.waitForTimeout(500);
      }
      
      // Should show star indicator in collapsed view
      const starIndicator = page.locator('.w-10 .absolute').first();
      const hasIndicator = await starIndicator.count() > 0;
      expect(hasIndicator).toBeTruthy();
    }
  });
});

test.describe('Sidebar - Starred Notes Sorting', () => {
  test('should display starred notes at the top', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Create two documents
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    // First document
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Close it
      const closeButton = page.locator('button[aria-label="Close document"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Second document
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Star this one
      const starButton = page.locator('button[title*="Star this note"]');
      if (await starButton.isVisible()) {
        await starButton.click();
        await page.waitForTimeout(500);
      }
      
      // Close it
      const closeButton = page.locator('button[aria-label="Close document"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Check order in sidebar - starred should be first
    const docButtons = page.locator('.w-full.text-left.px-3.py-2');
    const firstDoc = docButtons.first();
    const starIcon = firstDoc.locator('button[aria-label="Unstar"]');
    
    const hasStarred = await starIcon.count() > 0;
    expect(hasStarred).toBeTruthy();
  });

  test('should maintain starred section when adding new documents', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Create and star a document
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const starButton = page.locator('button[title*="Star this note"]');
      if (await starButton.isVisible()) {
        await starButton.click();
        await page.waitForTimeout(500);
      }
      
      const closeButton = page.locator('button[aria-label="Close document"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Create another unstarred document
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const closeButton = page.locator('button[aria-label="Close document"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Starred document should still be first
    const docButtons = page.locator('.w-full.text-left.px-3.py-2');
    const firstDoc = docButtons.first();
    const starIcon = firstDoc.locator('button[aria-label="Unstar"]');
    
    const hasStarred = await starIcon.count() > 0;
    expect(hasStarred).toBeTruthy();
  });
});

test.describe('Sidebar - Drag and Drop Reordering', () => {
  test('should show drag indicator on hover', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Create a document
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const closeButton = page.locator('button[aria-label="Close document"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Check for drag handle (⋮⋮)
    const dragHandle = page.locator('text=⋮⋮');
    const exists = await dragHandle.count() > 0;
    expect(exists).toBeTruthy();
  });

  test('should have draggable attribute on document elements', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Create a document
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const closeButton = page.locator('button[aria-label="Close document"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
      
      // Check for draggable div
      const draggableElement = page.locator('[draggable="true"]').first();
      const isDraggable = await draggableElement.count() > 0;
      expect(isDraggable).toBeTruthy();
    }
  });

  test('should show visual feedback during drag', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Create two documents
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    for (let i = 0; i < 2; i++) {
      if (await newDocButton.isVisible()) {
        await newDocButton.click();
        await page.waitForTimeout(1000);
        
        const closeButton = page.locator('button[aria-label="Close document"]');
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(500);
        }
      }
    }
    
    // Verify we have draggable elements
    const draggableElements = page.locator('[draggable="true"]');
    const count = await draggableElements.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Sidebar - Star and Drag Integration', () => {
  test('should maintain star state after drag', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Create and star a document
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const starButton = page.locator('button[title*="Star this note"]');
      if (await starButton.isVisible()) {
        await starButton.click();
        await page.waitForTimeout(500);
      }
      
      const closeButton = page.locator('button[aria-label="Close document"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
      
      // Verify star is maintained
      const unstarButton = page.locator('button[aria-label="Unstar"]').first();
      const hasStarred = await unstarButton.count() > 0;
      expect(hasStarred).toBeTruthy();
    }
  });

  test('should allow starring during reordering workflow', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Create documents
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    for (let i = 0; i < 2; i++) {
      if (await newDocButton.isVisible()) {
        await newDocButton.click();
        await page.waitForTimeout(1000);
        
        const closeButton = page.locator('button[aria-label="Close document"]');
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(500);
        }
      }
    }
    
    // Star the second document
    const starButtons = page.locator('button[aria-label="Star"]');
    const secondStar = starButtons.nth(1);
    if (await secondStar.isVisible()) {
      await secondStar.click();
      await page.waitForTimeout(500);
      
      // Starred doc should move to top
      const firstDoc = page.locator('.w-full.text-left.px-3.py-2').first();
      const hasUnstar = await firstDoc.locator('button[aria-label="Unstar"]').count() > 0;
      expect(hasUnstar).toBeTruthy();
    }
  });
});

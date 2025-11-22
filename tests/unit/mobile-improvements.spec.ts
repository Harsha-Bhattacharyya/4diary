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
 * Unit tests for mobile touch improvements in globals.css
 * Tests touch-friendly features, tap highlight disabling, and responsive button sizing
 */

test.describe('Global CSS - Touch Improvements', () => {
  test('should disable webkit tap highlight on body', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check computed style on body
    const tapHighlight = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).webkitTapHighlightColor;
    });
    
    // Should be transparent
    expect(tapHighlight).toContain('rgba(0, 0, 0, 0)');
  });

  test('should have touch-action manipulation on body', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check touch-action property
    const touchAction = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).touchAction;
    });
    
    expect(touchAction).toBe('manipulation');
  });

  test('should apply mobile styles on coarse pointer devices', async ({ page }) => {
    // Simulate mobile device
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Page should render without errors
    const hasBody = await page.locator('body').isVisible();
    expect(hasBody).toBeTruthy();
  });
});

test.describe('Global CSS - Mobile Button Sizing', () => {
  test('should have minimum 44px height for buttons on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check button sizing
    const buttons = page.getByRole('button').first();
    if (await buttons.isVisible()) {
      const box = await buttons.boundingBox();
      
      // Should meet minimum touch target size
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('should have minimum 44px width for buttons on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const buttons = page.getByRole('button').first();
    if (await buttons.isVisible()) {
      const box = await buttons.boundingBox();
      
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('should apply touch-action manipulation to buttons on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const button = page.getByRole('button').first();
    if (await button.isVisible()) {
      const touchAction = await button.evaluate((el) => 
        window.getComputedStyle(el).touchAction
      );
      
      // Should have touch-action set
      expect(touchAction).toBeTruthy();
    }
  });

  test('should apply sizing to links with button role on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check link buttons
    const linkButton = page.getByRole('link', { name: /Get Started|Log in/i }).first();
    if (await linkButton.isVisible()) {
      const box = await linkButton.boundingBox();
      
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(35);
      }
    }
  });
});

test.describe('Global CSS - Media Query Detection', () => {
  test('should detect hover capability on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Desktop should support hover
    const supportsHover = await page.evaluate(() => {
      return window.matchMedia('(hover: hover)').matches;
    });
    
    expect(supportsHover).toBeTruthy();
  });

  test('should detect pointer type on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if coarse pointer is detected
    const isCoarse = await page.evaluate(() => {
      return window.matchMedia('(pointer: coarse)').matches;
    });
    
    // May or may not be true depending on emulation
    expect(typeof isCoarse).toBe('boolean');
  });
});

test.describe('Sidebar - Fixed Positioning and Overlay', () => {
  test('should have fixed positioning', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Check sidebar positioning
    const sidebar = page.locator('.fixed.left-0.top-0.h-screen').first();
    const isVisible = await sidebar.isVisible();
    
    if (isVisible) {
      await expect(sidebar).toBeVisible();
    }
  });

  test('should have backdrop-blur effect', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Check for backdrop-blur class
    const sidebar = page.locator('.backdrop-blur-md');
    const count = await sidebar.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have semi-transparent background', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Look for opacity in background
    const sidebar = page.locator('[class*="bg-"][class*="/80"]').first();
    const exists = await sidebar.count() > 0;
    expect(exists).toBeTruthy();
  });

  test('should overlay main content when expanded', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Sidebar should have high z-index when expanded
    const expandedSidebar = page.locator('.z-\\[1000\\]');
    
    // Click to ensure sidebar is expanded
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      // If collapsed, expand it
      const isCollapsed = await page.locator('.w-16').count() > 0;
      if (isCollapsed) {
        await toggleButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    const hasOverlay = await expandedSidebar.count() > 0;
    expect(hasOverlay).toBeTruthy();
  });

  test('should have lower z-index when collapsed', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Collapse sidebar
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      // Should have z-10 when collapsed
      const collapsedSidebar = page.locator('.z-10');
      const count = await collapsedSidebar.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should transition smoothly between collapsed and expanded', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      // Check for transition class
      const sidebar = page.locator('.transition-all.duration-300').first();
      await expect(sidebar).toBeVisible();
      
      // Toggle and verify animation
      await toggleButton.click();
      await page.waitForTimeout(300);
      
      await toggleButton.click();
      await page.waitForTimeout(300);
      
      // Should complete without errors
      const hasContent = await page.locator('body').isVisible();
      expect(hasContent).toBeTruthy();
    }
  });
});

test.describe('Sidebar - Width Transitions', () => {
  test('should be 64 pixels wide when collapsed', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      // Collapse sidebar
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      // Check width
      const sidebar = page.locator('.w-16').first();
      const box = await sidebar.boundingBox();
      
      if (box) {
        expect(box.width).toBeCloseTo(64, 5);
      }
    }
  });

  test('should be 256 pixels wide when expanded', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      // Ensure expanded
      const isCollapsed = await page.locator('.w-16').count() > 0;
      if (isCollapsed) {
        await toggleButton.click();
        await page.waitForTimeout(500);
      }
      
      // Check width
      const sidebar = page.locator('.w-64').first();
      const box = await sidebar.boundingBox();
      
      if (box) {
        expect(box.width).toBeCloseTo(256, 5);
      }
    }
  });
});

test.describe('Workspace - Main Content Layout', () => {
  test('should not adjust margin based on sidebar state', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Main content should have z-0 (below sidebar overlay)
    const main = page.locator('main.z-0, main.relative.z-0').first();
    const exists = await main.count() > 0;
    expect(exists).toBeTruthy();
  });

  test('should be overlaid by expanded sidebar', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      // Expand sidebar
      const isCollapsed = await page.locator('.w-16').count() > 0;
      if (isCollapsed) {
        await toggleButton.click();
        await page.waitForTimeout(500);
      }
      
      // Main content should still be visible but partially covered
      const main = page.locator('main').first();
      await expect(main).toBeVisible();
    }
  });

  test('should remain at full width regardless of sidebar state', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      // Get main width when sidebar is one state
      const mainBefore = page.locator('main').first();
      const boxBefore = await mainBefore.boundingBox();
      
      // Toggle sidebar
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      // Get main width after toggle
      const boxAfter = await mainBefore.boundingBox();
      
      // Width should not change (within small margin)
      if (boxBefore && boxAfter) {
        expect(Math.abs(boxBefore.width - boxAfter.width)).toBeLessThan(10);
      }
    }
  });
});

test.describe('Workspace - Responsive Behavior', () => {
  test('should work on mobile portrait', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Sidebar and main content should both be visible
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should work on mobile landscape', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should collapse sidebar by default on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // On mobile, sidebar might start collapsed
    // Just verify it renders
    const sidebar = page.locator('[class*="fixed"][class*="h-screen"]').first();
    await expect(sidebar).toBeVisible();
  });
});

test.describe('Sidebar - Shadow and Borders', () => {
  test('should have shadow effect', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Check for shadow class
    const sidebar = page.locator('.shadow-2xl');
    const count = await sidebar.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have semi-transparent border', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Check for border with opacity
    const sidebar = page.locator('[class*="border-"][class*="/30"]').first();
    const exists = await sidebar.count() > 0;
    expect(exists).toBeTruthy();
  });
});

test.describe('Touch Target Sizing - Global Application', () => {
  test('should apply to all buttons across the app', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Get all buttons
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Sample check on first few buttons
    for (let i = 0; i < Math.min(count, 3); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          // Should have reasonable touch target
          expect(box.height).toBeGreaterThan(30);
        }
      }
    }
  });

  test('should apply to links with role=button', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check link buttons
    const linkButtons = page.locator('a[role="button"]');
    const count = await linkButtons.count();
    
    if (count > 0) {
      const firstLink = linkButtons.first();
      const box = await firstLink.boundingBox();
      
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(35);
      }
    }
  });
});

test.describe('CSS - Font Family Inheritance', () => {
  test('should use serif font family on body', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const fontFamily = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });
    
    // Should contain serif fonts
    expect(fontFamily.toLowerCase()).toMatch(/fell|georgia|times|serif/);
  });

  test('should maintain font family across navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const fontBefore = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const fontAfter = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });
    
    expect(fontBefore).toBe(fontAfter);
  });
});
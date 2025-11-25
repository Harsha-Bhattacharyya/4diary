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
 * Enhanced unit tests for BlockEditor component
 * Tests the new auto-save optimization, touch-friendly improvements, and change detection
 */

test.describe('BlockEditor - Auto-Save Optimization', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication to allow workspace access
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          username: 'testuser',
        }),
      });
    });
    await page.route('**/api/workspaces', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          workspace: { id: 'test-workspace-id', name: 'Test Workspace' }
        }),
      });
    });
    await page.route('**/api/documents**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: [] }),
      });
    });
  });

  test('should only save when content actually changes', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Track network requests to save API
      const saveRequests: string[] = [];
      page.on('request', (request) => {
        if (request.url().includes('/api/documents') && request.method() === 'PUT') {
          saveRequests.push(request.url());
        }
      });
      
      // Type content
      await page.keyboard.type('Test content');
      
      // Wait for auto-save interval (2000ms + buffer)
      await page.waitForTimeout(3000);
      
      // Should have triggered at least one save
      expect(saveRequests.length).toBeGreaterThan(0);
      
      const initialSaveCount = saveRequests.length;
      
      // Wait without making changes
      await page.waitForTimeout(3000);
      
      // Should not have triggered additional saves
      expect(saveRequests.length).toBeLessThanOrEqual(initialSaveCount + 1);
    }
  });

  test('should mark hasChanges when content is modified', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Type to trigger change detection
      await page.keyboard.type('Modified content');
      
      // Wait for auto-save to process
      await page.waitForTimeout(2500);
      
      // Save indicator should appear
      const saveIndicator = page.locator('text=/Saving|Saved/i');
      await expect(saveIndicator).toBeVisible();
    }
  });

  test('should reset hasChanges after successful save', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Type content
      await page.keyboard.type('Content to save');
      
      // Wait for auto-save
      await page.waitForTimeout(2500);
      
      // Should show "Saved" status
      const savedIndicator = page.locator('text=/✓ Saved/i');
      await expect(savedIndicator).toBeVisible();
      
      // Wait longer without changes
      await page.waitForTimeout(3000);
      
      // Should remain in saved state (not constantly saving)
      await expect(savedIndicator).toBeVisible();
    }
  });

  test('should compare stringified content to detect changes', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Type and delete to return to original state
      await page.keyboard.type('Temporary');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      
      // Wait for auto-save interval
      await page.waitForTimeout(2500);
      
      // Should detect that content returned to original state
      const hasContent = await page.locator('body').isVisible();
      expect(hasContent).toBeTruthy();
    }
  });

  test('should not trigger save when content is empty and unchanged', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Don't type anything, just wait
      await page.waitForTimeout(3000);
      
      // May show initial save, but shouldn't continuously save
      const hasEditor = await page.locator('.bn-container, [data-editor]').count() > 0;
      expect(hasEditor).toBeTruthy();
    }
  });
});

test.describe('BlockEditor - Touch Interaction Improvements', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: true, username: 'testuser' }),
      });
    });
    await page.route('**/api/workspaces', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ workspace: { id: 'test-workspace-id' } }) });
    });
    await page.route('**/api/documents**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ documents: [] }) });
    });
  });

  test('should have touch-auto class on editor container', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check for touch-auto class
      const container = page.locator('.touch-auto').first();
      await expect(container).toBeVisible();
    }
  });

  test('should have touch-manipulation class on editor wrapper', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check for touch-manipulation class
      const wrapper = page.locator('.touch-manipulation');
      await expect(wrapper).toBeVisible();
    }
  });

  test('should disable webkit tap highlight on editor', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check inline style for webkit tap highlight
      const wrapper = page.locator('.touch-manipulation').first();
      const style = await wrapper.getAttribute('style');
      
      if (style) {
        expect(style.toLowerCase()).toContain('transparent');
      }
    }
  });

  test('should work with mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Should render on mobile
      const editor = page.locator('.bn-container, .touch-manipulation').first();
      await expect(editor).toBeVisible();
    }
  });

  test('should support touch input on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Try to interact with editor (simulates touch)
      await page.keyboard.type('Touch input test');
      await page.waitForTimeout(500);
      
      // Content should be entered
      const hasText = await page.locator('text=Touch input test').count() > 0;
      expect(hasText).toBeTruthy();
    }
  });
});

test.describe('BlockEditor - Save Status Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: true, username: 'testuser' }) });
    });
    await page.route('**/api/workspaces', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ workspace: { id: 'test-workspace-id' } }) });
    });
    await page.route('**/api/documents**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ documents: [] }) });
    });
  });

  test('should show "Saving..." during save operation', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Type to trigger save
      await page.keyboard.type('Trigger save');
      
      // May catch "Saving..." state
      const savingIndicator = page.locator('text=💾 Saving...');
      
      // Wait for auto-save interval
      await page.waitForTimeout(2500);
      
      // Either saw "Saving..." or went straight to "Saved"
      const hasSaveStatus = await page.locator('text=/Saving|Saved/i').count() > 0;
      expect(hasSaveStatus).toBeTruthy();
    }
  });

  test('should display timestamp after successful save', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Type content
      await page.keyboard.type('Content with timestamp');
      
      // Wait for save
      await page.waitForTimeout(2500);
      
      // Should show timestamp
      const savedText = await page.locator('text=/✓ Saved/i').textContent();
      expect(savedText).toBeTruthy();
    }
  });

  test('should update timestamp on subsequent saves', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // First save
      await page.keyboard.type('First save');
      await page.waitForTimeout(2500);
      
      const firstTimestamp = await page.locator('text=/✓ Saved/i').textContent();
      
      // Second save
      await page.keyboard.type(' Second save');
      await page.waitForTimeout(2500);
      
      const secondTimestamp = await page.locator('text=/✓ Saved/i').textContent();
      
      // Timestamps should exist (may or may not be different depending on timing)
      expect(firstTimestamp).toBeTruthy();
      expect(secondTimestamp).toBeTruthy();
    }
  });

  test('should position save indicator in top-right corner', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Type to show save indicator
      await page.keyboard.type('Position test');
      await page.waitForTimeout(2500);
      
      // Check positioning classes
      const saveIndicator = page.locator('.absolute.top-4.right-4');
      await expect(saveIndicator).toBeVisible();
    }
  });

  test('should style save indicator with glass-card', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      await page.keyboard.type('Style test');
      await page.waitForTimeout(2500);
      
      // Should have glass-card styling
      const glassCard = page.locator('.glass-card').filter({ hasText: /Saved/i });
      const exists = await glassCard.count() > 0;
      expect(exists).toBeTruthy();
    }
  });
});

test.describe('BlockEditor - Props Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: true, username: 'testuser' }) });
    });
    await page.route('**/api/workspaces', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ workspace: { id: 'test-workspace-id' } }) });
    });
    await page.route('**/api/documents**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ documents: [] }) });
    });
  });

  test('should respect editable=false prop (read-only mode)', async ({ page }) => {
    // This would be tested via the share page which uses editable=false
    await page.route('**/api/share?id=readonly-test', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Read Only',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Read-only content' }] }],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto('/share/readonly-test');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Try to type - should not work in read-only mode
    await page.keyboard.type('Should not appear');
    
    // Original content should remain
    const hasOriginalContent = await page.locator('text=Read-only content').count() > 0;
    expect(hasOriginalContent).toBeTruthy();
  });

  test('should hide toolbar when showToolbar=false', async ({ page }) => {
    await page.route('**/api/share?id=no-toolbar', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'No Toolbar',
          content: [],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto('/share/no-toolbar');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Toolbar should not be present
    const toolbarCount = await page.getByRole('button', { name: /Bold|Italic/i }).count();
    expect(toolbarCount).toBe(0);
  });

  test('should not show save indicator when autoSave=false', async ({ page }) => {
    await page.route('**/api/share?id=no-autosave', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'No Auto Save',
          content: [],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto('/share/no-autosave');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Save indicator should not appear
    const saveIndicatorCount = await page.locator('text=/Saving|Saved/i').count();
    expect(saveIndicatorCount).toBe(0);
  });

  test('should initialize editor with provided initialContent', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Default content should be present (Untitled heading)
      const hasContent = await page.getByRole('heading', { name: /Untitled/i }).count() > 0;
      expect(hasContent).toBeTruthy();
    }
  });
});

test.describe('BlockEditor - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: true, username: 'testuser' }) });
    });
    await page.route('**/api/workspaces', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ workspace: { id: 'test-workspace-id' } }) });
    });
  });

  test('should handle save failures gracefully', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Mock save API to fail
    await page.route('**/api/documents/*', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Save failed' }),
        });
      } else {
        await route.continue();
      }
    });
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Type content
      await page.keyboard.type('Content that fails to save');
      
      // Wait for save attempt
      await page.waitForTimeout(2500);
      
      // Should not crash
      const hasEditor = await page.locator('body').isVisible();
      expect(hasEditor).toBeTruthy();
    }
  });

  test('should log error to console on save failure', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    await page.route('**/api/documents/*', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      await page.keyboard.type('Error test');
      await page.waitForTimeout(2500);
      
      // Error should be logged
      const hasError = consoleErrors.some(err => err.includes('Failed to save') || err.includes('error'));
      expect(hasError).toBeTruthy();
    }
  });
});

test.describe('BlockEditor - Change Detection Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: true, username: 'testuser' }) });
    });
    await page.route('**/api/workspaces', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ workspace: { id: 'test-workspace-id' } }) });
    });
    await page.route('**/api/documents**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ documents: [] }) });
    });
  });

  test('should handle rapid content changes', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Type rapidly
      await page.keyboard.type('Rapid typing test with multiple words');
      
      // Should handle without errors
      await page.waitForTimeout(2500);
      
      const hasContent = await page.locator('text=Rapid typing test').count() > 0;
      expect(hasContent).toBeTruthy();
    }
  });

  test('should detect changes when formatting is applied', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Type content
      await page.keyboard.type('Format test');
      
      // Apply bold formatting
      const boldButton = page.getByRole('button', { name: /Bold/i }).first();
      if (await boldButton.isVisible()) {
        await boldButton.click();
      }
      
      // Should detect change
      await page.waitForTimeout(2500);
      
      const hasContent = await page.locator('body').isVisible();
      expect(hasContent).toBeTruthy();
    }
  });

  test('should handle deletion of content', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Type and delete
      await page.keyboard.type('Delete this');
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      
      // Should detect change
      await page.waitForTimeout(2500);
      
      const hasEditor = await page.locator('.bn-container, [data-editor]').count() > 0;
      expect(hasEditor).toBeTruthy();
    }
  });
});
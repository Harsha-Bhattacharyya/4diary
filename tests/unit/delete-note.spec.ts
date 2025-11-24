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
 * Unit tests for delete note functionality
 * Tests the delete button, confirmation dialog, and document deletion flow
 */

test.describe('Delete Note Feature', () => {
  test('should show delete button in document menu', async ({ page }) => {
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

    // Mock workspace and documents
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
              encryptedContent: 'dGVzdCBjb250ZW50', // "test content" in base64
              encryptedDocumentKey: 'dGVzdCBrZXk=', // "test key" in base64
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

    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');

    // Open a document
    await page.click('text=Test Document');
    await page.waitForTimeout(1000);

    // Open dropdown menu
    await page.click('button[aria-label="Toggle menu"]');
    
    // Check for delete button
    const deleteButton = page.locator('button:has-text("🗑️ Delete Note")');
    await expect(deleteButton).toBeVisible();
  });

  test('should show confirmation modal when delete is clicked', async ({ page }) => {
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

    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');

    // Open document
    await page.click('text=Test Document');
    await page.waitForTimeout(1000);

    // Open menu and click delete
    await page.click('button[aria-label="Toggle menu"]');
    await page.click('button:has-text("🗑️ Delete Note")');

    // Check for confirmation modal
    await expect(page.locator('text=Delete Note?')).toBeVisible();
    await expect(page.locator('text=Are you sure you want to delete')).toBeVisible();
  });

  test('should close modal when cancel is clicked', async ({ page }) => {
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

    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');

    // Open document and delete button
    await page.click('text=Test Document');
    await page.waitForTimeout(1000);
    await page.click('button[aria-label="Toggle menu"]');
    await page.click('button:has-text("🗑️ Delete Note")');

    // Click cancel
    await page.click('button:has-text("Cancel")');

    // Modal should be closed
    await expect(page.locator('text=Delete Note?')).not.toBeVisible();
  });

  test('should delete document when confirmed', async ({ page }) => {
    let deleteRequested = false;

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
      if (route.request().method() === 'DELETE') {
        deleteRequested = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
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
      }
    });

    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');

    // Open document
    await page.click('text=Test Document');
    await page.waitForTimeout(1000);

    // Delete document
    await page.click('button[aria-label="Toggle menu"]');
    await page.click('button:has-text("🗑️ Delete Note")');
    await page.click('button:has-text("Delete")');

    // Wait for deletion
    await page.waitForTimeout(1000);

    // Check that DELETE was called
    expect(deleteRequested).toBeTruthy();
  });
});

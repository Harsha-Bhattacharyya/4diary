/**
 * Copyright © 2025 Harsha Bhattacharyya
 * 
 * This file is part of 4diary.
 * 
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { test, expect } from "@playwright/test";

test.describe("Playwriter Mode", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route("**/api/auth/session", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          authenticated: true,
          username: "test@example.com",
        }),
      })
    );

    // Mock workspace
    await page.route("**/api/workspaces", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          workspace: {
            id: "test-workspace",
            userId: "test@example.com",
            name: "Test Workspace",
          },
        }),
      })
    );

    // Mock documents
    await page.route("**/api/documents**", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            documents: [
              {
                id: "doc-1",
                metadata: {
                  title: "Test Play Script",
                  emojiIcon: "🎭",
                  type: "doc",
                },
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "INT. COFFEE SHOP - DAY" }],
                  },
                ],
                updatedAt: new Date().toISOString(),
              },
            ],
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      }
    });

    // Mock document get endpoint
    await page.route("**/api/documents/*", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          document: {
            id: "doc-1",
            metadata: {
              title: "Test Play Script",
              emojiIcon: "🎭",
              type: "doc",
            },
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "INT. COFFEE SHOP - DAY" }],
              },
            ],
            updatedAt: new Date().toISOString(),
          },
        }),
      });
    });
  });

  test("should show Playwriter Mode option in dropdown menu", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForLoadState("networkidle");

    // Open a document
    await page.click('text="Test Play Script"');
    await page.waitForTimeout(500);

    // Open the dropdown menu
    await page.click('button[aria-label="Toggle menu"]');
    await page.waitForTimeout(200);

    // Check if Playwriter Mode option exists
    const playwriterOption = page.locator('text="🎭 Playwriter Mode"');
    await expect(playwriterOption).toBeVisible();
  });

  test("should open Playwriter Mode when clicking the menu option", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForLoadState("networkidle");

    // Open a document
    await page.click('text="Test Play Script"');
    await page.waitForTimeout(500);

    // Open the dropdown menu
    await page.click('button[aria-label="Toggle menu"]');
    await page.waitForTimeout(200);

    // Click Playwriter Mode option
    await page.click('text="🎭 Playwriter Mode"');
    await page.waitForTimeout(300);

    // Check if Playwriter Mode modal opens
    const playwriterModal = page.locator('text="🎭 Playwriter Mode"').first();
    await expect(playwriterModal).toBeVisible();
  });

  test("should display screenplay tips in Playwriter Mode", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForLoadState("networkidle");

    // Open a document
    await page.click('text="Test Play Script"');
    await page.waitForTimeout(500);

    // Open the dropdown menu and click Playwriter Mode
    await page.click('button[aria-label="Toggle menu"]');
    await page.waitForTimeout(200);
    await page.click('text="🎭 Playwriter Mode"');
    await page.waitForTimeout(300);

    // Check for screenplay tips
    const tipsHeader = page.locator('text="Screenplay Tips"');
    await expect(tipsHeader).toBeVisible();

    // Check for specific tips
    await expect(page.locator('text="Use ALL CAPS for character names"')).toBeVisible();
  });

  test("should have font size controls in Playwriter Mode", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForLoadState("networkidle");

    // Open a document
    await page.click('text="Test Play Script"');
    await page.waitForTimeout(500);

    // Open the dropdown menu and click Playwriter Mode
    await page.click('button[aria-label="Toggle menu"]');
    await page.waitForTimeout(200);
    await page.click('text="🎭 Playwriter Mode"');
    await page.waitForTimeout(300);

    // Check for font size controls
    const decreaseFontButton = page.locator('button[aria-label="Decrease font size"]');
    const increaseFontButton = page.locator('button[aria-label="Increase font size"]');

    await expect(decreaseFontButton).toBeVisible();
    await expect(increaseFontButton).toBeVisible();
  });

  test("should close Playwriter Mode with close button", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForLoadState("networkidle");

    // Open a document
    await page.click('text="Test Play Script"');
    await page.waitForTimeout(500);

    // Open the dropdown menu and click Playwriter Mode
    await page.click('button[aria-label="Toggle menu"]');
    await page.waitForTimeout(200);
    await page.click('text="🎭 Playwriter Mode"');
    await page.waitForTimeout(300);

    // Click close button
    const closeButton = page.locator('button[aria-label="Close playwriter mode"]');
    await closeButton.click();
    await page.waitForTimeout(300);

    // Modal should be closed - check the label is no longer visible
    const modalLabel = page.locator('#playwriter-mode-label');
    await expect(modalLabel).not.toBeVisible();
  });

  test("should display editable textarea in Playwriter Mode", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForLoadState("networkidle");

    // Open a document
    await page.click('text="Test Play Script"');
    await page.waitForTimeout(500);

    // Open the dropdown menu and click Playwriter Mode
    await page.click('button[aria-label="Toggle menu"]');
    await page.waitForTimeout(200);
    await page.click('text="🎭 Playwriter Mode"');
    await page.waitForTimeout(300);

    // Check for textarea
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await expect(textarea).toBeEditable();
  });

  test("should show word count in Playwriter Mode", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForLoadState("networkidle");

    // Open a document
    await page.click('text="Test Play Script"');
    await page.waitForTimeout(500);

    // Open the dropdown menu and click Playwriter Mode
    await page.click('button[aria-label="Toggle menu"]');
    await page.waitForTimeout(200);
    await page.click('text="🎭 Playwriter Mode"');
    await page.waitForTimeout(300);

    // Check for word count display
    const wordCount = page.locator('text=/\\d+ words/');
    await expect(wordCount).toBeVisible();
  });

  test("should show keyboard hints in footer", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForLoadState("networkidle");

    // Open a document
    await page.click('text="Test Play Script"');
    await page.waitForTimeout(500);

    // Open the dropdown menu and click Playwriter Mode
    await page.click('button[aria-label="Toggle menu"]');
    await page.waitForTimeout(200);
    await page.click('text="🎭 Playwriter Mode"');
    await page.waitForTimeout(300);

    // Check for keyboard hints
    const footerHint = page.locator('text="Press ESC to exit"');
    await expect(footerHint).toBeVisible();
  });
});

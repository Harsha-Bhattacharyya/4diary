/**
 * Copyright © 2025 Harsha Bhattacharyya
 * 
 * This file is part of 4diary.
 * 
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { test, expect } from "@playwright/test";

test.describe("Note Settings Component", () => {
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

    // Mock workspace and documents
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
                  title: "Test Document",
                  emojiIcon: "📄",
                },
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Hello world!" }],
                  },
                ],
                updatedAt: new Date().toISOString(),
              },
            ],
          }),
        });
      } else {
        route.continue();
      }
    });
  });

  test("should open note settings from dropdown menu", async ({ page }) => {
    await page.goto("/workspace");

    // Wait for workspace to load
    await page.waitForSelector('[aria-label="Test Document"]', {
      timeout: 10000,
    });

    // Open a document
    await page.click("text=Test Document");

    // Wait for the document editor to be visible
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open dropdown menu
    await page.click('[aria-label="Toggle menu"]');

    // Click on Note Settings
    await page.click("text=⚙️ Note Settings");

    // Verify settings modal is open
    await expect(page.locator("#note-settings-title")).toBeVisible();
    await expect(page.locator("text=⚙️ Note Settings")).toBeVisible();
  });

  test("should display note statistics", async ({ page }) => {
    await page.goto("/workspace");

    // Wait for workspace to load
    await page.waitForSelector("text=Test Document", { timeout: 10000 });

    // Open a document
    await page.click("text=Test Document");

    // Wait for editor
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Check if statistics are displayed
    await expect(page.locator("text=Word Count")).toBeVisible();
    await expect(page.locator("text=Line Count")).toBeVisible();
    await expect(page.locator("text=Characters")).toBeVisible();
    await expect(page.locator("text=File Size")).toBeVisible();
    await expect(page.locator("text=Last Modified")).toBeVisible();
  });

  test("should toggle line numbers", async ({ page }) => {
    await page.goto("/workspace");

    // Wait and open document
    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Find the line numbers toggle
    const lineNumbersToggle = page.locator('button[role="switch"]');
    await expect(lineNumbersToggle).toBeVisible();

    // Toggle line numbers on
    await lineNumbersToggle.click();

    // Close settings
    await page.click("text=Close", { timeout: 3000 });

    // Verify line numbers are shown in editor (check for CSS class)
    await expect(page.locator(".editor-with-line-numbers")).toBeVisible();
  });

  test("should close note settings with escape key", async ({ page }) => {
    await page.goto("/workspace");

    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Verify settings modal is open
    await expect(page.locator("#note-settings-title")).toBeVisible();

    // Press Escape key
    await page.keyboard.press("Escape");

    // Verify settings modal is closed
    await expect(page.locator("#note-settings-title")).not.toBeVisible();
  });

  test("should close note settings with close button", async ({ page }) => {
    await page.goto("/workspace");

    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Verify settings modal is open
    await expect(page.locator("#note-settings-title")).toBeVisible();

    // Click close button
    await page.click('[aria-label="Close settings"]');

    // Verify settings modal is closed
    await expect(page.locator("#note-settings-title")).not.toBeVisible();
  });
});

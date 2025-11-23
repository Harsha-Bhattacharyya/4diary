/**
 * Copyright © 2025 Harsha Bhattacharyya
 * 
 * This file is part of 4diary.
 * 
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { test, expect } from "@playwright/test";

test.describe("Edit/Read Mode Toggle", () => {
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
                  title: "Test Note",
                  emojiIcon: "📄",
                },
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Test content" }],
                  },
                ],
                updatedAt: new Date().toISOString(),
              },
            ],
          }),
        });
      } else if (route.request().method() === "POST") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            document: {
              id: "new-doc",
              metadata: {
                title: "Untitled",
                emojiIcon: "📄",
              },
              content: [
                {
                  type: "heading",
                  props: { level: 1 },
                  content: [{ type: "text", text: "Untitled" }],
                },
              ],
              updatedAt: new Date().toISOString(),
            },
          }),
        });
      } else {
        route.continue();
      }
    });
  });

  test("should open document in read mode by default", async ({ page }) => {
    await page.goto("/workspace");

    // Wait for workspace to load
    await page.waitForSelector("text=Test Note", { timeout: 10000 });

    // Click on document to open it
    await page.click("text=Test Note");

    // Wait for editor to load
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Check that floating pen icon is visible (means we're in read mode)
    const floatingPenButton = page.locator(
      'button[aria-label="Enter edit mode"]'
    );
    await expect(floatingPenButton).toBeVisible();

    // Check that edit mode toolbar is NOT visible
    await expect(page.locator("text=Edit Mode")).not.toBeVisible();
  });

  test("should enter edit mode when clicking floating pen icon", async ({
    page,
  }) => {
    await page.goto("/workspace");

    await page.waitForSelector("text=Test Note", { timeout: 10000 });
    await page.click("text=Test Note");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Click the floating pen icon
    await page.click('button[aria-label="Enter edit mode"]');

    // Check that edit mode toolbar is visible
    await expect(page.locator("text=Edit Mode")).toBeVisible();

    // Check that floating pen icon is NOT visible
    await expect(
      page.locator('button[aria-label="Enter edit mode"]')
    ).not.toBeVisible();

    // Check that "Exit Edit Mode" button is visible
    await expect(page.locator("text=Exit Edit Mode")).toBeVisible();
  });

  test("should exit edit mode when clicking exit button", async ({ page }) => {
    await page.goto("/workspace");

    await page.waitForSelector("text=Test Note", { timeout: 10000 });
    await page.click("text=Test Note");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Enter edit mode
    await page.click('button[aria-label="Enter edit mode"]');
    await expect(page.locator("text=Edit Mode")).toBeVisible();

    // Exit edit mode
    await page.click("text=Exit Edit Mode");

    // Check that we're back in read mode
    await expect(
      page.locator('button[aria-label="Enter edit mode"]')
    ).toBeVisible();
    await expect(page.locator("text=Edit Mode")).not.toBeVisible();
  });

  test("should start new documents in edit mode", async ({ page }) => {
    await page.goto("/workspace");

    // Wait for workspace to load
    await page.waitForSelector("text=My Workspace", { timeout: 10000 });

    // Click "New Document" button
    await page.click("text=➕ New Document");

    // Wait for editor to load
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Check that we're in edit mode (edit mode toolbar visible)
    await expect(page.locator("text=Edit Mode")).toBeVisible();

    // Check that floating pen icon is NOT visible
    await expect(
      page.locator('button[aria-label="Enter edit mode"]')
    ).not.toBeVisible();
  });

  test("should display edit mode indicator when editing", async ({ page }) => {
    await page.goto("/workspace");

    await page.waitForSelector("text=Test Note", { timeout: 10000 });
    await page.click("text=Test Note");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Enter edit mode
    await page.click('button[aria-label="Enter edit mode"]');

    // Check for edit mode indicator with green background
    const editModeIndicator = page.locator(
      ".bg-green-100.text-green-700:has-text('Edit Mode')"
    );
    await expect(editModeIndicator).toBeVisible();

    // Check that the indicator contains the pen icon
    const penIcon = editModeIndicator.locator("svg");
    await expect(penIcon).toBeVisible();
  });

  test("should hide bottom toolbar in read mode", async ({ page }) => {
    await page.goto("/workspace");

    await page.waitForSelector("text=Test Note", { timeout: 10000 });
    await page.click("text=Test Note");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // In read mode, bottom toolbar should not be visible
    await expect(page.locator("text=Edit Mode")).not.toBeVisible();
    
    // Formatting buttons should not be visible
    await expect(
      page.locator('button:has-text("B")').first()
    ).not.toBeVisible();
  });

  test("should show bottom toolbar in edit mode", async ({ page }) => {
    await page.goto("/workspace");

    await page.waitForSelector("text=Test Note", { timeout: 10000 });
    await page.click("text=Test Note");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Enter edit mode
    await page.click('button[aria-label="Enter edit mode"]');

    // Bottom toolbar should be visible
    await expect(page.locator("text=Edit Mode")).toBeVisible();
    
    // Formatting buttons should be visible
    await expect(
      page.locator('.fixed.bottom-0 button:has-text("B")')
    ).toBeVisible();
  });

  test("should not show floating pen for kanban boards", async ({ page }) => {
    // Mock kanban board document
    await page.route("**/api/documents**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          documents: [
            {
              id: "board-1",
              metadata: {
                title: "Test Board",
                type: "board",
                emojiIcon: "📊",
              },
              content: [{ board: { columns: [] } }],
              updatedAt: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await page.goto("/workspace");

    await page.waitForSelector("text=Test Board", { timeout: 10000 });
    await page.click("text=Test Board");

    // Wait a bit for the board to render
    await page.waitForTimeout(2000);

    // Floating pen icon should not be visible for boards
    await expect(
      page.locator('button[aria-label="Enter edit mode"]')
    ).not.toBeVisible();
  });
});

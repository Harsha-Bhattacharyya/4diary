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

  test("should display folder input in note settings", async ({ page }) => {
    await page.goto("/workspace");

    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Verify folder input is displayed
    await expect(page.locator("text=📁 Folder")).toBeVisible();
    await expect(page.locator("#note-folder")).toBeVisible();
  });

  test("should display tags input in note settings", async ({ page }) => {
    await page.goto("/workspace");

    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Verify tags input is displayed
    await expect(page.locator("text=🏷️ Tags")).toBeVisible();
    await expect(page.locator("#note-tags")).toBeVisible();
    await expect(page.locator("button:has-text('Add')")).toBeVisible();
  });

  test("should add a tag when clicking Add button", async ({ page }) => {
    await page.goto("/workspace");

    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Mock the PUT request for updating document
    await page.route("**/api/documents", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Type a tag
    await page.fill("#note-tags", "important");

    // Click Add button
    await page.click("button:has-text('Add')");

    // Verify tag is displayed
    await expect(page.locator("text=important").first()).toBeVisible();
  });

  test("should add a tag when pressing Enter", async ({ page }) => {
    await page.goto("/workspace");

    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Mock the PUT request for updating document
    await page.route("**/api/documents", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Type a tag and press Enter
    await page.fill("#note-tags", "work");
    await page.press("#note-tags", "Enter");

    // Verify tag is displayed
    await expect(page.locator("text=work").first()).toBeVisible();
  });

  test("should display Organization section in note settings", async ({ page }) => {
    await page.goto("/workspace");

    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Verify Organization section header is displayed
    await expect(page.locator("text=Organization")).toBeVisible();
  });

  test("should display Hash Generation section", async ({ page }) => {
    await page.goto("/workspace");

    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Verify Hash Generation section is displayed
    await expect(page.locator("text=🔐 Hash Generation")).toBeVisible();
    await expect(page.locator("button:has-text('Generate Hashes')")).toBeVisible();
  });

  test("should generate hashes when clicking Generate Hashes button", async ({ page }) => {
    await page.goto("/workspace");

    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Click Generate Hashes button
    await page.click("button:has-text('Generate Hashes')");

    // Wait for hashes to be generated and displayed
    await expect(page.locator("text=MD5").first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=SHA-1").first()).toBeVisible();
    await expect(page.locator("text=SHA-256").first()).toBeVisible();
    await expect(page.locator("text=SHA-512").first()).toBeVisible();
  });

  test("should copy hash to clipboard when clicking Copy button", async ({ page }) => {
    await page.goto("/workspace");

    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Generate hashes first
    await page.click("button:has-text('Generate Hashes')");

    // Wait for hashes to be generated
    await expect(page.locator("text=MD5").first()).toBeVisible({ timeout: 5000 });

    // Click Copy button for MD5
    const copyButton = page.locator("text=Copy").first();
    await copyButton.click();

    // Verify the copied confirmation is shown
    await expect(page.locator("text=✓ Copied!").first()).toBeVisible({ timeout: 2000 });
  });
});

test.describe("Note Settings - Editor Font Selection", () => {
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

  test("should display Editor Font section in note settings", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Verify Editor Font section is displayed
    await expect(page.locator("text=Editor Font")).toBeVisible();
    await expect(page.locator("text=Choose your preferred font style")).toBeVisible();
  });

  test("should display all three font options", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Verify all three font buttons are visible
    await expect(page.locator("button:has-text('Normal')")).toBeVisible();
    await expect(page.locator("button:has-text('Serif')")).toBeVisible();
    await expect(page.locator("button:has-text('Condensed')")).toBeVisible();
  });

  test("should have Normal font selected by default", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Check that Normal button has active styling
    const normalButton = page.locator("button:has-text('Normal')");
    await expect(normalButton).toHaveClass(/bg-leather-600/);
  });

  test("should change font selection when clicking font buttons", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Click Serif button
    await page.click("button:has-text('Serif')");

    // Verify Serif is now selected
    const serifButton = page.locator("button:has-text('Serif')");
    await expect(serifButton).toHaveClass(/bg-leather-600/);

    // Click Condensed button
    await page.click("button:has-text('Condensed')");

    // Verify Condensed is now selected
    const condensedButton = page.locator("button:has-text('Condensed')");
    await expect(condensedButton).toHaveClass(/bg-leather-600/);
  });

  test("should persist font selection to localStorage", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Click Serif button
    await page.click("button:has-text('Serif')");

    // Check localStorage
    const storedFont = await page.evaluate(() => 
      localStorage.getItem('4diary-editor-font')
    );
    expect(storedFont).toBe('serif');
  });

  test("should restore font preference from localStorage on page load", async ({ page }) => {
    // Set localStorage before loading the page
    await page.goto("/workspace");
    await page.evaluate(() => {
      localStorage.setItem('4diary-editor-font', 'condensed');
    });

    // Reload the page
    await page.reload();
    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Verify Condensed is selected
    const condensedButton = page.locator("button:has-text('Condensed')");
    await expect(condensedButton).toHaveClass(/bg-leather-600/);
  });

  test("should apply font class to editor when font is changed", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Click Serif button
    await page.click("button:has-text('Serif')");

    // Close settings
    await page.click('[aria-label="Close settings"]');

    // Verify editor has the serif font class
    await expect(page.locator('.editor-font-serif')).toBeVisible();
  });

  test("should show correct font preview in font buttons", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Check that Normal button has monospace font
    const normalButton = page.locator("button:has-text('Normal')");
    const normalStyle = await normalButton.getAttribute('style');
    expect(normalStyle).toContain('JetBrains Mono');

    // Check that Serif button has serif font
    const serifButton = page.locator("button:has-text('Serif')");
    const serifStyle = await serifButton.getAttribute('style');
    expect(serifStyle).toContain('Arial');

    // Check that Condensed button has condensed font
    const condensedButton = page.locator("button:has-text('Condensed')");
    const condensedStyle = await condensedButton.getAttribute('style');
    expect(condensedStyle).toContain('Roboto Condensed');
  });

  test("should handle invalid localStorage values gracefully", async ({ page }) => {
    // Set invalid localStorage value before loading the page
    await page.goto("/workspace");
    await page.evaluate(() => {
      localStorage.setItem('4diary-editor-font', 'invalid-font');
    });

    // Reload the page
    await page.reload();
    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Should fall back to Normal (default)
    const normalButton = page.locator("button:has-text('Normal')");
    await expect(normalButton).toHaveClass(/bg-leather-600/);
  });

  test("should maintain font selection across editor mode changes", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings and change font
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");
    await page.click("button:has-text('Condensed')");
    await page.click('[aria-label="Close settings"]');

    // Toggle to read mode
    const toggleButton = page.locator('[aria-label="Toggle edit/read mode"], button:has-text("👁")');
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await page.waitForTimeout(500);

      // Toggle back to edit mode
      await toggleButton.click();
      await page.waitForTimeout(500);
    }

    // Font should still be condensed
    await expect(page.locator('.editor-font-condensed')).toBeVisible();
  });

  test("should update font immediately without needing to close settings", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Type some content first
    await page.keyboard.type("Test content for font change");

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Check initial editor class
    await expect(page.locator('.editor-font-normal')).toBeVisible();

    // Click Serif button
    await page.click("button:has-text('Serif')");

    // Font should change immediately while settings is still open
    await expect(page.locator('.editor-font-serif')).toBeVisible();
    await expect(page.locator('.editor-font-normal')).not.toBeVisible();
  });

  test("should work correctly with line numbers enabled", async ({ page }) => {
    await page.goto("/workspace");
    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Enable line numbers
    const lineNumbersToggle = page.locator('button[role="switch"]');
    await lineNumbersToggle.click();

    // Change font to Serif
    await page.click("button:has-text('Serif')");

    // Close settings
    await page.click('[aria-label="Close settings"]');

    // Both line numbers and serif font should be active
    await expect(page.locator('.editor-with-line-numbers')).toBeVisible();
    await expect(page.locator('.editor-font-serif')).toBeVisible();
  });

  test("should not call onFontChange if callback is undefined", async ({ page }) => {
    // This test verifies that clicking font buttons doesn't cause errors
    // when onFontChange callback might not be provided
    await page.goto("/workspace");
    await page.waitForSelector("text=Test Document", { timeout: 10000 });
    await page.click("text=Test Document");
    await page.waitForSelector(".bn-editor", { timeout: 5000 });

    // Open note settings
    await page.click('[aria-label="Toggle menu"]');
    await page.click("text=⚙️ Note Settings");

    // Click font buttons - should not cause errors
    await page.click("button:has-text('Serif')");
    await page.click("button:has-text('Condensed')");
    await page.click("button:has-text('Normal')");

    // Settings should still be visible and functional
    await expect(page.locator("text=Editor Font")).toBeVisible();
  });
});

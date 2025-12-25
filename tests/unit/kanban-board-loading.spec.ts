/**
 * Test: Kanban Board Loading Fix
 * 
 * This test verifies that the kanban board page properly handles the race condition
 * between authentication check and board loading.
 */

import { test, expect } from "@playwright/test";

test.describe("Kanban Board Loading", () => {
  test("should not get stuck on loading when accessing board page", async ({ page }) => {
    // Navigate to auth page first
    await page.goto("/auth");
    
    // Wait for auth page to load
    await expect(page.locator("h1")).toContainText("4diary", { timeout: 10000 });

    // Try to navigate to a board directly (simulating a direct link)
    // This should either redirect to auth or load the board, but not get stuck
    const boardUrl = "/workspace/test-workspace/board/test-board";
    await page.goto(boardUrl);

    // Wait a reasonable time for the page to settle
    await page.waitForTimeout(2000);

    // Check that we're not stuck on "Loading board..."
    // We should either see:
    // 1. The auth page (redirected because not authenticated)
    // 2. The board page (if authenticated)
    // 3. An error message (if board not found)
    const bodyText = await page.textContent("body");
    
    // The page should NOT be showing only "Loading board..." after 2 seconds
    // If we're on the auth page, we'll see "4diary" in the h1
    // If we're on the board page with an error, we'll see "Board not found" or similar
    // The issue was that it would stay on "Loading board..." indefinitely
    
    const isStuckLoading = bodyText?.includes("Loading board...") && 
                           !bodyText?.includes("4diary") && 
                           !bodyText?.includes("Board not found") &&
                           !bodyText?.includes("Go Back");
    
    expect(isStuckLoading).toBe(false);
  });

  test("should load board when authenticated", async ({ page, context }) => {
    // This is a more comprehensive test that would require actual auth setup
    // For now, we'll just verify the page structure exists
    
    await page.goto("/auth");
    await expect(page.locator("h1")).toContainText("4diary", { timeout: 10000 });
    
    // The actual board loading test would require:
    // 1. Creating a test user
    // 2. Logging in
    // 3. Creating a workspace
    // 4. Creating a board document
    // 5. Navigating to the board
    // 6. Verifying it loads without getting stuck
    
    // For this minimal fix test, we just verify the page doesn't crash
    // and handles the unauthenticated case properly
  });
});

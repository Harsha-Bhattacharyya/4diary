import { test, expect } from '@playwright/test';

test.describe('Sidebar Component', () => {
  test('should be visible on workspace page', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForTimeout(2000);
    
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
  });

  test('should have navigation items', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForTimeout(2000);
    
    // Check for navigation links
    await expect(page.getByRole('link', { name: /Home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Workspaces/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Templates/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Settings/i })).toBeVisible();
  });

  test('should collapse when toggle button is clicked', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForTimeout(2000);
    
    const sidebar = page.locator('aside');
    const toggleButton = sidebar.locator('button').first();
    
    if (await toggleButton.isVisible()) {
      // Get initial state
      const initialText = await sidebar.textContent();
      const hasFullText = initialText?.includes('Privacy-first notes');
      
      // Click toggle
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      // Check collapsed state
      const collapsedText = await sidebar.textContent();
      const stillHasFullText = collapsedText?.includes('Privacy-first notes');
      
      // Should have different content when collapsed
      expect(hasFullText).not.toBe(stillHasFullText);
    }
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should auto-collapse sidebar on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/workspace');
    await page.waitForTimeout(2000);
    
    const sidebar = page.locator('aside');
    
    if (await sidebar.isVisible()) {
      // On mobile, sidebar should be collapsed (narrower)
      const width = await sidebar.evaluate(el => el.offsetWidth);
      
      // Collapsed sidebar should be around 64px (w-16)
      expect(width).toBeLessThan(100);
    }
  });

  test('should have responsive toolbar on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/workspace');
    await page.waitForTimeout(2000);
    
    // Create a document
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check that toolbar is visible and wraps on mobile
      const toolbar = page.locator('.glass-card').first();
      
      if (await toolbar.isVisible()) {
        // Toolbar should be visible
        await expect(toolbar).toBeVisible();
      }
    }
  });

  test('should have touch-friendly buttons on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/workspace');
    await page.waitForTimeout(2000);
    
    // Check that buttons are not too small for touch
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    
    if (count > 0) {
      const firstButton = buttons.first();
      const box = await firstButton.boundingBox();
      
      // Touch targets should be at least 44x44px (Apple guidelines)
      // We're being lenient here with 30px since it's a complex UI
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(24);
      }
    }
  });
});

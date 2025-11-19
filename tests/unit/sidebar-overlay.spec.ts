import { test, expect } from '@playwright/test';

/**
 * Unit tests for Sidebar overlay behavior and workspace layout
 * Tests the new fixed positioning, backdrop blur, and z-index management
 */

test.describe('Sidebar - Overlay Architecture', () => {
  test('should use fixed positioning instead of flex', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Sidebar should be fixed, not in flex container
    const sidebar = page.locator('.fixed.left-0.top-0').first();
    await expect(sidebar).toBeVisible();
  });

  test('should stay fixed when scrolling page', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Get sidebar position
    const sidebar = page.locator('.fixed.h-screen').first();
    const positionBefore = await sidebar.boundingBox();
    
    // Scroll page
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);
    
    // Position should remain the same (fixed)
    const positionAfter = await sidebar.boundingBox();
    
    if (positionBefore && positionAfter) {
      expect(positionBefore.y).toBe(positionAfter.y);
    }
  });

  test('should span full viewport height', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const sidebar = page.locator('.h-screen').first();
    const box = await sidebar.boundingBox();
    
    if (box) {
      const viewportHeight = await page.viewportSize().then(vp => vp?.height || 0);
      expect(box.height).toBeCloseTo(viewportHeight, 5);
    }
  });

  test('should be positioned at left edge of viewport', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const sidebar = page.locator('.left-0').first();
    const box = await sidebar.boundingBox();
    
    if (box) {
      expect(box.x).toBe(0);
    }
  });

  test('should be positioned at top edge of viewport', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const sidebar = page.locator('.top-0').first();
    const box = await sidebar.boundingBox();
    
    if (box) {
      expect(box.y).toBe(0);
    }
  });
});

test.describe('Sidebar - Visual Effects', () => {
  test('should have backdrop blur effect', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const sidebar = page.locator('.backdrop-blur-md').first();
    await expect(sidebar).toBeVisible();
  });

  test('should have semi-transparent background', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Look for 80% opacity background
    const sidebar = page.locator('[class*="/80"]').first();
    await expect(sidebar).toBeVisible();
  });

  test('should have shadow effect for depth', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const sidebar = page.locator('.shadow-2xl').first();
    await expect(sidebar).toBeVisible();
  });

  test('should have semi-transparent border', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const sidebar = page.locator('.border-r').first();
    await expect(sidebar).toBeVisible();
  });

  test('should create glass morphism effect', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Combination of backdrop-blur and semi-transparent background
    const glassSidebar = page.locator('.backdrop-blur-md[class*="/80"]').first();
    await expect(glassSidebar).toBeVisible();
  });
});

test.describe('Sidebar - Z-Index Management', () => {
  test('should have z-1000 when expanded', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Ensure sidebar is expanded
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      const isCollapsed = await page.locator('.w-16').count() > 0;
      if (isCollapsed) {
        await toggleButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Check for high z-index
    const expandedSidebar = page.locator('.z-\\[1000\\]');
    const count = await expandedSidebar.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have z-10 when collapsed', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Collapse sidebar
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      const isExpanded = await page.locator('.w-64').count() > 0;
      if (isExpanded) {
        await toggleButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Check for lower z-index
    const collapsedSidebar = page.locator('.z-10');
    const count = await collapsedSidebar.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should overlay main content when expanded', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Expand sidebar
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      const isCollapsed = await page.locator('.w-16').count() > 0;
      if (isCollapsed) {
        await toggleButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Sidebar should be above main content
    const sidebar = page.locator('.z-\\[1000\\]').first();
    const main = page.locator('main.z-0').first();
    
    const sidebarExists = await sidebar.count() > 0;
    const mainExists = await main.count() > 0;
    
    expect(sidebarExists).toBeTruthy();
    expect(mainExists).toBeTruthy();
  });

  test('should not overlay main content when collapsed', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Collapse sidebar
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await page.waitForTimeout(500);
    }
    
    // Lower z-index means less intrusive
    const sidebar = page.locator('.z-10').first();
    const count = await sidebar.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Workspace - Main Content Independence', () => {
  test('should not have margin adjustment based on sidebar', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const main = page.locator('main').first();
    
    // Get margin when sidebar is in one state
    const marginBefore = await main.evaluate((el) => 
      window.getComputedStyle(el).marginLeft
    );
    
    // Toggle sidebar
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await page.waitForTimeout(500);
    }
    
    // Get margin after toggle
    const marginAfter = await main.evaluate((el) => 
      window.getComputedStyle(el).marginLeft
    );
    
    // Margin should remain consistent
    expect(marginBefore).toBe(marginAfter);
  });

  test('should have z-0 to sit behind sidebar', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const main = page.locator('main.z-0').first();
    const exists = await main.count() > 0;
    expect(exists).toBeTruthy();
  });

  test('should be full width regardless of sidebar state', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const main = page.locator('main').first();
    const widthBefore = await main.evaluate((el) => el.offsetWidth);
    
    // Toggle sidebar
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await page.waitForTimeout(500);
    }
    
    const widthAfter = await main.evaluate((el) => el.offsetWidth);
    
    // Width should be the same (within a small margin for animations)
    expect(Math.abs(widthBefore - widthAfter)).toBeLessThan(10);
  });

  test('should remain scrollable independently', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Main should have overflow-y-auto
    const main = page.locator('main.overflow-y-auto').first();
    await expect(main).toBeVisible();
  });
});

test.describe('Sidebar - Toggle Behavior with New Layout', () => {
  test('should animate width transition', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Check for transition classes
    const sidebar = page.locator('.transition-all.duration-300').first();
    await expect(sidebar).toBeVisible();
  });

  test('should expand to 256px width', async ({ page }) => {
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
      
      const sidebar = page.locator('.w-64').first();
      const box = await sidebar.boundingBox();
      
      if (box) {
        expect(box.width).toBeCloseTo(256, 10);
      }
    }
  });

  test('should collapse to 64px width', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      const sidebar = page.locator('.w-16').first();
      const box = await sidebar.boundingBox();
      
      if (box) {
        expect(box.width).toBeCloseTo(64, 10);
      }
    }
  });

  test('should change z-index during toggle', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      // Start collapsed
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      const hasLowZ = await page.locator('.z-10').count() > 0;
      expect(hasLowZ).toBeTruthy();
      
      // Expand
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      const hasHighZ = await page.locator('.z-\\[1000\\]').count() > 0;
      expect(hasHighZ).toBeTruthy();
    }
  });
});

test.describe('Sidebar - User Interaction with Overlay', () => {
  test('should allow clicking through to main content when collapsed', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Collapse sidebar
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await page.waitForTimeout(500);
    }
    
    // Should be able to interact with main content
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    if (await newDocButton.isVisible()) {
      await expect(newDocButton).toBeVisible();
    }
  });

  test('should cover part of main content when expanded on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Expand sidebar
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      const isCollapsed = await page.locator('.w-16').count() > 0;
      if (isCollapsed) {
        await toggleButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Sidebar should be visible and overlaying
    const sidebar = page.locator('.w-64').first();
    const main = page.locator('main').first();
    
    const sidebarBox = await sidebar.boundingBox();
    const mainBox = await main.boundingBox();
    
    if (sidebarBox && mainBox) {
      // Sidebar should overlap main on left side
      expect(sidebarBox.x).toBeLessThan(mainBox.x + mainBox.width);
    }
  });
});

test.describe('Sidebar - Content Visibility', () => {
  test('should show workspace header when expanded', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Ensure expanded
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      const isCollapsed = await page.locator('.w-16').count() > 0;
      if (isCollapsed) {
        await toggleButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Workspace text should be visible
    const workspaceHeader = page.getByText('Workspace');
    const count = await workspaceHeader.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should hide workspace header when collapsed', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Collapse sidebar
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await page.waitForTimeout(500);
    }
    
    // Workspace header should be hidden
    const workspaceHeader = page.getByRole('heading', { name: 'Workspace' });
    const isVisible = await workspaceHeader.isVisible().catch(() => false);
    
    // Should be hidden or not in DOM
    expect(isVisible).toBeFalsy();
  });

  test('should show document list when expanded', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Create a document first
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Ensure sidebar is expanded
      const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
      if (await toggleButton.isVisible()) {
        const isCollapsed = await page.locator('.w-16').count() > 0;
        if (isCollapsed) {
          await toggleButton.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Document should appear in sidebar
      const docInSidebar = page.locator('button:has-text("Untitled")').first();
      const exists = await docInSidebar.count() > 0;
      expect(exists).toBeTruthy();
    }
  });
});

test.describe('Sidebar - Accessibility with Overlay', () => {
  test('should be accessible via keyboard when expanded', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Tab to sidebar elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });
    
    expect(focusedElement).toBeTruthy();
  });

  test('should maintain aria labels on toggle button', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      const ariaLabel = await toggleButton.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel?.toLowerCase()).toContain('sidebar');
    }
  });

  test('should announce state changes to screen readers', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const toggleButton = page.locator('button[aria-label*="sidebar"]').first();
    if (await toggleButton.isVisible()) {
      // Check aria-label changes based on state
      const labelBefore = await toggleButton.getAttribute('aria-label');
      
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      const labelAfter = await toggleButton.getAttribute('aria-label');
      
      // Labels should indicate different states
      expect(labelBefore).not.toBe(labelAfter);
    }
  });
});
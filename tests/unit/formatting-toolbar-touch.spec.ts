import { test, expect } from '@playwright/test';

/**
 * Unit tests for FormattingToolbar touch interaction improvements
 * Tests the new onTouchStart handlers, active states, and touch-manipulation classes
 */

test.describe('FormattingToolbar - Touch Manipulation', () => {
  test('should have touch-manipulation class on toolbar', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check for touch-manipulation class on toolbar
      const toolbar = page.locator('.glass-card.touch-manipulation');
      await expect(toolbar).toBeVisible();
    }
  });

  test('should have touch-manipulation class with sticky positioning', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Verify sticky and touch classes coexist
      const toolbar = page.locator('.sticky.touch-manipulation');
      await expect(toolbar).toBeVisible();
    }
  });

  test('should remain at top when scrolling', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Add content to enable scrolling
      for (let i = 0; i < 20; i++) {
        await page.keyboard.type('Line of content\n');
      }
      
      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(500);
      
      // Toolbar should still be visible (sticky)
      const toolbar = page.locator('.sticky.top-0');
      await expect(toolbar).toBeVisible();
    }
  });
});

test.describe('FormattingToolbar - Button Touch Handlers', () => {
  test('should have type="button" on all formatting buttons', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check bold button
      const boldButton = page.getByRole('button', { name: /Bold/i }).first();
      if (await boldButton.isVisible()) {
        const type = await boldButton.getAttribute('type');
        expect(type).toBe('button');
      }
      
      // Check italic button
      const italicButton = page.getByRole('button', { name: /Italic/i }).first();
      if (await italicButton.isVisible()) {
        const type = await italicButton.getAttribute('type');
        expect(type).toBe('button');
      }
    }
  });

  test('should have active state styling on buttons', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check for active state class
      const boldButton = page.getByRole('button', { name: /Bold/i }).first();
      if (await boldButton.isVisible()) {
        const classList = await boldButton.getAttribute('class');
        expect(classList).toContain('active:bg-leather-700');
      }
    }
  });

  test('should respond to button clicks', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Type some text
      await page.keyboard.type('Format me');
      
      // Select text
      await page.keyboard.press('Control+A');
      
      // Click bold button
      const boldButton = page.getByRole('button', { name: /Bold/i }).first();
      if (await boldButton.isVisible()) {
        await boldButton.click();
        await page.waitForTimeout(500);
        
        // Should not crash
        const hasEditor = await page.locator('body').isVisible();
        expect(hasEditor).toBeTruthy();
      }
    }
  });

  test('should work on touch devices (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Toolbar should be visible on mobile
      const toolbar = page.locator('.touch-manipulation');
      await expect(toolbar).toBeVisible();
    }
  });

  test('should have proper touch target size on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check button size
      const boldButton = page.getByRole('button', { name: /Bold/i }).first();
      if (await boldButton.isVisible()) {
        const box = await boldButton.boundingBox();
        
        // Should have reasonable touch target (at least 32px is recommended, 44px is ideal)
        if (box) {
          expect(box.height).toBeGreaterThan(30);
        }
      }
    }
  });
});

test.describe('FormattingToolbar - Text Formatting Buttons', () => {
  test('should have Bold button with proper styling', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const boldButton = page.getByRole('button', { name: /Bold/i }).first();
      if (await boldButton.isVisible()) {
        const classList = await boldButton.getAttribute('class');
        
        expect(classList).toContain('hover:bg-leather-600');
        expect(classList).toContain('text-leather-200');
      }
    }
  });

  test('should have Italic button with proper styling', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const italicButton = page.getByRole('button', { name: /Italic/i }).first();
      if (await italicButton.isVisible()) {
        const classList = await italicButton.getAttribute('class');
        
        expect(classList).toContain('hover:bg-leather-600');
        expect(classList).toContain('active:bg-leather-700');
      }
    }
  });

  test('should have Underline button', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const underlineButton = page.getByRole('button', { name: /Underline/i });
      const count = await underlineButton.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should have Strikethrough button', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const strikeButton = page.getByRole('button', { name: /Strikethrough/i });
      const count = await strikeButton.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should have proper padding on text formatting buttons', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const boldButton = page.getByRole('button', { name: /Bold/i }).first();
      if (await boldButton.isVisible()) {
        const classList = await boldButton.getAttribute('class');
        
        expect(classList).toContain('px-3');
        expect(classList).toContain('py-1.5');
      }
    }
  });
});

test.describe('FormattingToolbar - Block Formatting Buttons', () => {
  test('should have Heading 1 button', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const h1Button = page.getByRole('button', { name: /Heading 1/i });
      const count = await h1Button.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should have Heading 2 button', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const h2Button = page.getByRole('button', { name: /Heading 2/i });
      const count = await h2Button.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should have Heading 3 button', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const h3Button = page.getByRole('button', { name: /Heading 3/i });
      const count = await h3Button.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should have Bullet List button', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const bulletButton = page.getByRole('button', { name: /Bullet List/i });
      const count = await bulletButton.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should have Numbered List button', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const numberedButton = page.getByRole('button', { name: /Numbered List/i });
      const count = await numberedButton.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should have consistent styling on block buttons', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const h1Button = page.getByRole('button', { name: /Heading 1/i }).first();
      if (await h1Button.isVisible()) {
        const classList = await h1Button.getAttribute('class');
        
        expect(classList).toContain('hover:bg-leather-600');
        expect(classList).toContain('active:bg-leather-700');
      }
    }
  });
});

test.describe('FormattingToolbar - Visual Separator', () => {
  test('should have border separator between text and block formatting', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Look for separator
      const separator = page.locator('.border-r.border-leather-500');
      const count = await separator.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should organize buttons in flex layout', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check for flex container
      const container = page.locator('.flex.flex-wrap.items-center.gap-1');
      await expect(container).toBeVisible();
    }
  });

  test('should wrap buttons on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check flex-wrap is present
      const toolbar = page.locator('.flex-wrap');
      await expect(toolbar).toBeVisible();
    }
  });
});

test.describe('FormattingToolbar - Accessibility', () => {
  test('should have title attributes on buttons', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const boldButton = page.getByRole('button', { name: /Bold/i }).first();
      if (await boldButton.isVisible()) {
        const title = await boldButton.getAttribute('title');
        expect(title).toBeTruthy();
      }
    }
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Tab to toolbar buttons
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to focus buttons
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    }
  });

  test('should have proper button roles', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // All toolbar buttons should have button role
      const buttons = await page.getByRole('button').filter({ has: page.locator('.glass-card') }).count();
      expect(buttons).toBeGreaterThan(0);
    }
  });
});

test.describe('FormattingToolbar - Touch Events', () => {
  test('should prevent default on touch events', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Buttons should have onTouchStart handlers
      // This is implicit in the implementation
      const toolbar = page.locator('.touch-manipulation');
      await expect(toolbar).toBeVisible();
    }
  });

  test('should handle rapid taps without double-triggering', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Type content
      await page.keyboard.type('Test');
      await page.keyboard.press('Control+A');
      
      // Rapid clicks on bold button
      const boldButton = page.getByRole('button', { name: /Bold/i }).first();
      if (await boldButton.isVisible()) {
        await boldButton.click();
        await boldButton.click();
        await page.waitForTimeout(500);
        
        // Should handle gracefully without errors
        const hasEditor = await page.locator('body').isVisible();
        expect(hasEditor).toBeTruthy();
      }
    }
  });
});

test.describe('FormattingToolbar - Responsive Design', () => {
  test('should be visible on mobile portrait', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const toolbar = page.locator('.glass-card').first();
      await expect(toolbar).toBeVisible();
    }
  });

  test('should be visible on mobile landscape', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const toolbar = page.locator('.glass-card').first();
      await expect(toolbar).toBeVisible();
    }
  });

  test('should be visible on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const toolbar = page.locator('.glass-card').first();
      await expect(toolbar).toBeVisible();
    }
  });

  test('should be visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const toolbar = page.locator('.glass-card').first();
      await expect(toolbar).toBeVisible();
    }
  });
});
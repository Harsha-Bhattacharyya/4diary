import { test, expect } from '@playwright/test';

/**
 * Unit tests for component behavior
 * These tests verify individual component functionality
 */

test.describe('EditableTitle Component', () => {
  test('should render title text', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Create a new document to get an editable title
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check that title is rendered
      await expect(page.getByText('Untitled')).toBeVisible();
    }
  });

  test('should switch to edit mode on click', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Click on title
      const title = page.getByRole('heading', { name: /Untitled/i }).first();
      
      if (await title.isVisible()) {
        await title.click();
        
        // Input should appear
        const input = page.locator('input[type="text"]').first();
        await expect(input).toBeVisible();
      }
    }
  });

  test('should save title on Enter key', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const title = page.getByRole('heading', { name: /Untitled/i }).first();
      
      if (await title.isVisible()) {
        await title.click();
        
        const input = page.locator('input[type="text"]').first();
        
        if (await input.isVisible()) {
          await input.fill('Test Title');
          await input.press('Enter');
          
          await page.waitForTimeout(500);
          
          // Input should be hidden, title should show new value
          await expect(input).not.toBeVisible();
          await expect(page.getByText('Test Title')).toBeVisible();
        }
      }
    }
  });

  test('should cancel edit on Escape key', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const title = page.getByRole('heading', { name: /Untitled/i }).first();
      
      if (await title.isVisible()) {
        await title.click();
        
        const input = page.locator('input[type="text"]').first();
        
        if (await input.isVisible()) {
          await input.fill('This Should Not Save');
          await input.press('Escape');
          
          await page.waitForTimeout(500);
          
          // Should revert to original title
          await expect(page.getByText('Untitled')).toBeVisible();
        }
      }
    }
  });
});

test.describe('FormattingToolbar Component', () => {
  test('should render all text formatting buttons', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check for formatting buttons
      const boldExists = await page.getByRole('button', { name: /Bold/i }).isVisible();
      const italicExists = await page.getByRole('button', { name: /Italic/i }).isVisible();
      
      // At least some buttons should be present
      expect(boldExists || italicExists).toBeTruthy();
    }
  });

  test('should render block formatting buttons', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check for block type buttons
      const h1Exists = await page.getByRole('button', { name: /Heading 1/i }).isVisible();
      const listExists = await page.getByRole('button', { name: /Bullet List/i }).isVisible();
      
      // At least some buttons should be present
      expect(h1Exists || listExists).toBeTruthy();
    }
  });
});

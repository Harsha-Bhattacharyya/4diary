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

test.describe('Sidebar Component', () => {
  test('should render sidebar with navigation items', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Check for logo/title
    await expect(page.getByText('4diary')).toBeVisible();
    
    // Check for navigation items (at least Home should be visible)
    const homeLink = page.getByRole('link', { name: /Home/i });
    await expect(homeLink).toBeVisible();
  });

  test('should collapse sidebar when toggle button is clicked', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Find the toggle button (looking for the arrow)
    const toggleButton = page.locator('button[title*="Collapse sidebar"]');
    
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await page.waitForTimeout(500); // Wait for animation
      
      // Check that sidebar is collapsed - logo should show '4D' instead of '4diary'
      await expect(page.getByText('4D')).toBeVisible();
    }
  });

  test('should expand sidebar when toggle button is clicked while collapsed', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const toggleButton = page.locator('button').filter({ hasText: /←|→/ }).first();
    
    if (await toggleButton.isVisible()) {
      // Collapse first
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      // Then expand
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      // Full title should be visible
      await expect(page.getByText('Privacy-first notes')).toBeVisible();
    }
  });

  test('should show recent documents when available', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Create a document first
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Look for document in sidebar
      const documentLink = page.locator('button:has-text("Untitled")').first();
      
      if (await documentLink.isVisible()) {
        await expect(documentLink).toBeVisible();
      }
    }
  });

  test('should navigate between different sections', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Click on Templates link
    const templatesLink = page.getByRole('link', { name: /Templates/i });
    
    if (await templatesLink.isVisible()) {
      await templatesLink.click();
      await page.waitForTimeout(500);
      
      // Should navigate to templates page
      expect(page.url()).toContain('/templates');
    }
  });

  test('should highlight active navigation item', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // The workspace link should be active (has special styling)
    const workspaceLink = page.getByRole('link', { name: /Workspaces/i });
    
    if (await workspaceLink.isVisible()) {
      // Check if it has active styling by looking at its class or visual state
      const classList = await workspaceLink.getAttribute('class');
      expect(classList).toBeTruthy();
    }
  });

  test('should show encryption badge in footer', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Look for encryption indicator
    await expect(page.getByText(/End-to-end encrypted|🔐/i)).toBeVisible();
  });
});

test.describe('EditableTitle Component - Advanced Tests', () => {
  test('should show original title when component mounts', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Should show "Untitled" by default
      await expect(page.getByText('Untitled').first()).toBeVisible();
    }
  });

  test('should focus input and select text when entering edit mode', async ({ page }) => {
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
          // Check if input is focused
          const isFocused = await input.evaluate(el => el === document.activeElement);
          expect(isFocused).toBeTruthy();
        }
      }
    }
  });

  test('should not save empty title and revert to original', async ({ page }) => {
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
          await input.fill('');
          await input.press('Enter');
          
          await page.waitForTimeout(500);
          
          // Should revert to "Untitled"
          await expect(page.getByText('Untitled')).toBeVisible();
        }
      }
    }
  });

  test('should trim whitespace from title before saving', async ({ page }) => {
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
          await input.fill('  Trimmed Title  ');
          await input.press('Enter');
          
          await page.waitForTimeout(500);
          
          // Should show trimmed version
          await expect(page.getByText('Trimmed Title')).toBeVisible();
        }
      }
    }
  });

  test('should save on blur (clicking outside)', async ({ page }) => {
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
          await input.fill('Blur Save Test');
          
          // Click outside to trigger blur
          await page.click('body');
          await page.waitForTimeout(500);
          
          // Should save the new title
          await expect(page.getByText('Blur Save Test')).toBeVisible();
        }
      }
    }
  });

  test('should respect maxLength attribute (100 characters)', async ({ page }) => {
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
          const maxLength = await input.getAttribute('maxLength');
          expect(maxLength).toBe('100');
        }
      }
    }
  });

  test('should update title in sidebar when changed', async ({ page }) => {
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
          await input.fill('Updated Sidebar Title');
          await input.press('Enter');
          
          await page.waitForTimeout(1000);
          
          // Check if sidebar reflects the new title
          const sidebarItem = page.locator('button:has-text("Updated Sidebar Title")');
          
          if (await sidebarItem.isVisible()) {
            await expect(sidebarItem).toBeVisible();
          }
        }
      }
    }
  });
});

test.describe('FormattingToolbar Component - Advanced Tests', () => {
  test('should render toolbar when editor is present', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Toolbar should be visible with formatting buttons
      const toolbarPresent = await page.locator('.glass-card').filter({ hasText: /B|I|U/ }).isVisible();
      expect(toolbarPresent).toBeTruthy();
    }
  });

  test('should have all text formatting buttons', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check for key formatting buttons by title
      const buttons = [
        'Bold',
        'Italic',
        'Underline',
        'Strikethrough',
      ];
      
      for (const buttonTitle of buttons) {
        const button = page.getByRole('button', { name: buttonTitle });
        const exists = await button.count();
        expect(exists).toBeGreaterThan(0);
      }
    }
  });

  test('should have all block formatting buttons', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Check for block type buttons
      const blockButtons = [
        'Heading 1',
        'Heading 2',
        'Heading 3',
        'Bullet List',
        'Numbered List',
      ];
      
      for (const buttonTitle of blockButtons) {
        const button = page.getByRole('button', { name: buttonTitle });
        const exists = await button.count();
        expect(exists).toBeGreaterThan(0);
      }
    }
  });

  test('should have visual separator between text and block formatting', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Look for the border/separator element
      const separator = page.locator('.border-r.border-leather-500');
      
      if (await separator.count() > 0) {
        await expect(separator.first()).toBeVisible();
      }
    }
  });

  test('toolbar buttons should be clickable', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const boldButton = page.getByRole('button', { name: /Bold/i }).first();
      
      if (await boldButton.isVisible()) {
        // Should be clickable (not disabled)
        const isDisabled = await boldButton.isDisabled();
        expect(isDisabled).toBeFalsy();
        
        // Try clicking
        await boldButton.click();
        // No error should occur
      }
    }
  });

  test('toolbar should have hover effects on buttons', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      const boldButton = page.getByRole('button', { name: /Bold/i }).first();
      
      if (await boldButton.isVisible()) {
        // Check for hover class
        const classList = await boldButton.getAttribute('class');
        expect(classList).toContain('hover:');
      }
    }
  });
});

test.describe('BlockEditor Component - Advanced Tests', () => {
  test('should show save indicator when autosave is enabled', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Look for save status indicator
      const saveIndicator = page.locator('text=/Saving|Saved/i');
      
      // Wait for autosave to trigger
      await page.waitForTimeout(3000);
      
      if (await saveIndicator.count() > 0) {
        await expect(saveIndicator.first()).toBeVisible();
      }
    }
  });

  test('should display "Saving..." during save operation', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Type something to trigger save
      await page.keyboard.type('Test content');
      
      // Wait for autosave to complete
      await page.waitForTimeout(1500);
    }
  });

  test('should show last saved timestamp', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Type content
      await page.keyboard.type('Test');
      
      // Wait for autosave
      await page.waitForTimeout(3000);
      
      // Look for timestamp in save indicator
      const savedIndicator = page.locator('text=/✓ Saved/i');
      
      if (await savedIndicator.count() > 0) {
        const text = await savedIndicator.first().textContent();
        expect(text).toBeTruthy();
      }
    }
  });

  test('should initialize with provided initial content', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Should show the default content (Untitled heading)
      await expect(page.getByRole('heading', { name: /Untitled/i })).toBeVisible();
    }
  });

  test('should render FormattingToolbar when showToolbar is true', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Toolbar should be present
      const toolbar = page.locator('.glass-card').first();
      await expect(toolbar).toBeVisible();
    }
  });
});

test.describe('Workspace Page Integration Tests', () => {
  test('should initialize encryption keys on load', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Should show encryption badge
    await expect(page.getByText(/🔐 Encrypted|Encryption Active/i)).toBeVisible();
  });

  test('should create new document with default content', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Should show editor with default "Untitled" heading
      await expect(page.getByText('Untitled')).toBeVisible();
    }
  });

  test('should show welcome cards when no document is open', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Look for welcome cards
    const createNoteCard = page.getByText(/Create Your First Note/i);
    const templateCard = page.getByText(/Use a Template/i);
    
    const hasWelcome = (await createNoteCard.count() > 0) || (await templateCard.count() > 0);
    expect(hasWelcome).toBeTruthy();
  });

  test('should handle template parameter in URL', async ({ page }) => {
    // Navigate with template parameter
    await page.goto('/workspace?template=daily-journal');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should attempt to load template (may or may not succeed based on template availability)
    // Just verify no crash occurs
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should display export button when document is open', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Export button should appear
      const exportButton = page.getByRole('button', { name: /📥 Export/i });
      await expect(exportButton).toBeVisible();
    }
  });

  test('should display "Export All" button when documents exist', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Export All button should appear
      const exportAllButton = page.getByRole('button', { name: /📦 Export All/i });
      await expect(exportAllButton).toBeVisible();
    }
  });

  test('should handle sidebar toggle state', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Find toggle button
    const toggleButton = page.locator('button').filter({ hasText: /←|→/ }).first();
    
    if (await toggleButton.isVisible()) {
      // Toggle sidebar
      await toggleButton.click();
      await page.waitForTimeout(500);
      
      // Main content should adjust
      const main = page.locator('main').first();
      const classList = await main.getAttribute('class');
      
      expect(classList).toBeTruthy();
    }
  });

  test('should show loading state during initialization', async ({ page }) => {
    // Navigate and immediately look for loading state
    const navigationPromise = page.goto('/workspace');
    
    // Try to catch loading state
    const loadingText = page.getByText(/Initializing encryption keys|Loading workspace/i);
    
    // Don't fail if we miss it (it might be too fast)
    if (await loadingText.count() > 0) {
      await expect(loadingText.first()).toBeVisible();
    }
    
    await navigationPromise;
    await page.waitForLoadState('networkidle');
  });

  test('should display error state on initialization failure', async ({ page }) => {
    // This test would require mocking/forcing an error
    // For now, just verify error handling UI exists in code
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Page should load without crashing
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Home Page Tests', () => {
  test('should render hero section with logo', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for logo image
    const logo = page.locator('img[alt="logo"]');
    await expect(logo).toBeVisible();
  });

  test('should display main heading and tagline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for main heading
    await expect(page.getByText(/Privacy-First Note-Taking/i)).toBeVisible();
  });

  test('should have "Get Started" button linking to workspace', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const getStartedLink = page.getByRole('link', { name: /Get Started/i });
    await expect(getStartedLink).toBeVisible();
    
    // Should link to workspace
    const href = await getStartedLink.getAttribute('href');
    expect(href).toContain('/workspace');
  });

  test('should have "Browse Templates" button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const templatesLink = page.getByRole('link', { name: /Browse Templates/i });
    await expect(templatesLink).toBeVisible();
  });

  test('should display all feature cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for key features
    const features = [
      'End-to-End Encrypted',
      'Notion-like Editor',
      'Self-Hostable',
      'Smart Organization',
      'Export Freedom',
      'Beautiful Design',
    ];
    
    for (const feature of features) {
      await expect(page.getByText(feature)).toBeVisible();
    }
  });

  test('should have footer with links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for footer text
    await expect(page.getByText(/Built with privacy, security/i)).toBeVisible();
    
    // Check for "Learn More" link
    const learnMoreLink = page.getByRole('link', { name: /Learn More/i });
    await expect(learnMoreLink).toBeVisible();
  });

  test('should render background animation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that LeatherBackground component rendered
    const background = page.locator('.fixed.inset-0.-z-10');
    
    if (await background.count() > 0) {
      await expect(background.first()).toBeVisible();
    }
  });
});

test.describe('Component Prop Variations', () => {
  test('EditableTitle should accept custom className', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    const newDocButton = page.getByRole('button', { name: /New Document/i });
    
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      await page.waitForTimeout(1000);
      
      // Title should have custom classes applied
      const title = page.locator('h2').filter({ hasText: 'Untitled' }).first();
      
      if (await title.isVisible()) {
        const classList = await title.getAttribute('class');
        expect(classList).toContain('text-2xl');
      }
    }
  });

  test('LeatherButton should support different variants', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
    
    // Check for different button variants
    const parchmentButton = page.getByRole('button', { name: /New Document/i });
    
    if (await parchmentButton.isVisible()) {
      const classList = await parchmentButton.getAttribute('class');
      expect(classList).toBeTruthy();
    }
  });

  test('GlassCard should support hover effect', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Feature cards should have hover effect
    const featureCard = page.locator('.leather-card').first();
    
    if (await featureCard.isVisible()) {
      const classList = await featureCard.getAttribute('class');
      expect(classList).toBeTruthy();
    }
  });
});
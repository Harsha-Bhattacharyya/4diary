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

test.describe('Home Page', () => {
  test('should load successfully with hero section', async ({ page }) => {
    await page.goto('/');
    
    // Check that the tagline is visible
    await expect(page.getByText(/Catering to your note needs with privacy and style/i)).toBeVisible();
    
    // Check that the main buttons are present in the hero
    await expect(page.getByRole('link', { name: /Get Started/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /View Docs/i }).first()).toBeVisible();
  });

  test('should have long scroll sections with key content', async ({ page }) => {
    await page.goto('/');
    
    // Check for hero section content
    await expect(page.getByText(/Catering to your note needs/i)).toBeVisible();
    
    // Scroll to see the problem section
    await page.getByRole('heading', { name: /The Growing Need for Privacy/i }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: /The Growing Need for Privacy/i })).toBeVisible();
    await expect(page.getByText(/Notes are like paper but better and faster/i)).toBeVisible();
    
    // Check for the security question section
    await page.getByRole('heading', { name: /But what if someone got access to these/i }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: /But what if someone got access to these/i })).toBeVisible();
    
    // Check for the E2E encryption section
    await page.getByRole('heading', { name: 'E2E Encryption' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: 'E2E Encryption' })).toBeVisible();
    
    // Check for the Why 4Diary feature cards
    await page.getByRole('heading', { name: /Why 4Diary/i }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: 'AES Encryption' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Zero-Knowledge' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Self-Hostable' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'FLOSS' })).toBeVisible();
  });

  test('should navigate to workspace', async ({ page }) => {
    await page.goto('/');
    
    // Click on "Get Started" button (first occurrence in hero section)
    await page.getByRole('link', { name: /Get Started/i }).first().click();
    
    // Wait for navigation
    await page.waitForURL('/workspace');
    
    // Check that workspace page loaded
    await expect(page.getByText(/Workspace|Initializing encryption keys/i)).toBeVisible();
  });

  test('should navigate to docs', async ({ page }) => {
    await page.goto('/');
    
    // Click on "View Docs" button (first occurrence in hero section)
    await page.getByRole('link', { name: /View Docs/i }).first().click();
    
    // Wait for navigation
    await page.waitForURL('/docs');
    
    // Check that docs page loaded - use more specific selector
    await expect(page.getByRole('heading', { name: /Documentation/i }).first()).toBeVisible();
  });
});

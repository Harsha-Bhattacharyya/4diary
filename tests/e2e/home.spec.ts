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
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page title is visible
    await expect(page.getByText('Privacy-First Note-Taking')).toBeVisible();
    
    // Check that the main buttons are present
    await expect(page.getByRole('link', { name: /Get Started/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse Templates/i })).toBeVisible();
  });

  test('should have all feature cards', async ({ page }) => {
    await page.goto('/');
    
    // Check for feature cards
    await expect(page.getByText('End-to-End Encrypted')).toBeVisible();
    await expect(page.getByText('Notion-like Editor')).toBeVisible();
    await expect(page.getByText('Self-Hostable')).toBeVisible();
    await expect(page.getByText('Smart Organization')).toBeVisible();
    await expect(page.getByText('Export Freedom')).toBeVisible();
    await expect(page.getByText('Beautiful Design')).toBeVisible();
  });

  test('should navigate to workspace', async ({ page }) => {
    await page.goto('/');
    
    // Click on "Get Started" button
    await page.getByRole('link', { name: /Get Started/i }).click();
    
    // Wait for navigation
    await page.waitForURL('/workspace');
    
    // Check that workspace page loaded
    await expect(page.getByText(/Workspace|Initializing encryption keys/i)).toBeVisible();
  });

  test('should navigate to templates', async ({ page }) => {
    await page.goto('/');
    
    // Click on "Browse Templates" button
    await page.getByRole('link', { name: /Browse Templates/i }).click();
    
    // Wait for navigation
    await page.waitForURL('/templates');
    
    // Check that templates page loaded
    await expect(page.getByText(/Document Templates/i)).toBeVisible();
  });
});

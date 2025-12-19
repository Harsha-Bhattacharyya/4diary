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

test.describe('Settings Page', () => {
  test('should load settings page successfully', async ({ page }) => {
    await page.goto('/settings');
    
    // Check that the settings page title is visible
    await expect(page.getByRole('heading', { name: /Settings/i }).first()).toBeVisible();
    
    // Check that main sections are present
    await expect(page.getByRole('heading', { name: /Security/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Appearance/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Import & Export/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Privacy/i })).toBeVisible();
  });

  test('should display encryption toggle', async ({ page }) => {
    await page.goto('/settings');
    
    // Check for encryption setting
    await expect(page.getByText(/End-to-End Encryption/i)).toBeVisible();
    await expect(page.getByText(/Encrypt all documents with AES-256-GCM/i)).toBeVisible();
  });

  test('should display 2FA section', async ({ page }) => {
    await page.goto('/settings');
    
    // Check for 2FA section
    await expect(page.getByText(/Two-Factor Authentication/i)).toBeVisible();
    await expect(page.getByText(/Add an extra layer of security with TOTP/i)).toBeVisible();
  });

  test('should have theme toggle', async ({ page }) => {
    await page.goto('/settings');
    
    // Check for theme toggle
    await expect(page.getByRole('heading', { name: /Appearance/i })).toBeVisible();
    await expect(page.getByText(/Theme/i)).toBeVisible();
  });

  test('should have import and export options', async ({ page }) => {
    await page.goto('/settings');
    
    // Scroll to import/export section
    await page.getByRole('heading', { name: /Import & Export/i }).scrollIntoViewIfNeeded();
    
    // Check for import/export options
    await expect(page.getByText(/Import Notes/i)).toBeVisible();
    await expect(page.getByText(/Export All Documents/i)).toBeVisible();
    
    // Check for supported formats
    await expect(page.getByText(/Markdown/i)).toBeVisible();
    await expect(page.getByText(/Google Keep/i)).toBeVisible();
    await expect(page.getByText(/Evernote/i)).toBeVisible();
    await expect(page.getByText(/Notion/i)).toBeVisible();
  });

  test('should display self-hosting information', async ({ page }) => {
    await page.goto('/settings');
    
    // Scroll to self-hosting section
    await page.getByRole('heading', { name: /Self-Hosting/i }).scrollIntoViewIfNeeded();
    
    // Check for self-hosting content
    await expect(page.getByRole('heading', { name: /Self-Hosting/i })).toBeVisible();
    await expect(page.getByText(/Docker/i)).toBeVisible();
  });
});

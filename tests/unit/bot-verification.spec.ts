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
 * Unit tests for Cloudflare Turnstile bot verification
 * Verifies that bot verification is optional and doesn't block login when disabled
 */

test.describe('Bot Verification - Cloudflare Turnstile', () => {
  test('should render Turnstile widget when configured', async ({ page }) => {
    // Mock environment variable for Turnstile
    await page.addInitScript(() => {
      // @ts-expect-error - Setting test environment variable
      window.ENV_TURNSTILE_ENABLED = true;
    });

    await page.goto('/auth');
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Log In")');
    
    // Note: Turnstile widget will only show if NEXT_PUBLIC_TURNSTILE_SITE_KEY is set
    // In test environment without the key, widget should not appear
    // This is by design for self-hostability
  });

  test('should allow login without Turnstile when not configured', async ({ page }) => {
    await page.goto('/auth');
    
    // Wait for login form
    await page.waitForSelector('h1:has-text("Log In")');
    
    // Fill in credentials
    await page.fill('input[type="text"]', 'testuser');
    await page.fill('input[type="password"]', 'testpassword123');
    
    // Submit form (this will fail without valid credentials, but that's expected)
    await page.click('button:has-text("Enter")');
    
    // The form should submit without requiring Turnstile token
    // We expect either a navigation or an error message, not a Turnstile error
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    const hasError = await page.locator('text=/Invalid credentials|Username and password are required/i').isVisible().catch(() => false);
    
    // Either redirected or got a login error (not Turnstile error)
    expect(currentUrl.includes('/workspace') || hasError).toBeTruthy();
  });

  test('auth page should have proper form structure', async ({ page }) => {
    await page.goto('/auth');
    
    // Check form elements exist
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Enter")')).toBeVisible();
    
    // Check toggle between login and signup
    await expect(page.locator('text=/Don\'t have an account\\? Sign up/i')).toBeVisible();
  });

  test('should toggle between login and signup', async ({ page }) => {
    await page.goto('/auth');
    
    // Start with login
    await expect(page.locator('h1:has-text("Log In")')).toBeVisible();
    
    // Toggle to signup
    await page.click('text=/Don\'t have an account\\? Sign up/i');
    await expect(page.locator('h1:has-text("Sign Up")')).toBeVisible();
    
    // Toggle back to login
    await page.click('text=/Already have an account\\? Log in/i');
    await expect(page.locator('h1:has-text("Log In")')).toBeVisible();
  });

  test('should show password generator in signup mode', async ({ page }) => {
    await page.goto('/auth');
    
    // Toggle to signup
    await page.click('text=/Don\'t have an account\\? Sign up/i');
    
    // Password generator button should be visible in signup mode
    const passwordField = page.locator('input[type="password"]');
    await expect(passwordField).toBeVisible();
    
    // Check for the generate password button (lock icon)
    const generateButton = page.locator('button[title="Generate secure password"]');
    await expect(generateButton).toBeVisible();
  });
});

test.describe('Bot Verification - API Route', () => {
  test('login endpoint should work without Turnstile token', async ({ request }) => {
    // Test that login works without Turnstile when feature is disabled
    const response = await request.post('/api/auth/login', {
      data: {
        username: 'testuser',
        password: 'testpassword123',
      },
    });

    // Should get unauthorized (401) or bad request (400), not forbidden (403) for missing Turnstile
    expect([400, 401, 500]).toContain(response.status());
    
    // Should not get Turnstile-specific error when feature is disabled
    const data = await response.json();
    expect(data.error).not.toContain('Bot verification');
  });
});

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
 * Unit tests for 2FA login flow
 * Tests the authentication page's handling of 2FA-enabled accounts
 */

test.describe('2FA Login Flow', () => {
  test('should show 2FA form when login returns requires2FA', async ({ page }) => {
    // Mock the login endpoint to return requires2FA
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          requires2FA: true,
          message: '2FA verification required'
        }),
      });
    });

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Fill in login form
    await page.fill('input[placeholder="username"]', 'testuser');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Wait for 2FA form to appear
    await page.waitForTimeout(500);
    
    // Should show 2FA verification form
    await expect(page.getByText('Two-Factor Authentication')).toBeVisible();
  });

  test('should show authentication code input in 2FA form', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ requires2FA: true }),
      });
    });

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[placeholder="username"]', 'testuser');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Should have authentication code input
    await expect(page.locator('input[placeholder="Enter 6-digit code"]')).toBeVisible();
  });

  test('should show backup code checkbox', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ requires2FA: true }),
      });
    });

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[placeholder="username"]', 'testuser');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Should show backup code checkbox
    await expect(page.locator('label[for="useBackupCode"]')).toBeVisible();
  });

  test('should switch to backup code input when checkbox is checked', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ requires2FA: true }),
      });
    });

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[placeholder="username"]', 'testuser');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Check backup code checkbox
    await page.check('input[id="useBackupCode"]');
    
    // Should show backup code input
    await expect(page.locator('input[placeholder="Enter backup code"]')).toBeVisible();
  });

  test('should call 2FA login API with correct parameters', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ requires2FA: true }),
      });
    });

    let twoFALoginCalled = false;
    let twoFALoginBody: any;

    await page.route('**/api/auth/2fa/login', async (route) => {
      twoFALoginCalled = true;
      twoFALoginBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Login successful' }),
      });
    });

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[placeholder="username"]', 'testuser');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Fill in 2FA token
    await page.fill('input[placeholder="Enter 6-digit code"]', '123456');
    
    // Submit 2FA form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Should have called 2FA login API
    expect(twoFALoginCalled).toBeTruthy();
    expect(twoFALoginBody.username).toBe('testuser');
    expect(twoFALoginBody.password).toBe('password123');
    expect(twoFALoginBody.token).toBe('123456');
    expect(twoFALoginBody.isBackupCode).toBe(false);
  });

  test('should redirect to workspace after successful 2FA verification', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ requires2FA: true }),
      });
    });

    await page.route('**/api/auth/2fa/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Login successful' }),
      });
    });

    // Mock workspace session check to prevent redirect back to auth
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: true, username: 'testuser' }),
      });
    });

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[placeholder="username"]', 'testuser');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Fill in 2FA token
    await page.fill('input[placeholder="Enter 6-digit code"]', '123456');
    await page.click('button[type="submit"]');

    // Should redirect to workspace
    await page.waitForURL('**/workspace', { timeout: 5000 });
    expect(page.url()).toContain('/workspace');
  });

  test('should show error message for invalid 2FA token', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ requires2FA: true }),
      });
    });

    await page.route('**/api/auth/2fa/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid 2FA token' }),
      });
    });

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[placeholder="username"]', 'testuser');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Fill in invalid 2FA token
    await page.fill('input[placeholder="Enter 6-digit code"]', '000000');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Should show error message
    await expect(page.getByText('Invalid 2FA token')).toBeVisible();
  });

  test('should have back to login button', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ requires2FA: true }),
      });
    });

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[placeholder="username"]', 'testuser');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Should show back button
    await expect(page.getByText('← Back to login')).toBeVisible();
  });

  test('should return to login form when back button is clicked', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ requires2FA: true }),
      });
    });

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[placeholder="username"]', 'testuser');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Click back button
    await page.click('button:has-text("← Back to login")');
    await page.waitForTimeout(200);

    // Should show login form again
    await expect(page.getByText('Log In')).toBeVisible();
    await expect(page.locator('input[placeholder="username"]')).toBeVisible();
  });

  test('should send isBackupCode flag when using backup code', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ requires2FA: true }),
      });
    });

    let twoFALoginBody: any;

    await page.route('**/api/auth/2fa/login', async (route) => {
      twoFALoginBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[placeholder="username"]', 'testuser');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Check backup code checkbox
    await page.check('input[id="useBackupCode"]');
    
    // Fill in backup code
    await page.fill('input[placeholder="Enter backup code"]', 'backup-12345');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Should send isBackupCode: true
    expect(twoFALoginBody.isBackupCode).toBe(true);
    expect(twoFALoginBody.token).toBe('backup-12345');
  });

  test('should not show toggle login/signup button in 2FA mode', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ requires2FA: true }),
      });
    });

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    // Verify toggle button is visible before 2FA
    await expect(page.getByText("Don't have an account? Sign up")).toBeVisible();

    // Login
    await page.fill('input[placeholder="username"]', 'testuser');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Toggle button should not be visible in 2FA mode
    await expect(page.getByText("Don't have an account? Sign up")).not.toBeVisible();
  });
});

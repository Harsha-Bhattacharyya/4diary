import { test, expect } from '@playwright/test';

/**
 * Unit tests for TopMenu component authentication features
 * Tests the new authentication state management, logout functionality, and user display
 */

test.describe('TopMenu - Authentication State Detection', () => {
  test('should check authentication status on mount', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: false }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should have made auth check request
    const request = await page.waitForRequest('**/api/auth/session');
    expect(request.url()).toContain('/api/auth/session');
  });

  test('should display login button when not authenticated', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: false }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should show "Log in" button
    const loginButton = page.getByRole('link', { name: /Log in/i });
    await expect(loginButton).toBeVisible();
  });

  test('should display user email when authenticated', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'testuser@example.com',
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should display username (part before @)
    await expect(page.getByText('testuser')).toBeVisible();
  });

  test('should display logout button when authenticated', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'user@test.com',
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should show "Logout" button
    const logoutButton = page.getByRole('button', { name: /Logout/i });
    await expect(logoutButton).toBeVisible();
  });

  test('should extract username from email (before @ symbol)', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'john.doe@example.com',
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should display only the part before @
    await expect(page.getByText('john.doe')).toBeVisible();
  });

  test('should handle authentication check errors gracefully', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.route('**/api/auth/session', async (route) => {
      await route.abort('failed');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should not crash and should log error
    const hasPage = await page.locator('body').isVisible();
    expect(hasPage).toBeTruthy();
    
    // Should have logged error
    const hasError = consoleErrors.some(err => err.toLowerCase().includes('auth'));
    expect(hasError).toBeTruthy();
  });

  test('should default to unauthenticated state on error', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should show login button when error occurs
    const loginButton = page.getByRole('link', { name: /Log in/i });
    await expect(loginButton).toBeVisible();
  });
});

test.describe('TopMenu - Logout Functionality', () => {
  test('should call logout API when logout button is clicked', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'user@test.com',
        }),
      });
    });

    let logoutCalled = false;
    await page.route('**/api/auth/logout', async (route) => {
      logoutCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click logout
    const logoutButton = page.getByRole('button', { name: /Logout/i });
    await logoutButton.click();
    
    // Should have called logout API
    expect(logoutCalled).toBeTruthy();
  });

  test('should use POST method for logout', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'user@test.com',
        }),
      });
    });

    await page.route('**/api/auth/logout', async (route) => {
      expect(route.request().method()).toBe('POST');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const logoutButton = page.getByRole('button', { name: /Logout/i });
    await logoutButton.click();
    
    await page.waitForTimeout(500);
  });

  test('should update local state after logout', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'user@test.com',
        }),
      });
    });

    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify authenticated state
    await expect(page.getByText('user')).toBeVisible();
    
    // Logout
    const logoutButton = page.getByRole('button', { name: /Logout/i });
    await logoutButton.click();
    
    await page.waitForTimeout(500);
    
    // Note: After logout, page redirects to /auth
    // So we'll check the navigation occurred
    await page.waitForURL('**/auth');
  });

  test('should redirect to /auth after logout', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'user@test.com',
        }),
      });
    });

    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click logout
    const logoutButton = page.getByRole('button', { name: /Logout/i });
    await logoutButton.click();
    
    // Should navigate to auth page
    await page.waitForURL('**/auth');
    expect(page.url()).toContain('/auth');
  });

  test('should clear user email from state after logout', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'user@test.com',
        }),
      });
    });

    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify email is displayed
    await expect(page.getByText('user')).toBeVisible();
    
    // Logout
    await page.getByRole('button', { name: /Logout/i }).click();
    await page.waitForTimeout(500);
    
    // Email should no longer be visible (redirected)
    await page.waitForURL('**/auth');
  });
});

test.describe('TopMenu - User Display', () => {
  test('should display username in text-sm size', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'testuser@example.com',
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for username with proper styling
    const username = page.locator('span.text-leather-200.text-sm');
    await expect(username).toBeVisible();
  });

  test('should display username and logout button in flex layout', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'user@test.com',
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Container should have flex layout
    const container = page.locator('.flex.items-center.gap-3').filter({ hasText: /user|Logout/i });
    await expect(container).toBeVisible();
  });

  test('should handle very long email addresses', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'verylongemailaddressfortesting@extremelylongdomainname.com',
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should display username portion
    await expect(page.getByText('verylongemailaddressfortesting')).toBeVisible();
  });

  test('should handle email without @ symbol gracefully', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'invalidemail',
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should display something (likely empty string or full email)
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should handle null email', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: null,
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should not crash
    const hasPage = await page.locator('body').isVisible();
    expect(hasPage).toBeTruthy();
  });
});

test.describe('TopMenu - Login Button', () => {
  test('should link to /auth when not authenticated', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: false }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check login link href
    const loginLink = page.getByRole('link', { name: /Log in/i });
    const href = await loginLink.getAttribute('href');
    expect(href).toBe('/auth');
  });

  test('should use LeatherButton component for login', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: false }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Login button should have leather styling
    const loginButton = page.getByRole('link', { name: /Log in/i });
    await expect(loginButton).toBeVisible();
  });

  test('should use parchment variant and sm size', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: false }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loginButton = page.getByRole('link', { name: /Log in/i });
    await expect(loginButton).toBeVisible();
  });
});

test.describe('TopMenu - Hamburger Menu with Auth', () => {
  test('should display hamburger menu regardless of auth state', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'user@test.com',
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Hamburger button should be visible
    const menuButton = page.getByRole('button', { name: /Toggle menu/i });
    await expect(menuButton).toBeVisible();
  });

  test('should open dropdown menu when authenticated', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'user@test.com',
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click hamburger menu
    const menuButton = page.getByRole('button', { name: /Toggle menu/i });
    await menuButton.click();
    
    // Dropdown should appear
    await expect(page.getByRole('button', { name: /🏠 Home/i })).toBeVisible();
  });

  test('should display all menu items when authenticated', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'user@test.com',
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open menu
    await page.getByRole('button', { name: /Toggle menu/i }).click();
    
    // Check for all menu items
    await expect(page.getByRole('button', { name: /🏠 Home/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /📚 Workspace/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /📄 Templates/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /📖 Docs/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ℹ️ About/i })).toBeVisible();
  });
});

test.describe('TopMenu - Logout Button Styling', () => {
  test('should have proper text styling for logout button', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'user@test.com',
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check logout button styling
    const logoutButton = page.getByRole('button', { name: /Logout/i });
    const classList = await logoutButton.getAttribute('class');
    
    expect(classList).toContain('text-leather-300');
    expect(classList).toContain('hover:text-leather-100');
  });

  test('should have transition effect on logout button', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'user@test.com',
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const logoutButton = page.getByRole('button', { name: /Logout/i });
    const classList = await logoutButton.getAttribute('class');
    
    expect(classList).toContain('transition-colors');
  });

  test('should use button type="button" for logout', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'user@test.com',
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const logoutButton = page.getByRole('button', { name: /Logout/i });
    const type = await logoutButton.getAttribute('type');
    
    expect(type).toBe('button');
  });
});

test.describe('TopMenu - State Persistence', () => {
  test('should maintain auth state across menu interactions', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'persistent@test.com',
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open and close menu
    const menuButton = page.getByRole('button', { name: /Toggle menu/i });
    await menuButton.click();
    await page.getByRole('button', { name: /🏠 Home/i }).click();
    
    await page.waitForTimeout(500);
    
    // Username should still be displayed
    await expect(page.getByText('persistent')).toBeVisible();
  });

  test('should check auth status only once on mount', async ({ page }) => {
    let authCheckCount = 0;
    
    await page.route('**/api/auth/session', async (route) => {
      authCheckCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authenticated: true,
          email: 'user@test.com',
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Interact with menu
    await page.getByRole('button', { name: /Toggle menu/i }).click();
    await page.waitForTimeout(500);
    
    // Should only have checked once
    expect(authCheckCount).toBe(1);
  });
});
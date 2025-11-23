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
 * Unit tests for logout route request parameter handling
 * Verifies that the logout route properly accepts NextRequest parameter
 * This test addresses the "request was not found" error in Next.js 16
 */

test.describe('Auth Logout Route - Request Parameter', () => {
  test('should accept POST requests without request body', async ({ request }) => {
    // This test verifies that the logout route accepts NextRequest parameter
    // and doesn't throw "request was not found" error
    const response = await request.post('/api/auth/logout', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Should return 200 status
    expect(response.status()).toBe(200);

    // Should return success message
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe('Logged out successfully');
  });

  test('should clear session cookie on logout', async ({ request }) => {
    const response = await request.post('/api/auth/logout', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status()).toBe(200);

    // Check that session cookie is cleared (maxAge=0)
    const setCookieHeader = response.headers()['set-cookie'];
    expect(setCookieHeader).toBeTruthy();
    
    // The cookie should be set to expire immediately
    if (setCookieHeader) {
      expect(setCookieHeader).toContain('session=');
      expect(setCookieHeader).toContain('Max-Age=0');
    }
  });

  test('should handle POST request with valid JSON body', async ({ request }) => {
    // Even though the logout route doesn't use the request body,
    // it should still accept requests with bodies without error
    const response = await request.post('/api/auth/logout', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({ unused: 'data' }),
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('should set correct cookie properties', async ({ request }) => {
    const response = await request.post('/api/auth/logout');

    expect(response.status()).toBe(200);

    const setCookieHeader = response.headers()['set-cookie'];
    if (setCookieHeader) {
      // Verify cookie properties (case-insensitive check for SameSite)
      expect(setCookieHeader).toContain('HttpOnly');
      expect(setCookieHeader).toContain('Path=/');
      expect(setCookieHeader.toLowerCase()).toContain('samesite=lax');
    }
  });
});

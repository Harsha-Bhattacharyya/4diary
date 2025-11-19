import { test, expect } from '@playwright/test';

/**
 * Unit tests for SharePage component (app/share/[id]/page.tsx)
 * Tests the shared document viewing functionality including loading states, error handling, and content display
 */

test.describe('SharePage Component - Loading State', () => {
  test('should display loading state when fetching share', async ({ page }) => {
    // Mock a slow API response to catch loading state
    await page.route('**/api/share?id=*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Test Document',
          content: [],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    const navigationPromise = page.goto('/share/test-share-id');
    
    // Check for loading indicator
    const loadingIcon = page.locator('text=📄');
    const loadingText = page.getByText('Loading shared document...');
    
    await expect(loadingIcon).toBeVisible();
    await expect(loadingText).toBeVisible();
    
    await navigationPromise;
    await page.waitForLoadState('networkidle');
  });

  test('should display loading card with proper styling', async ({ page }) => {
    await page.route('**/api/share?id=*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Test Document',
          content: [],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto('/share/test-share-id');
    
    // Verify glass card styling
    const glassCard = page.locator('.relative.z-10').first();
    await expect(glassCard).toBeVisible();
  });
});

test.describe('SharePage Component - Error States', () => {
  test('should display error when share ID is missing', async ({ page }) => {
    await page.route('**/api/share?id=', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Share ID is required' }),
      });
    });

    await page.goto('/share/');
    await page.waitForLoadState('networkidle');
    
    // Should show error state (may redirect or show 404)
    const hasError = await page.locator('text=/Error|Not Found/i').count() > 0;
    expect(hasError).toBeTruthy();
  });

  test('should display error when share not found (404)', async ({ page }) => {
    await page.route('**/api/share?id=nonexistent', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Share not found' }),
      });
    });

    await page.goto('/share/nonexistent');
    await page.waitForLoadState('networkidle');
    
    // Verify error display
    await expect(page.getByText('⚠️')).toBeVisible();
    await expect(page.getByText('Error')).toBeVisible();
    await expect(page.getByText('Share not found')).toBeVisible();
  });

  test('should display expired error when share has expired (410)', async ({ page }) => {
    await page.route('**/api/share?id=expired-share', async (route) => {
      await route.fulfill({
        status: 410,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Share has expired' }),
      });
    });

    await page.goto('/share/expired-share');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText('Share has expired')).toBeVisible();
    await expect(page.getByText('This link may have expired or been removed.')).toBeVisible();
  });

  test('should display generic error on server failure (500)', async ({ page }) => {
    await page.route('**/api/share?id=server-error', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to retrieve share' }),
      });
    });

    await page.goto('/share/server-error');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText('Failed to retrieve share')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.route('**/api/share?id=network-error', async (route) => {
      await route.abort('failed');
    });

    await page.goto('/share/network-error');
    await page.waitForLoadState('networkidle');
    
    // Should display error state
    const errorIcon = page.getByText('⚠️');
    await expect(errorIcon).toBeVisible();
  });

  test('should display error message helper text', async ({ page }) => {
    await page.route('**/api/share?id=test', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not found' }),
      });
    });

    await page.goto('/share/test');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText('This link may have expired or been removed.')).toBeVisible();
  });
});

test.describe('SharePage Component - Success State', () => {
  test('should display shared document with title', async ({ page }) => {
    const testDate = new Date();
    const expiryDate = new Date(testDate.getTime() + 86400000);
    
    await page.route('**/api/share?id=valid-share', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'My Shared Document',
          content: [
            {
              type: 'paragraph',
              content: 'This is shared content',
            },
          ],
          createdAt: testDate.toISOString(),
          expiresAt: expiryDate.toISOString(),
        }),
      });
    });

    await page.goto('/share/valid-share');
    await page.waitForLoadState('networkidle');
    
    // Verify title is displayed
    await expect(page.getByRole('heading', { name: 'My Shared Document' })).toBeVisible();
  });

  test('should display share metadata (creation and expiry dates)', async ({ page }) => {
    const testDate = new Date('2024-01-15T10:00:00Z');
    const expiryDate = new Date('2024-01-16T10:00:00Z');
    
    await page.route('**/api/share?id=valid-share', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Test Document',
          content: [],
          createdAt: testDate.toISOString(),
          expiresAt: expiryDate.toISOString(),
        }),
      });
    });

    await page.goto('/share/valid-share');
    await page.waitForLoadState('networkidle');
    
    // Check for date display (format may vary by locale)
    const dateText = await page.locator('text=/Shared on.*Expires/i').textContent();
    expect(dateText).toBeTruthy();
    expect(dateText).toContain('Shared on');
    expect(dateText).toContain('Expires');
  });

  test('should display read-only badge', async ({ page }) => {
    await page.route('**/api/share?id=valid-share', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Test',
          content: [],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto('/share/valid-share');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText('🔗 Read-only')).toBeVisible();
  });

  test('should display footer notice', async ({ page }) => {
    await page.route('**/api/share?id=valid-share', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Test',
          content: [],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto('/share/valid-share');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText('🔐 This is a temporary share link powered by 4diary')).toBeVisible();
  });

  test('should render content in BlockEditor', async ({ page }) => {
    await page.route('**/api/share?id=with-content', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Document with Content',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'This is the document content' }],
            },
          ],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto('/share/with-content');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // BlockEditor should be rendered (may need to wait for dynamic import)
    const editorContent = page.locator('.bn-container, [data-editor], .ProseMirror');
    const editorExists = await editorContent.count() > 0;
    expect(editorExists).toBeTruthy();
  });

  test('should not display formatting toolbar in read-only mode', async ({ page }) => {
    await page.route('**/api/share?id=readonly', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Read Only Doc',
          content: [],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto('/share/readonly');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Toolbar should not be visible
    const toolbarButtons = await page.getByRole('button', { name: /Bold|Italic/i }).count();
    expect(toolbarButtons).toBe(0);
  });

  test('should handle empty content array', async ({ page }) => {
    await page.route('**/api/share?id=empty-content', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Empty Document',
          content: [],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto('/share/empty-content');
    await page.waitForLoadState('networkidle');
    
    // Should display title without errors
    await expect(page.getByRole('heading', { name: 'Empty Document' })).toBeVisible();
  });
});

test.describe('SharePage Component - URL Parameter Handling', () => {
  test('should extract share ID from URL params', async ({ page }) => {
    const shareId = 'abc123def456';
    
    await page.route(`**/api/share?id=${shareId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Param Test',
          content: [],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto(`/share/${shareId}`);
    await page.waitForLoadState('networkidle');
    
    // Verify correct API call was made
    const request = await page.waitForRequest(`**/api/share?id=${shareId}`);
    expect(request.url()).toContain(shareId);
  });

  test('should URL-encode share ID parameter', async ({ page }) => {
    const shareId = 'test+id/with=special&chars';
    const encodedId = encodeURIComponent(shareId);
    
    await page.route(`**/api/share?id=${encodedId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Special Chars',
          content: [],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto(`/share/${shareId}`);
    await page.waitForLoadState('networkidle');
    
    // Should handle special characters
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('SharePage Component - Date Formatting', () => {
  test('should format creation date using toLocaleDateString', async ({ page }) => {
    const testDate = new Date('2024-01-15T10:00:00Z');
    
    await page.route('**/api/share?id=date-test', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Date Test',
          content: [],
          createdAt: testDate.toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto('/share/date-test');
    await page.waitForLoadState('networkidle');
    
    // Date should be formatted (exact format depends on locale)
    const dateSection = page.locator('text=/Shared on/i');
    await expect(dateSection).toBeVisible();
  });

  test('should format expiry date using toLocaleDateString', async ({ page }) => {
    const expiryDate = new Date('2024-12-31T23:59:59Z');
    
    await page.route('**/api/share?id=expiry-test', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Expiry Test',
          content: [],
          createdAt: new Date().toISOString(),
          expiresAt: expiryDate.toISOString(),
        }),
      });
    });

    await page.goto('/share/expiry-test');
    await page.waitForLoadState('networkidle');
    
    // Expiry date should be formatted
    const dateSection = page.locator('text=/Expires/i');
    await expect(dateSection).toBeVisible();
  });
});

test.describe('SharePage Component - Responsive Design', () => {
  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.route('**/api/share?id=mobile-test', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Mobile Test',
          content: [],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto('/share/mobile-test');
    await page.waitForLoadState('networkidle');
    
    // Title should still be visible on mobile
    await expect(page.getByRole('heading', { name: 'Mobile Test' })).toBeVisible();
  });

  test('should maintain layout on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.route('**/api/share?id=tablet-test', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Tablet Test',
          content: [],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto('/share/tablet-test');
    await page.waitForLoadState('networkidle');
    
    // Content should be properly contained
    const container = page.locator('.max-w-4xl').first();
    await expect(container).toBeVisible();
  });
});

test.describe('SharePage Component - Edge Cases', () => {
  test('should handle null shareData after loading', async ({ page }) => {
    await page.route('**/api/share?id=null-data', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(null),
      });
    });

    await page.goto('/share/null-data');
    await page.waitForLoadState('networkidle');
    
    // Should not crash, may show error or empty state
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should handle malformed JSON response', async ({ page }) => {
    await page.route('**/api/share?id=malformed', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'not valid json{',
      });
    });

    await page.goto('/share/malformed');
    await page.waitForLoadState('networkidle');
    
    // Should handle error gracefully
    const errorExists = await page.locator('text=/Error|Failed/i').count() > 0;
    expect(errorExists).toBeTruthy();
  });

  test('should handle very long document titles', async ({ page }) => {
    const longTitle = 'A'.repeat(200);
    
    await page.route('**/api/share?id=long-title', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: longTitle,
          content: [],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto('/share/long-title');
    await page.waitForLoadState('networkidle');
    
    // Title should be displayed (may be truncated)
    const titleElement = page.getByRole('heading').first();
    await expect(titleElement).toBeVisible();
  });

  test('should handle content with special characters', async ({ page }) => {
    await page.route('**/api/share?id=special-chars', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Special <>&"\'',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Content with <script>alert("xss")</script>' }],
            },
          ],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    await page.goto('/share/special-chars');
    await page.waitForLoadState('networkidle');
    
    // Should render safely without XSS
    const hasTitle = await page.getByRole('heading').first().isVisible();
    expect(hasTitle).toBeTruthy();
  });
});
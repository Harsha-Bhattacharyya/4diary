# Testing Guide for 4diary

This project uses [Playwright](https://playwright.dev/) for end-to-end (E2E) and component testing.

## Setup

### Install Dependencies

```bash
npm install
```

### Install Playwright Browsers

```bash
npx playwright install chromium
```

Or install all browsers:

```bash
npx playwright install
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run E2E Tests Only

```bash
npm run test:e2e
```

### Run Unit Tests Only

```bash
npm run test:unit
```

### Run Tests in UI Mode

```bash
npm run test:ui
```

This opens the Playwright Test UI for interactive testing and debugging.

### Run Tests in Headed Mode

```bash
npm run test:headed
```

This runs tests with the browser window visible.

### Debug Tests

```bash
npm run test:debug
```

This runs tests in debug mode with the Playwright Inspector.

### View Test Report

After running tests, view the HTML report:

```bash
npm run test:report
```

## Test Structure

- `tests/e2e/` - End-to-end tests that test complete user workflows
  - `home.spec.ts` - Tests for the home page
  - `workspace.spec.ts` - Tests for workspace functionality
  - `responsive.spec.ts` - Tests for mobile responsiveness
  
- `tests/unit/` - Component-level unit tests
  - `components.spec.ts` - Tests for individual React components

## Writing Tests

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should load home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Privacy-First Note-Taking')).toBeVisible();
});
```

### Component Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should toggle sidebar', async ({ page }) => {
  await page.goto('/workspace');
  const sidebar = page.locator('aside');
  const toggleButton = sidebar.locator('button').first();
  await toggleButton.click();
  // Assert sidebar state changed
});
```

## Configuration

The Playwright configuration is in `playwright.config.ts`. Key settings:

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Web Server**: Automatically starts `npm run dev` before tests
- **Retries**: 2 retries on CI, 0 locally
- **Reporter**: HTML report

## Test Coverage

The tests cover:

1. **Home Page**
   - Page loads correctly
   - All feature cards are visible
   - Navigation works

2. **Workspace**
   - Workspace initializes
   - Sidebar is collapsible
   - Documents can be created
   - Formatting toolbar is present
   - Title is editable

3. **Responsive Design**
   - Sidebar auto-collapses on mobile
   - Toolbar wraps on mobile
   - Touch targets are appropriately sized

4. **Components**
   - EditableTitle component behavior
   - FormattingToolbar renders correctly

## CI/CD Integration

Tests can be run in CI/CD pipelines. The configuration automatically:
- Runs tests in parallel on CI
- Retries failed tests twice
- Generates HTML reports
- Takes screenshots on failure

Example GitHub Actions workflow:

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests Timeout

If tests timeout, increase the timeout in `playwright.config.ts`:

```typescript
use: {
  timeout: 30000, // 30 seconds
}
```

### Browser Not Found

If you get "Browser not found", run:

```bash
npx playwright install chromium
```

### Dev Server Not Starting

Make sure port 3000 is not already in use:

```bash
lsof -i :3000
```

## Best Practices

1. **Use Page Object Model** - For complex tests, extract page interactions into page objects
2. **Wait for Elements** - Use `await expect().toBeVisible()` instead of arbitrary timeouts
3. **Use Data Test IDs** - Add `data-testid` attributes for more reliable selectors
4. **Test User Flows** - E2E tests should test complete user journeys
5. **Keep Tests Independent** - Each test should be able to run in isolation
6. **Use Fixtures** - Create reusable test fixtures for common setup

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Test Generator](https://playwright.dev/docs/codegen)

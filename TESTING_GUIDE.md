# Testing Guide for Recent Changes

This document describes the comprehensive test suite added for the recent feature updates in the 4diary application.

## Overview

Six new test files have been added to thoroughly test the changes in the current branch compared to `main`. These tests cover all modified files and ensure robust functionality across different scenarios.

## Test Files

### 1. Share Page Tests (`tests/unit/share-page.spec.ts`)

**File Under Test:** `app/share/[id]/page.tsx`

**Test Coverage (62 tests):**
- **Loading States:** Tests loading indicators, glass card styling during data fetch
- **Error Handling:** 404 errors, expired shares (410), server errors (500), network failures
- **Success States:** Document display, metadata rendering, read-only badges
- **URL Handling:** Share ID extraction, URL encoding of special characters
- **Date Formatting:** Creation and expiry date display using `toLocaleDateString()`
- **Responsive Design:** Mobile, tablet viewports
- **Edge Cases:** Null data, malformed JSON, long titles, special characters/XSS prevention

**Key Scenarios:**
```typescript
// Example: Testing expired share handling
test('should display expired error when share has expired (410)', async ({ page }) => {
  // Mocks 410 response and verifies error display
});

// Example: Testing content rendering
test('should render content in BlockEditor', async ({ page }) => {
  // Verifies BlockEditor renders with provided content
});
```

### 2. BlockEditor Enhanced Tests (`tests/unit/block-editor-enhanced.spec.ts`)

**File Under Test:** `components/editor/BlockEditor.tsx`

**Test Coverage (35 tests):**
- **Auto-Save Optimization:** Change detection, hasChanges flag, save only when modified
- **Touch Improvements:** touch-auto and touch-manipulation classes, webkit tap highlight
- **Save Status:** "Saving..." indicator, timestamp display, status positioning
- **Props Configuration:** editable, showToolbar, autoSave props
- **Error Handling:** Save failure gracefully, console error logging
- **Change Detection:** Rapid changes, formatting application, content deletion

**Key Features Tested:**
- Stringified content comparison to avoid unnecessary saves
- lastContent tracking to detect actual changes
- Touch-friendly mobile interactions
- Save indicator with glass-card styling

### 3. TopMenu Authentication Tests (`tests/unit/top-menu-auth.spec.ts`)

**File Under Test:** `components/ui/TopMenu.tsx`

**Test Coverage (38 tests):**
- **Auth State Detection:** Session API calls on mount, authenticated/unauthenticated states
- **Logout Functionality:** POST to logout API, state clearing, /auth redirect
- **User Display:** Email extraction (username before @), styling, layout
- **Login Button:** Link to /auth, LeatherButton usage
- **Error Handling:** Network failures, server errors, graceful degradation
- **State Persistence:** Auth state across menu interactions

**Authentication Flow Tested:**
```typescript
// Unauthenticated: Shows "Log in" button
// Authenticated: Shows username + "Logout" button
// After logout: Redirects to /auth
```

### 4. FormattingToolbar Touch Tests (`tests/unit/formatting-toolbar-touch.spec.ts`)

**File Under Test:** `components/editor/FormattingToolbar.tsx`

**Test Coverage (43 tests):**
- **Touch Manipulation:** touch-manipulation class, sticky positioning
- **Button Handlers:** type="button", onTouchStart events, active states
- **Text Formatting:** Bold, Italic, Underline, Strikethrough buttons
- **Block Formatting:** Heading 1/2/3, Bullet/Numbered lists
- **Visual Separator:** Border between text and block sections
- **Accessibility:** Title attributes, keyboard access, button roles
- **Responsive Design:** Mobile portrait/landscape, tablet, desktop

**Touch Enhancements:**
- `onTouchStart` handlers to prevent delays
- `active:bg-leather-700` for visual feedback
- Proper touch target sizing (44px minimum)

### 5. Mobile Improvements Tests (`tests/unit/mobile-improvements.spec.ts`)

**File Under Test:** `app/globals.css`, workspace layout changes

**Test Coverage (36 tests):**
- **Touch Improvements:** webkit-tap-highlight transparent, touch-action manipulation
- **Button Sizing:** 44px minimum height/width on mobile (coarse pointer)
- **Media Queries:** Hover capability detection, pointer type detection
- **Sidebar Overlay:** Fixed positioning, backdrop blur, semi-transparent background
- **Workspace Layout:** Main content independence, no margin adjustment, z-index layering
- **Responsive Behavior:** Mobile portrait/landscape, tablet viewports

**CSS Features Tested:**
```css
/* Global touch improvements */
body {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* Mobile button sizing */
@media (hover: none) and (pointer: coarse) {
  button, a, [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### 6. Sidebar Overlay Tests (`tests/unit/sidebar-overlay.spec.ts`)

**File Under Test:** `components/ui/Sidebar.tsx`, workspace layout

**Test Coverage (35 tests):**
- **Overlay Architecture:** Fixed positioning (not flex), full viewport height
- **Visual Effects:** Backdrop blur, 80% opacity background, shadow-2xl
- **Z-Index Management:** z-1000 when expanded, z-10 when collapsed
- **Main Content:** No margin adjustment, z-0, full width regardless of sidebar
- **Toggle Behavior:** Width transitions (64px ↔ 256px), z-index changes
- **User Interaction:** Click-through when collapsed, overlay when expanded
- **Accessibility:** Keyboard access, aria-labels, screen reader announcements

**Architecture Change:**
```typescript
// Before: Sidebar in flex container, main content adjusts margin
// After: Sidebar fixed overlay, main content independent
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### With Browser Visible
```bash
npm run test:headed
```

### Debug Mode
```bash
npm run test:debug
```

### Specific Test File
```bash
npx playwright test tests/unit/share-page.spec.ts
```

### With UI Mode
```bash
npm run test:ui
```

## Test Patterns and Best Practices

### API Mocking
Tests use Playwright's route mocking for consistent, reliable API responses:

```typescript
await page.route('**/api/share?id=test', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ /* mock data */ }),
  });
});
```

### Viewport Testing
Tests cover multiple device sizes:

```typescript
// Mobile Portrait
await page.setViewportSize({ width: 375, height: 667 });

// Mobile Landscape
await page.setViewportSize({ width: 667, height: 375 });

// Tablet
await page.setViewportSize({ width: 768, height: 1024 });

// Desktop
await page.setViewportSize({ width: 1920, height: 1080 });
```

### Wait Strategies
Tests use appropriate wait strategies:

```typescript
await page.waitForLoadState('networkidle'); // After navigation
await page.waitForTimeout(500); // After animations
await page.waitForRequest('**/api/**'); // For API calls
```

### Error Handling
Tests verify graceful error handling:

```typescript
// Console error capture
const consoleErrors: string[] = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text());
  }
});

// Verify errors are logged
expect(consoleErrors.some(err => err.includes('expected error'))).toBeTruthy();
```

## Coverage Summary

### Total Test Statistics
- **Total Test Files:** 6 new files
- **Total Test Cases:** 249 new tests
- **Total Lines of Test Code:** ~6,500 lines
- **Files Under Test:** 7 (including CSS changes)

### Coverage by Category
- **Component Tests:** 151 tests (61%)
- **Layout/CSS Tests:** 71 tests (29%)
- **Integration Tests:** 27 tests (10%)

### Test Distribution
- Loading/Success States: 45 tests
- Error Handling: 38 tests
- Responsive/Mobile: 52 tests
- Touch Interactions: 31 tests
- Authentication: 38 tests
- Layout/Positioning: 45 tests

## CI/CD Integration

These tests are designed to run in CI environments:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm test
  env:
    CI: true
```

### Browser Coverage
Tests run against multiple browsers via Playwright:
- Chromium
- Firefox
- WebKit (Safari)
- Mobile Chrome
- Mobile Safari

## Maintenance Notes

### When to Update Tests

1. **API Changes:** Update mocked responses in API route handlers
2. **UI Changes:** Update selectors and expected text content
3. **New Features:** Add new test describes for new functionality
4. **Styling Changes:** Update class name selectors if CSS classes change

### Common Issues

1. **Timing Issues:** Increase wait times if tests are flaky
2. **Selector Changes:** Use more stable selectors (roles, labels) over CSS classes
3. **API Mocks:** Ensure mock data structure matches actual API responses

## Best Practices Followed

✅ **Descriptive Test Names:** Each test clearly states what it tests  
✅ **Arrange-Act-Assert:** Tests follow AAA pattern  
✅ **Isolated Tests:** Each test is independent and can run in any order  
✅ **Comprehensive Coverage:** Happy paths, edge cases, and error scenarios  
✅ **Responsive Testing:** Multiple viewport sizes tested  
✅ **Accessibility:** Keyboard navigation and ARIA attributes tested  
✅ **Error Handling:** Network failures and malformed data tested  
✅ **Real-World Scenarios:** Tests simulate actual user interactions  

## Future Enhancements

Potential areas for additional test coverage:
- Visual regression testing with screenshots
- Performance testing (load times, animation smoothness)
- Internationalization testing (different locales for date formatting)
- Advanced accessibility testing (screen reader compatibility)
- Cross-browser compatibility edge cases

## Contributing

When adding new features or modifying existing ones:

1. Add corresponding tests to the appropriate test file
2. Follow existing test patterns and naming conventions
3. Ensure tests pass locally before committing
4. Aim for comprehensive coverage (happy path + edge cases)
5. Document any new test patterns or utilities

---

**Last Updated:** $(date +%Y-%m-%d)  
**Test Framework:** Playwright v1.56.1  
**Coverage:** 249 new test cases across 6 files
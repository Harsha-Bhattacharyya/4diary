# Editor Font Selection Tests

## Overview
This document describes the unit tests for the editor font selection feature.

## Test Files

### note-settings.spec.ts
Tests the NoteSettings component's font selection UI and user interactions.

**Test Suite**: "Note Settings - Editor Font Selection"
- 14 comprehensive tests
- Covers UI, persistence, integration, and edge cases

### block-editor-enhanced.spec.ts
Tests the BlockEditor component's font application and rendering.

**Test Suites**:
1. "BlockEditor - Font Styling" (11 tests)
2. "BlockEditor - Font CSS Inheritance" (3 tests)

## Running Tests

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npx playwright test tests/unit/note-settings.spec.ts
npx playwright test tests/unit/block-editor-enhanced.spec.ts

# Run with UI
npm run test:ui

# Debug mode
npm run test:debug
```

## Test Coverage

- ✅ Font selection UI components
- ✅ Font button interactions
- ✅ localStorage persistence
- ✅ CSS class application
- ✅ Editor integration
- ✅ Feature combinations (line numbers, edit/read mode)
- ✅ Edge cases and error handling

## Key Test Scenarios

1. **Default State**: Verifies Normal font is selected by default
2. **Font Switching**: Tests changing between Normal, Serif, and Condensed
3. **Persistence**: Validates localStorage save/restore
4. **Application**: Confirms CSS classes apply to editor
5. **Integration**: Tests with line numbers and other features
6. **Edge Cases**: Invalid localStorage values, missing callbacks

## Mocked APIs

All tests mock these endpoints:
- `**/api/auth/session` - Authentication
- `**/api/workspaces` - Workspace data
- `**/api/documents**` - Document operations

## Expected Results

All 28 tests should pass with 100% success rate.

## Troubleshooting

If tests fail:
1. Ensure dev server is running (`npm run dev`)
2. Check for port conflicts (default: 3000)
3. Verify Playwright is installed (`npx playwright install`)
4. Check browser compatibility

## Documentation

See `TEST_COVERAGE_FONT_FEATURE.md` for detailed test documentation.
See `UNIT_TEST_GENERATION_SUMMARY.md` for executive summary.
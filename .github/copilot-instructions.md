# GitHub Copilot Instructions for 4diary

## Project Overview

4diary is a privacy-focused, end-to-end encrypted note-taking application built with Next.js 16. It features military-grade encryption, zero-knowledge architecture, and a Notion-like editing experience with a leather-themed UI.

### Core Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB
- **Cache/Session Storage**: Redis (optional)
- **Editor**: BlockNote
- **Testing**: Playwright
- **Encryption**: Web Crypto API (AES-256-GCM)

## Architecture Principles

### Security & Privacy First

- **Zero-Knowledge Architecture**: Server never sees unencrypted content
- **Client-Side Only Encryption**: All encryption/decryption happens in the browser
- **End-to-End Encryption**: AES-256-GCM using Web Crypto API
- **Master Keys**: Generated in browser, stored in IndexedDB, never leave the client
- **Document Keys**: Each document has its own encryption key
- **Metadata**: Only searchable metadata (title, tags, folder) is stored unencrypted

### File Organization

```
├── app/                    # Next.js App Router pages & API routes
│   ├── api/               # API endpoints (Next.js Route Handlers)
│   ├── workspace/         # Workspace pages and layouts
│   ├── auth/              # Authentication pages
│   └── share/             # Public share pages
├── components/            # React components
│   ├── editor/           # Editor-related components
│   ├── ui/               # Reusable UI components
│   └── kanban/           # Kanban board components
├── lib/                   # Utility libraries and services
│   ├── crypto/           # Encryption/decryption utilities
│   ├── mongodb.ts        # MongoDB connection
│   └── redis.ts          # Redis connection
├── tests/                 # Test files
│   ├── e2e/              # End-to-end tests
│   └── unit/             # Unit tests
└── public/               # Static assets
```

## Coding Standards

### TypeScript

- **Strict Mode**: Currently `strict: false` in tsconfig.json for rapid alpha development
  - Note: Consider enabling strict mode post-alpha for better type safety
  - When writing new code, follow strict typing practices even though strict mode is off
- **Target**: ES2020
- **Module Resolution**: bundler
- **Path Aliases**: Use `@/*` for root-level imports
- **Type Annotations**: Always prefer explicit types for function parameters and return values
- **Interfaces**: Use interfaces for component props and data structures
- **Avoid `any`**: Use specific types or `unknown` instead of `any` when possible

### React Components

- **Always use "use client" directive** for client components
- **Functional Components**: Use functional components with hooks
- **Props Interface**: Define props with TypeScript interfaces
- **JSDoc Comments**: Add JSDoc for complex components and functions
- **Default Exports**: Use default exports for page components
- **Named Exports**: Use named exports for utility functions

Example component structure:
```typescript
"use client";

import React from "react";

interface MyComponentProps {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Brief description of what the component does.
 * 
 * @param title - Description of title prop
 * @param onClick - Description of onClick prop
 * @param disabled - Description of disabled prop
 */
export default function MyComponent({
  title,
  onClick,
  disabled = false,
}: MyComponentProps) {
  // Component implementation
  return (
    <div>
      {title}
    </div>
  );
}
```

### Styling

- **Tailwind CSS v4**: Use Tailwind utility classes
- **Custom Theme**: Leather color palette (leather-50 through leather-900)
- **Glass Card Pattern**: Use `glass-card` class for frosted glass effect
- **Leather Button**: Use `leather-button` class for primary actions
- **Custom Gradients**: `gradient-leather` and `gradient-parchment` available
- **Shadows**: `shadow-leather` and `shadow-deep` for depth
- **Touch Targets**: Minimum 44px height/width on mobile devices
- **Touch Optimization**: Use `touch-manipulation` class for better mobile UX

### API Routes (Next.js Route Handlers)

- **File-based Routing**: Use Next.js 16 Route Handlers in `app/api/`
- **HTTP Methods**: Export functions named after HTTP methods (GET, POST, PUT, DELETE)
- **Response Format**: Return NextResponse with proper status codes
- **Error Handling**: Always wrap in try-catch with proper error responses
- **Authentication**: Check session for protected routes
- **Rate Limiting**: Implement where appropriate (especially for shares)

Example API route:
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Implementation
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Security Guidelines

### Encryption

- **Never** decrypt content on the server
- **Always** use Web Crypto API for cryptographic operations
- **Generate** random IVs for each encryption operation
- **Store** encrypted content as base64 strings
- **Validate** encryption keys exist before operations
- **Handle** decryption failures gracefully

### Input Validation

- **Sanitize** all user input before storage
- **Validate** data types and formats
- **Use** sanitize-html for rich text content
- **Escape** special characters in metadata
- **Limit** input lengths to prevent DoS

### Authentication

- **Session Cookies**: Use HTTP-only, secure cookies
- **Session Validation**: Always validate session on protected routes
- **Logout**: Clear session and redirect to /auth
- **Never** expose passwords or encryption keys in responses

### Dependencies

- **Check for vulnerabilities** before adding new dependencies:
  - Run `npm audit` before adding packages
  - Review dependency security advisories
  - Prefer well-maintained, popular packages
- **Keep dependencies updated** with Dependabot

## Testing Requirements

### Testing Stack

- **Framework**: Playwright (v1.56.1)
- **Test Types**: Unit tests and E2E tests
- **Test Location**: `tests/unit/` and `tests/e2e/`
- **Commands**:
  - `npm test` - Run all tests
  - `npm run test:unit` - Run unit tests only
  - `npm run test:e2e` - Run E2E tests only
  - `npm run test:ui` - Run with Playwright UI
  - `npm run test:debug` - Run in debug mode

### Testing Best Practices

- **Descriptive Test Names**: Clearly state what is being tested
- **AAA Pattern**: Arrange, Act, Assert
- **Isolated Tests**: Each test should be independent
- **Mock API Calls**: Use Playwright's route mocking
- **Test Multiple Viewports**: Mobile (375x667), tablet (768x1024), desktop (1920x1080)
- **Wait Strategies**: Use appropriate waits (networkidle, timeout, etc.)
- **Error Scenarios**: Test both success and failure cases
- **Accessibility**: Test keyboard navigation and ARIA attributes

### Test Coverage Requirements

When modifying code, ensure tests cover:
- Happy path scenarios
- Error handling
- Edge cases (empty data, null values, long strings)
- Responsive behavior
- Security considerations (XSS prevention, input validation)

Example test structure:
```typescript
import { test, expect } from "@playwright/test";

test.describe("Component Name", () => {
  test("should handle basic functionality", async ({ page }) => {
    // Arrange
    await page.goto("/test-page");
    
    // Act
    await page.click("button");
    
    // Assert
    await expect(page.locator(".result")).toHaveText("Expected");
  });

  test("should handle error case", async ({ page }) => {
    // Test error handling
  });
});
```

## Component Patterns

### Editor Components

- **BlockEditor**: Main rich text editor using BlockNote
  - Props: `initialContent`, `onChange`, `editable`, `showToolbar`, `autoSave`
  - Auto-save with change detection (compares stringified content)
  - Touch-optimized with `touch-manipulation` class
  - Displays save status with timestamp

- **FormattingToolbar**: Text and block formatting controls
  - Sticky positioning for accessibility
  - Touch handlers with `onTouchStart` for responsiveness
  - Active state feedback with `active:bg-leather-700`

### UI Components

- **GlassCard**: Frosted glass effect container
  - Use for modals, overlays, and elevated content
  - Includes backdrop-blur and semi-transparent background

- **LeatherButton**: Themed button component
  - Variants: `gradient`, `leather`, `parchment`
  - Sizes: `sm`, `md`, `lg`
  - Props: `onClick`, `disabled`, `type`, `className`

- **Sidebar**: Navigation sidebar
  - Fixed overlay positioning (not flex-based)
  - Width transitions between collapsed (64px) and expanded (256px)
  - Z-index management: z-1000 when expanded, z-10 when collapsed
  - Backdrop blur and shadow-2xl when expanded

- **TopMenu**: Top navigation bar
  - Auth state detection on mount
  - Shows user email (username before @) when authenticated
  - Logout button that clears session and redirects

### Kanban Components

- **Board**: Drag-and-drop task board
  - Fully encrypted board data
  - Column-based organization
  - Card state management

## Database Patterns

### MongoDB Collections

- **workspaces**: User workspaces with encrypted master keys
- **documents**: Encrypted documents with metadata
  - Types: `doc` (document), `board` (kanban), `quick` (quick note)
  - Metadata stored unencrypted for search: title, tags, folder
  - Content stored encrypted as base64 string
- **templates**: Document templates
- **analytics_events**: Privacy-respecting usage analytics

### Redis Usage

- **Share Tokens**: Ephemeral share tokens with TTL
  - Default expiry: 24 hours
  - Keys format: `share:${token}`
  - Automatic cleanup via TTL

## Responsive Design

### Breakpoints

Use Tailwind's default breakpoints:
- `sm`: 640px (mobile landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)

### Mobile-First Approach

- Design for mobile first, enhance for larger screens
- Touch targets minimum 44x44px on mobile
- Use `touch-manipulation` for better responsiveness
- Disable webkit tap highlight: `-webkit-tap-highlight-color: transparent`
- Test on multiple viewports during development

### Sidebar Behavior

- Mobile: Overlay with backdrop blur
- Desktop: Always visible, can collapse to icon-only mode

## Performance

- **Auto-save**: Debounce changes, only save when content actually changes
- **Lazy Loading**: Use dynamic imports for heavy components
- **Code Splitting**: Leverage Next.js automatic code splitting
- **Image Optimization**: Use Next.js Image component
- **Caching**: Utilize Redis for frequently accessed data

## Accessibility

- **Keyboard Navigation**: Support Tab, Enter, Escape keys
- **ARIA Labels**: Add appropriate ARIA attributes
- **Focus Management**: Ensure visible focus indicators
- **Screen Readers**: Test with screen reader announcements
- **Color Contrast**: Maintain WCAG AA standards

## Git Commit Messages

Follow conventional commit format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example: `feat: add ephemeral share links with TTL`

## Development Workflow

1. **Install dependencies**: `npm install`
2. **Setup environment**: Copy `.env.example` to `.env.local`
3. **Start dev server**: `npm run dev`
4. **Run linter**: `npm run lint`
5. **Run tests**: `npm test`
6. **Build for production**: `npm run build`

## Common Pitfalls to Avoid

1. **Don't** decrypt content on the server - always client-side
2. **Don't** store unencrypted sensitive data
3. **Don't** use inline styles - use Tailwind classes
4. **Don't** forget "use client" directive for client components
5. **Don't** commit `.env.local` or secrets
6. **Don't** skip error handling in API routes
7. **Don't** forget to test on mobile viewports
8. **Don't** add dependencies without security checks
9. **Don't** remove or modify tests without good reason
10. **Don't** use force push - history rewriting not allowed

## Feature-Specific Guidelines

### Quick Note Feature

- Keyboard shortcut: Ctrl/Cmd + Q
- Local storage until saved to workspace
- Auto-save locally before sync
- Clear after successful save

### Quick Read (Reader Mode)

- Distraction-free reading view
- Adjustable font size (A-/A+ buttons)
- Exit with ESC or close button
- Maintains document scroll position

### Share Links

- Ephemeral with automatic expiry
- Permissions: view or edit
- Revocable anytime
- Content remains encrypted end-to-end
- Rate limiting: 10 shares per 15 minutes

### Export Feature

- Markdown format for documents
- ZIP file for full workspace
- Maintains folder structure
- Decrypts content during export (client-side)

## Documentation Standards

- **README.md**: Keep updated with features and setup
- **CONTRIBUTING.md**: Guidelines for contributors
- **SECURITY.md**: Security policy and vulnerability reporting
- **TESTING_GUIDE.md**: Comprehensive testing documentation
- **Code Comments**: JSDoc for complex functions
- **Inline Comments**: Only when logic is non-obvious

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Playwright Testing](https://playwright.dev/)
- [MongoDB Node Driver](https://www.mongodb.com/docs/drivers/node/)
- [BlockNote Editor](https://www.blocknotejs.org/)

## Support & Contribution

- Report bugs via GitHub Issues
- Security vulnerabilities: Follow SECURITY.md process
- Pull requests: Follow CONTRIBUTING.md guidelines
- Questions: Use GitHub Discussions

---

**Remember**: Privacy and security are paramount. When in doubt, err on the side of caution and ask for review.

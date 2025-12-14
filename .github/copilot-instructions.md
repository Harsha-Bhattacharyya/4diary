# GitHub Copilot Instructions for 4diary

## Project Overview

4diary is a privacy-focused, end-to-end encrypted note-taking application built with Next.js 16. It features military-grade encryption, zero-knowledge architecture, and a Notion-like editing experience with a leather-themed UI.

### Core Technology Stack

- **Framework**: Next.js 16.0.10 (App Router)
- **Language**: TypeScript 5.9.3
- **Runtime**: Node.js 20+ (25-alpine in Docker)
- **UI Library**: React 19.2.1
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB 7.0.0
- **Cache/Session Storage**: Redis (ioredis 5.8.2, optional)
- **Editor**: BlockNote 0.42.3
- **Testing**: Playwright 1.57.0
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Animation**: Framer Motion 12.23.24
- **Monitoring**: Sentry 10.27.0, Vercel Analytics 1.6.1, Vercel Speed Insights 1.2.0
- **Drag & Drop**: @hello-pangea/dnd 18.0.1
- **Kanban**: @caldwell619/react-kanban 0.0.12
- **PWA**: Custom service worker with offline support

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
│   │   ├── auth/         # Authentication routes (login, signup, logout, session)
│   │   ├── documents/    # Document CRUD operations
│   │   ├── workspaces/   # Workspace management
│   │   ├── shares/       # Share token management
│   │   ├── templates/    # Template operations
│   │   ├── backlinks/    # Backlink indexing and retrieval
│   │   ├── embed/        # URL embed preview generation
│   │   ├── analytics/    # Privacy-respecting analytics events
│   │   └── docs/         # Document content and metadata
│   ├── workspace/         # Workspace pages and layouts
│   ├── auth/              # Authentication pages
│   ├── share/             # Public share pages
│   ├── settings/          # Settings page
│   ├── templates/         # Templates page
│   ├── docs/              # Documentation pages
│   └── about/             # About page
├── components/            # React components
│   ├── editor/           # Editor-related components
│   ├── ui/               # Reusable UI components
│   └── kanban/           # Kanban board components
├── lib/                   # Utility libraries and services
│   ├── crypto/           # Encryption/decryption utilities
│   ├── vim/              # Vim mode implementation
│   ├── mongodb.ts        # MongoDB connection
│   ├── redis.ts          # Redis connection
│   ├── crypto-utils.ts   # Crypto helper functions
│   ├── documentService.ts # Document operations
│   ├── workspaceService.ts # Workspace operations
│   ├── backlinkService.ts # Backlink indexing
│   ├── versionService.ts  # Version history management
│   ├── templateService.ts # Template operations
│   ├── exportService.ts   # Export functionality
│   ├── import.ts          # Import from various formats
│   ├── export.ts          # Export utilities
│   ├── pwaService.ts      # PWA and service worker
│   ├── summarizer.ts      # Content summarization
│   ├── logger.ts          # Structured logging
│   ├── analytics.ts       # Analytics tracking
│   └── inMemoryStorage.ts # In-memory caching
├── docs/                  # Documentation
│   ├── getting-started/  # Setup guides
│   ├── guides/           # Feature guides (import, etc.)
│   ├── advanced/         # Advanced topics
│   └── architecture/     # Architecture documentation
├── tests/                 # Test files
│   ├── e2e/              # End-to-end tests
│   └── unit/             # Unit tests
├── public/                # Static assets
│   ├── manifest.json     # PWA manifest
│   └── sw.js             # Service worker
├── instrumentation.ts     # Sentry instrumentation
├── instrumentation-client.ts # Client-side instrumentation
├── sentry.server.config.ts # Sentry server config
└── sentry.edge.config.ts  # Sentry edge config
```

## Coding Standards

### TypeScript

- **Strict Mode**: Currently `strict: false` in tsconfig.json for rapid alpha development
  - Note: Consider enabling strict mode post-alpha for better type safety
  - When writing new code, follow strict typing practices even though strict mode is off
- **Target**: ES2020
- **Module Resolution**: bundler
- **JSX**: react-jsx (automatic JSX runtime)
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
- **Authentication**: Check session for protected routes using jose library
- **Rate Limiting**: Implement where appropriate (especially for shares)
- **Available Routes**:
  - `/api/auth/*` - Authentication (login, signup, logout, session)
  - `/api/documents` - Document CRUD operations
  - `/api/documents/[id]` - Single document operations
  - `/api/workspaces` - Workspace management
  - `/api/shares` - Share token creation and management
  - `/api/share` - Public share access
  - `/api/templates` - Template operations
  - `/api/backlinks` - Backlink indexing and retrieval
  - `/api/embed` - URL embed preview generation
  - `/api/analytics` - Privacy-respecting analytics events
  - `/api/docs` - Document metadata operations
  - `/api/docs/content` - Document content operations

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

## Service Layer Architecture

### Core Services

The application uses a service layer pattern to separate business logic from API routes:

- **documentService.ts**: Document CRUD operations, encryption/decryption coordination
- **workspaceService.ts**: Workspace management, user workspace operations
- **backlinkService.ts**: Backlink indexing, bidirectional link tracking, wiki-link parsing
- **versionService.ts**: Version history management, version storage and retrieval
- **templateService.ts**: Template operations, pre-built document templates
- **exportService.ts**: Export coordination, workspace export as ZIP
- **pwaService.ts**: PWA functionality, service worker registration, offline sync
- **import.ts**: Multi-format import (Markdown, Google Keep, Evernote, Notion, etc.)
- **export.ts**: Export utilities, format conversion, decryption for export
- **crypto-utils.ts**: Encryption helper functions, key generation, IV handling
- **summarizer.ts**: Content summarization using node-summarizer
- **logger.ts**: Structured logging, request tracking, error logging
- **analytics.ts**: Privacy-respecting analytics, event tracking
- **inMemoryStorage.ts**: In-memory caching layer for hot data

### Service Patterns

- **Separation of Concerns**: Services handle business logic, routes handle HTTP
- **Reusability**: Services can be called from multiple routes or other services
- **Error Handling**: Services throw errors, routes catch and format responses
- **Type Safety**: All services use TypeScript interfaces for parameters and returns
- **Async/Await**: All service methods are async for consistency
- **Transaction Support**: MongoDB transactions where needed for data consistency

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

- **Session Management**: JWT tokens using jose library
- **Session Cookies**: HTTP-only, secure cookies
- **Session Validation**: Always validate session on protected routes
- **Password Hashing**: bcrypt 6.0.0 for password storage
- **Logout**: Clear session and redirect to /auth
- **Never** expose passwords or encryption keys in responses
- **PBKDF2**: Key derivation with 100,000 iterations for key strengthening

### Dependencies

- **Check for vulnerabilities** before adding new dependencies:
  - Run `npm audit` before adding packages
  - Review dependency security advisories
  - Prefer well-maintained, popular packages
- **Keep dependencies updated** with Dependabot
- **Key Security Libraries**:
  - `bcrypt` - Password hashing
  - `jose` - JWT tokens
  - `sanitize-html` - HTML sanitization for embed previews
  - `@sentry/nextjs` - Error tracking and security monitoring
  - Native Web Crypto API - Client-side encryption

## Testing Requirements

### Testing Stack

- **Framework**: Playwright (v1.57.0)
- **Test Types**: Unit tests and E2E tests
- **Test Location**: `tests/unit/` and `tests/e2e/`
- **Commands**:
  - `npm test` - Run all tests
  - `npm run test:unit` - Run unit tests only
  - `npm run test:e2e` - Run E2E tests only
  - `npm run test:ui` - Run with Playwright UI
  - `npm run test:headed` - Run with visible browser
  - `npm run test:debug` - Run in debug mode
  - `npm run test:report` - Show test report

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

- **Board**: Drag-and-drop task board using @caldwell619/react-kanban
  - Fully encrypted board data
  - Column-based organization
  - Card state management
  - Drag and drop powered by @hello-pangea/dnd

## Database Patterns

### MongoDB Collections

- **workspaces**: User workspaces with encrypted master keys
- **documents**: Encrypted documents with metadata
  - Types: `doc` (document), `board` (kanban), `quick` (quick note)
  - Metadata stored unencrypted for search: title, tags, folder
  - Content stored encrypted as base64 string
  - Supports version history (last 50 versions per document)
  - Backlinks tracked for bidirectional linking
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

## Monitoring & Observability

### Sentry Integration

- **Error Tracking**: Automatic error capture and reporting
- **Performance Monitoring**: Track slow transactions and operations
- **Configuration Files**:
  - `sentry.server.config.ts` - Server-side config
  - `sentry.edge.config.ts` - Edge runtime config
  - `instrumentation.ts` - Runtime-specific loading
  - `instrumentation-client.ts` - Client-side instrumentation
- **Tunnel Route**: `/monitoring` to bypass ad-blockers
- **Source Maps**: Uploaded in CI for readable stack traces
- **Logger Disabled**: Tree-shaken in production builds
- **Vercel Cron Monitors**: Automatic instrumentation enabled

### Vercel Analytics

- **Web Analytics**: Track page views and user behavior
- **Speed Insights**: Real user monitoring (RUM) for performance
- **Privacy-Respecting**: GDPR compliant, no personal data collection
- **Packages**: `@vercel/analytics` and `@vercel/speed-insights`

### Custom Logging

- **Structured Logging**: Implemented in `lib/logger.ts`
- **Log Levels**: Debug, info, warn, error
- **Context Tracking**: Request IDs, user IDs, timestamps
- **Privacy-Safe**: Never log sensitive data or encryption keys

### Custom Analytics

- **Privacy-First**: Implemented in `lib/analytics.ts`
- **Anonymous Events**: No PII tracking
- **Usage Patterns**: Feature usage, error rates
- **MongoDB Storage**: `analytics_events` collection

## Performance

- **Auto-save**: Debounce changes, only save when content actually changes
- **Lazy Loading**: Use dynamic imports for heavy components
- **Code Splitting**: Leverage Next.js automatic code splitting
- **Image Optimization**: Use Next.js Image component
- **Caching**: Utilize Redis for frequently accessed data
- **In-Memory Cache**: `lib/inMemoryStorage.ts` for hot data
- **Service Worker**: Offline caching and background sync
- **Standalone Output**: Optimized Docker builds with Next.js standalone mode

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

### Prerequisites

- **Node.js**: 20+ (25-alpine recommended for Docker)
- **MongoDB**: 7.0.0+ (local or MongoDB Atlas)
- **Redis**: Optional but recommended for share tokens
- **npm**: Package manager

### Setup Steps

1. **Install dependencies**: `npm install`
2. **Setup environment**: Copy `.env.example` to `.env.local`
   - Required: `MONGODB_URI`
   - Optional: `REDIS_URL`, `NEXT_PUBLIC_BASE_URL`
   - Sentry: `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`
3. **Start dev server**: `npm run dev`
4. **Run linter**: `npm run lint` (ESLint 9 with Next.js config)
5. **Run tests**: `npm test` (Playwright)
6. **Build for production**: `npm run build`
7. **Start production**: `npm start`

### Docker Workflow

1. **Build image**: `docker build -t 4diary .`
2. **Run with compose**: `docker-compose up -d`
3. **With debug UI**: `docker-compose --profile debug up -d`
4. **Stop services**: `docker-compose down`

## Next.js Configuration

### next.config.ts

- **Output Mode**: `standalone` for optimized Docker builds
- **Server Actions**: Body size limit set to 5MB for file uploads
- **Sentry Integration**: Wrapped with `withSentryConfig`
- **Source Maps**: Uploaded to Sentry in CI
- **Tunnel Route**: `/monitoring` for Sentry to bypass ad-blockers
- **Automatic Instrumentation**: Vercel Cron Monitors enabled

### Instrumentation

- **Server Runtime**: `instrumentation.ts` loads runtime-specific Sentry config
- **Client Runtime**: `instrumentation-client.ts` for browser-side monitoring
- **Dynamic Loading**: Runtime detection (nodejs vs edge) for proper config
- **Error Boundaries**: Automatic error capture and reporting

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
11. **Don't** log sensitive data (passwords, encryption keys, tokens)
12. **Don't** expose MongoDB/Redis credentials in error messages
13. **Don't** skip input validation on API routes
14. **Don't** forget copyright headers (BSD-3-Clause) on new files

## Feature-Specific Guidelines

### Quick Note Feature

- Keyboard shortcut: Ctrl/Cmd + Q
- Local storage until saved to workspace
- Auto-save locally before sync
- Clear after successful save
- Accessible from any page

### Quick Read (Reader Mode)

- Distraction-free reading view
- Adjustable font size (A-/A+ buttons)
- Exit with ESC or close button
- Maintains document scroll position

### Vim Mode

- Keyboard shortcut: Ctrl+Shift+V to toggle
- Full Vim keybindings support in editor
- Four modes: NORMAL, INSERT, REPLACE, COMMAND
- Navigation with hjkl keys
- Commands: `:wq`, `:q`, `:x` to exit
- Implemented in `lib/vim/` directory
- Hooks: `useVimMode` for React integration
- Visual feedback for current mode

### Backlinks (Bidirectional Linking)

- Wiki-style syntax: `[[Document Title]]`
- Automatic link detection and indexing
- Backlinks sidebar shows documents linking to current page
- Real-time updates via `backlinkService.ts`
- Encrypted content remains secure
- Navigate between linked documents

### Version History

- Automatic versioning on document save
- Keeps last 50 versions per document
- View and restore previous versions
- Managed by `versionService.ts`
- Version metadata includes timestamp and content hash
- Client-side decryption of historical versions

### Calendar View

- Organize documents by date
- Monthly calendar navigation
- Visual indicators for days with documents
- Toggle between list and calendar views
- Date-based filtering and organization

### Share Links

- Ephemeral with automatic expiry
- Permissions: view or edit
- Revocable anytime
- Content remains encrypted end-to-end
- Rate limiting: 10 shares per 15 minutes
- Default TTL: 24 hours
- Stored in Redis with automatic cleanup

### Import Feature

- Support for multiple formats:
  - Markdown (.md files)
  - Google Keep (Takeout export)
  - Evernote (.enex files)
  - Notion (exported workspace)
  - Standard Notes (backup files)
  - Apple Notes (HTML/text export)
- Auto-detection of format
- Batch import support
- Preview before import
- Implemented in `lib/import.ts`
- Content encrypted on import

### Export Feature

- Markdown format for documents
- ZIP file for full workspace
- Maintains folder structure
- Decrypts content during export (client-side)
- Implemented in `lib/export.ts` and `lib/exportService.ts`
- Includes metadata preservation

### PWA (Progressive Web App)

- Installable on desktop and mobile
- Offline support with service worker
- Automatic sync when back online
- Manifest in `public/manifest.json`
- Service worker in `public/sw.js`
- Managed by `lib/pwaService.ts`
- Custom icons and splash screens

### Embed Previews

- Rich URL previews for links
- Sanitized metadata extraction
- Image, title, and description display
- Handled by `/api/embed` route
- Uses `sanitize-html` for XSS protection
- Cached for performance

### Emoji Icons

- Visual document identification
- Emoji picker integration (`emoji-picker-react`)
- Per-document custom icons
- Searchable and filterable

## Documentation Standards

- **README.md**: Keep updated with features and setup
- **CONTRIBUTING.md**: Guidelines for contributors
- **SECURITY.md**: Security policy and vulnerability reporting
- **RELEASE.md**: Release notes and changelog
- **docs/**: Comprehensive documentation directory
  - `getting-started/`: Setup and installation guides
  - `guides/`: Feature-specific guides (import, etc.)
  - `advanced/`: Advanced topics and customization
  - `architecture/`: System architecture documentation
  - `VIM_MODE.md`: Complete Vim mode documentation
- **Code Comments**: JSDoc for complex functions
- **Inline Comments**: Only when logic is non-obvious
- **Copyright Headers**: BSD-3-Clause license headers on all source files

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Playwright Testing](https://playwright.dev/)
- [MongoDB Node Driver](https://www.mongodb.com/docs/drivers/node/)
- [BlockNote Editor](https://www.blocknotejs.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- [ioredis](https://github.com/redis/ioredis)

## Additional Libraries & Tools

### Utility Libraries

- **jszip**: Create ZIP archives for workspace export
- **uuid**: Generate unique identifiers for documents and shares
- **sanitize-html**: Sanitize HTML content for embed previews
- **fast-xml-parser**: Parse XML for Evernote imports
- **node-summarizer**: Content summarization for quick previews
- **react-markdown**: Render Markdown content
- **rehype-highlight**: Syntax highlighting for code blocks
- **rehype-raw**: Raw HTML support in Markdown
- **remark-gfm**: GitHub Flavored Markdown support
- **react-hotkeys-hook**: Keyboard shortcut management
- **emoji-picker-react**: Emoji selection interface

### TypeScript Types

- `@types/bcrypt`: Type definitions for bcrypt
- `@types/node`: Node.js type definitions
- `@types/react`: React type definitions
- `@types/react-dom`: React DOM type definitions
- `@types/sanitize-html`: sanitize-html type definitions
- `@types/uuid`: uuid type definitions

### Build & Development Tools

- **eslint**: Linting (ESLint 9)
- **eslint-config-next**: Next.js ESLint configuration
- **tailwindcss**: CSS framework (v4)
- **@tailwindcss/postcss**: PostCSS plugin for Tailwind
- **postcss**: CSS processing
- **TypeScript**: Type checking (5.9.3)

### Deployment Tools

- **Docker**: Containerization with multi-stage builds
- **docker-compose**: Multi-service orchestration
- **Vercel**: Deployment platform (optional)
- **Node.js 25-alpine**: Lightweight production runtime

## Support & Contribution

- Report bugs via GitHub Issues
- Security vulnerabilities: Follow SECURITY.md process
- Pull requests: Follow CONTRIBUTING.md guidelines
- Questions: Use GitHub Discussions
- Code of Conduct: See CODE_OF_CONDUCT.md
- License: BSD-3-Clause (see LICENSE file)

---

**Remember**: Privacy and security are paramount. When in doubt, err on the side of caution and ask for review.

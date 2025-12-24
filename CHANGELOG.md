# Changelog

All notable changes to 4diary will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Documentation updates for all features
- Comprehensive changelog tracking

## [2.0.0] - 2025-12-24

### Added - Major UI Overhaul with shadcn/ui Components

#### Component System Modernization 🌟
- **shadcn/ui Integration**: Replaced custom components with shadcn/ui library
  - Drawer component for note settings and options
  - Card components for document and workspace cards
  - Iconed hamburger menu component for navigation
  - Alert dialogs and confirmation modals
  - Dropdown menus for context actions
  - Avatar components for user profiles
  - Separator components for UI sections
  - All components fully accessible and customizable

#### Sidebar Revamp 🌟
- **Redesigned Workplace Sidebar**: Complete sidebar overhaul with new sections
  - **Profile Section**: Large section with optional profile picture and current date
    - Date format can be customized in account settings
    - User avatar with initials or profile picture
    - Welcome message with user information
  - **Navigation Section**: Quick access to all application pages
    - Dashboard, Templates, Settings, Documentation
    - Clean iconography for better usability
  - **Documents Section**: Enhanced note listing with folder structure
    - Shows selected emoji icon for each note (replaces generic document icon) 🌟
    - Collapsible folders with visual hierarchy
    - Quick actions for each document
    - Drag and drop support for organization

### Added - Internationalization & Localization 🌟

#### Multi-Language Support (Phase 1)
- **lingo.dev Integration**: Server-side translation service for UI elements
  - **3 Languages Implemented** (first 3 of 8 planned):
    - 🇬🇧 English (en) - Default
    - 🇮🇳 Bengali (bn) - বাংলা
    - 🇮🇳 Hindi (hi) - हिन्दी
  - **5 Additional Languages Planned**:
    - Tamil, Mandarin Chinese, Russian, French, German
  - Language selection available in account settings
  - In-memory LRU caching for performance (up to 1000 translations)
  - Batch processing for multiple UI texts
  - **Self-Hostable**: No vendor lock-in, works without API key (falls back to English)
  - Privacy-preserved: Only UI elements translated, encrypted content untouched
  - Comprehensive documentation in translation.md

### Added - Advanced Mathematics & Calculations

#### LaTeX Math Notation Support 🌟
- **Full LaTeX Math Support**: Render mathematical expressions in documents
  - Inline math with `$...$` syntax
  - Display mode math with `$$...$$` syntax
  - Powered by KaTeX for high-quality rendering
  - Support for Greek letters, operators, fractions, matrices
  - Custom leather-themed math styling
  - Copy-paste friendly LaTeX code

#### Enhanced Calculator Mode 🌟
- **Built-in Calculator**: Quick math inside the editor
  - Full math.js expression evaluation
  - LaTeX-style math support for results
  - Mathematical functions: sqrt, sin, cos, tan, log, abs, exp, pow
  - Constants: pi, e
  - Short-hand notation support for common operations
  - History of last 10 calculations
  - Insert results directly into documents
  - Keyboard shortcut: Ctrl+Shift+C
  - Floating button for easy access

### Added - Testing & Quality Assurance

#### Playwright Mode Revamp 🌟
- **Enhanced E2E Testing**: Comprehensive test coverage improvements
  - Multiple viewport testing (mobile, tablet, desktop)
  - Improved test organization and structure
  - Better error reporting and debugging
  - Network mocking for API testing
  - Accessibility testing enhancements
  - Keyboard navigation tests
  - Visual regression testing capabilities
  - Parallel test execution support

### Added - Text Highlighting & Formatting 🌟

#### Highlighting System
- **Text Highlighting**: Rich text highlighting capabilities
  - Multiple highlight colors
  - Persistent highlighting across sessions
  - Copy-paste preservation of highlights
  - Remove highlighting option
  - Search highlighting in search results (yellow highlights)
  - Integrated with BlockNote editor
  - Keyboard shortcuts for quick highlighting

### Added - Powerful Search Capabilities 🌟

#### Advanced Document Search
- **Fuzzy Search**: Find documents even with typos
  - Search across: All, Title, Content, Tags, Folder
  - Visual highlights for matching text in results
  - Keyboard navigation with arrow keys and Enter
  - Client-side search on decrypted content
  - Real-time search results as you type
  - Search history and suggestions
  - Filter by document type, date, and status
  - Keyboard shortcut: Ctrl/Cmd+Shift+F

### Added - Settings Menu Functionality 🌟

#### Functional Settings Panel
- **Account Settings**: Comprehensive user preferences
  - **Encryption Toggle**: Ability to turn encryption on/off
    - Warning dialogs for security implications
    - Bulk re-encryption of existing documents
    - Master key management
  - **Date Format Settings**: Customize date display format
    - Multiple format options (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, etc.)
    - Applied across sidebar and document metadata
  - **Language Preferences**: Select UI language
  - **Theme Customization**: Future-ready theme settings
  - **Analytics Toggle**: Enable/disable TelemetryDeck analytics
  - **Notification Preferences**: Control PWA notifications
  - **Profile Management**: Update profile picture and display name

### Added - Advanced Security Features 🌟

#### Two-Factor Authentication (2FA)
- **TOTP-based 2FA**: Authenticator app support
  - QR code setup for easy configuration (Google Authenticator, Authy, etc.)
  - 10 single-use backup codes for account recovery
  - Rate limiting: 5 attempts per 15 minutes
  - Self-hosted compatible (no external dependencies)
  - Enable/disable in account settings
  - Verify with TOTP token or backup code
  - Required for sensitive operations

#### Note-Level Security 🌟
- **Password-Protected Notes**: Lock individual notes
  - Bcrypt password hashing (10 rounds)
  - Independent of account password and 2FA
  - Per-document password protection
  - Option to unlock with account password OR authenticator token (like Standard Notes)
  - Visual lock indicator in note list
  - Cannot be recovered if forgotten (zero-knowledge architecture)
  - Password required for note access, editing, and export

### Added - Document Customization 🌟

#### Background Colors
- **12 Google Keep-Style Colors**: Colored background options for notes
  - Colors: Coral, Peach, Sand, Mint, Sage, Fog, Storm, Dusk, Blossom, Clay, Chalk
  - Set from note settings drawer
  - Visual organization and quick identification
  - Persisted with encrypted document metadata
  - Reflected in workspace cards and editor

#### Handwritten Notes Support 🌟
- **Drawing Canvas**: Full handwriting capabilities
  - Pen and eraser tools
  - 7 preset colors (leather, black, blue, red, green, purple, orange)
  - 4 pen widths (thin, medium, thick, bold)
  - Undo last stroke and clear canvas
  - Mouse and touch input support
  - Export as PNG
  - Stored as encrypted base64 PNG images
  - Dedicated handwritten note document type

### Added - Document State Management 🌟

#### Read-Only Mode
- **Toggle Read-Only Notes**: Lock documents to prevent accidental edits
  - Visual "🔒 Read-Only" badge in editor
  - Editor and toolbar disabled when active
  - Reversible toggle from note settings drawer
  - Prevents editing but allows viewing and sharing
  - Useful for finalized documents and references

#### Archive System
- **Archive Notes**: Hide documents without deletion
  - Archived documents hidden from main workspace list
  - Accessible via archive view or search
  - Reversible via settings or API
  - Maintains encryption and metadata
  - Bulk archive operations available
  - Archive status reflected in UI

### Added - AI Integration 🌟

#### Privacy-Friendly AI Interface
- **Notion-like AI Assistant**: Built directly into notes interface
  - Powered by DuckDuckGo AI Chat (https://jsr.io/@mumulhl/duckduckgo-ai-chat)
  - Context-aware: understands current document content
  - No API keys required (works out-of-the-box)
  - Zero data retention (queries not stored or used for training)
  - Keyboard shortcut: Ctrl+Shift+A
  - Floating sparkle ✨ button for easy access
  - Features: writing help, content generation, editing, brainstorming
  - **Self-Hostable**: No vendor lock-in, privacy-first design
  - Optional feature, fully functional without external services

### Added - Security & Access Control 🌟

#### Cloudflare Bot Verification
- **Turnstile Bot Protection**: Optional login page protection
  - Cloudflare Turnstile integration for login forms
  - Prevents automated attacks and bot signups
  - **Self-Hostable**: Easy to enable/disable via environment variables
  - **No Vendor Lock-In**: Optional feature, works perfectly without it
  - Respects user privacy (no CAPTCHA friction)
  - Configurable challenge difficulty

### Added - Icon System Overhaul 🌟

#### React Icons SVG Integration
- **Flat Colored Icon Set**: Replace all emojis with React icons
  - @iconify/react with @iconify-json/flat-color-icons package
  - Consistent, professional iconography throughout app
  - Replaced emoji picker with icon selector
  - Document icons now use SVG icons instead of emojis
  - Better accessibility with proper ARIA labels
  - Scalable vector graphics for crisp rendering
  - Reduced emoji rendering inconsistencies across platforms

### Added - Marketing & Comparison

#### Homepage Enhancements 🌟
- **Alternatives Comparison Section**: Compare 4diary with competitors
  - **Google Keep**: Privacy, encryption, features comparison
  - **OneNote**: Feature parity and advantages
  - **Evernote**: Privacy-first approach vs. cloud-dependent
  - **Standard Notes**: Similar security model with more features
  - **Notion**: Encryption and privacy advantages
  - Side-by-side feature matrix
  - Clear value proposition for each use case

#### User Experience 🌟
- **Exit Redirect Page**: Cool redirect page when leaving the site
  - Warning when navigating to external links
  - Option to continue or cancel
  - Prevents accidental navigation
  - Customizable redirect animation
  - Security-conscious design

### Added - Analytics & Monitoring 🌟

#### TelemetryDeck Integration
- **Privacy-Friendly Analytics**: Replace Vercel Analytics with TelemetryDeck
  - @typedigital/telemetrydeck-react package
  - Fully privacy-respecting (no personal data collection)
  - GDPR compliant by design
  - Toggle-able in account settings (user consent required)
  - **Self-Hostable**: No vendor lock-in
  - Dashboard for usage insights without compromising privacy
  - Event tracking for feature usage and performance

### Added - Export Enhancements 🌟

#### Multiple Export Formats
- **Three Export Types**: TXT, LaTeX, and Markdown
  - **TXT Export**: Plain text for maximum compatibility
  - **LaTeX Export**: Formatted LaTeX documents with math notation preserved
  - **Markdown Export**: Standard Markdown with frontmatter
  - Individual document export or full workspace export
  - Maintains folder structure in workspace exports

#### Enhanced Security for Exports
- **Password + 2FA for Workspace Export**: Extra security layer
  - Full workspace export requires account password
  - 2FA verification (TOTP token or backup code) required
  - Prevents unauthorized data exfiltration
  - Client-side decryption before export
  - ZIP file generation with folder structure
  - Progress indicator for large exports

### Changed

#### UI/UX Improvements
- Enhanced sidebar with better visual hierarchy and iconography
- Improved responsive design for mobile and tablet devices
- Better touch target sizes for mobile usability
- Consistent spacing and alignment across all components
- Dark mode refinements with leather theme
- Smoother animations and transitions

#### Performance Optimizations
- Reduced bundle size with tree-shaking and code splitting
- Improved initial load time with lazy loading
- Better caching strategies for translations and assets
- Optimized image loading with next/image
- Database query optimizations for faster search

### Fixed

#### Bug Fixes
- Fixed sidebar collapse/expand animation glitches
- Resolved issue with emoji picker positioning on mobile
- Fixed search highlighting not clearing properly
- Corrected date format inconsistencies across UI
- Fixed 2FA backup code generation edge cases
- Resolved LaTeX rendering issues with certain symbols
- Fixed export filename sanitization for special characters

### Security

#### Security Enhancements
- Enhanced rate limiting for 2FA attempts
- Improved session management with shorter TTLs
- Strengthened password requirements and validation
- Better input sanitization for user-generated content
- XSS protection improvements in markdown rendering
- CSRF token validation for state-changing operations

## [1.0.0] - 2025-12-01

### Added - Production Release

This is the first production-ready release with a fully stylized UI, comprehensive features, and enterprise-grade security. Complete overhaul from the alpha prototype with professional design, working modes, Vim support, and all the features described below.

### Added - Stylized UI & Theme System

#### Professional Leather Theme
- **Custom Design System**: Rich, warm color palette inspired by leather journals
  - Leather color gradients (leather-50 through leather-900)
  - Custom gradients: gradient-leather and gradient-parchment
  - Glass card frosted effect with backdrop blur
  - Shadow variations (shadow-leather, shadow-deep)
- **Polished Components**: Professional, production-ready UI components
  - Smooth animations with Framer Motion
  - Consistent spacing and typography
  - Touch-optimized with 44px minimum touch targets
  - Responsive design with mobile-first approach
- **Dark Theme Support**: Beautiful dark mode with warm tones
  - Automatic theme detection
  - Smooth theme transitions
  - Reduced eye strain with warm colors

### Added - Working Modes & Editor

#### Vim Mode Integration ⌨️
- **Full Vim Keybindings**: Complete Vim editing experience
  - Four modes: NORMAL, INSERT, REPLACE, COMMAND
  - Visual modes: Character-wise and line-wise selection
  - Navigation: hjkl, w, b, e, 0, $, gg, G
  - Count prefixes: Repeat commands (e.g., 5j, 3w)
  - Editing commands: d, y, p, c, x, r
  - Command mode: :wq, :q, :x to exit
  - Visual mode indicator with color coding
  - Keyboard shortcut: Ctrl+Shift+V to toggle
  - Comprehensive documentation in VIM_MODE.md

#### Editor Modes
- **Full-screen Mode**: Distraction-free editing
- **Quick Read Mode**: Reader-friendly view with adjustable font size
- **Normal Mode**: Standard editing with formatting toolbar
- **Focus Mode**: Minimal UI for concentration

### Added - Core Privacy & Security Features

#### End-to-End Encryption
- **AES-256-GCM Encryption**: Military-grade encryption using Web Crypto API
- **Zero-Knowledge Architecture**: Server never sees unencrypted content
- **Master Key Management**: Generated in browser, stored in IndexedDB only
- **Document-Level Encryption**: Each document has its own encryption key
- **PBKDF2 Key Derivation**: 100,000 iterations for password-based key strengthening

#### Authentication & Access Control
- **Email-Based Authentication**: Secure sign-up and login with bcrypt password hashing
- **Session Management**: HTTP-only secure session cookies using JWT (jose library)
- **Two-Factor Authentication (2FA)**: TOTP-based 2FA with QR code setup
  - Authenticator app support (Google Authenticator, Authy, etc.)
  - 10 single-use backup codes for account recovery
  - Rate limiting (5 attempts per 15 minutes)
  - Self-hosted compatible
- **Cloudflare Turnstile**: Optional bot protection for login pages
  - Optional and self-hostable
  - Easy to enable/disable via environment variables

### Added - Document Management Features

#### Rich Text Editor
- **BlockNote Integration**: Notion-like editing experience
- **Auto-save**: Automatic saving with change detection
- **Formatting Toolbar**: Rich text formatting controls
- **Full-screen Mode**: Distraction-free editing
- **LaTeX Math Notation**: Inline (`$...$`) and display (`$$...$$`) math expressions
  - Support for Greek letters, operators, fractions, matrices
  - Rendered using KaTeX
- **Syntax Highlighting**: Enhanced code block highlighting for 50+ languages
  - Custom leather-themed syntax highlighting
  - Powered by highlight.js

#### Vim Mode
- **Full Vim Keybindings**: Complete Vim editing experience
- **Four Modes**: NORMAL, INSERT, REPLACE, COMMAND
- **Visual Modes**: Character-wise and line-wise visual selection
- **Navigation Commands**: hjkl, w, b, e, 0, $, gg, G
- **Count Prefix**: Repeat commands with number prefixes (e.g., 5j, 3w)
- **Editing Commands**: d, y, p, c, x, r, and more
- **Command Mode**: :wq, :q, :x to exit
- **Visual Indicator**: Shows current mode with color coding
- **Keyboard Shortcut**: Ctrl+Shift+V to toggle

#### Document Types
- **Regular Documents**: Rich text documents with full encryption
- **Kanban Boards**: Drag-and-drop task management boards
  - Column-based organization (To Do, In Progress, Done)
  - Card state management
  - Fully encrypted board data
  - Powered by @hello-pangea/dnd
- **Quick Notes**: Lightning-fast note capture
  - Hotkey activation (Ctrl/Cmd + Q)
  - Local-first auto-save
  - Sync to workspace when ready
- **Handwritten Notes**: Drawing canvas with full encryption
  - Pen and eraser tools
  - 7 preset colors
  - 4 pen widths (thin, medium, thick, bold)
  - Undo and clear functions
  - Mouse and touch input support
  - Export as PNG
  - Stored as encrypted base64 PNG images

#### Document Organization
- **Folders**: Hierarchical folder structure
- **Tags**: Tag documents for easy filtering
- **Favorites**: Mark important documents as favorites
- **Archive**: Archive documents without deleting
- **Emoji Icons**: Visual identification with emoji document icons
  - Integrated emoji picker
  - Custom icons per document
- **Background Colors**: 12 Google Keep-style color options
  - Coral, Peach, Sand, Mint, Sage, Fog, Storm, Dusk, Blossom, Clay, Chalk
  - Instant visual organization

#### Advanced Document Features
- **Backlinks (Bidirectional Linking)**: Wiki-style `[[Document Title]]` syntax
  - Automatic link detection and indexing
  - Backlinks sidebar shows incoming links
  - Navigate between linked documents
  - Perfect for building knowledge graphs
- **Version History**: Automatic document versioning
  - Saves every time you save
  - Keeps last 50 versions per document
  - Stored in browser's IndexedDB
  - Preview and restore previous versions
  - Client-side only (maintains zero-knowledge)
- **Calendar View**: Date-based document organization
  - Monthly calendar navigation
  - Visual indicators for days with documents
  - Toggle between list and calendar views
- **Read-Only Mode**: Lock documents to prevent accidental edits
  - Visual "🔒 Read-Only" badge
  - Editor and toolbar disabled
  - Reversible toggle
- **Password-Protected Notes**: Extra layer of security per document
  - Bcrypt password hashing (10 rounds)
  - Independent of account password and 2FA
  - Per-document password protection

### Added - Collaboration & Sharing

#### Ephemeral Share Links
- **Time-Limited Sharing**: Create temporary share links with 24-hour default expiry
- **Granular Permissions**: View or edit access control
- **Revocable Tokens**: Instantly revoke share access
- **Rate Limiting**: 10 shares per 15 minutes for security
- **Privacy-First**: Shared content remains encrypted end-to-end
- **Redis-Powered**: Token storage with automatic TTL cleanup

### Added - AI & Intelligence Features

#### AI Assistant
- **Privacy-First AI**: Powered by DuckDuckGo AI Chat
- **Context-Aware**: Understands current document content
- **No API Keys Required**: Works out-of-the-box
- **Zero Data Retention**: Queries not stored or used for training
- **Keyboard Shortcut**: Ctrl+Shift+A to toggle
- **Floating Button**: Sparkle ✨ button for easy access

#### Built-in Calculator
- **Mathematical Expressions**: Full math.js support
- **LaTeX Display**: Toggle to show results as LaTeX
- **Functions**: sqrt, sin, cos, tan, log, abs, exp, pow
- **Constants**: pi, e
- **History**: View last 10 calculations
- **Insert to Editor**: Add results directly to documents
- **Keyboard Shortcut**: Ctrl+Shift+C to toggle

#### Powerful Search
- **Fuzzy Matching**: Find results even with typos
- **Search Filters**: All, Title, Content, Tags, Folder
- **Visual Highlights**: Matching text highlighted in results
- **Keyboard Navigation**: Arrow keys and Enter
- **Client-Side Search**: On decrypted content
- **Keyboard Shortcut**: Ctrl/Cmd+Shift+F to toggle

### Added - Import & Export

#### Import Support
- **Multiple Formats**:
  - Markdown (.md files)
  - Google Keep (Google Takeout export)
  - Evernote (.enex files)
  - Notion (exported workspace)
  - Standard Notes (backup files)
  - Apple Notes (HTML/text export)
- **Auto-Detection**: Automatically detects import format
- **Batch Import**: Import multiple files at once
- **Preview**: Preview notes before importing
- **Encryption on Import**: Content encrypted immediately

#### Export Functionality
- **Markdown Export**: Export individual documents as Markdown
- **Workspace Export**: Full workspace as ZIP file
  - Maintains folder structure
  - Decrypts content during export (client-side)
  - Includes metadata preservation
- **PNG Export**: Handwritten notes as PNG images

### Added - Progressive Web App (PWA)

#### PWA Features
- **Installable**: Add to device home screen
- **Offline Support**: Access and edit without internet
- **Service Worker**: Background caching and sync
- **Automatic Updates**: Always get latest version
- **App-Like Experience**: Full-screen, no browser UI
- **Fast Loading**: Cached resources for instant startup
- **Custom Manifest**: Professional app experience

### Added - Multi-Language Support

#### Translation Service
- **Three Languages (Phase 1)**:
  - English (en)
  - Bengali (bn) - বাংলা
  - Hindi (hi) - हिन्दी
- **lingo.dev Integration**: Server-side translation API
- **In-Memory Caching**: LRU cache for up to 1000 translations
- **Batch Processing**: Multiple texts in single API call
- **Optional Feature**: Works perfectly without API key
- **Privacy-Preserved**: Only UI elements translated, not encrypted content

### Added - Additional Features

#### Quick Actions
- **Quick Note**: Ctrl/Cmd+Q for fast note capture
- **Quick Read**: Distraction-free reader mode
  - Adjustable font size (A-/A+)
  - Clean reading interface
  - ESC to exit

#### Embed Previews
- **Rich URL Previews**: Preview metadata for links
- **Sanitized HTML**: XSS protection with sanitize-html
- **OG/Meta Tags**: Parse Open Graph and meta tags
- **Server-Side Fetching**: Preview fetcher API route

#### Templates
- **Pre-Built Templates**: Categories for journal, work, productivity
- **Custom Templates**: Save documents as templates
- **Quick Start**: Use templates to create new documents

#### UI/UX Enhancements
- **Leather Theme**: Rich, warm color palette inspired by leather journals
  - Custom gradient: gradient-leather and gradient-parchment
  - Leather button styles
  - Glass card frosted effect
  - Shadow variations (shadow-leather, shadow-deep)
- **Touch Optimization**: 44px minimum touch targets
  - touch-manipulation class for better mobile UX
  - Touch handlers with active state feedback
- **Responsive Design**: Mobile-first approach
  - Sidebar overlay on mobile
  - Multiple viewport testing (375x667, 768x1024, 1920x1080)
- **Keyboard Shortcuts**: Comprehensive shortcut support
  - Quick Note: Ctrl/Cmd+Q
  - AI Assistant: Ctrl+Shift+A
  - Vim Mode: Ctrl+Shift+V
  - Calculator: Ctrl+Shift+C
  - Search: Ctrl/Cmd+Shift+F

### Added - Technical Infrastructure

#### Database
- **MongoDB**: Primary database for documents and workspaces
  - Collections: workspaces, documents, templates, analytics_events
  - Document types: doc, board, quick
  - Metadata stored unencrypted for search
  - Content stored encrypted
- **Redis**: Optional cache for share tokens
  - Ephemeral token storage
  - Automatic TTL cleanup
  - Optional dependency

#### API Routes
- `/api/auth/*` - Authentication (login, signup, logout, session)
- `/api/auth/2fa/*` - Two-factor authentication
- `/api/documents` - Document CRUD operations
- `/api/documents/[id]/lock` - Password protection
- `/api/workspaces` - Workspace management
- `/api/shares` - Share token management
- `/api/templates` - Template operations
- `/api/backlinks` - Backlink indexing and retrieval
- `/api/embed` - URL embed preview generation
- `/api/analytics` - Privacy-respecting analytics events
- `/api/translate` - Multi-language translation
- `/api/settings` - User settings management

#### Services Layer
- **documentService.ts**: Document CRUD, encryption coordination
- **workspaceService.ts**: Workspace management
- **backlinkService.ts**: Backlink indexing and wiki-link parsing
- **versionService.ts**: Version history management
- **templateService.ts**: Template operations
- **exportService.ts**: Export coordination, workspace ZIP
- **pwaService.ts**: PWA functionality, service worker
- **translationService.ts**: Multi-language support
- **import.ts**: Multi-format import
- **export.ts**: Export utilities
- **crypto-utils.ts**: Encryption helpers
- **summarizer.ts**: Content summarization (disabled by default)
- **logger.ts**: Structured logging
- **analytics.ts**: Privacy-respecting analytics
- **inMemoryStorage.ts**: In-memory caching layer

#### Monitoring & Observability
- **Sentry Integration**: Error tracking and performance monitoring
  - Automatic error capture
  - Performance monitoring
  - Source maps uploaded in CI
  - Tunnel route to bypass ad-blockers
  - Vercel Cron Monitors enabled
- **Vercel Analytics**: Web analytics and speed insights
  - GDPR compliant
  - Real user monitoring (RUM)
  - No personal data collection
- **Custom Logging**: Structured logging with request tracking
  - Log levels: debug, info, warn, error
  - Context tracking with request IDs
  - Privacy-safe (no sensitive data logged)

#### Testing
- **Playwright**: E2E and unit testing framework
  - Multiple viewport testing
  - Network mocking
  - Accessibility testing
  - Keyboard navigation tests
- **Test Coverage**:
  - E2E tests in tests/e2e/
  - Unit tests in tests/unit/
  - Commands: npm test, npm run test:unit, npm run test:e2e

### Added - Dependencies

#### Major Dependencies
- **Next.js 16.0.10**: App Router framework
- **React 19.2.3**: UI library
- **TypeScript 5.9.3**: Type safety
- **Tailwind CSS v4**: Utility-first styling
- **MongoDB 7.0.0**: Database driver
- **Redis (ioredis 5.8.2)**: Optional cache/session storage
- **BlockNote 0.45.0**: Rich text editor
- **Framer Motion 12.23.25**: Animations
- **bcrypt 6.0.0**: Password hashing
- **jose 6.1.0**: JWT tokens
- **uuid 13.0.0**: Secure token generation
- **jszip 3.10.1**: ZIP file creation
- **emoji-picker-react 4.16.1**: Emoji selection
- **@hello-pangea/dnd 18.0.1**: Drag and drop
- **@caldwell619/react-kanban 0.0.12**: Kanban boards
- **sanitize-html 2.17.0**: HTML sanitization
- **qrcode 1.5.4**: QR code generation for 2FA
- **speakeasy 2.0.0**: TOTP for 2FA
- **react-hotkeys-hook 5.2.1**: Keyboard shortcuts
- **@mumulhl/duckduckgo-ai-chat 3.3.0**: AI assistant
- **mathjs 15.1.0**: Calculator expressions
- **katex 0.16.27**: LaTeX math rendering
- **highlight.js 11.11.1**: Syntax highlighting
- **react-markdown 10.1.0**: Markdown rendering
- **@sentry/nextjs 10.29.0**: Error tracking
- **@vercel/analytics 1.6.1**: Web analytics
- **@lingo.dev/_sdk 0.13.4**: Translation service

### Added - Documentation

#### Comprehensive Guides
- **Getting Started**:
  - introduction.md
  - installation.md
  - quickstart.md
- **Feature Guides**:
  - ai-assistant.md
  - bot-protection.md
  - community-features.md (backlinks, calendar, version history, PWA)
  - editor.md
  - export-backup.md
  - handwritten-notes.md
  - import.md
  - kanban.md
  - math-search-features.md (LaTeX, calculator, search, syntax highlighting)
  - quick-note.md
  - reader-mode.md
  - security-privacy.md
  - sharing.md
  - shortcuts.md
  - templates.md
  - translation.md
  - troubleshooting.md
- **Advanced Topics**:
  - encryption.md
  - performance.md
  - self-hosting.md
  - theming.md
- **Architecture**:
  - api-reference.md
  - architecture.md
  - database-schema.md
  - deployment.md
  - security-architecture.md
- **Special Docs**:
  - VIM_MODE.md (comprehensive Vim mode guide)
  - NEW_FEATURES.md (2FA, encryption toggle, colors, read-only, archive, password protection)

#### Project Documentation
- **README.md**: Comprehensive feature list and setup guide
- **RELEASE.md**: Alpha release notes
- **CONTRIBUTING.md**: Contribution guidelines
- **CODE_OF_CONDUCT.md**: Community standards
- **SECURITY.md**: Security policy and vulnerability reporting
- **CHANGELOG.md**: Version-by-version change tracking (this file)

### Added - Docker & Deployment

#### Docker Support
- **Multi-Stage Build**: Optimized Docker image with Next.js standalone mode
- **Docker Compose**: Full stack with MongoDB and Redis
- **Debug Profile**: Optional Mongo Express for database management
- **Health Checks**: Container health monitoring
- **Environment Configuration**: Flexible environment variable setup

#### Deployment Options
- **Vercel**: One-click deployment with environment variables
- **Docker**: Self-hosted with docker-compose
- **Manual**: Node.js 20+ standalone deployment
- **CI/CD**: GitHub Actions workflow ready

### Security

#### Security Features
- **Client-Side Only Encryption**: All encryption happens in browser
- **Rate Limiting**: Share creation, 2FA login attempts
- **Input Validation**: All inputs validated before processing
- **HTML Sanitization**: XSS protection for embed previews
- **Password Hashing**: bcrypt with cost factor 10
- **Session Security**: HTTP-only, secure cookies
- **CSRF Protection**: Built into Next.js
- **No Secret Exposure**: Never log or expose sensitive data

### Performance

#### Optimization Features
- **Auto-save Debouncing**: Only save when content actually changes
- **In-Memory Caching**: Hot data cached for performance
- **Service Worker**: Offline caching and background sync
- **Code Splitting**: Next.js automatic code splitting
- **Dynamic Imports**: Lazy loading of heavy components
- **Standalone Output**: Optimized Docker builds
- **Redis Caching**: Optional Redis for frequently accessed data

### Known Limitations

- Share tokens require Redis configuration
- Vim mode limited to BlockNote editor capabilities
- Backlinks require exact title match (case-sensitive)
- Version history limited to 50 versions per document
- PWA offline mode requires initial online visit
- Translation requires lingo.dev API key (optional)

---

## [1.0-alpha] - 2025-11-13

### Initial Prototype Release

This was the initial alpha prototype with barely functional features. Basic proof-of-concept implementation to validate core ideas before building the full production version.

#### Prototyped Features
- **Basic Note Editor**: Simple text editing without rich formatting
- **Encryption Concept**: Initial implementation of client-side encryption (not fully functional)
- **Authentication Skeleton**: Basic login/signup forms (minimal validation)
- **Document Storage**: MongoDB integration for storing encrypted content
- **Simple UI**: Bare-bones interface without styling or theme
- **Workspace Concept**: Basic workspace structure (no organization features)

#### Known Issues (Alpha)
- Incomplete encryption implementation
- No styling or professional UI
- Limited functionality
- Many features not working
- Proof-of-concept only
- Not recommended for production use

#### What Was Missing
- No Vim mode
- No working modes (full-screen, reader, etc.)
- No theme system or leather UI
- No 2FA or advanced security
- No AI assistant
- No calculator or search
- No import/export functionality
- No PWA support
- No multilingual support
- No kanban boards
- No handwritten notes
- No backlinks or version history
- Basic functionality only

---

## Version History

### [2.0.0] - 2025-12-24
Major update with shadcn/ui components, multilingual support (3 languages), LaTeX math, calculator mode, highlighting system, powerful search, functional settings, 2FA, note locking, colored backgrounds, handwritten notes, read-only/archive toggles, AI interface, bot verification, React icons, TelemetryDeck analytics, and enhanced export options.

### [1.0.0] - 2025-12-01
First production release with stylized UI, working modes, Vim mode, and comprehensive feature set. Complete overhaul from alpha prototype with professional design and enterprise-grade functionality.

### [1.0-alpha] - 2025-11-13
Initial alpha prototype with barely functional features. Basic proof-of-concept to validate core encryption and document management concepts.

---

## Links

- [GitHub Repository](https://github.com/Harsha-Bhattacharyya/4diary)
- [Documentation](https://github.com/Harsha-Bhattacharyya/4diary/tree/main/docs)
- [Issue Tracker](https://github.com/Harsha-Bhattacharyya/4diary/issues)
- [License](https://github.com/Harsha-Bhattacharyya/4diary/blob/main/LICENSE) (BSD-3-Clause)

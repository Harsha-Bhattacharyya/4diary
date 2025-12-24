# 4diary Release Notes

## v2.0.0 (Major Update)

**Release Date:** 2025-12-24

This is a major update to 4diary with comprehensive UI modernization using shadcn/ui, multilingual support, advanced mathematics, enhanced search, functional settings, and many new features.

**✨ Highlights:**
- 🎨 Complete UI overhaul with shadcn/ui components
- 🌍 Multi-language support (English, Bengali, Hindi) with lingo.dev
- 📐 Full LaTeX math notation support
- 🔢 Enhanced calculator with LaTeX-style math
- 🎯 Powerful fuzzy search with filters
- ⚙️ Functional settings menu (encryption toggle, date formats, etc.)
- 🔐 Two-factor authentication (2FA) with authenticator apps
- 🔒 Password-protected notes with account/2FA unlock
- 🎨 12 Google Keep-style colored backgrounds for notes
- ✍️ Handwritten notes support
- 📖 Read-only mode and archive system
- 🤖 Privacy-friendly AI assistant (DuckDuckGo)
- 🛡️ Cloudflare bot verification
- 🎨 React icons SVG (Flat Colored icon set)
- 📊 Comparison with alternatives (Google Keep, OneNote, Evernote, Standard Notes, Notion)
- 🚪 Cool redirect page for external links
- 📊 TelemetryDeck privacy-friendly analytics
- 📤 Multiple export formats (TXT, LaTeX, MD) with password + 2FA protection

### What's New in v2.0.0

#### Component System Modernization
- Migrated to shadcn/ui for all UI components
- Drawer component for note settings
- Redesigned sidebar with profile section, navigation, and document listing
- Shows emoji icons for each note in sidebar
- Iconed hamburger menu and card components

#### Internationalization
- lingo.dev integration for translations
- 3 languages implemented: English, Bengali, Hindi
- 5 more planned: Tamil, Mandarin, Russian, French, German
- Self-hostable without vendor lock-in

#### Advanced Mathematics
- Full LaTeX math notation (`$...$` and `$$...$$`)
- Enhanced calculator with LaTeX display
- Short-hand notation support

#### Enhanced Search & Highlighting
- Fuzzy search across all content
- Search filters: All, Title, Content, Tags, Folder
- Text highlighting system
- Visual search result highlights

#### Functional Settings
- Toggle encryption on/off
- Customize date format
- Language preferences
- Analytics opt-in/out
- Profile management

#### Security Enhancements
- 2FA with authenticator apps
- Per-note password protection
- Cloudflare Turnstile bot verification
- Password + 2FA required for workspace export

#### Document Features
- 12 colored backgrounds (Google Keep-style)
- Handwritten notes with drawing tools
- Read-only mode toggle
- Archive system
- Multiple export formats (TXT, LaTeX, MD)

#### UI/UX Improvements
- Privacy-friendly AI assistant built-in
- React icons SVG (Flat Colored)
- Alternatives comparison section
- Exit redirect page
- TelemetryDeck analytics (privacy-respecting)

---

## v1.0.0 (Production Release)

**Release Date:** 2025-12-01

First production-ready release with fully stylized UI, comprehensive features, and enterprise-grade security. Complete overhaul from the alpha prototype.

**✨ Highlights:**
- 🎨 Professional leather-themed UI
- ⌨️ Full Vim mode with all keybindings
- 🖥️ Working modes (full-screen, reader, focus)
- 🔒 Complete end-to-end encryption
- 📝 Notion-like editor with BlockNote
- 📋 Kanban boards with drag-and-drop
- ⚡ Quick note capture (Ctrl/Cmd + Q)
- 🔗 Backlinks and bidirectional linking
- 📅 Calendar view
- 📚 Version history (50 versions)
- 📱 PWA with offline support
- 📥 Import/export functionality
- 🔗 Ephemeral share links

### What's New in v1.0.0

#### Professional UI & Theme
- Custom leather-themed design system
- Polished components with Framer Motion
- Glass card frosted effects
- Responsive, mobile-first design
- Touch-optimized with 44px targets

#### Vim Mode
- Complete Vim keybindings
- Four modes: NORMAL, INSERT, REPLACE, COMMAND
- Visual selection modes
- Count prefixes (5j, 3w, etc.)
- Full navigation and editing commands
- Toggle with Ctrl+Shift+V

#### Working Modes
- Full-screen distraction-free mode
- Quick Read mode with adjustable fonts
- Focus mode with minimal UI
- Normal editing mode

#### Document Management
- Rich text editor with BlockNote
- Auto-save with change detection
- LaTeX math notation
- Syntax highlighting (50+ languages)
- Multiple document types (docs, boards, quick notes, handwritten)

#### Organization
- Folders and tags
- Favorites and archive
- Emoji icons
- Background colors
- Backlinks (wiki-style)
- Version history
- Calendar view

#### Security
- AES-256-GCM encryption
- Zero-knowledge architecture
- Master key in IndexedDB
- Document-level encryption
- PBKDF2 key derivation

#### Collaboration
- Ephemeral share links (24h TTL)
- View/edit permissions
- Revocable tokens
- Rate limiting

---

## v1.0-alpha (Alpha Prototype)

**Release Date:** 2025-11-13

Initial alpha prototype with barely functional features. Basic proof-of-concept to validate core encryption and document management concepts before building the full production version.

### Prototyped Features
- Basic note editor (simple text, no rich formatting)
- Encryption concept (initial implementation, not fully functional)
- Authentication skeleton (basic login/signup forms)
- Document storage (MongoDB integration)
- Simple UI (bare-bones, no styling)
- Workspace concept (basic structure)

### Known Issues
- Incomplete encryption implementation
- No professional styling or theme
- Limited functionality
- Many features not working
- Proof-of-concept only
- Not recommended for any use

### What Was Missing
Everything that makes 4diary production-ready:
- No Vim mode
- No working modes
- No leather theme
- No 2FA or advanced security
- No AI assistant
- No calculator or search
- No import/export
- No PWA support
- No multilingual support
- No kanban boards
- No handwritten notes
- No backlinks or version history
- Basic functionality only

---

## v0.1.0-alpha (Deprecated - see v1.0-alpha)

**Release Date:** 2025-11-13

This is the first alpha release of 4diary, featuring core privacy-first E2EE functionality, advanced collaboration features, AI assistance, multi-language support, and comprehensive document management tools.

**✨ Highlights:**
- 🔒 End-to-end encryption with zero-knowledge architecture
- 🤖 Privacy-first AI assistant powered by DuckDuckGo
- 🌍 Multi-language support (English, Bengali, Hindi)
- ⌨️ Full Vim mode with visual modes and command support
- 🔢 Built-in calculator with LaTeX display
- 🔍 Powerful fuzzy search across all documents
- ✍️ Handwritten notes with drawing tools
- 📋 Kanban boards with drag-and-drop
- 🔗 Backlinks (bidirectional linking) for knowledge graphs
- 📅 Calendar view for date-based organization
- 📚 Automatic version history (last 50 versions)
- 📱 Progressive Web App with offline support
- 🔐 Two-factor authentication (2FA) with backup codes
- 🎨 12 Google Keep-style background colors
- 📐 LaTeX math notation support
- 💻 Enhanced syntax highlighting for 50+ languages
- 📥 Import from Google Keep, Evernote, Notion, Apple Notes, Standard Notes, and Markdown
- 📤 Export as Markdown or workspace ZIP

### New Features

#### 🔐 Privacy & Security
- **End-to-End Encryption (E2EE)**: AES-256-GCM encryption using Web Crypto API
  - All document content and keys encrypted client-side
  - Server never sees plaintext
  - Master keys generated in browser and stored in IndexedDB only
  - Each document has its own encryption key
  - PBKDF2 key derivation with 100,000 iterations
- **Email-based Authentication**: Secure sign-up and login with bcrypt password hashing
- **Session Management**: JWT-based session validation with HTTP-only secure cookies
- **Two-Factor Authentication (2FA)**: TOTP-based 2FA with authenticator app support
  - QR code setup for easy configuration
  - 10 single-use backup codes for account recovery
  - Rate limiting (5 attempts per 15 minutes)
  - Self-hosted compatible without external dependencies
- **Optional Bot Protection**: Cloudflare Turnstile for login pages
  - Fully optional and self-hostable
  - Easy to enable/disable via environment variables

#### 📤 Sharing & Collaboration
- **Ephemeral Share Links**: Create temporary share links with 24-hour expiry (feature #4)
  - Token-based sharing via Redis
  - Granular permissions (view/edit)
  - Revocable tokens with TTL management
  - Rate limiting for security
  - Server never accesses plaintext content

#### 📝 Rich Text Editing
- **BlockNote Editor**: Notion-like editing experience with full formatting
- **Auto-save**: Automatic saving with intelligent change detection
- **Full-screen Mode**: Distraction-free editing experience
- **LaTeX Math Notation**: Inline (`$...$`) and display (`$$...$$`) math expressions
  - Greek letters, operators, fractions, matrices
  - Rendered beautifully with KaTeX
- **Syntax Highlighting**: Enhanced code blocks for 50+ languages
  - Custom leather-themed highlighting
  - Powered by highlight.js

#### ⌨️ Vim Mode (NEW!)
- **Full Vim Keybindings**: Complete Vim editing experience in the editor
- **Four Modes**: NORMAL, INSERT, REPLACE, COMMAND
- **Visual Modes**: Character-wise and line-wise visual selection
- **Navigation**: hjkl, w, b, e, 0, $, gg, G with count prefixes
- **Editing**: d, y, p, c, x, r and more
- **Command Mode**: :wq, :q, :x to exit
- **Visual Indicator**: Shows current mode with color coding
- **Toggle**: Ctrl+Shift+V to enable/disable

#### 📄 Document Types
- **Regular Documents**: Rich text documents with full encryption
- **Kanban Boards**: Drag-and-drop task management (feature #7)
  - Column-based organization (To Do, In Progress, Done)
  - Card state management
  - Fully encrypted board data
  - Powered by @hello-pangea/dnd
- **Quick Notes**: Lightning-fast note capture (feature #8)
  - Hotkey activation (Ctrl/Cmd + Q)
  - Local-first auto-save to browser storage
  - Optional sync to workspace when ready
  - Minimal, distraction-free UI
- **Handwritten Notes**: Drawing canvas with full encryption support (NEW!)
  - Pen and eraser tools
  - 7 preset colors (leather, black, blue, red, green, purple, orange)
  - 4 pen widths (thin, medium, thick, bold)
  - Undo last stroke and clear canvas
  - Mouse and touch input support
  - Export as PNG
  - Stored as encrypted base64 PNG images

#### 📁 Document Organization
- **Emoji Icons**: Visual identification with emoji document icons (feature #6)
  - Integrated emoji picker UI
  - Custom icons per document
- **Background Colors**: 12 Google Keep-style background colors (NEW!)
  - Coral, Peach, Sand, Mint, Sage, Fog, Storm, Dusk, Blossom, Clay, Chalk
  - Instant visual organization and categorization
- **Folders**: Hierarchical folder structure for organization
- **Tags**: Tag documents for easy filtering and search
- **Favorites**: Mark important documents for quick access
- **Archive**: Archive documents without deleting (NEW!)
  - Hidden from main workspace list
  - Reversible via settings or API
- **Read-Only Mode**: Lock documents to prevent accidental edits (NEW!)
  - Visual "🔒 Read-Only" badge
  - Editor and toolbar disabled when active

#### 🔗 Advanced Document Features (NEW!)
- **Backlinks (Bidirectional Linking)**: Build knowledge graphs
  - Wiki-style `[[Document Title]]` syntax
  - Automatic link detection and indexing
  - Backlinks sidebar shows incoming links
  - Navigate between linked documents
  - Perfect for research and personal knowledge management
- **Version History**: Automatic document versioning
  - Saves every time you save
  - Keeps last 50 versions per document
  - Stored in browser's IndexedDB (zero-knowledge maintained)
  - Preview and restore previous versions
  - No server storage needed
- **Calendar View**: Date-based document organization
  - Monthly calendar navigation
  - Visual indicators for days with documents
  - Toggle between list and calendar views
  - Great for journals and meeting notes
- **Password-Protected Notes**: Extra security layer per document (NEW!)
  - Bcrypt password hashing (10 rounds)
  - Independent of account password and 2FA
  - Per-document password protection
  - Cannot be recovered if forgotten

#### 📖 Quick Read
- **Reader Mode**: Distraction-free reading (feature #9)
  - Clean, focused reading interface
  - Adjustable font size (A-/A+ buttons)
  - Press ESC to exit

#### 🔗 Embed Previews
- **Rich URL Previews**: Preview metadata for links (feature #10)
  - Server-side preview fetcher
  - Sanitized HTML to prevent XSS
  - OG/meta tag parsing
  - Cached for performance

#### 🤖 AI & Intelligence Features (NEW!)

##### AI Assistant
- **Privacy-First AI**: Powered by DuckDuckGo AI Chat
- **Context-Aware**: Understands current document content
- **No API Keys Required**: Works out-of-the-box
- **Zero Data Retention**: Queries not stored or used for training
- **Keyboard Shortcut**: Ctrl+Shift+A to toggle
- **Floating Button**: Sparkle ✨ button for easy access
- **Features**: Writing help, content generation, editing, brainstorming

##### Built-in Calculator
- **Mathematical Expressions**: Full math.js support
- **LaTeX Display**: Toggle to show results as LaTeX
- **Functions**: sqrt, sin, cos, tan, log, abs, exp, pow
- **Constants**: pi, e
- **History**: View last 10 calculations
- **Insert to Editor**: Add results directly to documents
- **Keyboard Shortcut**: Ctrl+Shift+C to toggle

##### Powerful Search
- **Fuzzy Matching**: Find results even with typos
- **Search Filters**: All, Title, Content, Tags, Folder
- **Visual Highlights**: Matching text highlighted in yellow
- **Keyboard Navigation**: Arrow keys and Enter
- **Client-Side Search**: On decrypted content (privacy-safe)
- **Keyboard Shortcut**: Ctrl/Cmd+Shift+F to toggle

#### 🎨 UI/UX
- **Leather Theme**: Rich, warm color palette inspired by leather journals
  - Custom gradients: gradient-leather and gradient-parchment
  - Leather button styles with hover effects
  - Glass card frosted effect with backdrop blur
  - Shadow variations (shadow-leather, shadow-deep)
- **Full-screen Editor**: Distraction-free editing experience
- **Formatting Toolbar**: Rich text editing with BlockNote
- **Card-based Workspace**: Modern, organized workspace layout
- **Top Navigation**: Streamlined navigation across features
- **Touch Optimization**: 44px minimum touch targets for mobile
  - touch-manipulation class for better responsiveness
  - Touch handlers with active state feedback
- **Responsive Design**: Mobile-first approach
  - Sidebar overlay on mobile with backdrop blur
  - Multiple viewport support (375x667, 768x1024, 1920x1080)
- **Keyboard Shortcuts**: Comprehensive shortcut support
  - Quick Note: Ctrl/Cmd+Q
  - AI Assistant: Ctrl+Shift+A
  - Vim Mode: Ctrl+Shift+V
  - Calculator: Ctrl+Shift+C
  - Search: Ctrl/Cmd+Shift+F

#### 📥 Import & Export (NEW!)

##### Import Support
- **Multiple Formats**: Import notes from popular apps
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

##### Export Functionality
- **Markdown Export**: Export individual documents as Markdown
- **Workspace Export**: Full workspace as ZIP file
  - Maintains folder structure
  - Decrypts content during export (client-side)
  - Includes metadata preservation
- **PNG Export**: Handwritten notes as PNG images

#### 📱 Progressive Web App (PWA) (NEW!)
- **Installable**: Add 4Diary to device home screen
- **Offline Support**: Access and edit documents without internet
- **Service Worker**: Background caching and automatic sync
- **Automatic Updates**: Always get the latest version
- **App-Like Experience**: Full-screen mode without browser UI
- **Fast Loading**: Cached resources for instant startup
- **Custom Manifest**: Professional app icons and splash screens

#### 🌍 Multi-Language Support (NEW!)
- **Three Languages (Phase 1)**:
  - English (en)
  - Bengali (bn) - বাংলা
  - Hindi (hi) - हिन्दी
- **lingo.dev Integration**: Server-side translation API
- **In-Memory Caching**: LRU cache for up to 1000 translations
- **Batch Processing**: Multiple texts in single API call
- **Optional Feature**: Works perfectly without API key (defaults to English)
- **Privacy-Preserved**: Only UI elements translated, not encrypted content

#### 📄 Pages & Navigation
- **Workspace**: Main document management page
- **Documentation**: Comprehensive guides and help
- **About**: Project information and acknowledgments
- **Authentication**: Sign up, login, 2FA verification
- **Templates**: Pre-built template gallery
- **Settings**: User preferences, 2FA setup, encryption toggle, language selection
- **Share**: Public share pages for documents

### Technical Improvements

#### Major Dependencies
- `next@16.0.10`: App Router framework
- `react@19.2.3` & `react-dom@19.2.3`: UI library
- `typescript@5.9.3`: Type safety
- `tailwindcss@4`: Utility-first styling
- `mongodb@7.0.0`: Database driver
- `ioredis@5.8.2`: Redis client for ephemeral share tokens (optional)
- `@blocknote/react@0.45.0`: Rich text editor
- `framer-motion@12.23.25`: Animations
- `bcrypt@6.0.0`: Password hashing
- `jose@6.1.0`: JWT session tokens
- `uuid@13.0.0`: Secure token generation
- `jszip@3.10.1`: ZIP file creation for exports
- `emoji-picker-react@4.16.1`: Emoji picker component
- `@hello-pangea/dnd@18.0.1`: Drag and drop for kanban
- `@caldwell619/react-kanban@0.0.12`: Kanban board UI
- `sanitize-html@2.17.0`: HTML sanitization for XSS protection
- `qrcode@1.5.4`: QR code generation for 2FA
- `speakeasy@2.0.0`: TOTP for two-factor authentication
- `react-hotkeys-hook@5.2.1`: Keyboard shortcuts management
- `@mumulhl/duckduckgo-ai-chat@3.3.0`: Privacy-first AI assistant
- `mathjs@15.1.0`: Calculator mathematical expressions
- `katex@0.16.27`: LaTeX math rendering
- `highlight.js@11.11.1`: Syntax highlighting for code blocks
- `react-markdown@10.1.0`: Markdown rendering
- `react-signature-canvas@1.1.0-alpha.2`: Handwritten notes canvas
- `fast-xml-parser@5.3.2`: XML parsing for Evernote imports
- `@sentry/nextjs@10.29.0`: Error tracking and performance monitoring
- `@vercel/analytics@1.6.1`: Web analytics (GDPR compliant)
- `@lingo.dev/_sdk@0.13.4`: Multi-language translation service

#### Database Schema Updates
- **User Model Extended**:
  - `twoFactorEnabled`: Boolean flag for 2FA status
  - `twoFactorSecret`: TOTP secret for 2FA
  - `backupCodes`: Array of single-use backup codes
  - `encryptionEnabled`: Toggle for encryption (default: true)
  - `languagePreference`: User's selected language code
- **Document Model Extended**:
  - `emojiIcon`: Emoji identifier for documents
  - `type`: Document type (doc/board/quick/handwritten)
  - `embedPreviews`: Cached URL preview metadata
  - `isQuickReadSaved`: Quick read mode state
  - `readOnly`: Boolean flag for read-only mode
  - `passwordProtected`: Boolean flag for password protection
  - `passwordHash`: Bcrypt hash of document password
  - `archived`: Boolean flag for archived documents
  - `metadata.backgroundColor`: Background color for visual organization

#### API Endpoints
- **Authentication**:
  - `/api/auth/login` - User login
  - `/api/auth/signup` - User registration
  - `/api/auth/logout` - User logout
  - `/api/auth/session` - Session validation
  - `/api/auth/2fa/setup` - Initialize 2FA setup
  - `/api/auth/2fa/verify` - Verify TOTP token
  - `/api/auth/2fa/enable` - Enable 2FA after verification
  - `/api/auth/2fa/disable` - Disable 2FA (requires password)
  - `/api/auth/2fa/status` - Check 2FA status
  - `/api/auth/2fa/login` - Complete login with 2FA
- **Documents**:
  - `/api/documents` - Document CRUD operations
  - `/api/documents/[id]` - Single document operations
  - `/api/documents/[id]/lock` - Set password protection
  - `/api/documents/[id]/unlock` - Remove password protection
  - `/api/documents/[id]/verify-password` - Verify document password
  - `/api/docs` - Document metadata operations
  - `/api/docs/content` - Document content operations
- **Workspaces**:
  - `/api/workspaces` - Workspace management
- **Sharing**:
  - `/api/shares` - Create, retrieve, update, and revoke share tokens
  - `/api/share` - Public share access
- **Features**:
  - `/api/templates` - Template operations
  - `/api/backlinks` - Backlink indexing and retrieval
  - `/api/embed` - URL embed preview generation
  - `/api/analytics` - Privacy-respecting analytics events
  - `/api/translate` - Multi-language translation
  - `/api/settings` - User settings (encryption, language, etc.)

#### Security
- **Client-Side Only Encryption**: All encryption happens in browser
- **Rate Limiting**: Share creation (10 per 15 min), 2FA login attempts (5 per 15 min)
- **Input Validation**: All inputs validated before processing
- **HTML Sanitization**: XSS protection for embed previews
- **Password Hashing**: bcrypt with cost factor 10
- **Session Security**: HTTP-only, secure cookies with JWT
- **CSRF Protection**: Built into Next.js framework
- **No Secret Exposure**: Never log or expose sensitive data
- **Token Ownership Verification**: Verify user owns resources before access
- **Privacy-First Design**: Server never sees plaintext content

### Documentation

#### Comprehensive Guides
- **Getting Started**: introduction.md, installation.md, quickstart.md
- **Feature Guides**: ai-assistant.md, bot-protection.md, community-features.md, editor.md, export-backup.md, handwritten-notes.md, import.md, kanban.md, math-search-features.md, quick-note.md, reader-mode.md, security-privacy.md, sharing.md, shortcuts.md, templates.md, translation.md, troubleshooting.md
- **Advanced Topics**: encryption.md, performance.md, self-hosting.md, theming.md
- **Architecture**: api-reference.md, architecture.md, database-schema.md, deployment.md, security-architecture.md
- **Special Docs**: VIM_MODE.md, NEW_FEATURES.md

#### Project Documentation
- **README.md**: Comprehensive feature list and setup guide
- **RELEASE.md**: Alpha release notes (this file)
- **CHANGELOG.md**: Version-by-version change tracking
- **CONTRIBUTING.md**: Contribution guidelines
- **CODE_OF_CONDUCT.md**: Community standards
- **SECURITY.md**: Security policy and vulnerability reporting

### CI/CD & Monitoring

#### Docker & Deployment
- **Multi-Stage Docker Build**: Optimized image with Next.js standalone mode
- **Docker Compose**: Full stack with MongoDB and Redis
- **Debug Profile**: Optional Mongo Express for database management
- **Health Checks**: Container health monitoring
- **Environment Configuration**: Flexible environment variable setup

#### Monitoring & Observability
- **Sentry Integration**: Error tracking and performance monitoring
  - Automatic error capture and reporting
  - Performance monitoring for slow operations
  - Source maps uploaded in CI for readable stack traces
  - Tunnel route (`/monitoring`) to bypass ad-blockers
  - Vercel Cron Monitors enabled
- **Vercel Analytics**: Web analytics and speed insights
  - GDPR compliant analytics
  - Real user monitoring (RUM)
  - No personal data collection
- **Custom Logging**: Structured logging with request tracking
  - Log levels: debug, info, warn, error
  - Context tracking with request IDs
  - Privacy-safe (no sensitive data logged)

#### Testing
- **Playwright**: E2E and unit testing framework
  - Multiple viewport testing (mobile, tablet, desktop)
  - Network mocking for API testing
  - Accessibility testing
  - Keyboard navigation tests
- **Test Commands**: 
  - `npm test` - Run all tests
  - `npm run test:unit` - Unit tests only
  - `npm run test:e2e` - E2E tests only
  - `npm run test:ui` - Playwright UI mode
  - `npm run test:headed` - Visible browser mode
  - `npm run test:debug` - Debug mode

#### CI/CD Pipeline
- **GitHub Actions**: Continuous integration workflow
- **Linting**: ESLint 9 with Next.js config
- **Type Checking**: TypeScript compilation
- **Build Verification**: Next.js build validation
- **Dockerfile**: With healthcheck for production

### Known Limitations (Alpha)
- Redis is optional; if not configured, share tokens will be unavailable
- Summarizer endpoint is disabled by default (privacy-first approach)
- Quick note sync requires active workspace session
- Vim mode limited to BlockNote editor capabilities
- Backlinks require exact title match (case-sensitive)
- Version history limited to 50 versions per document
- PWA offline mode requires initial online visit
- Translation requires lingo.dev API key (optional feature)
- Master key storage uses base64 encoding; post-alpha will implement PBKDF2-based password encryption
- Handwritten notes have fixed canvas size (no zoom/pan)
- Calculator LaTeX display is basic (no advanced formatting)

### Upcoming Features (Post-Alpha)
- **Collaboration**: Real-time collaborative editing
- **Mobile Apps**: Native iOS and Android applications
- **Search Enhancements**: Date range filters, search operators, saved searches
- **Document Features**: Graph view of relationships, version comparison (diff), more templates
- **PWA Improvements**: Push notifications, better background sync
- **Languages**: Phase 2 languages (Tamil, Mandarin, Russian, French, German)
- **Authentication**: Biometric authentication, hardware key (FIDO2) support
- **Handwritten Notes**: OCR for handwriting-to-text, multi-page support, shape tools
- **Translation**: Offline translation models, custom translations
- **Export/Import**: More formats, batch operations
- **Customization**: Theme customization, custom keyboard shortcuts

### Breaking Changes
None (first release)

### Migration Notes
This is the first release. No migration required.

---

**Privacy First**: 4diary is built with privacy at its core. Your documents are encrypted on your device before being sent to the server. The server never has access to your encryption keys or plaintext content. We cannot read your notes, and neither can anyone else without your password.

**Feedback Welcome**: This is an alpha release. Please report issues and share feedback at https://github.com/Harsha-Bhattacharyya/4diary/issues

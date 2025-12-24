# 4diary Features Summary

**Version:** 0.1.0-alpha  
**Last Updated:** December 24, 2025

This document provides a comprehensive overview of all features available in 4diary.

## Table of Contents

- [Quick Reference](#quick-reference)
- [Core Features](#core-features)
- [Privacy & Security](#privacy--security)
- [Document Management](#document-management)
- [Advanced Features](#advanced-features)
- [AI & Intelligence](#ai--intelligence)
- [Import & Export](#import--export)
- [Collaboration](#collaboration)
- [Customization](#customization)
- [Technical Features](#technical-features)
- [Keyboard Shortcuts](#keyboard-shortcuts)

---

## Quick Reference

### Feature Checklist

✅ = Fully implemented  
🚧 = In development  
📋 = Planned for future release

| Feature | Status | Description |
|---------|--------|-------------|
| End-to-End Encryption | ✅ | AES-256-GCM encryption with zero-knowledge architecture |
| Two-Factor Authentication | ✅ | TOTP-based 2FA with backup codes |
| Vim Mode | ✅ | Full Vim keybindings with 4 modes |
| AI Assistant | ✅ | Privacy-first AI powered by DuckDuckGo |
| Handwritten Notes | ✅ | Drawing canvas with encryption support |
| Kanban Boards | ✅ | Drag-and-drop task management |
| Backlinks | ✅ | Bidirectional wiki-style linking |
| Version History | ✅ | Automatic versioning (last 50 versions) |
| Calendar View | ✅ | Date-based document organization |
| PWA Support | ✅ | Installable with offline capabilities |
| Multi-Language | ✅ | English, Bengali, Hindi |
| Calculator | ✅ | Built-in math calculator with LaTeX |
| Search | ✅ | Powerful fuzzy search |
| LaTeX Math | ✅ | Inline and display math notation |
| Syntax Highlighting | ✅ | 50+ languages supported |
| Import | ✅ | Google Keep, Evernote, Notion, more |
| Export | ✅ | Markdown, ZIP, PNG formats |
| Share Links | ✅ | Ephemeral time-limited sharing |
| Background Colors | ✅ | 12 Google Keep-style colors |
| Read-Only Mode | ✅ | Lock documents to prevent edits |
| Password Protection | ✅ | Per-document password protection |
| Real-time Collaboration | 📋 | Planned for post-alpha |
| Mobile Apps | 📋 | Native iOS/Android apps planned |
| Graph View | 📋 | Visual document relationship graph |

---

## Core Features

### 1. End-to-End Encryption

**Zero-Knowledge Architecture**

- **Encryption**: AES-256-GCM using Web Crypto API
- **Key Management**: Master keys generated in browser, stored in IndexedDB only
- **Document Keys**: Each document has its own encryption key
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Server Knowledge**: Server never sees unencrypted content or keys

**What's Encrypted:**
- All document content
- Document keys (encrypted with master key)
- Kanban board data
- Handwritten notes (as base64 PNG)

**What's NOT Encrypted:**
- Document metadata (title, tags, folder) - needed for search
- User email and authentication data
- Share token metadata

### 2. Authentication System

**Email-Based Authentication**
- Secure sign-up with bcrypt password hashing (cost factor 10)
- Session management with JWT tokens (jose library)
- HTTP-only, secure session cookies

**Two-Factor Authentication (2FA)**
- TOTP-based (works with Google Authenticator, Authy, etc.)
- QR code setup for easy configuration
- 10 single-use backup codes for recovery
- Rate limiting: 5 attempts per 15 minutes
- Self-hosted compatible (no external dependencies)

**Optional Bot Protection**
- Cloudflare Turnstile integration
- Fully optional and self-hostable
- Easy to enable/disable via environment variables

---

## Privacy & Security

### Security Features

1. **Client-Side Encryption**: All encryption happens in the browser
2. **Rate Limiting**: 
   - Share creation: 10 per 15 minutes
   - 2FA login: 5 attempts per 15 minutes
3. **Input Validation**: All inputs validated before processing
4. **HTML Sanitization**: XSS protection for embed previews (sanitize-html)
5. **Password Hashing**: bcrypt with cost factor 10
6. **Session Security**: HTTP-only, secure cookies
7. **CSRF Protection**: Built into Next.js framework
8. **No Secret Logging**: Never log sensitive data

### Privacy Features

1. **Zero-Knowledge**: Server cannot read your content
2. **No Telemetry**: Privacy-respecting analytics only (opt-in)
3. **Local Processing**: Version history stored locally in IndexedDB
4. **Encryption Toggle**: Control encryption for new documents
5. **Self-Hosting**: Full control of your data

---

## Document Management

### 1. Rich Text Editor

**BlockNote Integration**
- Notion-like editing experience
- Full formatting toolbar (bold, italic, underline, etc.)
- Headers (H1, H2, H3)
- Lists (ordered, unordered, todo)
- Code blocks with syntax highlighting
- Block quotes
- Tables
- Images
- Auto-save with change detection

**LaTeX Math Notation**
- Inline math: `$E = mc^2$`
- Display math: `$$\int_{0}^{\infty} e^{-x^2} dx$$`
- Full LaTeX support (Greek letters, operators, fractions, matrices)
- Rendered with KaTeX

**Syntax Highlighting**
- 50+ languages supported
- Powered by highlight.js
- Custom leather-themed highlighting
- Auto-detection of language

### 2. Document Types

**Regular Documents**
- Rich text with full encryption
- Supports all editor features

**Kanban Boards**
- Drag-and-drop task management
- Column-based (To Do, In Progress, Done)
- Card state management
- Fully encrypted
- Powered by @hello-pangea/dnd

**Quick Notes**
- Lightning-fast capture (Ctrl/Cmd + Q)
- Local-first auto-save
- Sync to workspace when ready
- Minimal UI for distraction-free writing

**Handwritten Notes**
- Drawing canvas with pen and eraser tools
- 7 preset colors
- 4 pen widths (thin, medium, thick, bold)
- Undo and clear functions
- Mouse and touch input
- Export as PNG
- Stored as encrypted base64 PNG

### 3. Document Organization

**Folders**
- Hierarchical folder structure
- Drag documents between folders
- Filter by folder

**Tags**
- Tag documents for categorization
- Multi-tag support
- Filter by tags
- Searchable

**Favorites**
- Mark important documents
- Quick access from sidebar

**Archive**
- Archive documents without deleting
- Hidden from main list
- Reversible

**Emoji Icons**
- Custom emoji per document
- Integrated emoji picker
- Visual identification

**Background Colors**
- 12 Google Keep-style colors
- Instant visual organization
- Colors: Coral, Peach, Sand, Mint, Sage, Fog, Storm, Dusk, Blossom, Clay, Chalk

### 4. Advanced Document Features

**Backlinks (Bidirectional Linking)**
- Wiki-style syntax: `[[Document Title]]`
- Automatic link detection
- Backlinks sidebar shows incoming links
- Navigate between linked documents
- Build knowledge graphs

**Version History**
- Automatic versioning on save
- Last 50 versions per document
- Stored in browser's IndexedDB
- Preview previous versions
- Restore any version
- Client-side only (zero-knowledge maintained)

**Calendar View**
- Monthly calendar navigation
- Visual indicators for document days
- Toggle between list and calendar
- Date-based organization

**Read-Only Mode**
- Lock documents to prevent edits
- Visual "🔒 Read-Only" badge
- Reversible toggle

**Password Protection**
- Per-document password protection
- Bcrypt hashing (10 rounds)
- Independent of account password
- Cannot be recovered if forgotten

### 5. Vim Mode

**Full Vim Keybindings**
- Four modes: NORMAL, INSERT, REPLACE, COMMAND
- Visual modes: Character-wise and line-wise
- Navigation: hjkl, w, b, e, 0, $, gg, G
- Count prefixes: 5j, 3w, 2dd
- Editing: d, y, p, c, x, r
- Command mode: :wq, :q, :x
- Visual indicator with color coding
- Toggle: Ctrl+Shift+V

---

## Advanced Features

### 1. Quick Read (Reader Mode)

**Distraction-Free Reading**
- Clean, focused interface
- Adjustable font size (A-/A+)
- Full-screen mode
- Exit with ESC or close button

### 2. Templates

**Pre-Built Templates**
- Categories: journal, work, productivity
- Quick start for common document types
- Save custom templates

### 3. Embed Previews

**Rich URL Previews**
- Automatic metadata extraction
- OG/meta tag parsing
- Image previews
- Sanitized HTML (XSS protected)
- Cached for performance

---

## AI & Intelligence

### 1. AI Assistant

**Privacy-First AI**
- Powered by DuckDuckGo AI Chat
- Context-aware (understands current document)
- No API keys required
- Zero data retention (not stored or used for training)
- Keyboard shortcut: Ctrl+Shift+A
- Floating ✨ button for easy access

**Capabilities:**
- Writing help and suggestions
- Content generation
- Editing and proofreading
- Research and brainstorming
- Question answering

### 2. Built-in Calculator

**Mathematical Expressions**
- Full math.js support
- Functions: sqrt, sin, cos, tan, log, abs, exp, pow
- Constants: pi, e
- LaTeX display mode
- Calculation history (last 10)
- Insert results to editor
- Keyboard shortcut: Ctrl+Shift+C

### 3. Powerful Search

**Fuzzy Search**
- Find results even with typos
- Relevance scoring
- Visual highlights in results

**Search Filters:**
- All (search everything)
- Title only
- Content only
- Tags only
- Folder only

**Features:**
- Keyboard navigation (arrow keys, Enter)
- Client-side search (on decrypted content)
- Privacy-safe
- Keyboard shortcut: Ctrl/Cmd+Shift+F

---

## Import & Export

### Import Support

**Supported Formats:**
1. **Markdown** (.md files)
2. **Google Keep** (Google Takeout export)
3. **Evernote** (.enex files)
4. **Notion** (exported workspace)
5. **Standard Notes** (backup files)
6. **Apple Notes** (HTML/text export)

**Features:**
- Auto-detection of format
- Batch import (multiple files)
- Preview before import
- Content encrypted on import

### Export Functionality

**Export Options:**
1. **Markdown**: Individual documents as .md files
2. **Workspace ZIP**: Full workspace with folder structure
3. **PNG**: Handwritten notes as images

**Features:**
- Client-side decryption for export
- Metadata preservation
- Folder structure maintained
- Privacy-safe (no server involvement)

---

## Collaboration

### Ephemeral Share Links

**Time-Limited Sharing**
- Create temporary share links
- Default 24-hour expiry
- Custom TTL support

**Features:**
- Granular permissions (view or edit)
- Revocable tokens (instant revoke)
- Rate limiting (10 shares per 15 min)
- Privacy-first (content remains encrypted)
- Redis-powered with automatic cleanup

**Limitations:**
- Requires Redis to be configured
- Share links are temporary only

---

## Customization

### UI/UX Customization

**Leather Theme**
- Rich, warm color palette
- Custom gradients
- Glass card effects
- Shadow variations

**Document Customization:**
- Background colors (12 options)
- Emoji icons
- Custom titles
- Adjustable font size (reader mode)

**Editor Preferences:**
- Full-screen mode
- Vim mode toggle
- Toolbar visibility
- Auto-save intervals

### Language Support

**Available Languages (Phase 1):**
- English (en)
- Bengali (bn) - বাংলা
- Hindi (hi) - हिन्दी

**Coming Soon (Phase 2):**
- Tamil, Mandarin, Russian, French, German

**Features:**
- lingo.dev integration
- In-memory caching (1000 translations)
- Batch processing
- Optional (works without API key)

---

## Technical Features

### Progressive Web App (PWA)

**Installation**
- Install on desktop and mobile
- Native app-like experience
- Custom icons and splash screens

**Offline Support**
- Access documents without internet
- Edit offline
- Automatic sync when back online
- Service worker caching

**Performance**
- Fast loading (cached resources)
- Background sync
- Automatic updates

### Monitoring & Observability

**Sentry Integration**
- Error tracking and reporting
- Performance monitoring
- Source maps for readable traces
- Tunnel route to bypass ad-blockers

**Vercel Analytics**
- Web analytics (GDPR compliant)
- Real user monitoring (RUM)
- Speed insights
- No personal data collection

**Custom Logging**
- Structured logging
- Request tracking with IDs
- Log levels: debug, info, warn, error
- Privacy-safe (no sensitive data)

### Testing

**Playwright Testing**
- E2E tests
- Unit tests
- Multiple viewport testing
- Accessibility testing
- Keyboard navigation tests

**Test Commands:**
- `npm test` - All tests
- `npm run test:unit` - Unit tests
- `npm run test:e2e` - E2E tests
- `npm run test:ui` - Playwright UI
- `npm run test:headed` - Visible browser
- `npm run test:debug` - Debug mode

---

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Q` / `Cmd+Q` | Toggle Quick Note |
| `Ctrl+Shift+A` | Toggle AI Assistant |
| `Ctrl+Shift+V` | Toggle Vim Mode |
| `Ctrl+Shift+C` | Open Calculator |
| `Ctrl/Cmd+Shift+F` | Open Search |
| `ESC` | Close modal (Quick Note, AI, Reader Mode, etc.) |

### Editor Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` / `Cmd+B` | Bold |
| `Ctrl+I` / `Cmd+I` | Italic |
| `Ctrl+U` / `Cmd+U` | Underline |
| `Ctrl+K` / `Cmd+K` | Add link |
| `Ctrl+S` / `Cmd+S` | Save (auto-save enabled) |

### Vim Mode Shortcuts

| Key | Action (Normal Mode) |
|-----|---------------------|
| `h` | Move left |
| `j` | Move down |
| `k` | Move up |
| `l` | Move right |
| `w` | Word forward |
| `b` | Word backward |
| `0` | Start of line |
| `$` | End of line |
| `gg` | Start of document |
| `G` | End of document |
| `dd` | Delete line |
| `yy` | Copy line |
| `p` | Paste |
| `u` | Undo |
| `Ctrl+r` | Redo |
| `i` | Enter INSERT mode |
| `v` | Enter VISUAL mode |
| `:wq` | Save and quit |

### Search Shortcuts

| Shortcut | Action |
|----------|--------|
| `↑` / `↓` | Navigate results |
| `Enter` | Open selected document |
| `ESC` | Close search |

### Calculator Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Calculate expression |
| `ESC` | Close calculator |

---

## Feature Comparison

### vs. Notion

| Feature | 4diary | Notion |
|---------|--------|--------|
| End-to-End Encryption | ✅ | ❌ |
| Offline Support | ✅ | Limited |
| Self-Hosting | ✅ | ❌ |
| Vim Mode | ✅ | ❌ |
| Backlinks | ✅ | ✅ |
| AI Assistant | ✅ (Privacy-first) | ✅ (Cloud-based) |
| Version History | ✅ | ✅ (Paid) |
| Handwritten Notes | ✅ | ❌ |
| Kanban Boards | ✅ | ✅ |
| LaTeX Math | ✅ | ✅ |
| Multi-Language | ✅ | Partial |

### vs. Standard Notes

| Feature | 4diary | Standard Notes |
|---------|--------|----------------|
| End-to-End Encryption | ✅ | ✅ |
| Rich Text Editor | ✅ | ✅ (Paid) |
| Vim Mode | ✅ | ❌ |
| Kanban Boards | ✅ | ❌ |
| AI Assistant | ✅ | ❌ |
| Handwritten Notes | ✅ | ❌ |
| Self-Hosting | ✅ | ✅ |
| Calendar View | ✅ | ❌ |
| Version History | ✅ | ✅ (Paid) |

---

## API Overview

### Authentication APIs
- `/api/auth/login` - User login
- `/api/auth/signup` - User registration
- `/api/auth/logout` - User logout
- `/api/auth/session` - Session validation
- `/api/auth/2fa/*` - Two-factor authentication

### Document APIs
- `/api/documents` - CRUD operations
- `/api/documents/[id]` - Single document
- `/api/documents/[id]/lock` - Password protection
- `/api/docs` - Metadata operations
- `/api/docs/content` - Content operations

### Feature APIs
- `/api/shares` - Share token management
- `/api/templates` - Template operations
- `/api/backlinks` - Backlink indexing
- `/api/embed` - URL embed previews
- `/api/translate` - Multi-language translation
- `/api/analytics` - Privacy-respecting analytics
- `/api/settings` - User settings

---

## Deployment Options

### Docker (Recommended)

**Features:**
- Multi-stage build for optimization
- Standalone Next.js mode
- Includes MongoDB and Redis
- Health checks
- Debug profile with Mongo Express

**Commands:**
```bash
docker-compose up -d
docker-compose --profile debug up -d
```

### Vercel

**Features:**
- One-click deployment
- Automatic SSL
- Global CDN
- Environment variable support

### Manual Deployment

**Requirements:**
- Node.js 20+
- MongoDB 7.0+
- Redis (optional)

**Commands:**
```bash
npm run build
npm start
```

---

## Known Limitations

### Alpha Release Limitations

1. **Redis Optional**: Share tokens unavailable without Redis
2. **Version Limit**: Last 50 versions per document
3. **PWA**: Initial online visit required
4. **Backlinks**: Case-sensitive exact match
5. **Vim Mode**: Limited to BlockNote capabilities
6. **Translation**: Requires lingo.dev API key (optional)
7. **Master Keys**: Base64 encoding (PBKDF2 planned)

### Future Improvements

Planned for post-alpha releases:
- Real-time collaboration
- Native mobile apps
- Graph view of relationships
- Version comparison (diff view)
- More languages
- Biometric authentication
- OCR for handwritten notes
- Multi-page handwritten notes

---

## Getting Help

### Documentation

- **Main README**: [README.md](../README.md)
- **Release Notes**: [RELEASE.md](../RELEASE.md)
- **Changelog**: [CHANGELOG.md](../CHANGELOG.md)
- **Guides**: [docs/guides/](./guides/)
- **Architecture**: [docs/architecture/](./architecture/)

### Support Channels

- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share ideas
- **Documentation**: Comprehensive guides for all features

### Contributing

- **Contributing Guide**: [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Code of Conduct**: [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)
- **Security Policy**: [SECURITY.md](../SECURITY.md)

---

## License

4diary is open-source software licensed under the BSD-3-Clause License.
See [LICENSE](../LICENSE) for details.

---

**Last Updated:** December 24, 2025  
**Version:** 0.1.0-alpha  
**Project:** [github.com/Harsha-Bhattacharyya/4diary](https://github.com/Harsha-Bhattacharyya/4diary)

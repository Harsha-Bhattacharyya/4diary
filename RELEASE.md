# 4diary Release Notes

## v0.1.0-alpha (Alpha Release)

**Release Date:** 2025-11-13

This is the first alpha release of 4diary, featuring core privacy-first E2EE functionality and advanced collaboration features.

### New Features

#### 🔐 Privacy & Security
- **End-to-End Encryption (E2EE)**: All document content and keys are encrypted client-side. Server never sees plaintext.
- **Email-based Authentication**: Secure sign-up and login with session cookies
- **Session Management**: Session validation and secure logout

#### 📤 Sharing & Collaboration
- **Ephemeral Share Links**: Create temporary share links with 24-hour expiry (feature #4)
  - Token-based sharing via Redis
  - Granular permissions (view/edit)
  - Revocable tokens with TTL management
  - Rate limiting for security
  - Server never accesses plaintext content

#### 📝 Document Features
- **Emoji Icons**: Add emoji icons to documents for quick visual identification (feature #6)
  - Integrated emoji picker UI
  - Stored in document metadata
  
- **Kanban Boards**: Full kanban board support with drag-and-drop (feature #7)
  - Board type stored encrypted
  - Columns and cards UI
  - Real-time auto-save
  - Same E2EE model as documents

- **Quick Note**: Lightning-fast note capture (feature #8)
  - Hotkey activation (Ctrl/Cmd + Q)
  - Local-first auto-save to browser storage
  - Optional sync to workspace when ready
  - Minimal, distraction-free UI

- **Quick Read**: Reader mode for distraction-free reading (feature #9)
  - Clean, focused reading interface
  - Adjustable font size
  - Optional privacy-preserving summarizer (disabled by default)

- **Embed Previews**: Rich URL previews with privacy controls (feature #10)
  - Server-side preview fetcher
  - Sanitized HTML to prevent XSS
  - OG/meta tag parsing
  - Optional full-page embed with user consent

#### 🎨 UI/UX
- **Leather Theme**: Rich, warm color palette inspired by leather journals
- **Full-screen Editor**: Distraction-free editing experience
- **Formatting Toolbar**: Rich text editing with BlockNote
- **Card-based Workspace**: Modern, organized workspace layout
- **Top Navigation**: Streamlined navigation across features

#### 📄 Pages
- Documentation page
- About page
- Authentication pages
- Templates gallery
- Workspace management
- Settings

### Technical Improvements

#### Dependencies Added
- `ioredis`: Redis client for ephemeral share tokens
- `emoji-picker-react`: Emoji picker component
- `@asseinfo/react-kanban`: Kanban board UI
- `react-hotkeys-hook`: Keyboard shortcuts
- `sanitize-html`: HTML sanitization for security
- `uuid`: Secure token generation

#### Database Schema Updates
- Extended document metadata to support:
  - `emojiIcon`: Emoji identifier for documents
  - `type`: Document type (doc/board/quick)
  - `embedPreviews`: Cached URL preview metadata
  - `isQuickReadSaved`: Quick read mode state

#### API Endpoints
- `/api/shares`: Create, retrieve, update, and revoke share tokens
- `/api/embed`: Fetch and sanitize URL previews

#### Security
- Rate limiting on share creation
- Token ownership verification
- HTML sanitization for embed previews
- Privacy-first design: server never sees plaintext

### Documentation
- CONTRIBUTING.md: Contribution guidelines
- CODE_OF_CONDUCT.md: Community standards
- Updated README with new features

### CI/CD
- GitHub Actions workflow for continuous integration
- Dockerfile with healthcheck
- Improved database connection robustness

### Known Limitations (Alpha)
- Redis is optional; if not configured, share tokens will be unavailable
- Summarizer endpoint is disabled by default (privacy-first approach)
- Quick note sync requires active workspace session
- Some edge cases in kanban board drag-and-drop may need refinement
- Master key storage uses base64 encoding; post-alpha will implement PBKDF2-based password encryption

### Upcoming Features (Post-Alpha)
- Real-time collaboration
- Mobile app
- Offline-first PWA support
- Advanced search and filtering
- Document versioning
- More templates

### Breaking Changes
None (first release)

### Migration Notes
This is the first release. No migration required.

---

**Privacy First**: 4diary is built with privacy at its core. Your documents are encrypted on your device before being sent to the server. The server never has access to your encryption keys or plaintext content. We cannot read your notes, and neither can anyone else without your password.

**Feedback Welcome**: This is an alpha release. Please report issues and share feedback at https://github.com/Harsha-Bhattacharyya/4diary/issues

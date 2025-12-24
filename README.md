# 4Diary
> 🏆 **Hack This Fall 2025 Project** - A privacy-focused, end-to-end encrypted note-taking application built with Next.js.

A privacy-focused, end-to-end encrypted note-taking application built with Next.js. Think Notion, but with military-grade encryption and complete privacy.

## ✨ Features

### Core Privacy & Security
- 🔒 **End-to-End Encryption**: AES-256-GCM encryption using Web Crypto API
- 🔐 **Zero Knowledge**: Server never sees unencrypted content
- 🔑 **Email Authentication**: Secure sign-up and login with session cookies
- 🤖 **Optional Bot Protection**: Cloudflare Turnstile for login (optional, self-hostable)

### Document Management
- ✍️ **Notion-like Editor**: Rich text editing with BlockNote
- ✏️ **Handwritten Notes**: Draw and save handwritten notes with encryption support
- 🤖 **AI Assistant**: Privacy-first AI chat powered by DuckDuckGo (Ctrl+Shift+A)
- ⌨️ **Vim Mode**: Full Vim keybindings support (Ctrl+Shift+V to toggle)
- 📁 **Smart Organization**: Folders, tags, favorites, and archives
- 📄 **Templates**: Pre-built templates for various use cases
- 😀 **Emoji Icons**: Visual identification with emoji document icons
- ⚡ **Quick Note**: Lightning-fast note capture (Ctrl/Cmd + Q)
- 📖 **Quick Read**: Distraction-free reader mode
- 🔗 **Backlinks**: Bidirectional linking with [[wiki-style]] syntax
- 📅 **Calendar View**: Organize and view documents by date
- 📚 **Version History**: Track changes and restore previous versions

### Collaboration & Sharing
- 🔗 **Ephemeral Share Links**: Secure, time-limited sharing (24-hour default)
- 🔓 **Granular Permissions**: View or edit permissions for shared documents
- 🚫 **Revocable Tokens**: Instantly revoke share access
- 🔄 **Privacy-First**: Shared content remains encrypted end-to-end

### Advanced Features
- 📋 **Kanban Boards**: Drag-and-drop task management with encrypted boards
- 🎨 **Drawing Canvas**: Full-featured handwriting support with colors, pen widths, and tools
- 🔗 **Embed Previews**: Rich URL previews with sanitized metadata
- 📥 **Import Notes**: Import from Google Keep, Evernote, Notion, Apple Notes, Standard Notes, or Markdown
- 📤 **Export Freedom**: Export as Markdown, PNG (handwritten), or ZIP files
- 📦 **Self-Hostable**: Docker-ready deployment with no vendor lock-in
- 📱 **PWA Support**: Install as a progressive web app with offline capabilities
- 🌍 **Multi-Language**: Support for English, Bengali, Hindi (more languages coming soon)
- 🔢 **Built-in Calculator**: Quick math calculations with LaTeX support (Ctrl+Shift+C)
- 🔍 **Powerful Search**: Fuzzy search across all documents with filters (Ctrl/Cmd + Shift + F)
- 📐 **LaTeX Math Notation**: Render mathematical expressions inline (`$...$`) and display mode (`$$...$$`)
- 💻 **Syntax Highlighting**: Enhanced code block highlighting for multiple languages

### UI/UX
- 🎨 **Leather Theme**: Rich, warm color palette inspired by leather journals
- 🖥️ **Full-screen Editor**: Distraction-free editing experience
- 🎯 **Keyboard Shortcuts**: Quick note (Ctrl/Cmd + Q), Vim mode (Ctrl+Shift+V), AI Assistant (Ctrl+Shift+A), Calculator (Ctrl+Shift+C), Search (Ctrl/Cmd + Shift + F)

## 🚀 Getting Started

### ⚡ Quick Install (Recommended)

The easiest way to get started is using our interactive installer:

```bash
curl -fsSL https://raw.githubusercontent.com/Harsha-Bhattacharyya/4diary/main/install.sh | bash
```

Or download and run manually:

```bash
wget https://raw.githubusercontent.com/Harsha-Bhattacharyya/4diary/main/install.sh
chmod +x install.sh
./install.sh
```

The installer will:
- ✅ Check system requirements
- ✅ Guide you through configuration
- ✅ Set up Docker or local development environment
- ✅ Configure MongoDB, Redis, and other services
- ✅ Generate all necessary configuration files

### Prerequisites

- Node.js 20+ 
- MongoDB (local or MongoDB Atlas)
- Redis (optional, for share tokens feature)
- pnpm (recommended package manager)

### Manual Development Setup

1. Clone the repository:
```bash
git clone https://github.com/Harsha-Bhattacharyya/4diary.git
cd 4diary
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local with your configuration
# Required:
MONGODB_URI=mongodb://localhost:27017/4diary

# Optional (for share tokens feature):
REDIS_URL=redis://localhost:6379

# Optional (for multi-language support):
LINGO_API_KEY=your_lingo_api_key_here

# Optional:
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Run the development server:
```bash
pnpm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🐳 Self-Hosting with Docker

### Using Docker Compose (Recommended)

1. Clone the repository
2. Export your MongoDB URI, Redis configuration, and desired port as environment variables
3. Run:

```bash
docker compose up -d
```

This will start:
- Next.js app on port 3000
- MongoDB on port 27017
- Redis on port 6379

### With Database Management UI

To also run Mongo Express for database management:

```bash
docker-compose --profile debug up -d
```

Access Mongo Express at http://localhost:8081 (default credentials: admin/changeme)

### Production Deployment

For production, update the `docker-compose.yml` with:
- Secure MongoDB credentials
- Environment-specific configurations
- SSL/TLS certificates
- Reverse proxy setup (nginx/Caddy)

## 🏗️ Architecture

### Encryption Flow

1. **Master Key Generation**: Generated in browser, stored in IndexedDB
2. **Document Keys**: Each document has its own encryption key
3. **Key Encryption**: Document keys are encrypted with master key
4. **Content Encryption**: Document content encrypted with document key
5. **Server Storage**: Only encrypted data reaches the server

### Database Schema

- **workspaces**: User workspaces with encrypted master keys
- **documents**: Encrypted documents with searchable metadata (supports doc/board/quick types)
- **templates**: Document templates
- **analytics_events**: Privacy-respecting usage analytics
- **shares** (Redis): Ephemeral share tokens with TTL

## 📚 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Editor**: BlockNote
- **Database**: MongoDB
- **Cache/Tokens**: Redis (optional)
- **Encryption**: Web Crypto API
- **Animation**: Framer Motion
- **Export**: JSZip
- **Kanban**: @asseinfo/react-kanban
- **Emoji Picker**: emoji-picker-react
- **Monitoring**: Sentry (error tracking), Vercel Analytics (web analytics & speed insights)

## 🔐 Security

- Client-side only encryption
- AES-256-GCM encryption algorithm
- Master keys never leave the browser
- Server has zero knowledge of content
- PBKDF2 for password-based key derivation
- 100,000 iterations for key strengthening
- Rate limiting on share token creation
- HTML sanitization for embed previews

For information about reporting security vulnerabilities, supported versions, and security best practices, please see our [Security Policy](SECURITY.md).

## 📖 Usage

### Creating Documents

1. Navigate to the workspace
2. Click "New Document" or choose a template
3. Start writing - auto-save is enabled
4. Content is encrypted automatically before saving

### Quick Note (⚡ Fast Capture)

1. Press `Ctrl+Q` (or `Cmd+Q` on Mac) anywhere
2. Start typing - auto-saved locally
3. Click "Save to Workspace" when ready
4. Note is encrypted and synced to your workspace

### Vim Mode (⌨️ Power User Editing)

1. Press `Ctrl+Shift+V` in any editor to toggle Vim mode
2. Use standard Vim keybindings (hjkl for navigation, i for insert, etc.)
3. Support for 4 modes: NORMAL, INSERT, REPLACE, and COMMAND
4. Exit with `:wq`, `:q`, or `:x` commands
5. See [Vim Mode Documentation](docs/VIM_MODE.md) for complete guide

### Kanban Boards

1. Create a new document with type "board"
2. Organize tasks in columns (To Do, In Progress, Done)
3. Drag and drop cards between columns
4. Board data is fully encrypted like documents

### Sharing Documents

1. Open any document
2. Click the "Share" button
3. Configure permissions (view/edit) and expiry time
4. Copy the generated link
5. Share the link - it expires automatically after TTL
6. Revoke access anytime from share settings

### Using Templates

1. Go to Templates page
2. Browse categories (journal, work, productivity)
3. Click "Use Template" to start with pre-built structure
4. Customize to your needs

### Importing Notes

4Diary supports importing notes from popular apps:

1. Go to Workspace
2. Click "📥 Import" in Quick Actions
3. Select format (or use Auto-detect):
   - **Markdown** (.md files)
   - **Google Keep** (Google Takeout export)
   - **Evernote** (.enex files)
   - **Notion** (exported workspace)
   - **Standard Notes** (backup files)
   - **Apple Notes** (HTML/text export)
4. Drop or select your files
5. Preview imported notes
6. Click Import - notes are encrypted and saved

For detailed instructions, see [Import Guide](docs/guides/import.md).

### Exporting Data

1. Go to Settings
2. Click "Export Workspace"
3. Downloads ZIP with all documents as Markdown files
4. Maintains folder structure

### Reader Mode (Quick Read)

1. Open any document
2. Click the "Reader Mode" button
3. Adjust font size with A-/A+ buttons
4. Press ESC or click ✕ to exit

### Backlinks (Bidirectional Linking)

1. Create links using [[Document Title]] syntax in your documents
2. Links are automatically detected and indexed
3. View backlinks sidebar when editing a document
4. See all documents that link to the current page
5. Click any backlink to navigate to that document

### Calendar View

1. In the workspace, toggle between List and Calendar views
2. See all your documents organized by date
3. Navigate between months using arrow buttons
4. Click on any document to open it
5. Visual indicators show days with documents

### Version History

1. Open any document
2. Click the menu button (☰) → "Version History"
3. Browse previous versions of the document
4. Click on a version to preview it
5. Click "Restore" to revert to that version
6. Versions are saved automatically (keeps last 50 versions)

### Progressive Web App (PWA)

1. Visit the app in a supported browser (Chrome, Edge, Safari)
2. Look for the "Install" prompt or browser install button
3. Click install to add 4Diary to your device
4. Access the app from your home screen or app drawer
5. Works offline with automatic sync when back online

### AI Assistant (Privacy-First)

1. Open any document in edit mode
2. Click the sparkle ✨ button (bottom right) or press `Ctrl+Shift+A`
3. Ask questions, get writing suggestions, or request help
4. All queries are processed through DuckDuckGo's privacy-focused AI
5. No data is stored or used for training
6. No API keys or configuration required

### Handwritten Notes

1. Go to Workspace
2. Click "✍️ Handwritten" in Quick Actions
3. Use the drawing tools to create your note:
   - Select pen or eraser
   - Choose from 7 colors
   - Adjust pen width (thin/medium/thick/bold)
   - Undo last stroke or clear entire canvas
4. Click "Save" to encrypt and store your handwritten note
5. Download as PNG image anytime
6. Supports both mouse and touch input

### Bot Protection (Optional)

1. Get free Cloudflare Turnstile keys from https://dash.cloudflare.com/
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key-here
   TURNSTILE_SECRET_KEY=your-secret-key-here
   ```
3. Restart the app - Turnstile widget will appear on login page
4. To disable: simply remove the environment variables
5. Self-hosted instances work perfectly without Turnstile

## ⌨️ Keyboard Shortcuts

- `Ctrl+Q` / `Cmd+Q`: Toggle Quick Note modal
- `Ctrl+Shift+A`: Toggle AI Assistant
- `Ctrl+Shift+V`: Toggle Vim Mode
- `Ctrl+Shift+C`: Toggle Calculator
- `Ctrl/Cmd+Shift+F`: Toggle Search
- `ESC`: Close Quick Note, AI Assistant, or Reader Mode

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the BSD-3 Clause License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- BlockNote for the amazing editor
- Next.js team for the framework
- MongoDB for the database
- All open-source contributors

## 📞 Support

For issues and questions, please use the GitHub issue tracker.

---

Built with ♥️ in  🇮🇳

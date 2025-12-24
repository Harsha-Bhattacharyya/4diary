# 4diary Quick Reference Card

**Version:** 0.1.0-alpha

A one-page reference for the most commonly used features and shortcuts in 4diary.

---

## 🎯 Keyboard Shortcuts

### Essential Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Q` (or `Cmd+Q`) | Quick Note - Fast note capture |
| `Ctrl+Shift+A` | AI Assistant - Get writing help |
| `Ctrl+Shift+V` | Vim Mode - Toggle Vim keybindings |
| `Ctrl+Shift+C` | Calculator - Open math calculator |
| `Ctrl+Shift+F` (or `Cmd+Shift+F`) | Search - Find across all documents |
| `ESC` | Close any modal or overlay |

### Editor Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` (or `Cmd+B`) | **Bold** text |
| `Ctrl+I` (or `Cmd+I`) | *Italic* text |
| `Ctrl+U` (or `Cmd+U`) | Underline text |
| `Ctrl+K` (or `Cmd+K`) | Insert link |
| `/` | Open block menu |

### Vim Mode (when enabled)

| Key | Action |
|-----|--------|
| `i` | Enter INSERT mode |
| `ESC` | Return to NORMAL mode |
| `hjkl` | Navigate (left, down, up, right) |
| `dd` | Delete line |
| `yy` | Copy line |
| `p` | Paste |
| `:wq` | Save and exit Vim mode |

---

## 📝 Document Types

| Type | Description | How to Create |
|------|-------------|---------------|
| **Document** | Rich text note | Click "New Document" |
| **Kanban** | Task board | Choose "Kanban Board" template |
| **Quick Note** | Fast capture | Press `Ctrl+Q` |
| **Handwritten** | Drawing canvas | Click "✍️ Handwritten" in Quick Actions |

---

## 🎨 Document Organization

### Quick Actions

- **Folder**: Organize in folders (create in sidebar)
- **Tags**: Add tags for filtering (comma-separated)
- **Favorite**: Star icon to favorite
- **Archive**: Hide from main list (gear icon → Archive)
- **Emoji Icon**: Click emoji to change
- **Background Color**: Gear icon → Display Settings

### Available Colors

Coral • Peach • Sand • Mint • Sage • Fog • Storm • Dusk • Blossom • Clay • Chalk

---

## 🔐 Security Features

### Two-Factor Authentication (2FA)
- **Setup**: Settings → Security → Setup 2FA
- **Login**: Enter 6-digit code from authenticator app
- **Backup Codes**: Save 10 codes for emergency access

### Document Security
- **Password Protection**: Gear icon → Password Protection
- **Read-Only Mode**: Gear icon → Note State → Read-Only
- **Encryption**: All content encrypted by default (AES-256-GCM)

---

## 🤖 AI Assistant

**Open**: Click ✨ button or press `Ctrl+Shift+A`

### Common Prompts

- "Help me improve this paragraph"
- "Summarize this in bullet points"
- "Make this more concise"
- "Explain [concept] in simple terms"
- "Give me ideas for [topic]"

**Privacy**: Powered by DuckDuckGo AI - no data stored or used for training

---

## 🔢 Calculator

**Open**: Press `Ctrl+Shift+C`

### Supported Operations

- **Basic**: `+`, `-`, `*`, `/`, `^` (power)
- **Functions**: `sqrt(x)`, `sin(x)`, `cos(x)`, `tan(x)`, `log(x)`
- **Constants**: `pi`, `e`

### Examples
```
5 + 3 * 2        → 11
sqrt(16)         → 4
sin(pi/2)        → 1
2^8              → 256
```

---

## 🔍 Search

**Open**: Press `Ctrl+Shift+F` (or `Cmd+Shift+F`)

### Search Filters

- **All** - Search everything
- **Title** - Document titles only
- **Content** - Document content only
- **Tags** - Tags only
- **Folder** - Folder names only

**Navigation**: Use ↑/↓ arrows, press Enter to open

---

## 📐 LaTeX Math

### Inline Math
```
The formula $E = mc^2$ is Einstein's equation.
```

### Display Math
```
$$
\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

---

## 🔗 Backlinks

Create bidirectional links using wiki-style syntax:

```
Check out [[My Project Plan]] for details.
Link with text: [[Project Plan|the plan]]
```

View backlinks in the sidebar when editing a document.

---

## ✍️ Handwritten Notes

**Create**: Click "✍️ Handwritten" in Quick Actions

### Tools

- **Pen**: Draw with chosen color and width
- **Eraser**: Remove strokes
- **Colors**: 7 preset colors available
- **Widths**: Thin, Medium, Thick, Bold
- **Undo**: Remove last stroke
- **Clear**: Erase entire canvas
- **Download**: Save as PNG
- **Save**: Encrypt and store

---

## 📥 Import & Export

### Import From

- Markdown (.md)
- Google Keep (Takeout)
- Evernote (.enex)
- Notion (export)
- Standard Notes (backup)
- Apple Notes (HTML/text)

**How**: Workspace → 📥 Import button

### Export To

- **Markdown**: Single document
- **ZIP**: Full workspace with folders
- **PNG**: Handwritten notes

**How**: Settings → Export Workspace

---

## 🔗 Sharing

**Create Share Link**:
1. Open document
2. Click Share button
3. Set permissions (View/Edit)
4. Set expiry time (default: 24 hours)
5. Copy link

**Revoke**: Share settings → Revoke button

**Note**: Requires Redis to be configured

---

## 📚 Version History

**View Versions**:
1. Open document
2. Menu (☰) → Version History
3. Browse saved versions
4. Click version to preview
5. Restore if needed

**Storage**: Last 50 versions saved locally (IndexedDB)

---

## 📅 Calendar View

**Toggle**: Click "📅 Calendar" button in workspace

- Navigate months with arrows
- Days with documents highlighted
- Click document to open

---

## 📱 Progressive Web App (PWA)

### Install

**Desktop**: Click install icon in address bar

**Mobile**: 
1. Tap share button
2. Select "Add to Home Screen"

**Benefits**: Offline access, faster loading, native app feel

---

## 🌍 Languages

**Current**: English, Bengali (বাংলা), Hindi (हिन्दी)

**Change**: Settings → Appearance → Language

**Note**: Requires lingo.dev API key (optional)

---

## 🔧 Settings Quick Access

| Setting | Location |
|---------|----------|
| 2FA Setup | Settings → Security |
| Encryption Toggle | Settings → Security |
| Language | Settings → Appearance |
| Export Data | Settings → Data |
| Account | Settings → Account |

---

## 🆘 Getting Help

- **Documentation**: `/docs` folder in repository
- **Issues**: GitHub Issues tracker
- **Security**: See SECURITY.md
- **Support**: GitHub Discussions

---

## 📖 Documentation Links

- **Full README**: [README.md](../README.md)
- **Feature Summary**: [FEATURES_SUMMARY.md](FEATURES_SUMMARY.md)
- **All Guides**: [docs/guides/](guides/)
- **Vim Mode**: [VIM_MODE.md](VIM_MODE.md)
- **New Features**: [NEW_FEATURES.md](NEW_FEATURES.md)
- **Changelog**: [CHANGELOG.md](../CHANGELOG.md)

---

## 💡 Pro Tips

1. **Use Vim Mode** for faster editing if you're familiar with Vim
2. **Enable 2FA** for extra security
3. **Tag consistently** for better organization
4. **Install as PWA** for offline access
5. **Use Quick Note** (`Ctrl+Q`) for capturing ideas instantly
6. **Create backlinks** to build a knowledge graph
7. **Try AI Assistant** for writing help and brainstorming
8. **Search with fuzzy matching** - typos are okay!
9. **Export regularly** as backup
10. **Use background colors** to visually organize documents

---

## ⚠️ Important Notes

- **Encryption**: All content is encrypted client-side with AES-256-GCM
- **Zero-Knowledge**: Server never sees your encryption keys or plaintext
- **Local Storage**: Version history and PWA cache stored locally
- **Share Links**: Temporary (24-hour default) and revocable
- **Password Recovery**: Forgotten document passwords cannot be recovered
- **Self-Hosting**: Fully self-hostable with Docker

---

**4diary** - Privacy-focused, end-to-end encrypted note-taking

Built with ♥️ in 🇮🇳 • BSD-3-Clause License • Version 0.1.0-alpha

**GitHub**: [github.com/Harsha-Bhattacharyya/4diary](https://github.com/Harsha-Bhattacharyya/4diary)

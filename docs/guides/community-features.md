# Community-Requested Features

4Diary includes several powerful features that are frequently requested by the note-taking community but are missing from popular alternatives like Notion.

## 🔗 Backlinks (Bidirectional Linking)

### What are Backlinks?

Backlinks show you which documents link to the current document you're viewing. This creates a web of interconnected notes, making it easy to navigate related content.

### How to Use

1. **Create Links**: Use wiki-style syntax to link documents:
   ```
   Check out [[My Project Plan]] for more details.
   Link with custom text: [[Project Plan|the plan]]
   ```

2. **View Backlinks**: When editing a document, the backlinks panel appears on the right side showing all documents that link to the current page.

3. **Navigate**: Click any backlink to quickly jump to that document.

### Benefits

- Build a knowledge graph of interconnected notes
- Discover relationships between documents
- Never lose track of where information is referenced
- Perfect for research, project management, and personal knowledge bases

## 📅 Calendar View

### What is Calendar View?

An alternative way to view and organize your documents based on when they were last updated or created.

### How to Use

1. In your workspace, click the "📅 Calendar" button at the top
2. Navigate between months using the arrow buttons
3. See visual indicators for days that have documents
4. Click on any document to open it

### Benefits

- Visualize your note-taking activity over time
- Quickly find documents from a specific date
- See patterns in your work habits
- Perfect for journals, meeting notes, and time-based organization

## 📚 Version History

### What is Version History?

Automatic tracking of document changes, allowing you to view and restore previous versions.

### How to Use

1. Open any document
2. Click the menu (☰) → "Version History"
3. Browse through saved versions
4. Select a version to preview it
5. Click "Restore" to revert to that version

### Features

- Automatic version saving (every time you save)
- Keeps last 50 versions per document
- Client-side storage using IndexedDB
- No server storage needed (maintains zero-knowledge architecture)

### Benefits

- Recover from accidental deletions or changes
- Review document evolution over time
- Experiment freely knowing you can always revert
- No manual "save version" needed

## 📱 Progressive Web App (PWA)

### What is PWA?

A Progressive Web App provides a native app-like experience with offline capabilities, installation, and better performance.

### Features

1. **Install**: Add 4Diary to your device home screen
2. **Offline Mode**: Access and edit your documents without internet
3. **Fast Loading**: Cached resources for instant startup
4. **App-like Experience**: Full-screen mode, no browser UI
5. **Automatic Updates**: Always get the latest version

### How to Install

**Desktop (Chrome/Edge)**:
1. Click the install icon in the address bar
2. Or click "Install 4Diary" in the settings menu

**Mobile (iOS/Android)**:
1. Tap the share button
2. Select "Add to Home Screen"
3. Name it and confirm

**From App**:
- Look for the install prompt that appears after a few seconds
- Click "Install" to add to your device

### Offline Features

- View all downloaded documents
- Create and edit documents offline
- Automatic sync when back online
- Graceful offline page when network is unavailable

### Benefits

- Works like a native app
- Use without internet connection
- Faster startup and navigation
- Less battery drain than browser tabs
- Dedicated app icon and window

## 🆚 Why These Features Matter

These features address common pain points with existing note-taking apps:

| Feature | Problem It Solves |
|---------|-------------------|
| **Backlinks** | Notion lacks bidirectional linking, making it hard to see relationships |
| **Calendar View** | Most apps don't offer date-based organization beyond search |
| **Version History** | Limited version tracking in free plans of most apps |
| **PWA/Offline** | Many apps require constant internet connection |

## 🔐 Privacy First

All these features maintain 4Diary's zero-knowledge architecture:

- **Backlinks**: Processed client-side, links never exposed to server
- **Calendar View**: Uses local document metadata
- **Version History**: Stored in browser's IndexedDB, never uploaded
- **PWA**: Offline functionality without compromising encryption

## 🚀 Future Enhancements

Potential improvements to these features:

- [ ] Graph view of document relationships
- [ ] Version comparison (diff view)
- [ ] More granular version control (save on specific events)
- [ ] PWA push notifications for reminders
- [ ] Background sync for better offline experience
- [ ] Export version history

## 💡 Tips & Best Practices

1. **Use descriptive document titles** for better backlink discovery
2. **Link freely** - the backlinks panel helps you track connections
3. **Check calendar view weekly** to see your productivity patterns
4. **Install as PWA** for the best experience
5. **Version history is automatic** - just save your work normally

## 🐛 Known Limitations

- Backlinks require exact title match (case-sensitive)
- Version history limited to 50 versions per document
- PWA offline mode requires initial online visit
- Calendar view shows last update date, not creation date

## 📚 Learn More

- [Main README](../README.md)
- [Testing Guide](../TESTING_GUIDE.md)
- [Contributing](../CONTRIBUTING.md)

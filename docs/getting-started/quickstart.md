# Quick Start Guide

Get up and running with 4Diary in just a few minutes!

## Create Your Account

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click **"Sign Up"** in the top menu
3. Enter your email and create a secure password
4. Click **"Create Account"**

> **Note**: Your password is never sent to the server. It's used only to derive encryption keys locally.

## Your First Note

### Creating a Document

1. After logging in, you'll see your workspace dashboard
2. Click **"➕ New Document"** button
3. A new encrypted document will be created
4. Start typing in the editor!

### Using the Editor

The BlockNote editor supports:

- **Markdown shortcuts**: Type `/` for commands
- **Headings**: `#` for H1, `##` for H2, etc.
- **Lists**: `-` for bullets, `1.` for numbered lists
- **Bold**: `**text**` or Ctrl+B
- **Italic**: `*text*` or Ctrl+I
- **Code blocks**: ` ``` ` for code

## Quick Note (Ctrl+Q)

For lightning-fast note capture:

1. Press **Ctrl+Q** anywhere in the app
2. Type your quick note
3. It's automatically saved to localStorage
4. Click **"Save to Workspace"** to store it permanently

## Organizing Documents

### Using Folders

1. Open a document
2. Click on the document title
3. Add a folder name (e.g., "Work", "Personal")
4. Documents will be grouped by folder in the sidebar

### Adding Emoji Icons

1. Click the emoji icon next to the document title
2. Select an emoji from the picker
3. The emoji will appear next to your document

## Kanban Boards

Create task boards for project management:

1. Click **"📊 Kanban"** in the quick actions
2. Add columns for your workflow (To Do, In Progress, Done)
3. Create cards by clicking **"+ Add Card"**
4. Drag and drop cards between columns

## Sharing Documents

Share documents securely with temporary links:

1. Open the document you want to share
2. Click the **"Share"** button
3. Choose permissions (view or edit)
4. Set expiration time (up to 24 hours)
5. Copy the generated link

> **Security**: Shared links include the encryption key. The server cannot decrypt shared documents.

## Exporting Your Data

### Export Single Document

1. Open the document
2. Click **"Export"**
3. Choose Markdown or JSON format

### Export All Documents

1. Go to workspace dashboard
2. Click **"📦 Export All"**
3. Download ZIP file with all your notes

## Tips & Shortcuts

- **Ctrl+Q**: Open Quick Note modal
- **Ctrl+S**: Save current document
- **Ctrl+/**: Toggle markdown preview
- **Ctrl+B**: Bold text
- **Ctrl+I**: Italic text

## Next Steps

- Explore the [User Guide](../guides/editor.md) for advanced features
- Learn about [Security & Encryption](./security.md)
- Check out [Templates](../guides/templates.md) for productivity

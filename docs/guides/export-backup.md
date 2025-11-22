# Export & Backup Guide

Learn how to export your documents, create backups, and maintain control over your data.

## Overview

4Diary provides **complete data portability** - your notes belong to you. Export individual documents or your entire workspace in multiple formats, ensuring you're never locked into the platform.

### Export Options

- 📄 **Single Document Export**: Markdown or JSON format
- 📦 **Workspace Export**: ZIP archive with all documents
- 🔄 **Format Choices**: Markdown, JSON, or both
- 📁 **Folder Structure**: Maintains your organization
- 🔓 **Decrypted Output**: Exports are readable plaintext

## Single Document Export

### Exporting as Markdown

**Best For**: Human-readable documents, publishing, importing to other note apps

1. Open the document you want to export
2. Click the **"Export"** button in the toolbar (or ⋮ menu)
3. Select **"Export as Markdown"**
4. File downloads immediately: `document-title.md`

**Markdown Output Includes**:
- Document title as H1 heading
- Full formatted content
- Preserved headings, lists, and formatting
- Code blocks with syntax markers
- Tables in markdown format
- Links preserved

**Example Output**:
```markdown
# My Document Title

## Introduction

This is the document content with **bold** and *italic* text.

- Bullet points
- Are preserved
- Perfectly

### Code Example

```javascript
function hello() {
  console.log("Hello, world!");
}
```

## Conclusion

All formatting maintained!
```

### Exporting as JSON

**Best For**: Programmatic processing, backup with metadata, migration to other systems

1. Open the document
2. Click **"Export"** → **"Export as JSON"**
3. File downloads: `document-title.json`

**JSON Output Includes**:
- Document metadata (title, emoji, dates)
- Full content in BlockNote JSON format
- Document type (doc/board/quick)
- Folder and tag information
- Creation and modification timestamps

**Example Output**:
```json
{
  "id": "doc_abc123",
  "title": "My Document Title",
  "emoji": "📝",
  "type": "doc",
  "folder": "Work",
  "tags": ["project", "notes"],
  "createdAt": "2024-11-22T10:30:00Z",
  "updatedAt": "2024-11-22T15:45:00Z",
  "content": [
    {
      "type": "heading",
      "level": 1,
      "content": "My Document Title"
    },
    {
      "type": "paragraph",
      "content": "Document content here..."
    }
  ]
}
```

### Exporting Kanban Boards

Kanban boards export differently:

**As JSON**: Full board structure with columns and cards
```json
{
  "id": "board_xyz789",
  "title": "Project Tasks",
  "type": "board",
  "columns": [
    {
      "id": "col_1",
      "title": "To Do",
      "cards": [
        {
          "id": "card_1",
          "title": "Task 1",
          "description": "Details..."
        }
      ]
    }
  ]
}
```

**As Markdown**: Formatted checklist
```markdown
# Project Tasks

## To Do
- [ ] Task 1
- [ ] Task 2

## In Progress
- [ ] Task 3

## Done
- [x] Task 4
```

## Workspace Export

### Complete Workspace Export

Export **everything** in your workspace at once:

1. Navigate to workspace dashboard or settings
2. Click **"⬇️ Export Workspace"** or **"📦 Export All"**
3. Choose format:
   - **Markdown Only**: All docs as `.md` files
   - **JSON Only**: All docs as `.json` files
   - **Both**: Includes both formats
4. Wait for processing (may take time for large workspaces)
5. ZIP file downloads: `4diary-workspace-[date].zip`

### ZIP Archive Structure

The exported ZIP maintains your folder organization:

```
4diary-workspace-2024-11-22.zip
│
├── README.txt                      # Export information
├── metadata.json                   # Workspace metadata
│
├── Documents/                      # Root-level documents
│   ├── document-1.md
│   ├── document-1.json
│   ├── document-2.md
│   └── document-2.json
│
├── Work/                           # Folder: Work
│   ├── project-notes.md
│   ├── project-notes.json
│   ├── meeting-minutes.md
│   └── meeting-minutes.json
│
├── Personal/                       # Folder: Personal
│   ├── journal-entry.md
│   └── journal-entry.json
│
└── Boards/                         # Kanban boards
    ├── sprint-23.md
    └── sprint-23.json
```

### Workspace Metadata

The `metadata.json` file includes:

```json
{
  "exportDate": "2024-11-22T16:30:00Z",
  "version": "0.1.0-alpha",
  "totalDocuments": 42,
  "totalFolders": 5,
  "totalBoards": 3,
  "workspace": {
    "id": "ws_abc123",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "folders": [
    {
      "name": "Work",
      "documentCount": 15
    },
    {
      "name": "Personal",
      "documentCount": 8
    }
  ]
}
```

## Backup Strategies

### Local Backups

**Frequency Recommendations**:

| Usage Level | Backup Frequency |
|-------------|------------------|
| **Light** (< 10 docs) | Weekly |
| **Moderate** (10-50 docs) | Every 3 days |
| **Heavy** (50-200 docs) | Daily |
| **Power User** (200+ docs) | Daily + automated |

**Local Backup Workflow**:
1. Schedule recurring reminder (phone/calendar)
2. Export entire workspace to ZIP
3. Save to local drive: `~/Backups/4diary/`
4. Organize by date: `4diary-2024-11-22.zip`
5. Keep last 7-30 backups depending on usage

### Cloud Backups

Store exports in cloud storage for additional safety:

**Options**:
- Google Drive
- Dropbox
- iCloud Drive
- OneDrive
- Nextcloud (self-hosted)

**Automated Cloud Backup** (Manual Method):
1. Export workspace to ZIP
2. Upload to cloud storage
3. Use cloud provider's versioning
4. Set retention policy (keep 30 days)

**Example Folder Structure**:
```
Google Drive/
└── 4diary-backups/
    ├── 2024-11/
    │   ├── workspace-2024-11-01.zip
    │   ├── workspace-2024-11-08.zip
    │   ├── workspace-2024-11-15.zip
    │   └── workspace-2024-11-22.zip
    └── 2024-10/
        └── ... (older backups)
```

### Backup Automation

**Using Scripts** (Advanced):

Create a backup script (requires API access in future versions):

```bash
#!/bin/bash
# backup-4diary.sh

DATE=$(date +%Y-%m-%d)
BACKUP_DIR="$HOME/Backups/4diary"
CLOUD_DIR="$HOME/Google\ Drive/4diary-backups"

# Export workspace (manual step currently)
echo "Please export workspace from 4Diary UI"
echo "Save as: $BACKUP_DIR/workspace-$DATE.zip"

# Wait for manual export
read -p "Press enter when export is complete..."

# Copy to cloud
cp "$BACKUP_DIR/workspace-$DATE.zip" "$CLOUD_DIR/$(date +%Y-%m)/"

# Clean old local backups (keep last 7)
cd "$BACKUP_DIR"
ls -t workspace-*.zip | tail -n +8 | xargs rm -f

echo "Backup complete: workspace-$DATE.zip"
```

### Version Control for Documents

**Use Git for Document History** (Markdown exports):

```bash
# Initialize repository
cd ~/4diary-docs
git init

# Export workspace as Markdown
# Extract to this directory

# Commit changes
git add .
git commit -m "Workspace backup $(date +%Y-%m-%d)"

# Push to private remote
git push origin main
```

**Benefits**:
- Full document history
- Line-by-line change tracking
- Revert to any previous version
- Distributed backup (remote repositories)

## Import & Migration

### Importing to Other Apps

#### Obsidian

1. Export documents as Markdown
2. Extract ZIP to Obsidian vault folder
3. Folder structure is preserved
4. Internal links may need adjustment

#### Notion

1. Export as Markdown
2. In Notion: Import → Markdown
3. Select folder or individual files
4. Notion converts markdown to blocks

#### Standard Notes

1. Export as Markdown
2. Use Standard Notes import feature
3. Each .md file becomes a note
4. Tags can be added manually

#### Joplin

1. Export as Markdown
2. Joplin: File → Import → Markdown files
3. Folder structure maintained
4. Attachments need manual handling

### Restoring from Backup

**To Same 4Diary Instance**:
1. Currently: Manual re-import (copy-paste content)
2. Future: Workspace import feature planned

**To New 4Diary Instance**:
1. Set up new 4Diary installation
2. Create workspace and documents
3. Copy content from exported Markdown files
4. Restore folder organization manually

> **Future Feature**: One-click workspace import from ZIP backups

## Export Best Practices

### 1. Regular Export Schedule

Create a habit:
- **Weekly**: Export entire workspace
- **After Major Changes**: Significant edits or reorganization
- **Before Updates**: Before upgrading 4Diary version
- **Before Cleanup**: Before deleting documents

### 2. Multiple Format Strategy

Export in both formats:
- **Markdown**: For human readability and portability
- **JSON**: For complete metadata and programmatic access
- **Both**: Recommended for comprehensive backups

### 3. Verify Exports

After exporting:
1. Extract ZIP to temporary folder
2. Spot-check several documents
3. Verify folder structure is correct
4. Confirm dates and metadata
5. Delete temporary files after verification

### 4. Organize Exports

Maintain organized backup folder:
```
~/Backups/4diary/
├── daily/
│   ├── workspace-2024-11-22.zip
│   ├── workspace-2024-11-21.zip
│   └── ... (last 7 days)
├── weekly/
│   ├── workspace-2024-11-17.zip
│   ├── workspace-2024-11-10.zip
│   └── ... (last 4 weeks)
└── monthly/
    ├── workspace-2024-11-01.zip
    ├── workspace-2024-10-01.zip
    └── ... (last 12 months)
```

### 5. Test Restoration

Periodically test your backups:
1. Export workspace
2. Create test documents in workspace
3. Verify you can access export
4. Check that content is readable
5. Attempt to import into another tool

## Data Privacy

### Decryption on Export

**Important**: Exports are **decrypted** plaintext!

When you export:
- ✅ Content is decrypted in your browser
- ✅ Plaintext is written to files
- ✅ Files are NOT encrypted in ZIP
- ⚠️ Anyone with export file can read content

**Security Recommendations**:
1. **Encrypt Export Files**: Use system encryption (VeraCrypt, 7-Zip with password)
2. **Secure Storage**: Store in encrypted drive or password-protected cloud
3. **Delete After Upload**: Remove local copy after uploading to secure cloud
4. **Restricted Access**: Don't share export files publicly

### Encrypted Backups

**Encrypting ZIP Exports**:

**Using 7-Zip** (Windows/Linux/Mac):
```bash
7z a -p -mhe=on workspace-encrypted.7z workspace-2024-11-22.zip
# Enter strong password when prompted
# -mhe=on encrypts filenames too
```

**Using GPG** (Linux/Mac):
```bash
gpg --symmetric --cipher-algo AES256 workspace-2024-11-22.zip
# Creates workspace-2024-11-22.zip.gpg
```

**Using VeraCrypt**:
1. Create encrypted volume
2. Mount volume
3. Copy exports to mounted volume
4. Dismount when done

## Exporting Specific Content

### Export by Folder

To export only specific folder:

1. **Manual Method** (Current):
   - Export entire workspace
   - Extract ZIP
   - Navigate to folder
   - Zip only that folder

2. **Planned Feature**: Select folder, export that folder only

### Export by Tag

Export documents with specific tags:

1. **Manual Method** (Current):
   - Export workspace
   - Parse `metadata.json` for tags
   - Filter documents by tag
   - Create custom ZIP

2. **Planned Feature**: Filter by tag before export

### Export by Date Range

Export documents created/modified in date range:

1. **Manual Method**:
   - Export workspace
   - Check timestamps in JSON files
   - Filter by date
   - Package filtered documents

2. **Planned Feature**: Date range selector in export UI

## Troubleshooting

### Export Fails

**Problem**: Export button doesn't work or errors

**Solutions**:
1. Check browser console for errors
2. Verify you're logged in
3. Try smaller subset (single document first)
4. Check browser storage limits
5. Disable browser extensions temporarily
6. Try different browser

### Large Exports Time Out

**Problem**: Workspace export hangs or times out

**Solutions**:
1. Archive old documents before exporting
2. Export in batches (by folder)
3. Increase browser memory if possible
4. Use desktop app (if available)
5. Contact support for large workspaces

### Corrupted ZIP Files

**Problem**: Downloaded ZIP is corrupted or won't extract

**Solutions**:
1. Re-download export
2. Try different extraction tool (7-Zip, The Unarchiver)
3. Check download wasn't interrupted
4. Verify disk space available
5. Try exporting fewer documents

### Missing Documents in Export

**Problem**: Some documents not in export

**Solutions**:
1. Verify documents aren't archived (check archive section)
2. Check if Quick Notes need saving to workspace first
3. Ensure all documents finished saving before export
4. Try exporting again
5. Report bug if persists

## Advanced Export Techniques

### Batch Processing Exports

Use scripts to process exported documents:

```python
# process_exports.py
import json
import os
from pathlib import Path

def extract_titles(export_dir):
    """Extract all document titles from JSON exports"""
    titles = []
    for json_file in Path(export_dir).rglob("*.json"):
        with open(json_file) as f:
            doc = json.load(f)
            titles.append(doc.get("title", "Untitled"))
    return titles

# Usage
titles = extract_titles("./4diary-export")
print(f"Found {len(titles)} documents")
```

### Converting to Other Formats

**Markdown to PDF** (using Pandoc):
```bash
# Install pandoc first
pandoc document.md -o document.pdf --pdf-engine=xelatex
```

**Markdown to HTML**:
```bash
pandoc document.md -o document.html --standalone
```

**Markdown to DOCX** (Microsoft Word):
```bash
pandoc document.md -o document.docx
```

### Creating Custom Archives

**Export with Custom Structure**:
```bash
#!/bin/bash
# custom-archive.sh

# Export workspace and extract
unzip 4diary-workspace.zip -d temp/

# Create custom structure
mkdir custom-archive
mkdir custom-archive/by-date
mkdir custom-archive/by-type

# Sort by modification date
find temp -name "*.json" -exec jq -r '.updatedAt' {} \; | sort

# Create year-based folders
# ... custom processing logic

# Archive custom structure
zip -r custom-archive.zip custom-archive/
```

## Future Features

Planned export enhancements:

- 📤 **Automated Backups**: Scheduled automatic exports
- 🔄 **Incremental Exports**: Export only changes since last backup
- 📊 **Export Analytics**: Statistics about exported content
- 🎨 **Styled Exports**: Export with 4Diary styling preserved
- 📱 **Mobile Export**: Direct export from mobile app
- ☁️ **Cloud Integration**: Direct export to Google Drive, Dropbox
- 🔍 **Selective Export**: Filter by multiple criteria before export
- 📦 **Workspace Import**: One-click restore from ZIP backup
- 🔐 **Encrypted Exports**: Option to export as encrypted ZIP
- 📄 **PDF Export**: Direct export as PDF with formatting
- 🌐 **HTML Export**: Export as static website

## Best Practices Summary

✅ **Do**:
- Export regularly (weekly minimum)
- Keep multiple backup copies
- Verify exports after downloading
- Encrypt sensitive exports
- Store backups in multiple locations
- Test restoration occasionally
- Document your backup procedure

❌ **Don't**:
- Rely on single backup location
- Store unencrypted exports in cloud
- Forget to verify exports
- Delete workspace without confirmed backup
- Share export files publicly
- Ignore backup reminders
- Wait for data loss to start backing up

## Next Steps

- Learn about [Security & Privacy](./security-privacy.md) for data protection
- Explore [Sharing](./sharing.md) for collaboration
- Read [Troubleshooting](./troubleshooting.md) for common issues
- Check [Self-Hosting Guide](../advanced/self-hosting.md) for full control

---

**Last Updated**: November 2025  
**Feature Status**: ✅ Export available in v0.1.0-alpha | 🔄 Import planned for v0.2.0

# Import Notes Guide

Import your notes from other apps into 4Diary with full encryption and organization preserved.

## Overview

4Diary supports importing notes from popular note-taking applications, making it easy to migrate your existing notes while maintaining their privacy through end-to-end encryption.

### Supported Import Sources

| App | Format | Supported Files |
|-----|--------|-----------------|
| **Markdown** | Standard Markdown | `.md`, `.markdown` |
| **Google Keep** | Google Takeout | `.json`, `.html`, `.zip` |
| **Evernote** | ENEX Export | `.enex` |
| **Notion** | Export ZIP/MD | `.md`, `.csv`, `.zip` |
| **Standard Notes** | Backup | `.json`, `.txt` |
| **Apple Notes** | HTML/Text Export | `.html`, `.txt`, `.zip` |

## Quick Start

1. Go to your **Workspace**
2. Click the **📥 Import** button in Quick Actions
3. Select your import format (or use Auto-detect)
4. Drop or select your files
5. Preview the import
6. Click **Import** to add notes to your workspace

All imported notes are automatically encrypted with your master key before being saved.

## Detailed Import Instructions

### Markdown Files

**What's Imported:**
- Document content with formatting
- Title (from H1 heading or filename)
- Tags (from YAML frontmatter or hashtags)

**How to Import:**
1. Select **Markdown** format (or Auto-detect)
2. Select one or more `.md` files
3. Preview and import

**Example File:**
```markdown
---
title: My Note
tags: [personal, ideas]
---

# My Note

This is the content of my note with **bold** and *italic* text.

- Bullet point 1
- Bullet point 2
```

### Google Keep (Google Takeout)

**What's Imported:**
- Note title and content
- Checklist items (with checked status)
- Labels (as tags)
- Creation and modification dates
- Note color (as metadata)

**How to Export from Google Keep:**
1. Go to [Google Takeout](https://takeout.google.com/)
2. Click "Deselect all"
3. Find and select "Keep"
4. Click "Next step"
5. Choose export frequency (once is fine)
6. Choose delivery method and file type (ZIP)
7. Click "Create export"
8. Download the ZIP file when ready

**How to Import:**
1. Select **Google Keep** format
2. Upload the entire ZIP file from Google Takeout
3. Or extract and upload individual JSON/HTML files
4. Preview and import

**Notes:**
- Trashed notes are automatically skipped
- Images and audio are not imported (text only)
- Labels become tags in 4Diary

### Evernote (ENEX)

**What's Imported:**
- Note title and content
- Tags
- Notebook name (as folder)
- Creation and modification dates
- Text formatting (bold, italic, links)

**How to Export from Evernote:**

**Desktop App:**
1. Select notes to export (or all notes in a notebook)
2. Right-click and select "Export Notes..."
3. Choose "ENEX format (.enex)"
4. Click "Export"

**Web App:**
1. Go to your notebook
2. Click ⋮ (More) → Export notebook
3. Select ENEX format
4. Download the file

**How to Import:**
1. Select **Evernote** format
2. Upload one or more `.enex` files
3. Preview the detected notes
4. Import

**Notes:**
- Rich text is converted to Markdown
- Embedded images are not imported (text only)
- Tables are converted to text
- Checkboxes are preserved

### Notion

**What's Imported:**
- Page title and content
- Tags/Properties from databases
- Folder structure (from nested pages)
- Basic formatting

**How to Export from Notion:**
1. Go to Settings & members → Settings
2. Scroll down to "Export all workspace content"
3. Click "Export all workspace content"
4. Select "Markdown & CSV"
5. Click "Export"
6. Download the ZIP file

**Alternative - Export Single Page:**
1. Click ⋮ (More) on any page
2. Select "Export"
3. Choose "Markdown & CSV"
4. Download

**How to Import:**
1. Select **Notion** format
2. Upload the ZIP file or individual `.md`/`.csv` files
3. Preview the detected pages
4. Import

**Notes:**
- Notion's unique IDs in filenames are automatically cleaned
- Database rows become individual notes
- Nested page structure is preserved as folders
- Images and embeds are not imported

### Standard Notes

**What's Imported:**
- Note title and text content
- Creation and modification dates

**How to Export from Standard Notes:**
1. Go to Preferences → Backups
2. Click "Download backup"
3. Choose decrypted format if possible (for easier import)
4. Download the backup file

**How to Import:**
1. Select **Standard Notes** format
2. Upload the `.json` backup file
3. Preview and import

**Notes:**
- Only text notes are imported (not extensions)
- Encrypted backups require manual decryption first
- Tags from Standard Notes are preserved

### Apple Notes

**What's Imported:**
- Note title and content
- Basic formatting
- Folder organization (if available in export)

**How to Export from Apple Notes:**

Apple Notes doesn't have a built-in export feature. Use one of these methods:

**Method 1: Copy as PDF/Text**
1. Open a note
2. Click File → Export as PDF (or copy text)
3. Convert PDF to text or HTML

**Method 2: Third-party Tools**
- Use [Exporter for Notes](https://apps.apple.com/us/app/exporter/id1099120373) (Mac App Store)
- Export to HTML or Markdown format

**Method 3: iCloud Web**
1. Go to icloud.com/notes
2. Select notes and copy content
3. Paste into text files

**How to Import:**
1. Select **Apple Notes** format
2. Upload `.html` or `.txt` files
3. Preview and import

**Notes:**
- Attachments and images are not imported
- Checklists may need manual adjustment
- Third-party export tools provide best results

## Auto-Detect Mode

For convenience, 4Diary can automatically detect the format of your files:

1. Select **Auto-detect** format (default)
2. Upload any combination of supported files
3. 4Diary analyzes file contents and structure
4. Each file is processed with the appropriate parser
5. Preview all detected notes
6. Import

**Detection Logic:**
- `.md` files → Markdown parser
- `.enex` files → Evernote parser
- `.json` files → Checks for Google Keep or Standard Notes structure
- `.html` files → Checks for Google Keep or Apple Notes format
- `.zip` files → Examines contents to determine source

## Import Preview

Before importing, you'll see a preview showing:

- **Notes to Import**: Total count of detected notes
- **Warnings**: Files that were skipped or partially processed
- **Errors**: Files that couldn't be processed
- **Note Details**: Title, source app, folder, and tags

Review the preview carefully to ensure all your notes were detected correctly.

## What Happens During Import

1. **Parsing**: Files are analyzed and content is extracted
2. **Conversion**: Content is converted to 4Diary's BlockNote format
3. **Preview**: You review the detected notes
4. **Encryption**: Each note is encrypted with a unique document key
5. **Storage**: Encrypted notes are saved to your workspace
6. **Key Management**: Document keys are encrypted with your master key

Your imported notes are protected with the same end-to-end encryption as all other 4Diary documents.

## Organizing Imported Notes

After import:

1. **Folders**: Preserved from source app when available
2. **Tags**: Converted from labels, categories, or properties
3. **Dates**: Original creation/modification dates retained when available
4. **Titles**: Extracted from headings or original note titles

You can reorganize imported notes like any other document:
- Move to different folders
- Add or remove tags
- Star favorites
- Rename titles

## Troubleshooting

### Common Issues

**"No notes found in file"**
- Check if the file is in the correct format
- Ensure the file isn't corrupted or empty
- Try exporting from the source app again

**"Failed to parse file"**
- The file may be encrypted (decrypt first)
- Try a different export format from the source app
- Check for special characters in filenames

**"Some notes were skipped"**
- Trashed/deleted notes are skipped by design
- Empty notes may be skipped
- Check warnings for specific details

**Large Imports Taking Time**
- Large imports (100+ notes) may take several minutes
- Progress bar shows import status
- Don't close the browser during import

### Getting Help

If you encounter issues:
1. Check the warnings and errors in the import preview
2. Try importing a single file first
3. Verify your export from the source app
4. Contact support with specific error messages

## Best Practices

### Before Importing

1. **Backup First**: Keep your original export files
2. **Clean Up Source**: Delete unwanted notes before exporting
3. **Organize**: Use folders/labels in source app for easier post-import organization
4. **Test Small**: Try importing a few notes first

### After Importing

1. **Review**: Check that notes imported correctly
2. **Organize**: Move notes to appropriate folders
3. **Tag**: Add additional tags for better searchability
4. **Star**: Mark important notes as favorites
5. **Clean Up**: Delete any duplicate or unwanted imports

## Privacy & Security

### Import Security

- All parsing happens in your browser (client-side)
- Original files are never uploaded to servers
- Notes are encrypted before being stored
- Import history is not logged

### Data Handling

- Imported content is processed locally
- Only encrypted data reaches 4Diary servers
- Original files remain on your device
- No third-party services are involved in the import process

## Limitations

### Content Not Imported

- Images and attachments (text only)
- Audio and video embeds
- Tables may be simplified
- Complex formatting may be reduced
- App-specific features (e.g., Evernote web clips)

### Format Limitations

- Very old export formats may not be fully supported
- Encrypted exports need decryption first
- Maximum file size: 50MB per file
- Maximum notes per import: 1000

## Feature Comparison

| Feature | Google Keep | Evernote | Notion | Standard Notes | Apple Notes |
|---------|-------------|----------|--------|----------------|-------------|
| Text Content | ✅ | ✅ | ✅ | ✅ | ✅ |
| Formatting | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| Tags/Labels | ✅ | ✅ | ✅ | ✅ | ❌ |
| Folders | ❌ | ✅ | ✅ | ❌ | ⚠️ |
| Checklists | ✅ | ✅ | ✅ | ❌ | ⚠️ |
| Dates | ✅ | ✅ | ⚠️ | ✅ | ❌ |
| Links | ✅ | ✅ | ✅ | ✅ | ⚠️ |

✅ = Full support | ⚠️ = Partial support | ❌ = Not supported

## Future Enhancements

Planned import improvements:

- 📷 **Image Import**: Support for embedded images
- 📎 **Attachments**: PDF and document imports
- 🔄 **Sync Integration**: Direct API connections
- 📊 **Better Tables**: Improved table conversion
- 🏷️ **Tag Mapping**: Custom tag transformations
- 📁 **Folder Mapping**: Custom folder assignments

## Related Documentation

- [Export & Backup Guide](./export-backup.md) - Exporting your 4Diary notes
- [Editor Guide](./editor.md) - Editing imported notes
- [Security & Privacy](./security-privacy.md) - How your notes are protected
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions

---

**Last Updated**: November 2025  
**Feature Status**: ✅ Available in v0.1.0-alpha

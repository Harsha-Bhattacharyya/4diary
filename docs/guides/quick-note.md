# Quick Note Guide

Master 4Diary's lightning-fast note capture feature for instant note-taking anywhere in the app.

## What is Quick Note?

Quick Note is a **floating notepad** that appears instantly with a keyboard shortcut, allowing you to capture thoughts, ideas, and information without interrupting your workflow. Think of it as your always-available scratch pad.

### Key Features

- ⚡ **Instant Access**: Press `Ctrl+Q` (or `Cmd+Q` on Mac) anywhere
- 💾 **Auto-Save**: Content saved locally as you type
- 🔒 **Encrypted Sync**: Save to workspace with full encryption
- 🎯 **Distraction-Free**: Modal overlay focuses on writing
- 🚀 **No Context Switch**: Capture without leaving current page

## Opening Quick Note

### Keyboard Shortcut

The fastest way to open Quick Note:

**Windows/Linux**: `Ctrl + Q`  
**macOS**: `Cmd + Q`

This works anywhere in 4Diary:
- ✅ While browsing documents
- ✅ In the editor
- ✅ On the dashboard
- ✅ While viewing boards
- ✅ In settings

### Mouse Click

You can also open Quick Note by clicking:

1. Look for the **⚡ Quick Note** button in the navigation
2. Click to open the modal
3. Start typing immediately

## Using Quick Note

### Basic Workflow

1. **Open**: Press `Ctrl+Q` anywhere
2. **Type**: Start writing your note
3. **Auto-Save**: Content saves to localStorage automatically
4. **Close**: Press `Escape` or click outside
5. **Later**: Open again to continue editing
6. **Save to Workspace**: Click button to permanently store

### The Quick Note Interface

```
┌─────────────────────────────────────────┐
│  ⚡ Quick Note                      ✕   │
├─────────────────────────────────────────┤
│                                         │
│  [Start typing your quick note...]      │
│                                         │
│  Content automatically saved locally    │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  💾 Save to Workspace    Clear          │
└─────────────────────────────────────────┘
```

**Components**:
- **Title Bar**: "⚡ Quick Note" with close button (✕)
- **Text Area**: Large input area for your notes
- **Status**: Shows auto-save status
- **Actions**: Save to Workspace and Clear buttons

### Writing in Quick Note

**Supported Input**:
- Plain text (no rich formatting)
- Markdown syntax (will render when saved to workspace)
- URLs (automatically linkified when saved)
- Multiple lines and paragraphs
- Emoji characters

**Not Supported**:
- Rich text formatting (bold, italic) during editing
- Images or file attachments
- Tables or complex layouts
- Real-time markdown preview

> **💡 Tip**: Write markdown syntax in Quick Note, then save to workspace for full formatting.

## Auto-Save & Persistence

### Local Storage

Quick Note uses browser's localStorage for instant saving:

- **Automatic**: Saves as you type (debounced)
- **Persistent**: Survives page refreshes
- **Browser-Specific**: Saved per browser/device
- **Not Encrypted**: Local storage is not encrypted (save to workspace for encryption)

### How Auto-Save Works

```typescript
1. You type in Quick Note
2. After 500ms of no typing (debounce)
3. Content is saved to localStorage
4. You see a brief "Saved locally" indicator
5. Content persists until you clear or save to workspace
```

**Benefits**:
- Never lose your quick thoughts
- Resume writing after closing Quick Note
- Recover from accidental browser close
- No network needed for local save

### Recovering Lost Quick Notes

If you accidentally closed Quick Note:

1. Press `Ctrl+Q` again
2. Your content will still be there
3. Continue editing or save to workspace

If you cleared browser data:
- Quick Note content is lost (was in localStorage)
- Saved workspace documents are safe (encrypted on server)

## Saving to Workspace

### When to Save

Save your Quick Note to workspace when:
- ✅ You want to keep it permanently
- ✅ You want it encrypted on the server
- ✅ You need to access it from other devices
- ✅ You want to organize it with folders/tags
- ✅ You want to edit it in the full editor

### How to Save

1. Write your content in Quick Note
2. Click **"💾 Save to Workspace"** button
3. Quick Note content is:
   - Encrypted with your workspace key
   - Saved as a new document
   - Given a default title (first line or "Quick Note")
   - Timestamped with creation date
4. Quick Note is cleared automatically
5. New document appears in your workspace

### What Happens When You Save

**Before Save** (Quick Note):
- Content in localStorage (unencrypted)
- Not synced to server
- Not accessible from other devices
- Not organized in workspace

**After Save** (Workspace Document):
- Content encrypted with AES-256-GCM
- Stored on MongoDB server
- Accessible from any device
- Appears in workspace document list
- Can be edited, shared, exported

### Document Properties After Save

The new document receives:

- **Title**: First line of Quick Note (or "Quick Note" if empty)
- **Type**: Regular document (`type: "doc"`)
- **Emoji**: Default 📝 emoji
- **Folder**: Placed in root (no folder)
- **Tags**: None (add manually after save)
- **Created Date**: Current timestamp
- **Content**: Full Quick Note text (encrypted)

## Clearing Quick Note

### Manual Clear

1. Click **"Clear"** button in Quick Note
2. Confirm the action (if prompted)
3. Content is removed from localStorage
4. Quick Note returns to empty state

> **⚠️ Warning**: Clearing removes content permanently from local storage. Save to workspace first if you want to keep it!

### Auto-Clear

Quick Note automatically clears when you:
- ✅ Save to workspace (successful)
- ✅ Click "Clear" button
- ❌ Press Escape (does NOT clear, only closes)
- ❌ Click outside modal (does NOT clear)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Q` / `Cmd+Q` | Open/Close Quick Note |
| `Escape` | Close Quick Note (content preserved) |
| `Ctrl+S` / `Cmd+S` | Save to Workspace (when Quick Note is focused) |
| `Ctrl+L` / `Cmd+L` | Clear Quick Note (when focused) |

## Use Cases

### Capturing Ideas

**Scenario**: Sudden idea while working on something else

1. Press `Ctrl+Q` mid-task
2. Jot down the idea quickly
3. Press `Escape` to return
4. Continue your original task
5. Later, open Quick Note to save the idea

### Meeting Notes

**Scenario**: Quick capture during video call

1. Meeting starts, press `Ctrl+Q`
2. Type key points as they're discussed
3. Leave Quick Note open or close between notes
4. After meeting, add more context
5. Save to workspace as permanent meeting notes

### Research Notes

**Scenario**: Found interesting info while browsing

1. Reading a document, find important point
2. Press `Ctrl+Q` to capture it
3. Paste URLs or write notes
4. Continue reading
5. Accumulate multiple points
6. Save as research document when done

### To-Do Lists

**Scenario**: Quick task capture

```
Quick Note Content:
- Buy groceries
- Call dentist
- Finish project report
- Review pull requests
```

1. Add tasks to Quick Note throughout the day
2. Keep it open or press `Ctrl+Q` to add more
3. At end of day, save to workspace
4. Convert to Kanban board or keep as list

### Daily Journal

**Scenario**: Quick thoughts throughout day

```
Quick Note Content:
9 AM: Good coffee this morning
12 PM: Productive meeting with team
3 PM: Solved that tricky bug!
6 PM: Finished all tasks early today
```

1. Add entries with timestamps
2. Accumulate throughout the day
3. Save to workspace as daily journal
4. Use template for consistent format

### Clipboard Alternative

**Scenario**: Temporary text storage

1. Copy text from one place
2. Press `Ctrl+Q` and paste into Quick Note
3. Navigate to another location
4. Open Quick Note and copy text back
5. Clear Quick Note after use

## Tips & Best Practices

### 1. Use Markdown Syntax

Write markdown in Quick Note for formatted documents:

```markdown
# Meeting Notes
## Action Items
- [ ] Review design mockups
- [ ] Update documentation
- [ ] Schedule follow-up

**Attendees**: Alice, Bob, Carol
```

When saved to workspace, markdown renders beautifully!

### 2. Include Timestamps

For time-sensitive notes:

```
[2024-11-22 14:30] Client requested new feature
[2024-11-22 15:15] Discussed with team, estimated 2 weeks
```

### 3. Use Keywords

Add searchable keywords for later finding:

```
#idea #feature-request
New idea for improving user onboarding flow...
```

### 4. Link to Other Documents

Reference other documents by title:

```
Related to: Project Alpha Timeline
See also: Sprint 23 Notes
Dependencies: API Documentation
```

### 5. Keep It Short-Term

Quick Note is best for:
- ✅ Temporary notes
- ✅ Ideas to process later
- ✅ Quick captures
- ❌ Long-term storage (use workspace documents)

### 6. Regular Review

Develop a habit:
- Open Quick Note at end of day
- Review accumulated notes
- Save important items to workspace
- Clear or organize the rest

## Advanced Techniques

### Templates in Quick Note

Create personal templates for common notes:

**Meeting Template**:
```
Meeting: [TITLE]
Date: [DATE]
Attendees: 
Agenda:
1. 
2. 
3. 
Notes:

Action Items:
- [ ] 
```

Copy your template, paste in Quick Note, fill in details.

### Multiple Quick Notes

While you can only have one Quick Note at a time, you can simulate multiple:

1. Write first note in Quick Note
2. Save to workspace
3. Quick Note is now empty
4. Write second note
5. Save to workspace
6. Repeat as needed

### Quick Note as Scratch Pad

Use Quick Note as a temporary workspace:

- Draft email text
- Format data before pasting elsewhere
- Work out calculations
- Compose messages
- Practice writing

### Backup Strategy

Quick Note is in localStorage (not backed up):

**Best Practice**:
1. At end of each session
2. Review Quick Note contents
3. Save anything important to workspace
4. Clear Quick Note
5. Start fresh next session

## Troubleshooting

### Quick Note Not Opening

**Problem**: `Ctrl+Q` doesn't work

**Solutions**:
1. Check if key is bound to something else
2. Try using the button in navigation
3. Check browser console for JavaScript errors
4. Verify browser allows keyboard shortcuts

### Content Disappeared

**Problem**: Quick Note is empty after reopening

**Possible Causes**:
- ✓ Browser data was cleared
- ✓ Using different browser profile
- ✓ localStorage was wiped
- ✓ You clicked "Clear"

**Solutions**:
- Check if you saved to workspace
- Search workspace documents for content
- Use browser's localStorage inspector to check

### Save to Workspace Fails

**Problem**: Clicking save button doesn't work

**Solutions**:
1. Check network connectivity
2. Verify you're logged in
3. Check browser console for errors
4. Try refreshing page and retry
5. Copy content, refresh, paste back

### Keyboard Shortcut Conflicts

**Problem**: `Ctrl+Q` does something else

**Solutions**:
1. Check browser extension shortcuts
2. Check OS-level keyboard shortcuts
3. Use the mouse click alternative
4. Customize shortcut (if available in settings)

## Privacy & Security

### Local Storage Security

Quick Note content in localStorage is:
- ❌ **Not encrypted** while in localStorage
- ❌ **Not synced** to server
- ❌ **Accessible** to JavaScript on the domain
- ❌ **Not secure** for sensitive information

**Recommendation**: Save to workspace for encryption!

### When to Avoid Quick Note

Don't use Quick Note for:
- ❌ Passwords or credentials
- ❌ Private keys or tokens
- ❌ Personal identification numbers
- ❌ Credit card information
- ❌ Anything highly sensitive

Instead:
1. Use full editor directly
2. Enable encryption immediately
3. Save to workspace right away

### Browser Privacy Modes

In Incognito/Private mode:
- Quick Note works normally
- localStorage is temporary
- Content lost when closing private window
- Save to workspace before closing!

## Comparison: Quick Note vs Regular Document

| Feature | Quick Note | Regular Document |
|---------|------------|------------------|
| **Speed** | Instant (`Ctrl+Q`) | Navigate to workspace |
| **Storage** | localStorage | Encrypted on server |
| **Security** | Unencrypted locally | AES-256-GCM encrypted |
| **Formatting** | Plain text | Rich text editor |
| **Organization** | None | Folders, tags, emoji |
| **Sharing** | Not possible | Share links |
| **Export** | Copy/paste only | Markdown, JSON, ZIP |
| **Access** | Same browser only | Any device |
| **Best For** | Quick capture | Long-term storage |

## Integration with Workflow

### Morning Routine

```
1. Open 4Diary
2. Press Ctrl+Q
3. Write:
   - Today's goals
   - Important reminders
   - Quick notes from overnight
4. Save as "Daily Plan [DATE]"
```

### During Work

```
1. Working on tasks
2. Press Ctrl+Q when needed
3. Capture:
   - Code snippets to remember
   - URLs to review later
   - Meeting outcomes
   - Problem solutions
4. Keep adding throughout day
5. Save at end of day
```

### End of Day Review

```
1. Press Ctrl+Q
2. Review all quick notes
3. Categorize:
   - Save important ones to workspace
   - Clear temporary notes
   - Move to Kanban if actionable
4. Start fresh tomorrow
```

## Future Enhancements

Planned improvements for Quick Note:

- 🎨 **Rich Text**: Basic formatting in Quick Note
- 📱 **Mobile Optimization**: Better mobile Quick Note UI
- 🔍 **Search History**: Search past Quick Notes
- 📋 **Templates**: Built-in Quick Note templates
- 🔔 **Reminders**: Set reminders on Quick Notes
- 🏷️ **Quick Tags**: Add tags before saving
- 📂 **Quick Folders**: Choose folder when saving
- 🔗 **Quick Links**: Link to existing documents

## Next Steps

- Learn [Keyboard Shortcuts](./shortcuts.md) for more efficiency
- Explore [Editor Guide](./editor.md) for full editing
- Read about [Templates](./templates.md) for structured notes
- Check out [Export & Backup](./export-backup.md) for data management

---

**Last Updated**: November 2025  
**Feature Status**: ✅ Available in v0.1.0-alpha

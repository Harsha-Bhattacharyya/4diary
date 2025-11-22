# Kanban Boards Guide

Master task management with 4Diary's encrypted Kanban boards.

## What are Kanban Boards?

Kanban boards in 4Diary provide a visual way to organize tasks, projects, and workflows using drag-and-drop cards across customizable columns. Like all content in 4Diary, your Kanban boards are **fully encrypted end-to-end**.

## Creating a Kanban Board

### Method 1: From Dashboard

1. Navigate to your workspace dashboard
2. Click the **"📊 Kanban"** button in the quick actions
3. A new board is created with default columns:
   - **To Do** - Tasks waiting to be started
   - **In Progress** - Currently active tasks
   - **Done** - Completed tasks

### Method 2: From Document Menu

1. Click **"+ New Document"**
2. Select **"Board"** as the document type
3. Give your board a name
4. The board opens with default columns

## Board Structure

### Columns

Columns represent stages in your workflow. Each board starts with three default columns, but you can customize them.

**Default Columns:**
- 🔴 **To Do**: Tasks not yet started
- 🟡 **In Progress**: Tasks currently being worked on
- 🟢 **Done**: Completed tasks

### Cards

Cards represent individual tasks or items. Each card contains:
- **Title**: Brief description of the task
- **Description**: Detailed information (optional)
- **Position**: Order within the column

## Managing Columns

### Adding Columns

1. Click **"+ Add Column"** on the board
2. Enter the column name
3. Choose a position (before/after existing columns)
4. Press Enter to create

**Common Column Examples:**
- Backlog → To Do → In Progress → Review → Done
- Ideas → Planning → Executing → Testing → Deployed
- New → Active → Blocked → Resolved → Closed

### Editing Columns

1. Click the **column header**
2. Edit the column name
3. Press Enter to save

### Deleting Columns

1. Click the **⋮** menu on the column header
2. Select **"Delete Column"**
3. Confirm deletion

> **⚠️ Warning**: Deleting a column also deletes all cards within it. Move cards to another column before deleting if you want to keep them.

### Reordering Columns

1. Click and drag the **column header**
2. Move it left or right
3. Drop it in the desired position

## Managing Cards

### Adding Cards

1. Click **"+ Add Card"** at the bottom of any column
2. Enter the card title
3. Optionally add a description
4. Press Enter to create

### Editing Cards

1. Click on the card to open it
2. Edit the title or description
3. Changes are saved automatically

### Moving Cards

**Drag and Drop:**
1. Click and hold a card
2. Drag it to a different column
3. Drop it in the desired position

**Using Card Menu:**
1. Click the **⋮** menu on the card
2. Select **"Move to..."**
3. Choose the target column

### Deleting Cards

1. Click the **⋮** menu on the card
2. Select **"Delete Card"**
3. Confirm deletion

### Duplicating Cards

1. Click the **⋮** menu on the card
2. Select **"Duplicate"**
3. A copy appears below the original

## Board Features

### Board Title and Emoji

1. Click the **board title** at the top
2. Edit the name
3. Click the **emoji icon** to add a visual identifier
4. Changes save automatically

### Folder Organization

1. Open the board settings
2. Add a folder name (e.g., "Projects", "Work")
3. Boards are grouped by folder in the sidebar

### Favorites

1. Click the **⭐** star icon on the board
2. Favorited boards appear at the top of your workspace
3. Quick access to your most important boards

### Archive

1. Click the **📦** archive icon
2. Archived boards move to the Archive section
3. Unarchive anytime to restore to active boards

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | New card in first column |
| `Enter` | Create card (when in new card input) |
| `Escape` | Close card editor |
| `Delete` | Delete selected card |
| `Ctrl+S` | Save changes |

## Use Cases

### Project Management

**Software Development:**
```
Backlog → To Do → In Progress → Review → Testing → Done
```

Track features, bugs, and technical debt through your development workflow.

### Personal Task Management

**GTD (Getting Things Done):**
```
Inbox → Next Actions → Waiting For → Someday/Maybe → Done
```

Implement David Allen's GTD methodology with Kanban columns.

### Content Creation

**Blog Workflow:**
```
Ideas → Outline → Draft → Edit → Publish → Promoted
```

Manage your content pipeline from idea to publication.

### Team Collaboration

**Marketing Campaign:**
```
Brainstorm → Plan → Create → Review → Launch → Analyze
```

Coordinate team efforts with shared visibility (using share links).

### Bug Tracking

**Issue Management:**
```
New → Confirmed → In Progress → Fixed → Testing → Closed
```

Track bugs and issues through resolution.

## Best Practices

### 1. Keep Cards Focused

✅ **Good**: "Implement user authentication API"  
❌ **Bad**: "Work on backend stuff"

Each card should represent a single, actionable item.

### 2. Limit Work in Progress

Avoid having too many cards in the "In Progress" column. This prevents context switching and improves focus.

**Recommended WIP Limits:**
- Solo: 2-3 cards in progress
- Small Team: 1-2 cards per person
- Large Team: Use sub-boards for team members

### 3. Use Descriptive Column Names

Column names should clearly indicate what stage the card is in:
- ✅ "Awaiting Review" instead of "Review"
- ✅ "Ready for Testing" instead of "Test"
- ✅ "Blocked - Need Info" instead of "Blocked"

### 4. Regular Cleanup

- Archive completed projects
- Delete obsolete cards
- Update card descriptions
- Review and update board structure quarterly

### 5. Add Context to Cards

Include relevant information in card descriptions:
- Requirements
- Acceptance criteria
- Links to related resources
- Estimated time
- Dependencies

### 6. Color Code with Emojis

Use emojis for quick visual identification:
- 🔴 High priority
- 🟡 Medium priority
- 🟢 Low priority
- 🐛 Bug
- ✨ Feature
- 📝 Documentation

## Sharing Boards

### Creating Share Links

1. Open the board
2. Click **"Share"** button
3. Configure permissions:
   - **View Only**: Others can see the board
   - **Edit**: Others can modify cards and columns
4. Set expiration time (up to 24 hours)
5. Copy and share the link

> **🔒 Privacy Note**: Shared boards include the encryption key in the URL. The server cannot decrypt the board content.

### Revoking Access

1. Go to board settings
2. Click **"Manage Shares"**
3. Revoke specific share tokens
4. All shared links become invalid immediately

## Export Boards

### Export as JSON

1. Open the board
2. Click **"Export"** → **"JSON"**
3. Downloads a JSON file with all board data
4. Includes columns, cards, and metadata

### Export as Markdown

1. Open the board
2. Click **"Export"** → **"Markdown"**
3. Downloads a formatted markdown file
4. Each column becomes a heading with cards as list items

**Exported Format:**
```markdown
# Board Title

## To Do
- [ ] Task 1
- [ ] Task 2

## In Progress
- [ ] Task 3

## Done
- [x] Task 4
- [x] Task 5
```

## Encryption & Security

### How Board Encryption Works

1. **Board Key**: Each board has a unique encryption key
2. **Column Data**: Column names and order are encrypted
3. **Card Data**: All card content is encrypted
4. **Local Decryption**: Only decrypted in your browser
5. **Server Storage**: Server only stores encrypted data

### Security Best Practices

- **Use strong passwords**: Protect your workspace
- **Share carefully**: Share links include encryption keys
- **Revoke access**: Remove share links when no longer needed
- **Regular exports**: Keep encrypted backups
- **Self-host**: Full control over your data

## Troubleshooting

### Board Not Loading

**Problem**: Board appears blank or shows loading spinner indefinitely.

**Solutions**:
1. Refresh the page (F5)
2. Clear browser cache
3. Check browser console for errors
4. Verify MongoDB connection

### Cards Not Dragging

**Problem**: Unable to drag and drop cards between columns.

**Solutions**:
1. Ensure JavaScript is enabled
2. Disable browser extensions temporarily
3. Try a different browser
4. Check if touch events are working on mobile

### Changes Not Saving

**Problem**: Card or column changes don't persist.

**Solutions**:
1. Check network connection
2. Verify API endpoints are accessible
3. Check browser console for errors
4. Try manual save (Ctrl+S)

### Encryption Errors

**Problem**: "Failed to decrypt board" error message.

**Solutions**:
1. Verify you're logged into the correct workspace
2. Check if master key is present in IndexedDB
3. Try re-logging in
4. Contact support if issue persists

## Advanced Tips

### Nested Task Management

While cards can't have sub-cards, you can use markdown checklists in card descriptions:

```markdown
Complete user onboarding flow:
- [ ] Design wireframes
- [ ] Implement signup page
- [ ] Add email verification
- [ ] Create welcome tutorial
```

### Board Templates

Create board templates for recurring projects:

1. Set up a board with your ideal column structure
2. Add template cards with placeholders
3. Duplicate the board for new projects
4. Customize as needed

### Integration Workflows

While 4Diary doesn't have native integrations, you can:
- Export boards as JSON for processing
- Use markdown exports in other tools
- Create custom scripts to parse exported data
- Share board links in team communications

### Multi-Board Projects

For complex projects, create multiple boards:
- **Master Board**: High-level project tracking
- **Team Boards**: Individual team workflows
- **Sprint Boards**: Time-boxed iterations
- **Bug Board**: Dedicated bug tracking

Link between boards using card descriptions:
```markdown
Related: See Sprint 23 Board (#board-id-here)
Dependencies: Waiting on API Board completion
```

## Next Steps

- Learn about [Templates](./templates.md) for document organization
- Explore [Sharing & Collaboration](./sharing.md) for team work
- Read [Export & Backup](./export-backup.md) for data management
- Master [Keyboard Shortcuts](./shortcuts.md) for efficiency

---

**Last Updated**: November 2025  
**Feature Status**: ✅ Available in v0.1.0-alpha

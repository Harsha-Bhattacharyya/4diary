# Reader Mode Guide

Experience distraction-free reading with 4Diary's dedicated Reader Mode.

## What is Reader Mode?

Reader Mode transforms your documents into a clean, focused reading experience by removing all editing UI elements and presenting your content in an optimized layout. It's perfect for:

- 📖 **Long-form reading**: Focus on content without distractions
- 📱 **Mobile reading**: Optimized for phones and tablets
- 👁️ **Eye comfort**: Adjustable font sizes for better readability
- 🎯 **Presentations**: Share screen without editing clutter

## Accessing Reader Mode

### From Any Document

1. Open any document in your workspace
2. Look for the **📖 Reader Mode** button in the toolbar
3. Click to enter Reader Mode
4. Document displays in clean, focused layout

### Keyboard Shortcut

Coming soon: `Ctrl+R` / `Cmd+R` to toggle Reader Mode

### From Shared Documents

Reader Mode is available for:
- ✅ Documents you own
- ✅ Shared documents (view-only and edit)
- ✅ Templates
- ❌ Kanban boards (different viewing mode)

## Reader Mode Interface

### Layout

```
┌─────────────────────────────────────────┐
│  📖 Document Title        A-  A  A+  ✕  │
├─────────────────────────────────────────┤
│                                         │
│    Your document content displayed      │
│    in a clean, distraction-free         │
│    reading layout.                      │
│                                         │
│    Scrollable content area with         │
│    optimized typography and spacing.    │
│                                         │
│    [Images and formatting preserved]    │
│                                         │
└─────────────────────────────────────────┘
```

**Key Elements**:
- **Title Bar**: Document title with controls
- **Font Controls**: A-, A, A+ buttons for sizing
- **Close Button**: ✕ to exit Reader Mode
- **Content Area**: Clean, centered text
- **No Distractions**: No toolbars, sidebars, or editing UI

### Visual Design

Reader Mode features:
- **Centered Layout**: Content centered for comfortable reading
- **Optimal Width**: Limited line length for readability (65-75 characters)
- **Increased Spacing**: More line height and padding
- **Enhanced Typography**: Larger, clearer fonts
- **Leather Theme**: Consistent with 4Diary's aesthetic

## Font Size Controls

### Adjusting Size

**Using Controls**:
- **A-** button: Decrease font size
- **A** button: Reset to default size  
- **A+** button: Increase font size

**Keyboard Shortcuts** (planned):
- `Ctrl + -` : Decrease size
- `Ctrl + 0` : Reset size
- `Ctrl + +` : Increase size

### Font Size Levels

| Level | Size | Best For |
|-------|------|----------|
| **Smallest** | 14px | Dense content, small screens |
| **Small** | 16px | Standard reading |
| **Default** | 18px | Comfortable reading (recommended) |
| **Large** | 20px | Easier reading |
| **Larger** | 22px | Low vision, presentations |
| **Largest** | 24px | Maximum readability |

### Size Persistence

Font size preference:
- Saved in localStorage
- Persists across documents
- Per browser/device
- Resets if browser data cleared

## Content Rendering

### What's Preserved

Reader Mode maintains all document formatting:

✅ **Text Formatting**:
- Bold, italic, underline
- Strikethrough
- Headings (H1-H6)
- Font colors

✅ **Structure**:
- Paragraphs and line breaks
- Bullet and numbered lists
- Checklists (with checkboxes)
- Blockquotes
- Code blocks

✅ **Media**:
- Inline images
- Linked content
- Embedded URLs (as links)

✅ **Layout**:
- Tables
- Horizontal rules
- Indentation levels

### What's Hidden

Reader Mode removes editing UI:

❌ **Toolbars**:
- Formatting toolbar
- Block toolbar
- Inline formatting menu

❌ **Navigation**:
- Sidebar
- Top menu (except Reader Mode controls)
- Document metadata

❌ **Editing Features**:
- Cursor
- Selection highlights
- Drag handles
- Block controls

## Use Cases

### Long-Form Reading

**Blog Posts & Articles**:
1. Import or write long-form content
2. Enter Reader Mode
3. Read without editing distractions
4. Exit to continue editing

**Research Papers**:
- Focus on content comprehension
- Adjust font size for comfort
- No accidental edits while reading

### Mobile Reading

**Phone Optimization**:
- Full-width content on mobile
- Touch-optimized controls
- Larger touch targets for A-/A/A+
- Smooth scrolling

**Tablet Reading**:
- Landscape and portrait modes
- Centered content with margins
- Comfortable reading position

### Presenting Content

**Screen Sharing**:
1. Open document to present
2. Enter Reader Mode
3. Clean interface for viewers
4. Adjust size for projector/screen
5. No editing clutter visible

**Client Reviews**:
- Professional presentation
- Hide workspace organization
- Focus on document content
- Easy to navigate

### Proofreading

**Final Review**:
1. Finish editing document
2. Enter Reader Mode
3. Read as final audience would see it
4. Spot errors in reading flow
5. Exit to make corrections

### Studying & Learning

**Educational Content**:
- Read learning materials
- Adjust size for comfort
- Minimize distractions
- Focus on comprehension
- No temptation to edit

## Features & Capabilities

### Scrolling

Reader Mode supports:
- **Smooth Scrolling**: Optimized scroll behavior
- **Keyboard Navigation**: Arrow keys, Page Up/Down
- **Mouse Wheel**: Natural scrolling
- **Touch Gestures**: Swipe on mobile
- **Scroll Position**: Maintained when exiting (returns to same position)

### Selection & Copying

While in Reader Mode:
- ✅ **Select Text**: Click and drag to select
- ✅ **Copy Content**: Right-click to copy
- ✅ **Search in Page**: Ctrl+F / Cmd+F works
- ❌ **Edit Text**: Read-only mode
- ❌ **Paste**: No editing allowed

### Links

Clickable links in Reader Mode:
- Internal document references (if present)
- External URLs (open in new tab)
- Anchors within document (smooth scroll)

### Performance

Reader Mode is optimized for:
- **Fast Loading**: Minimal rendering overhead
- **Smooth Scrolling**: 60fps scroll performance
- **Large Documents**: Handles 100+ pages efficiently
- **Low Memory**: Reduced DOM complexity

## Exiting Reader Mode

### Multiple Ways to Exit

**Click Close Button**:
- Click the **✕** in top-right
- Returns to editor immediately

**Keyboard Shortcut**:
- Press **Escape** (ESC)
- Quick exit to editor

**Browser Back**:
- Click browser back button
- Returns to previous view

### What Happens on Exit

When you exit Reader Mode:
1. Document returns to editor view
2. Scroll position is maintained (or close to it)
3. Cursor placed at end of document
4. All editing features restored
5. Font size preference saved

## Mobile Experience

### Touch Optimization

Reader Mode on mobile features:
- **Large Touch Targets**: Easy to tap A-/A/A+ buttons
- **Swipe Gestures**: Natural scrolling
- **No Pinch-Zoom**: Font controls instead
- **Orientation Support**: Works in portrait and landscape

### Mobile Layout

**Portrait Mode**:
- Full-width content
- Controls at top
- Easy one-handed use

**Landscape Mode**:
- Centered content with margins
- Better use of horizontal space
- Comfortable reading angle

### Mobile-Specific Features

- Prevents accidental zooming
- Optimized touch scrolling
- Fullscreen option (coming soon)
- Brightness integration (planned)

## Accessibility

### Screen Readers

Reader Mode is accessible:
- ✅ **ARIA Labels**: Proper semantic HTML
- ✅ **Heading Hierarchy**: Correct H1-H6 structure
- ✅ **Alt Text**: Image descriptions preserved
- ✅ **Link Text**: Descriptive link labels
- ✅ **Keyboard Navigation**: Full keyboard support

### Keyboard Navigation

Navigate without mouse:
- `Tab`: Move between controls
- `Enter` / `Space`: Activate buttons
- `Escape`: Exit Reader Mode
- `Arrow Keys`: Scroll content
- `Home` / `End`: Jump to start/end

### Visual Accessibility

Reader Mode helps users with:
- **Low Vision**: Larger font sizes available
- **Dyslexia**: Clean layout, optimal line length
- **ADHD**: No distractions, focused reading
- **Light Sensitivity**: Consistent leather theme (dark mode coming)

## Best Practices

### When to Use Reader Mode

**Good Use Cases**:
- ✅ Reading finished documents
- ✅ Proofreading before publishing
- ✅ Presenting to others
- ✅ Mobile reading
- ✅ Focused comprehension
- ✅ Printing preparation (coming soon)

**Not Ideal For**:
- ❌ Active editing
- ❌ Quick reference (use normal view)
- ❌ Multi-tasking (need quick access to other docs)

### Reading Habits

**Effective Reading**:
1. Enter Reader Mode for focused reading
2. Adjust font size for comfort
3. Take breaks every 20-30 minutes
4. Use browser find (Ctrl+F) for specific content
5. Exit to make notes or edits

**Speed Reading**:
- Use larger font size
- Minimize scrolling (larger viewport)
- Focus on content, not UI
- Use Reader Mode consistently

## Comparison: Reader Mode vs Editor

| Feature | Reader Mode | Editor View |
|---------|-------------|-------------|
| **Purpose** | Reading | Editing |
| **UI** | Minimal | Full toolbar |
| **Editing** | Not possible | Full editing |
| **Distractions** | None | Some (menus, etc.) |
| **Font Size** | Adjustable | Fixed |
| **Layout** | Centered | Full width |
| **Selection** | Copy only | Copy & edit |
| **Best For** | Reading | Writing |

## Troubleshooting

### Reader Mode Button Missing

**Solutions**:
1. Verify you're viewing a document (not a board)
2. Check if document is fully loaded
3. Refresh the page
4. Try a different browser

### Font Size Not Changing

**Solutions**:
1. Click A-/A+ buttons directly
2. Verify controls are visible
3. Clear browser cache
4. Check browser console for errors

### Content Not Displaying Correctly

**Possible Issues**:
- Complex formatting not supported
- Custom HTML/CSS in document
- Browser compatibility issues

**Solutions**:
1. Exit and re-enter Reader Mode
2. Check document renders correctly in editor
3. Simplify document formatting
4. Report issue if persists

### Scroll Position Lost

**When It Happens**:
- Very long documents
- Browser memory constraints
- Quick exit and re-enter

**Solutions**:
- Use browser search (Ctrl+F) to find position
- Stay in Reader Mode longer
- Add heading anchors for quick navigation

## Future Enhancements

Planned Reader Mode features:

### Reading Experience

- 🌓 **Dark Mode**: Toggle dark theme in Reader Mode
- 🎨 **Custom Themes**: Choose reading color schemes
- 📏 **Line Height**: Adjustable spacing
- 🔤 **Font Choice**: Select serif, sans-serif, mono
- 📖 **Page Mode**: Paginated view option

### Controls

- ⌨️ **More Shortcuts**: Full keyboard control
- 📱 **Gesture Controls**: Swipe to adjust size
- 🔊 **Text-to-Speech**: Read aloud feature
- 🔖 **Bookmarks**: Mark reading position
- 📊 **Progress Bar**: Show reading progress

### Features

- 🖨️ **Print Mode**: Optimized printing from Reader Mode
- 💾 **Export PDF**: Save as PDF from Reader Mode
- 🔗 **Share Reading View**: Share with Reader Mode enabled
- 📱 **Offline Reading**: Cache for offline access
- ⏱️ **Reading Time**: Estimate time to read

## Integration with Other Features

### With Sharing

When sharing documents:
- Recipients see Reader Mode button
- Shared view-only docs default to Reader Mode
- Edit permissions allow switching to editor

### With Export

Export documents as seen in Reader Mode:
- Export → PDF (coming soon)
- Maintains Reader Mode layout
- Font size preferences applied

### With Templates

Reader Mode works with all templates:
- Preview templates in Reader Mode
- Evaluate template layout before use
- Read template instructions clearly

### With Quick Note

Quick Notes can't use Reader Mode:
- Save Quick Note to workspace first
- Then access Reader Mode on saved document

## Tips & Tricks

### 1. Two-Monitor Setup

Use Reader Mode for reference:
- Document in Reader Mode on second screen
- Editor on primary screen
- Read and write simultaneously

### 2. Reading Sessions

Create focused reading sessions:
- Enter Reader Mode
- Disable notifications
- Full-screen browser (F11)
- Read without interruptions

### 3. Compare Versions

Compare edits visually:
- Open original in Reader Mode
- Open edited version in editor
- Side-by-side comparison

### 4. Presentation Prep

Before presenting:
- Review document in Reader Mode
- Adjust font size for projector
- Verify all content displays correctly
- Practice navigation

### 5. Mobile Reading Workflow

Optimize mobile reading:
- Flag documents for "Read Later"
- Open on phone in Reader Mode
- Read during commute
- Edit on desktop later

## Next Steps

- Learn [Keyboard Shortcuts](./shortcuts.md) for faster navigation
- Explore [Editor Guide](./editor.md) for writing features
- Read about [Export & Backup](./export-backup.md) for saving
- Check [Troubleshooting](./troubleshooting.md) for common issues

---

**Last Updated**: November 2025  
**Feature Status**: ✅ Available in v0.1.0-alpha

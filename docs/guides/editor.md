# Editor Guide

Master the powerful BlockNote editor in 4Diary.

## Editor Basics

The editor is a rich text editing experience that supports markdown shortcuts and commands.

### Using Slash Commands

Type `/` to open the command menu:

- `/h1` - Large heading
- `/h2` - Medium heading
- `/h3` - Small heading
- `/bullet` - Bullet list
- `/number` - Numbered list
- `/check` - Checklist
- `/code` - Code block
- `/quote` - Quote block

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+U` | Underline |
| `Ctrl+K` | Insert link |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+S` | Save |

### Markdown Support

The editor automatically converts markdown syntax:

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*
~~Strikethrough~~

- Bullet list
1. Numbered list
- [ ] Checklist

> Quote block

`inline code`
```

## Advanced Features

### Code Blocks

Create syntax-highlighted code blocks:

1. Type ` ``` ` or use `/code`
2. Select the programming language
3. Paste or type your code

Example:

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}
```

### Tables

Create tables using markdown:

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Links and Images

- **Links**: `[text](url)` or Ctrl+K
- **Images**: `![alt text](image-url)`

### Nested Lists

Create nested lists by indenting:

- Parent item
  - Child item
    - Grandchild item
- Another parent

## Formatting Tips

### Styling Text

Combine multiple formatting styles:

- **Bold and *italic***
- ***Bold italic***
- **Bold with `code`**

### Using Headings

Structure your document with headings:

```markdown
# Main Title (H1)

## Section (H2)

### Subsection (H3)

#### Detail (H4)
```

## Collaboration Features

### Comments (Coming Soon)

- Add inline comments to collaborate
- Mention users with `@username`
- Resolve comments when addressed

### Version History (Coming Soon)

- View document revision history
- Restore previous versions
- Compare changes between versions

## Best Practices

1. **Use headings** to organize content hierarchically
2. **Keep paragraphs short** for better readability
3. **Use lists** to break down complex information
4. **Add code blocks** for technical documentation
5. **Include links** for references

## Troubleshooting

### Editor Not Loading

1. Clear browser cache
2. Disable browser extensions
3. Check browser console for errors

### Formatting Issues

1. Ensure proper markdown syntax
2. Check for unclosed formatting tags
3. Use preview mode to verify rendering

## Next Steps

- Learn about [Templates](./templates.md) for faster note-taking
- Explore [Kanban Boards](./kanban.md) for task management

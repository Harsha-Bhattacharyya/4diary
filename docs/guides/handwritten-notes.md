# Handwritten Notes Guide

4diary supports handwritten notes with a full-featured drawing canvas. Create sketches, diagrams, or handwritten text with support for both mouse and touch input. All handwritten notes are encrypted just like your text documents.

## Features

### Drawing Tools
- **Pen Tool**: Draw freely with your chosen color and width
- **Eraser Tool**: Remove unwanted strokes
- **Multiple Colors**: Choose from 7 preset colors
- **Pen Widths**: Select from 4 different pen widths
- **Undo**: Remove the last stroke
- **Clear**: Erase the entire canvas

### Input Methods
- **Mouse Support**: Draw with your mouse
- **Touch Support**: Draw with your finger or stylus on touch devices
- **Pressure Sensitivity**: Smooth drawing experience on supported devices

### Storage & Export
- **Encrypted Storage**: Handwritten notes stored as encrypted base64 PNG images
- **Download**: Export your handwritten note as a PNG image
- **Integration**: Works seamlessly with folders, tags, favorites, and archive

## Creating a Handwritten Note

### From Workspace

1. Navigate to your workspace
2. Look for "Quick Actions" section
3. Click the "✍️ Handwritten" button
4. A new handwritten note will be created and opened

### From URL

Navigate directly to create a new handwritten note:
```
/workspace?new=handwritten
```

## Using the Drawing Canvas

### Selecting Tools

#### Pen Tool
1. Click the pen icon (or it's selected by default)
2. Choose your color from the color picker
3. Select your preferred pen width
4. Start drawing on the canvas

#### Eraser Tool
1. Click the eraser icon
2. Draw over any strokes you want to remove
3. The eraser uses white color to remove strokes

### Color Palette

Choose from these colors:
- **Leather** (#4A3728) - Default leather theme color
- **Black** (#000000) - Classic black
- **Blue** (#1E40AF) - Deep blue
- **Red** (#DC2626) - Vibrant red
- **Green** (#16A34A) - Fresh green
- **Purple** (#9333EA) - Rich purple
- **Orange** (#EA580C) - Bright orange

### Pen Widths

Select from these widths:
- **Thin** (1px) - For fine details
- **Medium** (2px) - Default width, good for general use
- **Thick** (4px) - For bold strokes
- **Bold** (6px) - For emphasis and headers

### Canvas Controls

#### Undo
- Click the undo button to remove the last stroke
- Each click removes one stroke in reverse order
- Useful for fixing mistakes without clearing everything

#### Clear All
- Click the trash icon to erase the entire canvas
- Confirmation prompt prevents accidental clearing
- Starts with a fresh white canvas

#### Download
- Click the download button to save as PNG
- Downloads immediately to your device
- File named with timestamp: `handwritten-note-[timestamp].png`

#### Save
- Click the "Save" button to encrypt and store your note
- Changes are detected automatically
- Button is disabled if no changes have been made

## Touch & Mobile Support

### Touch Input
- Works on any touch-enabled device
- Supports single-touch drawing
- Smooth drawing experience with minimal lag

### Mobile Optimization
- Touch-optimized toolbar with larger buttons
- Responsive canvas sizing
- Touch manipulation class for better responsiveness
- Prevents unwanted scrolling while drawing

### Stylus Support
- Full support for stylus input on compatible devices
- Smooth pressure-sensitive drawing (on supported devices)
- Natural drawing experience

## Document Management

### Metadata
Handwritten notes support all standard document features:
- **Title**: Give your note a descriptive name
- **Emoji Icon**: Choose a custom emoji icon
- **Folder**: Organize in folders
- **Tags**: Add tags for easy filtering
- **Favorites**: Mark as favorite for quick access
- **Archive**: Archive when no longer actively used

### Document List
Handwritten notes appear in your document list with:
- A purple "Handwritten" badge
- Default ✍️ emoji if no custom icon set
- Same sorting and filtering as other documents

### Viewing & Editing
- **View Mode**: Display the handwritten note (read-only)
- **Edit Mode**: Enable drawing tools and editing
- Toggle between modes using the edit button

## Encryption & Privacy

### Storage
- Handwritten notes are stored as base64-encoded PNG images
- Content is encrypted before sending to server
- Uses same AES-256-GCM encryption as text documents
- Server never sees unencrypted image data

### Key Management
- Each handwritten note has its own document key
- Document key is encrypted with your master key
- Master key never leaves your browser
- Follows zero-knowledge architecture

## Use Cases

### Sketches & Diagrams
- Quick sketches and doodles
- Flow charts and mind maps
- Diagrams and visual explanations
- Wireframes and mockups

### Handwritten Text
- Handwritten notes and memos
- Signatures and annotations
- Study notes with drawings
- Personal journal entries

### Art & Creative
- Digital drawings and art
- Calligraphy practice
- Design sketches
- Creative brainstorming

## Limitations

### Current Limitations
- Canvas size is fixed (responsive to container)
- No zoom or pan functionality
- No layers or advanced features
- No shape tools (rectangles, circles, etc.)
- No text tool overlay

### Not Included
- OCR (Optical Character Recognition)
- Handwriting-to-text conversion
- Advanced drawing features
- Vector graphics (SVG)
- Multi-page notes

## Best Practices

1. **Use Descriptive Titles**: Name your handwritten notes clearly
2. **Organize with Folders**: Keep handwritten notes organized
3. **Regular Backups**: Download important handwritten notes as PNG
4. **Choose Appropriate Colors**: Use colors that contrast well with white background
5. **Save Frequently**: Click save after significant changes
6. **Use Undo**: Fix mistakes incrementally instead of clearing everything

## Tips & Tricks

### Drawing Techniques
- Use thin pen for fine details
- Switch to thick pen for headers and emphasis
- Use eraser sparingly to preserve overall composition
- Leverage undo for precise corrections

### Organization
- Add tags like "sketch", "diagram", "handwritten"
- Use folders to separate types of handwritten notes
- Set custom emoji icons for visual identification
- Add to favorites for frequently referenced notes

### Mobile Drawing
- Use landscape orientation for more drawing space
- Rest your palm carefully to avoid accidental marks
- Use undo frequently on touch devices
- Consider a stylus for precision

## Troubleshooting

### Canvas Not Responding
- Ensure you're in edit mode
- Try refreshing the page
- Check if JavaScript is enabled
- Clear browser cache

### Strokes Not Appearing
- Make sure pen tool is selected (not eraser)
- Check if pen color is not white
- Ensure canvas is loaded
- Try increasing pen width

### Save Button Not Working
- Make sure you've made changes to the canvas
- Check your internet connection
- Verify you're authenticated
- Try clicking save again after a moment

### Touch Input Issues
- Enable touch support in browser settings
- Make sure device touch screen is working
- Try using mouse if touch fails
- Update browser to latest version

## Keyboard Shortcuts

Currently, handwritten notes don't have dedicated keyboard shortcuts beyond the standard document shortcuts. Drawing requires mouse or touch input.

## Future Enhancements

Planned features for future releases:

- [ ] Shape tools (rectangles, circles, lines)
- [ ] Text overlay tool
- [ ] Layers support
- [ ] Zoom and pan
- [ ] Color picker (custom colors)
- [ ] More pen styles (markers, highlighters)
- [ ] OCR for handwriting-to-text
- [ ] Import images to annotate
- [ ] Multi-page support
- [ ] Templates (graph paper, lined paper, etc.)

---

**Tip**: Combine handwritten notes with regular text documents by taking photos of your sketches or using import features to bring external handwritten content into 4diary.

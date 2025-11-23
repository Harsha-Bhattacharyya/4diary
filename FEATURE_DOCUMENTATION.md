# Note Settings Menu and Edit/Read Mode - Feature Documentation

## Overview
This pull request implements two major features:
1. **Note Settings Menu** - Displays note statistics and settings
2. **Edit/Read Mode Toggle** - Documents open in read mode with a floating pen icon to enter edit mode

## Features

### 1. Note Settings Menu

#### Access
- Open a document
- Click the menu button (☰) in the top left
- Select "⚙️ Note Settings"

#### Statistics Displayed
The settings modal shows:
- **Word Count** - Total number of words in the document
- **Line Count** - Number of non-empty lines
- **Characters** - Total character count including spaces
- **File Size** - Approximate size in KB (based on JSON representation)
- **Last Modified** - Human-readable timestamp

#### Display Settings
- **Line Numbers Toggle** - Show/hide line numbers in the editor
  - When enabled, line numbers appear on the left side of each line
  - Numbers use a monospace font for alignment
  - CSS counter-based implementation for performance

#### User Interactions
- **Close with X button** - Click the X in the top right
- **Close with Close button** - Click the "Close" button at the bottom
- **Close with ESC key** - Press Escape to close the modal

### 2. Edit/Read Mode Toggle

#### Read Mode (Default)
When you open a document, it opens in **read mode**:
- Editor is not editable
- Floating pen icon button appears in bottom right corner
- Bottom formatting toolbar is hidden
- Perfect for reviewing notes without accidental edits

#### Edit Mode
Click the floating pen icon to enter **edit mode**:
- Editor becomes editable
- Floating pen icon disappears
- Bottom formatting toolbar appears with:
  - Green "Edit Mode" indicator badge
  - "Exit Edit Mode" button
  - All formatting buttons (B, I, H1, H2, etc.)

#### Special Cases
- **New documents** - Start in edit mode automatically
- **Kanban boards** - Always editable (no read/edit toggle)

### 3. Line Numbers

#### Enabling Line Numbers
1. Open Note Settings (⚙️ menu → Note Settings)
2. Toggle "Line Numbers" switch to ON
3. Close the settings modal
4. Line numbers now appear in the editor

#### Visual Style
- Numbers appear on the left side
- Monospace font for proper alignment
- Gray color (#999) to not distract from content
- Auto-increment using CSS counters

## Technical Implementation

### Components Modified/Created

#### 1. `components/ui/NoteSettings.tsx` (NEW)
A modal component that:
- Calculates statistics using `useMemo` for performance
- Extracts text from BlockNote content structure iteratively
- Uses TextEncoder for accurate byte size calculation
- Provides keyboard navigation (ESC to close)
- Implements toggle switch for line numbers

#### 2. `components/editor/BlockEditor.tsx` (MODIFIED)
Enhanced with:
- `editable` prop - Controls if editor content can be modified
- `showLineNumbers` prop - Toggles line numbers display
- Conditional CSS class application for line numbers

#### 3. `components/editor/editor.css` (MODIFIED)
Added CSS for line numbers:
- CSS counter for automatic numbering
- Flexbox layout for proper alignment
- Monospace font styling
- User-select prevention on line numbers

#### 4. `app/workspace/page.tsx` (MODIFIED)
Enhanced workspace with:
- State management for `isEditMode`, `showNoteSettings`, `showLineNumbers`
- Floating pen button component (only visible in read mode)
- Updated dropdown menu with "Note Settings" option
- Edit mode indicator in bottom toolbar
- Conditional toolbar visibility based on edit mode
- New documents start in edit mode, existing ones in read mode

### State Management
```typescript
const [isEditMode, setIsEditMode] = useState(false);
const [showNoteSettings, setShowNoteSettings] = useState(false);
const [showLineNumbers, setShowLineNumbers] = useState(false);
```

### Performance Optimizations
1. **Statistics Calculation** - Uses `useMemo` to avoid recalculating on every render
2. **Text Extraction** - Iterative approach instead of recursive to prevent stack overflow
3. **Size Calculation** - TextEncoder instead of Blob for better performance
4. **Line Numbers** - Pure CSS implementation using counters

## Testing

### Unit Tests Created

#### `tests/unit/note-settings.spec.ts`
Tests for Note Settings component:
- ✅ Opening settings from dropdown menu
- ✅ Displaying note statistics
- ✅ Toggling line numbers
- ✅ Closing with ESC key
- ✅ Closing with close button

#### `tests/unit/edit-read-mode.spec.ts`
Tests for Edit/Read Mode:
- ✅ Documents open in read mode by default
- ✅ Entering edit mode with floating pen icon
- ✅ Exiting edit mode with exit button
- ✅ New documents start in edit mode
- ✅ Edit mode indicator displays correctly
- ✅ Bottom toolbar hidden in read mode
- ✅ Bottom toolbar shown in edit mode
- ✅ Kanban boards don't show floating pen

## User Experience Flow

### Opening and Reading a Note
1. User clicks on a document in workspace
2. Document opens in **read mode**
3. User can scroll and read without editing
4. Floating pen icon visible in bottom right

### Editing a Note
1. User clicks floating pen icon
2. Editor becomes editable
3. Bottom toolbar appears with formatting options
4. Edit mode indicator shows green badge
5. User makes edits
6. Changes auto-save (existing functionality)
7. User clicks "Exit Edit Mode" to return to read mode

### Viewing Note Statistics
1. User opens document (in either mode)
2. Clicks menu button (☰)
3. Clicks "⚙️ Note Settings"
4. Views statistics and settings
5. Optionally toggles line numbers
6. Closes modal

### Enabling Line Numbers
1. Open Note Settings
2. Toggle "Line Numbers" switch
3. Close settings
4. Line numbers now visible in editor
5. Setting persists for the session

## Security Considerations
- All statistics calculated client-side
- No data sent to server for analysis
- Line numbers implemented with CSS only
- No impact on encryption or data storage

## Accessibility
- Keyboard navigation supported (ESC key)
- ARIA labels on interactive elements
- Focus management in modals
- Color contrast meets WCAG AA standards
- Touch targets meet minimum size requirements

## Browser Compatibility
- Modern browsers with CSS counter support
- TextEncoder API (widely supported)
- Flexbox layout for line numbers
- Tested on Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari

## Future Enhancements
- Persist line numbers preference to localStorage
- Add more statistics (reading time, avg word length)
- Export statistics with document
- Custom line number styling options
- Search within document highlighting

## Migration Notes
- No database changes required
- Fully backward compatible
- No breaking changes to existing features
- Line numbers default to OFF

## Code Review Improvements
Applied feedback from automated code review:
1. ✅ Fixed redundant CSS rules for line numbers
2. ✅ Changed text extraction to iterative approach (prevents stack overflow)
3. ✅ Optimized size calculation with TextEncoder (better performance)

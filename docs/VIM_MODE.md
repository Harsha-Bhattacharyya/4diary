# Vim Mode Documentation

## Overview

4diary now includes a comprehensive Vim mode that allows users to edit documents using Vim keybindings. This feature provides a familiar editing experience for Vim users while maintaining the rich text editing capabilities of BlockNote.

## Activation

Press **Ctrl+Shift+V** to toggle Vim mode on/off while in the editor.

A visual indicator will appear in the bottom-left corner showing the current Vim mode:
- **NORMAL** (blue) - For navigation and commands
- **INSERT** (green) - For text insertion
- **REPLACE** (red) - For text replacement
- **COMMAND** (yellow) - For executing commands

## Modes

### NORMAL Mode

Default mode when Vim is enabled. Used for navigation and executing commands.

#### Navigation Commands

| Key | Action |
|-----|--------|
| `h` | Move left |
| `j` | Move down |
| `k` | Move up |
| `l` | Move right |
| `w` | Move forward by word |
| `b` | Move backward by word |
| `e` | Move to end of word |
| `0` | Move to start of line |
| `^` | Move to first non-whitespace character |
| `$` | Move to end of line |
| `gg` | Move to start of document |
| `G` | Move to end of document |

#### Count Prefix

You can prefix most commands with a number to repeat them. For example:
- `5j` - Move down 5 lines
- `3w` - Move forward 3 words
- `2dd` - Delete 2 lines

The count will be displayed in the indicator while typing.

#### Editing Commands

| Key | Action |
|-----|--------|
| `x` | Delete character under cursor |
| `X` | Delete character before cursor |
| `dd` | Delete current line |
| `dw` | Delete word |
| `d$` | Delete to end of line |
| `d0` | Delete to start of line |
| `cc` | Change current line (delete and enter INSERT mode) |
| `cw` | Change word |
| `yy` | Yank (copy) current line |
| `yw` | Yank word |
| `p` | Paste after cursor |
| `P` | Paste before cursor |
| `u` | Undo last change |
| `r` + `<char>` | Replace character under cursor with `<char>` |

#### Mode Switching

| Key | Action |
|-----|--------|
| `i` | Enter INSERT mode at cursor |
| `I` | Enter INSERT mode at start of line |
| `a` | Enter INSERT mode after cursor |
| `A` | Enter INSERT mode at end of line |
| `o` | Open new line below and enter INSERT mode |
| `O` | Open new line above and enter INSERT mode |
| `R` | Enter REPLACE mode |
| `:` | Enter COMMAND mode |
| `Esc` | Return to NORMAL mode (from any mode) |

### INSERT Mode

Standard text insertion mode. Type normally to insert text.

- **Esc** - Return to NORMAL mode

### REPLACE Mode

Replace existing characters as you type.

- **Esc** - Return to NORMAL mode

### COMMAND Mode

Execute special commands. Press `:` from NORMAL mode to enter.

#### Available Commands

| Command | Action |
|---------|--------|
| `:q` | Quit Vim mode (return to normal editing) |
| `:w` | Save document |
| `:wq` | Save and quit Vim mode |
| `:x` | Save and quit Vim mode |
| `:q!` | Force quit Vim mode without saving |

The command buffer is shown in the indicator as you type.

## Macro Recording

Record and replay sequences of commands.

### Recording a Macro

1. Press `q` followed by a register letter (a-z) to start recording
   - Example: `qa` starts recording to register 'a'
2. Perform your commands
3. Press `q` again to stop recording

A recording indicator (◉ Recording @a) will be shown while recording.

### Playing a Macro

Press `@` followed by the register letter to replay the macro.
- Example: `@a` plays the macro stored in register 'a'

## Visual Indicators

The Vim mode indicator in the bottom-left shows:

1. **Current Mode** - Color-coded badge (NORMAL, INSERT, REPLACE, COMMAND)
2. **Command Buffer** - Shows `:` commands as you type them
3. **Recording Status** - Animated indicator when recording macros
4. **Count Prefix** - Shows the count number when entering numeric prefixes

## Tips

- Start with basic navigation (`hjkl`) and mode switching (`i`, `Esc`)
- Use count prefixes to move faster (e.g., `10j` to move down 10 lines)
- Combine commands with motions (e.g., `d3w` to delete 3 words)
- Remember `:wq` to save and exit Vim mode
- Press **Ctrl+Shift+V** anytime to toggle Vim mode off

## Compatibility

Vim mode works alongside BlockNote's rich text features:
- Formatting from the toolbar is preserved
- Block-level elements (lists, headings) are supported
- Auto-save continues to work in the background
- All standard editor features remain accessible

## Limitations

- Some advanced Vim features (text objects, visual block mode, registers for copy/paste) are not yet implemented
- Vim mode is editor-specific and doesn't affect other UI elements
- Command-line search (/) is planned for future releases

## Future Enhancements

Planned features for upcoming releases:
- Visual selection mode with more features
- Text objects (e.g., `diw`, `ci"`)
- Additional commands (`:set`, `:help`)
- Search and replace with patterns
- More advanced macro features
- Vim configuration options

## Feedback

We're continuously improving the Vim mode implementation. Please report any issues or feature requests on our GitHub repository.

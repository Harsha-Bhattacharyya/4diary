# Math, Calculator, and Search Features

This guide covers the new mathematical, calculation, and search capabilities in 4diary.

## 📐 LaTeX Math Notation

4diary supports LaTeX math notation for writing mathematical expressions in your notes.

### Inline Math

Use single dollar signs `$...$` for inline mathematical expressions:

```
The formula $E = mc^2$ is Einstein's famous equation.
The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.
```

### Display Math

Use double dollar signs `$$...$$` for centered, display-mode equations:

```
$$
\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

$$
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
$$
```

### Supported LaTeX Features

The math renderer supports:
- Greek letters: `\alpha`, `\beta`, `\gamma`, etc.
- Operators: `\sum`, `\int`, `\prod`, `\lim`
- Fractions: `\frac{numerator}{denominator}`
- Square roots: `\sqrt{x}` or `\sqrt[n]{x}`
- Superscripts: `x^2` or `x^{expression}`
- Subscripts: `x_i` or `x_{expression}`
- Matrices: `\begin{matrix}...\end{matrix}`
- And much more from standard LaTeX math

## 🔢 Built-in Calculator

Access a powerful calculator directly from your workspace.

### Opening the Calculator

- **Keyboard shortcut**: Press `Ctrl+Shift+C` (Windows/Linux) or `Cmd+Shift+C` (Mac)
- **Menu**: Click the menu button → Calculator

### Basic Operations

The calculator supports:

- **Arithmetic**: `+`, `-`, `*`, `/`
- **Exponentiation**: `^` or `**` (e.g., `2^3` = 8)
- **Parentheses**: For grouping operations

### Mathematical Functions

Built-in functions include:

- `sqrt(x)` - Square root
- `sin(x)`, `cos(x)`, `tan(x)` - Trigonometric functions
- `log(x)` - Natural logarithm
- `abs(x)` - Absolute value
- `exp(x)` - Exponential function
- `pow(x, y)` - Power function

### Constants

Use mathematical constants:

- `pi` - π (3.14159...)
- `e` - Euler's number (2.71828...)

### Examples

```
Basic arithmetic:
5 + 3 * 2        → 11
(5 + 3) * 2      → 16

Functions:
sqrt(16)         → 4
sin(pi/2)        → 1
2^8              → 256

Complex expressions:
sqrt(2^2 + 3^2)  → 3.605551275...
log(e^3)         → 3
```

### Calculator Features

- **History**: View your last 10 calculations
- **LaTeX Display**: Toggle to show results as LaTeX expressions
- **Insert to Editor**: Click "Insert to Editor" to add results to your document
- **Keyboard shortcuts**:
  - `Enter` to calculate
  - `Esc` to close calculator

### Quick Buttons

Use the quick insert buttons for common operations:
- π, e - Mathematical constants
- √ - Square root
- ^ - Exponentiation
- sin, cos, tan - Trigonometric functions
- log - Logarithm

## 🔍 Powerful Note Search

Search across all your documents quickly and efficiently.

### Opening Search

- **Keyboard shortcut**: Press `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)
- **Menu**: Click the menu button → Search Notes

### Search Features

#### Fuzzy Matching

The search uses intelligent fuzzy matching that:
- Finds results even with typos
- Scores results by relevance
- Highlights matching characters

#### Search Filters

Filter your search by:
- **All** - Search across all fields
- **Title** - Search only document titles
- **Content** - Search only document content
- **Tags** - Search only tags
- **Folder** - Search only folder names

#### Visual Highlights

Matching text is highlighted in yellow to show exactly what matched your query.

### Search Navigation

- **Arrow keys** (`↑` / `↓`) - Navigate through results
- **Enter** - Open selected document
- **Esc** - Close search modal

### Search Results

Results display:
- Document emoji icon
- Document title (with highlights)
- Content preview (if content matched)
- Folder name
- Tags
- Last modified date

### Search Tips

1. **Start broad**: Begin with a general term and refine with filters
2. **Use filters**: When you know what you're looking for (e.g., tag name)
3. **Keyboard navigation**: Stay focused on the keyboard for faster workflow
4. **Fuzzy search**: Don't worry about exact matches - the algorithm finds related content

### Examples

**Find a document by title:**
1. Press `Ctrl+K`
2. Click "Title" filter
3. Type part of the title
4. Press Enter to open

**Search for tagged documents:**
1. Press `Ctrl+K`
2. Click "Tags" filter
3. Type the tag name
4. Browse results and select with arrow keys

**Find content across all documents:**
1. Press `Ctrl+K`
2. Keep "All" filter selected
3. Type keywords from the content
4. Review highlighted matches in results

## 💻 Enhanced Syntax Highlighting

Code blocks in your documents now feature comprehensive syntax highlighting.

### Supported Languages

The enhanced syntax highlighting supports all languages from highlight.js, including:

- JavaScript, TypeScript
- Python, Ruby, PHP
- Java, C, C++, C#
- Go, Rust
- HTML, CSS, SCSS
- SQL, Bash, Shell
- JSON, YAML, XML
- Markdown
- And many more...

### Using Code Blocks

1. In the editor, use the slash menu (`/`) to insert a code block
2. Select the language from the dropdown
3. Your code will be automatically highlighted

### Custom Theme

The syntax highlighting uses a custom theme that matches 4diary's leather aesthetic:
- Soft background color
- Readable contrast
- Highlighted keywords, strings, and comments
- Special styling for functions, types, and variables

## Keyboard Shortcuts Reference

Quick reference for new keyboard shortcuts:

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+C` (or `Cmd+Shift+C`) | Open Calculator |
| `Ctrl+K` (or `Cmd+K`) | Open Search |
| `Enter` (in Calculator) | Calculate expression |
| `Enter` (in Search) | Open selected document |
| `Esc` | Close modal (Calculator or Search) |
| `↑` / `↓` (in Search) | Navigate results |

## Tips and Best Practices

### Math Notation
- Use LaTeX for complex equations to keep them readable and editable
- Display mode (`$$...$$`) works best for standalone equations
- Inline mode (`$...$`) is perfect for math within text

### Calculator
- Save frequently used expressions in your calculation history
- Use the LaTeX display option to create beautiful formatted results
- Insert calculated results directly into your notes

### Search
- Build a consistent tagging system for easier filtering
- Use meaningful folder names to organize documents
- Regular use of search helps maintain an organized knowledge base

### Syntax Highlighting
- Always specify the language for your code blocks for optimal highlighting
- Use code blocks for any technical content, not just programming code
- The syntax highlighting works great for configuration files, logs, and data formats

## Troubleshooting

### Math Not Rendering
- Check that your LaTeX syntax is correct
- Ensure you're using proper delimiters (`$...$` or `$$...$$`)
- Complex expressions may need explicit grouping with `{}`

### Calculator Errors
- Verify function names are spelled correctly
- Check that parentheses are balanced
- Use `pi` and `e` (lowercase) for constants

### Search Not Finding Results
- Try using the "All" filter first
- Check for typos in your search query
- Remember that fuzzy search works best with at least 3 characters

## Privacy Note

All these features maintain 4diary's commitment to privacy:
- Math notation is stored encrypted
- Calculator results are not stored on the server
- Search is performed entirely client-side on decrypted content
- No telemetry or tracking of your searches or calculations

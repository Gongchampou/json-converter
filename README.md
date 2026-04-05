# JSON Editor

A VS Code-style JSON editor with live preview, document conversion, and real-time validation.

## Features

### Editor Features

- **Syntax Highlighting** - JSON text is color-coded (green for valid, red for invalid)
- **Line Numbers** - Scrollable line numbers that sync with the editor
- **Tab Support** - Press Tab to insert 2 spaces for proper indentation
- **Real-time Validation** - Shows "Valid" or "Invalid" badge instantly as you type
- **Auto-fix Newlines** - Automatically handles unescaped newlines in JSON strings

### Editor Actions

| Button | Description |
|--------|-------------|
| **Beautify** | Formats JSON with proper indentation (2 spaces) |
| **Minify** | Compresses JSON to a single line |
| **Copy** | Copies the entire JSON to clipboard |
| **Clear** | Clears the editor content |

### File Operations

| Button | Description |
|--------|-------------|
| **Upload JSON** | Load a `.json` file from your computer |
| **Download** | Save the current JSON as `data.json` |
| **PDF to JSON** | Convert PDF files to JSON (extracts text with bold/italic formatting) |
| **Word to JSON** | Convert Word documents (.docx) to JSON (extracts text with full formatting including colors) |

### Document Conversion

#### PDF to JSON
- Extracts text from all pages
- Detects **bold** text from font names and wraps in `<b>` tags
- Detects *italic* text from font names and wraps in `<i>` tags
- Preserves line breaks and paragraph spacing
- Groups consecutive formatted text together (no redundant tags)
- Output format: `{"content": "\n<b>Title</b>\nParagraph text..."}`

#### Word to JSON (.docx)
- Extracts text with full formatting:
  - **Bold** - `<b>text</b>`
  - *Italic* - `<i>text</i>`
  - <u>Underline</u> - `<u>text</u>`
  - Colors - `<font color="#FF0000">text</font>`
- **Smart Color Detection** - Finds the most common color in the document and treats it as default (no tag needed). Only different colors get `<font>` tags.
- Groups text with same formatting together for cleaner output
- Output format: `{"content": "\n<b>Heading</b>\nNormal text <font color=\"#FF0000\">red text</font>..."}`

### Preview Features

- **Live Preview** - See formatted output as you type
- **Smart Rendering** - Different data types are rendered appropriately:
  - **Booleans** - Displayed as "Yes" (green) or "No" (red) badges
  - **Numbers** - Formatted with locale-specific separators (e.g., 12,500)
  - **URLs** - Clickable links that open in new tab
  - **Emails** - Clickable mailto links
  - **Dates** - Automatically formatted to readable date (e.g., "January 15, 2024")
  - **HTML Content** - Rendered with proper formatting (bold, italic, underline, colors)
  - **Long Text** - Displayed as paragraphs with preserved line breaks
  - **Arrays** - Shown as tags for simple values, or cards for objects
  - **Objects** - Nested display with proper indentation
- **Copy Button** - Copy the formatted JSON from preview

### Theme

- **Dark/Light Mode** - Toggle between themes using the theme button in the header
- **System Preference** - Automatically detects your system theme preference

## How to Use

### Basic JSON Editing

1. Type or paste JSON in the left editor panel
2. See the live preview on the right panel
3. Use **Beautify** to format messy JSON
4. Use **Minify** to compress JSON for production

### Converting PDF to JSON

1. Click the **PDF to JSON** button
2. Select a PDF file from your computer
3. Wait for conversion (shows "Converting..." status)
4. The extracted text with formatting appears in the editor

### Converting Word to JSON

1. Click the **Word to JSON** button (blue button)
2. Select a `.docx` file from your computer
3. Wait for conversion
4. The extracted text with all formatting (bold, italic, underline, colors) appears in the editor

### Uploading JSON Files

1. Click **Upload JSON**
2. Select a `.json` file
3. The content loads into the editor

### Downloading JSON

1. Edit your JSON in the editor
2. Ensure it shows "Valid" status
3. Click **Download** to save as `data.json`

## JSON Output Format

When converting PDF or Word documents, the output follows this format:

```json
{
  "content": "\n<b>Document Title</b>\nThis is regular text.\n<b>Section Heading:</b>\nMore content here.\n<font color=\"#0000FF\">Blue colored text</font>\n<i>Italic text</i>"
}
```

### Supported HTML Tags in Content

| Tag | Description | Example |
|-----|-------------|---------|
| `<b>` | Bold text | `<b>Bold</b>` |
| `<i>` | Italic text | `<i>Italic</i>` |
| `<u>` | Underlined text | `<u>Underline</u>` |
| `<font color="#HEX">` | Colored text | `<font color="#FF0000">Red</font>` |
| `\n` | Line break | `Line 1\nLine 2` |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Insert 2 spaces |

## Technical Details

- Built with **Next.js 16** and **React 19**
- Uses **PDF.js** (v3.11.174) for PDF parsing - loaded from CDN
- Uses **JSZip** (v3.10.1) for Word document extraction - loaded from CDN
- Styled with **Tailwind CSS v4**
- Uses **shadcn/ui** components
- Supports dark and light themes via **next-themes**

## Browser Support

Works in all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## License

MIT

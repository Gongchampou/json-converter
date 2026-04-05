# JSON Editor

A powerful, VS Code-style JSON editor with live preview, document conversion, and real-time validation. Built for developers and content creators who need to work with JSON data efficiently.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Getting Started](#getting-started)
5. [Editor Features](#editor-features)
6. [File Operations](#file-operations)
7. [Document Conversion](#document-conversion)
8. [Preview Features](#preview-features)
9. [Theme Support](#theme-support)
10. [Keyboard Shortcuts](#keyboard-shortcuts)
11. [JSON Output Format](#json-output-format)
12. [Troubleshooting](#troubleshooting)
13. [Technical Details](#technical-details)
14. [Browser Support](#browser-support)
15. [License](#license)

---

## Overview

JSON Editor is a web-based application that provides a complete solution for editing, validating, previewing, and converting JSON data. It features a split-panel interface with a code editor on the left and a live preview on the right.

### Key Highlights

- Real-time JSON validation as you type
- Beautiful syntax highlighting
- Live preview with smart data rendering
- Convert PDF and Word documents to JSON format
- Extract formatting (bold, italic, colors) from documents
- Dark and light theme support
- No server required - everything runs in the browser

---

## Features

### Core Features at a Glance

| Feature | Description |
|---------|-------------|
| Syntax Highlighting | Color-coded JSON for easy reading |
| Line Numbers | Numbered lines that scroll with content |
| Real-time Validation | Instant feedback on JSON validity |
| Live Preview | See formatted output as you type |
| PDF Conversion | Extract text and formatting from PDFs |
| Word Conversion | Extract text with colors from .docx files |
| Dark/Light Theme | Toggle between themes or use system preference |

---

## Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **pnpm** (recommended) or npm

### Step-by-Step Installation

1. **Clone or download the repository**

   ```bash
   git clone <repository-url>
   cd json-editor
   ```

2. **Install dependencies**

   Using pnpm (recommended):
   ```bash
   pnpm install
   ```

   Or using npm:
   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   pnpm dev
   ```

   Or with npm:
   ```bash
   npm run dev
   ```

4. **Open in browser**

   Navigate to `http://localhost:3000` in your web browser.

### Building for Production

To create a production build:

```bash
pnpm build
```

To start the production server:

```bash
pnpm start
```

---

## Getting Started

### Your First JSON Edit

1. **Open the application** in your browser
2. **Look at the interface** - you'll see two panels:
   - **Left panel**: The JSON editor where you type
   - **Right panel**: The live preview showing formatted output
3. **Start typing** or paste your JSON in the left panel
4. **Watch the preview** update in real-time on the right

### Quick Example

Try pasting this JSON into the editor:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "website": "https://johndoe.com",
  "age": 30,
  "isActive": true,
  "joinDate": "2024-01-15",
  "bio": "Hello!\nThis is my bio."
}
```

You'll see:
- The email becomes a clickable mailto link
- The website becomes a clickable URL
- The age is formatted as a number
- isActive shows as a green "Yes" badge
- joinDate is formatted as "January 15, 2024"
- The bio preserves the line break

---

## Editor Features

### Syntax Highlighting

The editor uses color-coded text to help you identify JSON structure:

- **Green text**: Valid JSON
- **Red text**: Invalid JSON (when validation fails)

The color changes in real-time as you type, giving you instant feedback.

### Line Numbers

- Line numbers appear on the left side of the editor
- They scroll synchronously with your content
- Helps you navigate large JSON files
- Useful for identifying error locations

### Real-time Validation

A badge appears in the header showing the current status:

| Badge | Meaning |
|-------|---------|
| **Valid** (green) | Your JSON is correctly formatted |
| **Invalid** (red) | There's a syntax error in your JSON |

The validation happens instantly as you type - no need to click a button.

### Tab Support

- Press **Tab** to insert 2 spaces
- Helps maintain consistent indentation
- Works anywhere in the editor

### Auto-fix Newlines

The editor automatically handles common issues:

- Unescaped newlines in strings are converted to `\n`
- Preserves intentional formatting while fixing errors

---

## File Operations

### Editor Action Buttons

Located in the header toolbar, these buttons help you work with your JSON:

#### Beautify Button

**What it does**: Formats your JSON with proper indentation

**When to use**: 
- When you have minified JSON that's hard to read
- When you want consistent 2-space indentation
- After pasting JSON from another source

**Before Beautify**:
```json
{"name":"John","age":30,"city":"New York"}
```

**After Beautify**:
```json
{
  "name": "John",
  "age": 30,
  "city": "New York"
}
```

#### Minify Button

**What it does**: Removes all unnecessary whitespace

**When to use**:
- When you need to reduce file size
- When preparing JSON for API requests
- When you need a single-line format

**Before Minify**:
```json
{
  "name": "John",
  "age": 30,
  "city": "New York"
}
```

**After Minify**:
```json
{"name":"John","age":30,"city":"New York"}
```

#### Copy Button

**What it does**: Copies the entire JSON content to your clipboard

**When to use**:
- When you need to paste JSON elsewhere
- When sharing JSON with others
- When moving data between applications

**How it works**:
1. Click the Copy button
2. The JSON is copied to your clipboard
3. Paste it anywhere using Ctrl+V (or Cmd+V on Mac)

#### Clear Button

**What it does**: Removes all content from the editor

**When to use**:
- When starting fresh with new JSON
- When you want to clear mistakes
- When switching to a different project

**Warning**: This action cannot be undone. Make sure to save your work first if needed.

### File Upload and Download

#### Upload JSON Button

**What it does**: Loads a JSON file from your computer into the editor

**Step-by-step instructions**:
1. Click the **Upload JSON** button
2. A file picker dialog opens
3. Navigate to your JSON file
4. Select the file (must have `.json` extension)
5. Click "Open"
6. The file content loads into the editor

**Supported file types**: `.json` files only

#### Download Button

**What it does**: Saves your current JSON as a file on your computer

**Step-by-step instructions**:
1. Ensure your JSON is valid (shows "Valid" badge)
2. Click the **Download** button
3. A file named `data.json` downloads automatically
4. Check your Downloads folder

**Note**: The file is always named `data.json`. Rename it after downloading if needed.

---

## Document Conversion

One of the most powerful features is the ability to convert PDF and Word documents to JSON format, extracting text along with formatting.

### PDF to JSON Conversion

#### What it extracts:

| Formatting | How it's converted |
|------------|-------------------|
| Bold text | `<b>text</b>` |
| Italic text | `<i>text</i>` |
| Line breaks | `\n` |
| Paragraph breaks | `\n\n` |

#### How it works:

The converter uses PDF.js library to:
1. Parse the PDF file structure
2. Extract text content from all pages
3. Analyze font names to detect bold/italic
4. Group consecutive formatted text together
5. Output clean JSON with formatting tags

#### Step-by-step instructions:

1. Click the **PDF to JSON** button
2. Select a PDF file from your computer
3. Wait for the "Converting..." status to finish
4. The extracted text appears in the editor
5. Review and edit as needed

#### Example output:

If your PDF has:
- A bold title "Welcome"
- Normal paragraph text
- An italic note

The output will be:
```json
{
  "content": "\n<b>Welcome</b>\nThis is the paragraph text.\n<i>This is the italic note.</i>"
}
```

#### Limitations:

- **Colors cannot be extracted** - PDF.js doesn't expose color information
- **Font sizes** - Not included in output (would require AI)
- **Images** - Text only, images are not extracted
- **Complex layouts** - Multi-column layouts may not preserve order

### Word to JSON Conversion

#### What it extracts:

| Formatting | How it's converted |
|------------|-------------------|
| Bold text | `<b>text</b>` |
| Italic text | `<i>text</i>` |
| Underlined text | `<u>text</u>` |
| Colored text | `<font color="#RRGGBB">text</font>` |
| Line breaks | `\n` |

#### Smart Color Detection

This is a key feature that makes the output cleaner:

1. The converter analyzes ALL text in your document
2. It counts how many times each color is used
3. The most common color becomes the "default" (no tag needed)
4. Only text with DIFFERENT colors gets `<font>` tags

**Example**:
- If 90% of your document is black (#000000)
- And 10% is red (#FF0000)
- Only the red text gets `<font color="#FF0000">` tags
- Black text has no font tag (cleaner output)

#### How it works:

The converter:
1. Opens the .docx file (which is actually a ZIP archive)
2. Extracts the `word/document.xml` file
3. Parses the XML to find text runs with formatting
4. Detects bold (w:b), italic (w:i), underline (w:u), and color (w:color)
5. Groups text with same formatting together
6. Applies smart color detection
7. Outputs clean JSON

#### Step-by-step instructions:

1. Click the **Word to JSON** button (blue button)
2. Select a `.docx` file from your computer
3. Wait for conversion to complete
4. The extracted text with formatting appears in the editor
5. Review the output

#### Example output:

If your Word document has:
- Bold heading "Report"
- Normal text
- Red colored warning text

The output will be:
```json
{
  "content": "\n<b>Report</b>\nThis is normal text.\n<font color=\"#FF0000\">Warning: Important notice!</font>"
}
```

#### Supported file types:

- `.docx` files (Word 2007 and later)
- NOT supported: `.doc` files (old Word format)

#### Limitations:

- **Old .doc format** - Only .docx is supported
- **Images** - Not extracted
- **Tables** - Text is extracted but table structure is lost
- **Headers/Footers** - May not be included

---

## Preview Features

The right panel shows a live preview of your JSON data with smart rendering.

### Smart Data Type Rendering

The preview automatically detects and formats different data types:

#### Booleans

| Value | Display |
|-------|---------|
| `true` | Green "Yes" badge |
| `false` | Red "No" badge |

#### Numbers

Numbers are formatted with locale-specific separators:
- `12500` displays as `12,500`
- `1000000` displays as `1,000,000`

#### URLs

Any URL starting with `http://` or `https://` becomes a clickable link:
- Blue colored text
- Opens in a new tab when clicked
- Shows the full URL

#### Email Addresses

Email addresses become clickable mailto links:
- Blue colored text
- Clicking opens your email client
- Pre-fills the "To" field

#### Dates

ISO date strings are automatically formatted:
- `2024-01-15` displays as `January 15, 2024`
- `2024-12-25T00:00:00Z` displays as `December 25, 2024`

#### HTML Content

Content with HTML tags is rendered properly:
- `<b>bold</b>` shows as **bold**
- `<i>italic</i>` shows as *italic*
- `<u>underline</u>` shows as underlined
- `<font color="#FF0000">red</font>` shows as red text
- `\n` creates line breaks

#### Long Text

Text longer than 100 characters is displayed as a paragraph with:
- Preserved line breaks
- Proper text wrapping
- Readable formatting

#### Arrays

Arrays are displayed based on their content:

**Simple values** (strings, numbers):
- Displayed as inline tags/badges
- Compact, easy to scan

**Objects**:
- Each object displayed as a card
- Nested properties shown with indentation

#### Objects

Nested objects are displayed with:
- Clear hierarchy
- Proper indentation
- Expandable structure

### Preview Copy Button

A copy button appears in the preview panel header:
- Copies the formatted JSON
- Same as the editor's copy button

---

## Theme Support

### Dark and Light Modes

The application supports both dark and light themes:

| Theme | Description |
|-------|-------------|
| Light | White background, dark text |
| Dark | Dark background, light text |

### How to Change Theme

1. Look for the theme toggle button in the header (sun/moon icon)
2. Click to switch between light and dark modes
3. Your preference is saved automatically

### System Preference

By default, the app uses your system's theme preference:
- If your OS is set to dark mode, the app uses dark theme
- If your OS is set to light mode, the app uses light theme

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Insert 2 spaces at cursor |
| `Ctrl+A` / `Cmd+A` | Select all text |
| `Ctrl+C` / `Cmd+C` | Copy selected text |
| `Ctrl+V` / `Cmd+V` | Paste from clipboard |
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Redo |

---

## JSON Output Format

### Document Conversion Output

When converting PDF or Word documents, the output follows this structure:

```json
{
  "content": "\n<b>Document Title</b>\nFirst paragraph of text.\n\n<b>Section Heading</b>\nSection content here.\n<font color=\"#0000FF\">Blue text</font>\n<i>Italic text</i>"
}
```

### Supported HTML Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| `<b>` | Bold text | `<b>Bold text</b>` |
| `<i>` | Italic text | `<i>Italic text</i>` |
| `<u>` | Underlined text | `<u>Underlined</u>` |
| `<font color="#HEX">` | Colored text | `<font color="#FF0000">Red text</font>` |

### Line Break Characters

| Character | Meaning |
|-----------|---------|
| `\n` | Single line break |
| `\n\n` | Paragraph break (double line break) |

### Example: Full Document

**Original Word Document**:
```
MONTHLY REPORT (bold, black)
January 2024 (normal, black)

Summary (bold, black)
This month was productive. (normal, black)

Important Note (bold, red)
Please review carefully. (normal, red)
```

**JSON Output**:
```json
{
  "content": "\n<b>MONTHLY REPORT</b>\nJanuary 2024\n\n<b>Summary</b>\nThis month was productive.\n\n<font color=\"#FF0000\"><b>Important Note</b></font>\n<font color=\"#FF0000\">Please review carefully.</font>"
}
```

---

## Troubleshooting

### Common Issues and Solutions

#### "Invalid" badge even though JSON looks correct

**Possible causes**:
1. Missing comma between properties
2. Trailing comma after last property
3. Unquoted property names
4. Single quotes instead of double quotes

**Solution**: Use the Beautify button to help identify the issue. Check for:
- Missing or extra commas
- Matching brackets and braces
- Proper quote usage

#### PDF conversion shows "Failed to load PDF.js"

**Possible causes**:
1. Network connection issue
2. CDN is temporarily unavailable

**Solution**:
1. Check your internet connection
2. Refresh the page and try again
3. Try a different browser

#### Word conversion doesn't extract colors

**Possible causes**:
1. The color is the default/most common color
2. The .docx file uses theme colors

**Solution**:
- Smart color detection treats the most common color as default
- Only different colors get `<font>` tags
- This is intentional to keep output clean

#### Word conversion shows "Failed to convert Word document"

**Possible causes**:
1. File is not a valid .docx file
2. File is an old .doc format
3. File is corrupted

**Solution**:
1. Ensure the file has `.docx` extension
2. Open in Word and re-save as .docx
3. Try a different file

#### Line numbers don't show all lines

**Possible cause**: Browser rendering issue

**Solution**: Scroll in the editor - line numbers scroll with content

#### Preview doesn't update

**Possible cause**: Invalid JSON stops preview from rendering

**Solution**: Fix the JSON errors first (check for "Valid" badge)

---

## Technical Details

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | React framework |
| React | 19 | UI library |
| Tailwind CSS | v4 | Styling |
| shadcn/ui | Latest | UI components |
| next-themes | Latest | Theme management |

### External Libraries (Loaded from CDN)

| Library | Version | Purpose |
|---------|---------|---------|
| PDF.js | 3.11.174 | PDF parsing |
| JSZip | 3.10.1 | Word document extraction |

### Why CDN?

These libraries are loaded from CDN (unpkg.com) because:
1. Reduces initial bundle size
2. Loaded only when needed (lazy loading)
3. Cached by browser for faster subsequent loads
4. No server-side dependencies

### File Structure

```
json-editor/
├── app/
│   ├── layout.tsx      # Main layout with theme provider
│   ├── page.tsx        # Main page with all logic
│   └── globals.css     # Global styles
├── components/
│   ├── json-editor.tsx # Editor component with syntax highlighting
│   ├── json-preview.tsx# Preview component with smart rendering
│   ├── theme-toggle.tsx# Theme switch button
│   └── ui/            # shadcn/ui components
├── package.json
└── README.md
```

---

## Browser Support

### Fully Supported Browsers

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 14+ |
| Edge | 90+ |

### Known Limitations

- **Internet Explorer**: Not supported
- **Older browsers**: May have issues with CSS Grid and modern JavaScript

### Mobile Support

The application is responsive but optimized for desktop:
- **Desktop**: Full two-panel layout
- **Tablet**: Stacked panels (editor on top, preview below)
- **Mobile**: Usable but editor works best with physical keyboard

---

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## Support

If you encounter any issues or have questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Open an issue on GitHub
3. Contact the maintainers

---

**Made with care for developers and content creators.**

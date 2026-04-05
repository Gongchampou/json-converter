"use client"

import { useState, useMemo, useCallback } from "react"
import { JsonEditor } from "@/components/json-editor"
import { JsonPreview } from "@/components/json-preview"
import { Code, Eye, Braces, Download, Upload, FileText, Loader2, FileType } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const SAMPLE_JSON = `{
  "name": "JSON Editor",
  "version": "1.0.0",
  "description": "A VS Code-style JSON editor with live preview",
  "features": [
    "Syntax highlighting",
    "Line numbers",
    "Collapsible nodes",
    "Error detection",
    "Copy to clipboard"
  ],
  "settings": {
    "theme": "dark",
    "tabSize": 2,
    "wordWrap": true
  },
  "isAwesome": true,
  "downloads": 12500
}`

export interface HighlightRange {
  start: number
  end: number
}

export default function Home() {
  const [jsonText, setJsonText] = useState(SAMPLE_JSON)
  const [isConverting, setIsConverting] = useState(false)
  const [convertError, setConvertError] = useState<string | null>(null)
  const [highlightRange, setHighlightRange] = useState<HighlightRange | null>(null)
  const [editorSelectedText, setEditorSelectedText] = useState<string | null>(null)

  // Callback when text is selected in the editor
  const handleEditorSelection = useCallback((selectedText: string) => {
    console.log("[v0] handleEditorSelection called with:", selectedText)
    setEditorSelectedText(selectedText || null)
    // Clear the preview-to-editor highlight when selecting in editor
    if (selectedText) {
      setHighlightRange(null)
    }
  }, [])

  // Callback when text is selected in the preview
  const handlePreviewSelection = useCallback((selectedText: string) => {
    // Clear the editor-to-preview highlight when selecting in preview
    if (selectedText) {
      setEditorSelectedText(null)
    }
    if (!selectedText) {
      setHighlightRange(null)
      return
    }
    
    // Escape the selected text to match JSON source format
    // In JSON, newlines are stored as \n (literal backslash + n), tabs as \t, etc.
    const escapeForJson = (text: string) => {
      return text
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
    }
    
    const escapedText = escapeForJson(selectedText)
    
    // Try multiple matching strategies
    let start = -1
    let matchLength = 0
    
    // Strategy 1: Direct match (works for keys, numbers, booleans, etc.)
    start = jsonText.indexOf(selectedText)
    if (start !== -1) {
      matchLength = selectedText.length
    }
    
    // Strategy 2: Try with escaped characters (for content inside JSON strings)
    if (start === -1) {
      start = jsonText.indexOf(escapedText)
      if (start !== -1) {
        matchLength = escapedText.length
      }
    }
    
    // Strategy 3: Try wrapping in quotes (for complete JSON string values)
    if (start === -1) {
      const quotedText = `"${escapedText}"`
      const quotedStart = jsonText.indexOf(quotedText)
      if (quotedStart !== -1) {
        // Highlight just the value content, not the quotes
        start = quotedStart + 1
        matchLength = escapedText.length
      }
    }
    
    // Strategy 4: Search for partial matches - scan through all string values in JSON
    if (start === -1) {
      // Find all JSON string values and search within each
      const stringValueRegex = /"(?:[^"\\]|\\.)*"/g
      let match
      while ((match = stringValueRegex.exec(jsonText)) !== null) {
        const stringContent = match[0].slice(1, -1) // Remove surrounding quotes
        const indexInString = stringContent.indexOf(escapedText)
        if (indexInString !== -1) {
          start = match.index + 1 + indexInString // +1 for opening quote
          matchLength = escapedText.length
          break
        }
      }
    }
    
    // Strategy 5: Handle HTML content - the JSON may contain HTML tags that are stripped in preview
    // We need to find where the selected text appears when ignoring HTML tags
    if (start === -1) {
      const stringValueRegex = /"(?:[^"\\]|\\.)*"/g
      let match
      while ((match = stringValueRegex.exec(jsonText)) !== null) {
        const stringContent = match[0].slice(1, -1) // Remove surrounding quotes
        
        // Strip HTML tags from the string content to match against selection
        // HTML tags in JSON strings may have escaped quotes like: <font color=\"#C00000\">
        const strippedContent = stringContent
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/<[^>]*>/g, '') // Remove HTML tags (handles escaped quotes inside)
        
        const indexInStripped = strippedContent.indexOf(selectedText)
        if (indexInStripped !== -1) {
          // Found it! Now we need to find the corresponding position in the original string
          // by counting characters while skipping HTML tags
          let originalIndex = 0
          let strippedIndex = 0
          
          while (strippedIndex < indexInStripped && originalIndex < stringContent.length) {
            // Check for escaped sequences
            if (stringContent.slice(originalIndex, originalIndex + 2) === '\\n') {
              originalIndex += 2
              strippedIndex += 1
            } else if (stringContent.slice(originalIndex, originalIndex + 2) === '\\r') {
              originalIndex += 2
              strippedIndex += 1
            } else if (stringContent.slice(originalIndex, originalIndex + 2) === '\\t') {
              originalIndex += 2
              strippedIndex += 1
            } else if (stringContent[originalIndex] === '<') {
              // Skip HTML tag - find the closing >
              let tagEnd = originalIndex + 1
              while (tagEnd < stringContent.length && stringContent[tagEnd] !== '>') {
                // Handle escaped characters inside tags like \"
                if (stringContent[tagEnd] === '\\' && tagEnd + 1 < stringContent.length) {
                  tagEnd += 2
                } else {
                  tagEnd++
                }
              }
              originalIndex = tagEnd + 1
            } else if (stringContent.slice(originalIndex, originalIndex + 2) === '\\\"') {
              // Escaped quote
              originalIndex += 2
              strippedIndex++
            } else {
              originalIndex++
              strippedIndex++
            }
          }
          
          // Now find the end position
          let endOriginalIndex = originalIndex
          let endStrippedIndex = strippedIndex
          
          while (endStrippedIndex < strippedIndex + selectedText.length && endOriginalIndex < stringContent.length) {
            if (stringContent.slice(endOriginalIndex, endOriginalIndex + 2) === '\\n') {
              endOriginalIndex += 2
              endStrippedIndex += 1
            } else if (stringContent.slice(endOriginalIndex, endOriginalIndex + 2) === '\\r') {
              endOriginalIndex += 2
              endStrippedIndex += 1
            } else if (stringContent.slice(endOriginalIndex, endOriginalIndex + 2) === '\\t') {
              endOriginalIndex += 2
              endStrippedIndex += 1
            } else if (stringContent[endOriginalIndex] === '<') {
              // Skip HTML tag
              let tagEnd = endOriginalIndex + 1
              while (tagEnd < stringContent.length && stringContent[tagEnd] !== '>') {
                if (stringContent[tagEnd] === '\\' && tagEnd + 1 < stringContent.length) {
                  tagEnd += 2
                } else {
                  tagEnd++
                }
              }
              endOriginalIndex = tagEnd + 1
            } else if (stringContent.slice(endOriginalIndex, endOriginalIndex + 2) === '\\\"') {
              // Escaped quote
              endOriginalIndex += 2
              endStrippedIndex++
            } else {
              endOriginalIndex++
              endStrippedIndex++
            }
          }
          
          start = match.index + 1 + originalIndex // +1 for opening quote
          matchLength = endOriginalIndex - originalIndex
          break
        }
      }
    }
    
    if (start !== -1 && matchLength > 0) {
      setHighlightRange({ start, end: start + matchLength })
    } else {
      setHighlightRange(null)
    }
  }, [jsonText])

  const { parsedJson, error } = useMemo(() => {
    if (!jsonText.trim()) {
      return { parsedJson: undefined, error: null }
    }
    try {
      // First try standard JSON parse
      const parsed = JSON.parse(jsonText)
      return { parsedJson: parsed, error: null }
    } catch (e) {
      // If standard parse fails, try to fix common issues like unescaped newlines in strings
      try {
        // Replace actual newlines inside JSON strings with \n escape sequences
        // This regex finds strings and replaces newlines within them
        let fixedJson = jsonText
        
        // Convert actual newlines inside strings to \n escape sequences
        // Match content between quotes, handling escaped quotes
        fixedJson = fixedJson.replace(
          /"([^"\\]|\\.)*"/g,
          (match) => {
            // Replace actual newlines with \n escape sequence
            return match
              .replace(/\r\n/g, '\\n')
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\n')
          }
        )
        
        const parsed = JSON.parse(fixedJson)
        return { parsedJson: parsed, error: null }
      } catch {
        // If still fails, return original error
        return {
          parsedJson: undefined,
          error: e instanceof Error ? e.message : "Invalid JSON",
        }
      }
    }
  }, [jsonText])

  const handleDownload = () => {
    if (parsedJson !== undefined) {
      const blob = new Blob([JSON.stringify(parsedJson, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "data.json"
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const text = e.target?.result as string
          setJsonText(text)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handlePdfUpload = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".pdf"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setIsConverting(true)
        setConvertError(null)
        
        try {
          // Load PDF.js from CDN
          const PDFJS_VERSION = '3.11.174'
          
          type TextItem = {
            str: string
            transform: number[]
            fontName: string
            width: number
            height: number
          }
          
          type PDFJSLib = {
            GlobalWorkerOptions: { workerSrc: string }
            getDocument: (options: { data: ArrayBuffer }) => { 
              promise: Promise<{
                numPages: number
                getPage: (num: number) => Promise<{
                  getTextContent: () => Promise<{ 
                    items: TextItem[]
                    styles: Record<string, { fontFamily: string }>
                  }>
                }>
              }>
            }
          }
          
          type PDFJSWindow = Window & typeof globalThis & { pdfjsLib?: PDFJSLib }
          const win = window as PDFJSWindow
          
          // Load the library if not already loaded
          if (!win.pdfjsLib) {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement('script')
              script.src = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.js`
              script.async = true
              script.onload = () => {
                if (win.pdfjsLib) {
                  win.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js`
                  resolve()
                } else {
                  reject(new Error('PDF.js library not found'))
                }
              }
              script.onerror = () => reject(new Error('Failed to load PDF.js'))
              document.head.appendChild(script)
            })
          }
          
          const pdfjsLib = win.pdfjsLib!
          const arrayBuffer = await file.arrayBuffer()
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          
          let fullText = ''
          let currentBoldText = ''
          let inBold = false
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            
            let lastY: number | null = null
            let lastX: number | null = null
            
            // Helper to flush bold text
            const flushBold = () => {
              if (inBold && currentBoldText) {
                fullText += `<b>${currentBoldText}</b>`
                currentBoldText = ''
                inBold = false
              }
            }
            
            for (const item of textContent.items) {
              const text = item.str
              if (!text) continue
              
              // Get font size from transform matrix
              const fontSize = Math.abs(item.transform[0])
              
              // Check font name for bold/italic
              const fontName = item.fontName.toLowerCase()
              const isBold = fontName.includes('bold') || fontName.includes('black') || fontName.includes('heavy')
              const isItalic = fontName.includes('italic') || fontName.includes('oblique')
              
              // Detect line breaks based on Y position change
              const currentY = item.transform[5]
              const currentX = item.transform[4]
              
              // Check for line break
              if (lastY !== null && Math.abs(currentY - lastY) > fontSize * 0.8) {
                flushBold()
                
                // Double line break for larger gaps (paragraph)
                if (Math.abs(currentY - lastY) > fontSize * 2) {
                  fullText += '\n\n'
                } else {
                  fullText += '\n'
                }
              } else if (lastX !== null && currentX < lastX - 50) {
                flushBold()
                fullText += '\n'
              }
              
              lastY = currentY
              lastX = currentX + item.width
              
              // Handle text with simple tags
              if (isBold) {
                if (!inBold) {
                  inBold = true
                  currentBoldText = text
                } else {
                  currentBoldText += text
                }
              } else {
                flushBold()
                if (isItalic) {
                  fullText += `<i>${text}</i>`
                } else {
                  fullText += text
                }
              }
            }
            
            // Flush remaining bold at end of page
            flushBold()
            
            // Add page break
            if (i < pdf.numPages) {
              fullText += '\n\n'
            }
          }
          
          // Clean up the text - merge consecutive tags
          fullText = fullText
            .replace(/<\/b><b>/g, '')
            .replace(/<\/i><i>/g, '')
            .replace(/\n\n\n+/g, '\n\n')
            .trim()
          
          const jsonData = { content: '\n' + fullText }
          setJsonText(JSON.stringify(jsonData, null, 2))
        } catch (err) {
          setConvertError(err instanceof Error ? err.message : 'Failed to convert PDF')
        } finally {
          setIsConverting(false)
        }
      }
    }
    input.click()
  }

  const handleWordUpload = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".docx"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setIsConverting(true)
        setConvertError(null)
        
        try {
          // Load JSZip to extract docx (which is a zip file)
          type JSZipLib = {
            loadAsync: (data: ArrayBuffer) => Promise<{
              file: (name: string) => { async: (type: string) => Promise<string> } | null
            }>
          }
          
          type JSZipWindow = Window & typeof globalThis & { JSZip?: new () => JSZipLib }
          const win = window as JSZipWindow
          
          if (!win.JSZip) {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement('script')
              script.src = 'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js'
              script.async = true
              script.onload = () => {
                if (win.JSZip) {
                  resolve()
                } else {
                  reject(new Error('JSZip library not found'))
                }
              }
              script.onerror = () => reject(new Error('Failed to load JSZip'))
              document.head.appendChild(script)
            })
          }
          
          const JSZip = win.JSZip!
          const zip = new JSZip()
          const arrayBuffer = await file.arrayBuffer()
          const zipContent = await zip.loadAsync(arrayBuffer)
          
          // Get the main document XML
          const documentXml = zipContent.file('word/document.xml')
          if (!documentXml) {
            throw new Error('Invalid Word document')
          }
          
          const xmlContent = await documentXml.async('string')
          
          // Parse XML to extract text with formatting
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')
          
          // First pass: count colors to find the most common one (default color)
          const colorCounts: Record<string, number> = { '': 0 }
          const allRuns = xmlDoc.getElementsByTagName('w:r')
          
          for (let r = 0; r < allRuns.length; r++) {
            const run = allRuns[r]
            const rPr = run.getElementsByTagName('w:rPr')[0]
            let color = ''
            
            if (rPr) {
              const colorEl = rPr.getElementsByTagName('w:color')[0]
              if (colorEl) {
                const colorVal = colorEl.getAttribute('w:val')
                if (colorVal && colorVal !== 'auto' && colorVal !== '000000') {
                  color = '#' + colorVal
                }
              }
            }
            
            colorCounts[color] = (colorCounts[color] || 0) + 1
          }
          
          // Find the most common color - this becomes the default (no tag needed)
          let defaultColor = ''
          let maxCount = 0
          for (const [color, count] of Object.entries(colorCounts)) {
            if (count > maxCount) {
              maxCount = count
              defaultColor = color
            }
          }
          
          let fullText = ''
          
          // Track current formatting state for grouping
          let currentText = ''
          let currentStyle = { bold: false, italic: false, underline: false, color: '' }
          
          // Helper to flush accumulated text with its formatting
          const flushText = () => {
            if (!currentText) return
            
            let formatted = currentText
            
            // Only add font tag if color is DIFFERENT from the most common color
            if (currentStyle.color && currentStyle.color !== defaultColor) {
              formatted = `<font color="${currentStyle.color}">${formatted}</font>`
            }
            if (currentStyle.underline) {
              formatted = `<u>${formatted}</u>`
            }
            if (currentStyle.italic) {
              formatted = `<i>${formatted}</i>`
            }
            if (currentStyle.bold) {
              formatted = `<b>${formatted}</b>`
            }
            
            fullText += formatted
            currentText = ''
          }
          
          // Get all paragraphs
          const paragraphs = xmlDoc.getElementsByTagName('w:p')
          
          for (let p = 0; p < paragraphs.length; p++) {
            const para = paragraphs[p]
            
            // Get all runs (text segments with formatting) in this paragraph
            const runs = para.getElementsByTagName('w:r')
            
            for (let r = 0; r < runs.length; r++) {
              const run = runs[r]
              
              // Get text content
              const textNodes = run.getElementsByTagName('w:t')
              let text = ''
              for (let t = 0; t < textNodes.length; t++) {
                text += textNodes[t].textContent || ''
              }
              
              if (!text) continue
              
              // Get run properties for formatting
              const rPr = run.getElementsByTagName('w:rPr')[0]
              
              let isBold = false
              let isItalic = false
              let isUnderline = false
              let color = ''
              
              if (rPr) {
                isBold = rPr.getElementsByTagName('w:b').length > 0 || 
                         rPr.getElementsByTagName('w:bCs').length > 0
                isItalic = rPr.getElementsByTagName('w:i').length > 0 ||
                           rPr.getElementsByTagName('w:iCs').length > 0
                isUnderline = rPr.getElementsByTagName('w:u').length > 0
                
                const colorEl = rPr.getElementsByTagName('w:color')[0]
                if (colorEl) {
                  const colorVal = colorEl.getAttribute('w:val')
                  if (colorVal && colorVal !== 'auto' && colorVal !== '000000') {
                    color = '#' + colorVal
                  }
                }
              }
              
              // Check if formatting changed
              const styleChanged = 
                currentStyle.bold !== isBold ||
                currentStyle.italic !== isItalic ||
                currentStyle.underline !== isUnderline ||
                currentStyle.color !== color
              
              if (styleChanged) {
                // Flush previous text with old formatting
                flushText()
                // Update to new formatting
                currentStyle = { bold: isBold, italic: isItalic, underline: isUnderline, color }
              }
              
              // Accumulate text
              currentText += text
            }
            
            // Flush at end of paragraph and add newline
            flushText()
            fullText += '\n'
          }
          
          // Clean up excess newlines
          fullText = fullText
            .replace(/\n\n+/g, '\n')
            .trim()
          
          const jsonData = { content: '\n' + fullText }
          setJsonText(JSON.stringify(jsonData, null, 2))
        } catch (err) {
          setConvertError(err instanceof Error ? err.message : 'Failed to convert Word document')
        } finally {
          setIsConverting(false)
        }
      }
    }
    input.click()
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="relative flex items-center justify-between border-b border-border bg-sidebar px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded bg-primary">
            <Braces className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              JSON Editor
            </h1>
            <p className="text-xs text-muted-foreground">
              Edit and preview JSON in real-time
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpload}
            className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:bg-accent"
          >
            <Upload className="size-3.5" />
            Upload JSON
          </button>
          <button
            onClick={handlePdfUpload}
            disabled={isConverting}
            className="flex items-center gap-1.5 rounded-md border border-border bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConverting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <FileText className="size-3.5" />
                PDF to JSON
              </>
            )}
          </button>
          <button
            onClick={handleWordUpload}
            disabled={isConverting}
            className="flex items-center gap-1.5 rounded-md border border-border bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConverting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <FileType className="size-3.5" />
                Word to JSON
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={parsedJson === undefined}
            className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-3.5" />
            Download
          </button>
          <ThemeToggle />
        </div>
        {convertError && (
          <div className="absolute right-4 top-16 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {convertError}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
        {/* Editor Panel */}
        <div className="flex min-h-0 flex-col border-b border-border md:border-b-0 md:border-r">
          <div className="min-h-0 flex-1">
            <JsonEditor value={jsonText} onChange={setJsonText} error={error} highlightRange={highlightRange} onSelection={handleEditorSelection} />
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex min-h-0 flex-col">
          <div className="min-h-0 flex-1">
            <JsonPreview data={parsedJson} error={error} onSelection={handlePreviewSelection} highlightText={editorSelectedText} />
          </div>
        </div>
      </main>

      {/* Status bar */}
      <footer className="flex items-center justify-between border-t border-border bg-sidebar px-4 py-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>JSON</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          {parsedJson !== undefined ? (
            <span className="text-emerald-600 dark:text-emerald-400">Valid</span>
          ) : error ? (
            <span className="text-destructive">Invalid</span>
          ) : (
            <span>Empty</span>
          )}
        </div>
      </footer>
    </div>
  )
}

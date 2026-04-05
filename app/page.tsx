"use client"

import { useState, useMemo } from "react"
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

export default function Home() {
  const [jsonText, setJsonText] = useState(SAMPLE_JSON)
  const [isConverting, setIsConverting] = useState(false)
  const [convertError, setConvertError] = useState<string | null>(null)

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
          // Load mammoth.js dynamically from CDN
          type MammothLib = {
            convertToHtml: (options: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>
          }
          
          type MammothWindow = Window & typeof globalThis & { mammoth?: MammothLib }
          const win = window as MammothWindow
          
          if (!win.mammoth) {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement('script')
              script.src = 'https://unpkg.com/mammoth@1.6.0/mammoth.browser.min.js'
              script.async = true
              script.onload = () => {
                if (win.mammoth) {
                  resolve()
                } else {
                  reject(new Error('Mammoth.js library not found'))
                }
              }
              script.onerror = () => reject(new Error('Failed to load Mammoth.js'))
              document.head.appendChild(script)
            })
          }
          
          const mammoth = win.mammoth!
          const arrayBuffer = await file.arrayBuffer()
          
          // Convert Word to HTML - mammoth preserves bold, italic, colors, etc.
          const result = await mammoth.convertToHtml({ arrayBuffer })
          let html = result.value
          
          // Convert HTML to simple format with \n for line breaks
          // Replace paragraph and break tags with newlines
          html = html
            .replace(/<\/p><p>/g, '\n\n')
            .replace(/<p>/g, '')
            .replace(/<\/p>/g, '\n')
            .replace(/<br\s*\/?>/g, '\n')
            // Keep bold, italic, underline tags
            .replace(/<strong>/g, '<b>')
            .replace(/<\/strong>/g, '</b>')
            .replace(/<em>/g, '<i>')
            .replace(/<\/em>/g, '</i>')
            // Remove other HTML tags but keep content
            .replace(/<(?!\/?(b|i|u|font|span)[>\s])[^>]+>/g, '')
            // Clean up extra newlines
            .replace(/\n\n\n+/g, '\n\n')
            .trim()
          
          const jsonData = { content: '\n' + html }
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
          <div className="flex shrink-0 items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
            <Code className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Editor</span>
          </div>
          <div className="min-h-0 flex-1">
            <JsonEditor value={jsonText} onChange={setJsonText} error={error} />
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex min-h-0 flex-col">
          <div className="flex shrink-0 items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
            <Eye className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Preview
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <JsonPreview data={parsedJson} error={error} />
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

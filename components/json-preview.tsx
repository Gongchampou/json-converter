"use client"

import { useState, useMemo, useEffect, useCallback, createContext, useContext } from "react"
import { Copy, Check, FileText } from "lucide-react"

// Context to pass highlight text to nested components
const HighlightContext = createContext<string | null>(null)

// Helper function to highlight text within HTML content
function HighlightedHtml({ html }: { html: string }) {
  const highlightText = useContext(HighlightContext)
  
  const highlightedHtml = useMemo(() => {
    if (!highlightText || highlightText.length < 2) {
      return html
    }
    
    // Escape special regex characters in the search text
    const escapedSearch = highlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    
    // Create a regex that matches the text but not inside HTML tags
    const regex = new RegExp(`(${escapedSearch})(?![^<]*>)`, 'gi')
    
    // Replace matches with highlighted version
    return html.replace(regex, '<mark class="border-b-2 border-yellow-500 bg-yellow-500/20">$1</mark>')
  }, [html, highlightText])
  
  return (
    <div 
      className="prose dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-line [&_b]:font-bold [&_b]:text-foreground [&_i]:italic [&_u]:underline [&_mark]:text-inherit"
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
    />
  )
}

// Helper function to highlight text matches
function HighlightedText({ text }: { text: string }) {
  const highlightText = useContext(HighlightContext)
  
  console.log("[v0] HighlightedText - highlightText:", highlightText, "text:", text?.substring(0, 30))
  
  if (!highlightText || highlightText.length < 2) {
    return <>{text}</>
  }
  
  // Find all occurrences of the highlight text (case-insensitive)
  const parts: { text: string; highlight: boolean }[] = []
  let lastIndex = 0
  const lowerText = text.toLowerCase()
  const lowerHighlight = highlightText.toLowerCase()
  
  let index = lowerText.indexOf(lowerHighlight)
  while (index !== -1) {
    if (index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, index), highlight: false })
    }
    parts.push({ text: text.slice(index, index + highlightText.length), highlight: true })
    lastIndex = index + highlightText.length
    index = lowerText.indexOf(lowerHighlight, lastIndex)
  }
  
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false })
  }
  
  if (parts.length === 0) {
    return <>{text}</>
  }
  
  return (
    <>
      {parts.map((part, i) =>
        part.highlight ? (
          <mark key={i} className="border-b-2 border-yellow-500 bg-yellow-500/20 text-inherit">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  )
}

interface JsonPreviewProps {
  data: unknown
  error?: string | null
  onSelection?: (selectedText: string) => void
  highlightText?: string | null
}

function formatKey(key: string): string {
  // Convert camelCase or snake_case to Title Case with spaces
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim()
}

function RenderValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null) {
    return <span className="italic text-muted-foreground">None</span>
  }

  if (typeof value === "boolean") {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          value
            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/20 text-red-600 dark:text-red-400"
        }`}
      >
        {value ? "Yes" : "No"}
      </span>
    )
  }

  if (typeof value === "number") {
    return <span className="font-medium text-sky-600 dark:text-sky-400">{value.toLocaleString()}</span>
  }

  if (typeof value === "string") {
    // Convert literal \n to actual newlines for display
    const processedValue = value.replace(/\\n/g, "\n")
    
// Check if it's a URL
  if (processedValue.match(/^https?:\/\//)) {
  return (
  <a
  href={processedValue}
  target="_blank"
  rel="noopener noreferrer"
  className="text-primary underline underline-offset-2 hover:text-primary/80"
  >
  <HighlightedText text={processedValue} />
  </a>
  )
  }
  // Check if it's an email
  if (processedValue.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
  return (
  <a
  href={`mailto:${processedValue}`}
  className="text-primary underline underline-offset-2 hover:text-primary/80"
  >
  <HighlightedText text={processedValue} />
  </a>
  )
  }
    // Check if it looks like a date
    if (processedValue.match(/^\d{4}-\d{2}-\d{2}/) || processedValue.match(/^\d{2}\/\d{2}\/\d{4}/)) {
      try {
        const date = new Date(processedValue)
        if (!isNaN(date.getTime())) {
          const formattedDate = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
          return (
            <span className="text-foreground">
              <HighlightedText text={formattedDate} />
            </span>
          )
        }
      } catch {
        // Not a valid date, render as string
      }
    }
    // Check if it contains HTML tags - render as HTML document
    if (processedValue.match(/<[^>]+>/)) {
      return (
        <HighlightedHtml html={processedValue} />
      )
    }
// Check if it's a long text (multiline) - render as paragraph
  if (processedValue.includes("\n") || processedValue.length > 100) {
  return (
  <p className="text-foreground leading-relaxed whitespace-pre-line">
  <HighlightedText text={processedValue} />
  </p>
  )
  }
  return <span className="text-foreground"><HighlightedText text={processedValue} /></span>
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="italic text-muted-foreground">Empty list</span>
    }

    // Check if it's an array of primitives
    const allPrimitives = value.every(
      (item) =>
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean"
    )

    if (allPrimitives) {
      return (
        <div className="flex flex-wrap gap-1.5">
{value.map((item, index) => (
  <span
  key={index}
  className="inline-flex items-center rounded-md bg-accent px-2 py-1 text-sm"
  >
  <HighlightedText text={String(item)} />
  </span>
  ))}
        </div>
      )
    }

    // Array of objects - render as cards
    return (
      <div className="mt-2 space-y-3">
        {value.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-background p-4"
          >
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              Item {index + 1}
            </div>
            <RenderValue value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    )
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) {
      return <span className="italic text-muted-foreground">Empty object</span>
    }

    return (
      <div className={`space-y-4 ${depth > 0 ? "" : ""}`}>
        {entries.map(([key, val]) => {
          const isComplexValue =
            typeof val === "object" && val !== null && Object.keys(val).length > 0

          return (
            <div key={key} className="space-y-1">
<span className="block text-sm font-medium text-muted-foreground">
  <HighlightedText text={formatKey(key)} />
  </span>
              {isComplexValue ? (
                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <RenderValue value={val} depth={depth + 1} />
                </div>
              ) : (
                <div className="text-left">
                  <RenderValue value={val} depth={depth + 1} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return <span>{String(value)}</span>
}

export function JsonPreview({ data, error, onSelection, highlightText }: JsonPreviewProps) {
  const [copied, setCopied] = useState(false)

  // Handle text selection in the preview
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    const selectedText = selection?.toString().trim() || ""
    onSelection?.(selectedText)
  }, [onSelection])

  // Clear selection when clicking outside or pressing escape
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        onSelection?.("")
      }
    }

    document.addEventListener("selectionchange", handleSelectionChange)
    return () => document.removeEventListener("selectionchange", handleSelectionChange)
  }, [onSelection])

  const formattedJson = useMemo(() => {
    if (data === undefined) return ""
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return ""
    }
  }, [data])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error("Failed to copy")
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden" onMouseUp={handleMouseUp}>
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-sidebar px-4 py-2">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Document Preview</span>
          {!error && data !== undefined && (
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              Valid JSON
            </span>
          )}
        </div>
        {!error && data !== undefined && (
          <button
            onClick={handleCopy}
            className="relative flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-all hover:bg-accent"
          >
            <span className={`flex items-center gap-1.5 transition-all duration-200 ${copied ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}>
              <Copy className="size-3.5" />
              Copy
            </span>
            <span className={`absolute inset-0 flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 transition-all duration-200 ${copied ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}>
              <Check className="size-3.5" />
              Copied!
            </span>
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
            <div className="rounded-full bg-destructive/20 p-3">
              <svg
                className="size-6 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-destructive">Invalid JSON</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : data === undefined || data === null ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-full bg-muted p-4">
              <FileText className="size-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">No Data to Preview</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste or type JSON in the editor to see it displayed here
              </p>
            </div>
          </div>
        ) : typeof data === "object" && Object.keys(data as object).length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-full bg-muted p-4">
              <FileText className="size-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Empty Object</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The JSON contains an empty object or array
              </p>
            </div>
          </div>
        ) : (
<div className="bg-card p-8">
  {/* Document container - like a PDF page */}
  <div className="mx-auto max-w-3xl">
  <div className="rounded-xl border border-border bg-background p-6 shadow-lg">
{console.log("[v0] JsonPreview highlightText prop:", highlightText)}
<HighlightContext.Provider value={highlightText || null}>
  <RenderValue value={data} />
</HighlightContext.Provider>
  </div>
  </div>
  </div>
        )}
      </div>
    </div>
  )
}

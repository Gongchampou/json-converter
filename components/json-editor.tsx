"use client"

import { useCallback, useRef, useEffect, useState, useMemo } from "react"
import { Sparkles, Minimize2, Trash2, Copy, Check } from "lucide-react"

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  error?: string | null
}

// Syntax highlighting function for JSON
function highlightJson(code: string): string {
  if (!code) return ""
  
  // Escape HTML first
  let highlighted = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
  
  // Highlight strings (keys and values)
  highlighted = highlighted.replace(
    /"([^"\\]|\\.)*"/g,
    (match) => {
      // Check if it's a key (followed by :)
      return `<span class="json-string">${match}</span>`
    }
  )
  
  // Highlight numbers
  highlighted = highlighted.replace(
    /\b(-?\d+\.?\d*(?:[eE][+-]?\d+)?)\b/g,
    '<span class="json-number">$1</span>'
  )
  
  // Highlight booleans
  highlighted = highlighted.replace(
    /\b(true|false)\b/g,
    '<span class="json-boolean">$1</span>'
  )
  
  // Highlight null
  highlighted = highlighted.replace(
    /\bnull\b/g,
    '<span class="json-null">null</span>'
  )
  
  // Highlight brackets and braces
  highlighted = highlighted.replace(
    /([{}\[\]])/g,
    '<span class="json-bracket">$1</span>'
  )
  
  // Highlight colons and commas
  highlighted = highlighted.replace(
    /(:)/g,
    '<span class="json-punctuation">$1</span>'
  )
  
  return highlighted
}

export function JsonEditor({ value, onChange, error }: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  const lines = value.split("\n")
  const lineCount = lines.length
  
  const highlightedCode = useMemo(() => highlightJson(value), [value])

  const handleScroll = useCallback(() => {
    if (textareaRef.current) {
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
      }
      if (highlightRef.current) {
        highlightRef.current.scrollTop = textareaRef.current.scrollTop
        highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
      }
    }
  }, [])

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.addEventListener("scroll", handleScroll)
      return () => textarea.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      const newValue = value.substring(0, start) + "  " + value.substring(end)
      onChange(newValue)
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2
      }, 0)
    }
  }

  const handleBeautify = () => {
    try {
      const parsed = JSON.parse(value)
      // Format with 2 spaces and ensure brackets are on separate lines for easy editing
      const beautified = JSON.stringify(parsed, null, 2)
      onChange(beautified)
    } catch {
      // Can't beautify invalid JSON
    }
  }

  const handleCopy = async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Copy failed
    }
  }

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(value)
      onChange(JSON.stringify(parsed))
    } catch {
      // Can't minify invalid JSON
    }
  }

  const handleClear = () => {
    onChange("")
  }

  const isValidJson = (() => {
    try {
      JSON.parse(value)
      return true
    } catch {
      return false
    }
  })()

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-sidebar px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex size-3 items-center justify-center rounded-full bg-[#ff5f56]" />
          <div className="flex size-3 items-center justify-center rounded-full bg-[#ffbd2e]" />
          <div className="flex size-3 items-center justify-center rounded-full bg-[#27c93f]" />
        </div>
        <span className="ml-4 text-sm text-muted-foreground">editor.json</span>
        
        {/* Editor action buttons */}
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={handleBeautify}
            disabled={!isValidJson}
            title="Beautify JSON"
            className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="size-3.5" />
            Beautify
          </button>
          <button
            onClick={handleMinify}
            disabled={!isValidJson}
            title="Minify JSON"
            className="flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Minimize2 className="size-3.5" />
            Minify
          </button>
          <button
            onClick={handleCopy}
            disabled={!value}
            title="Copy to clipboard"
            className="relative flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className={`flex items-center gap-1.5 transition-all duration-200 ${copied ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}>
              <Copy className="size-3.5" />
              Copy
            </span>
            <span className={`absolute inset-0 flex items-center justify-center gap-1.5 text-emerald-400 transition-all duration-200 ${copied ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}>
              <Check className="size-3.5" />
              Copied!
            </span>
          </button>
          <button
            onClick={handleClear}
            title="Clear editor"
            className="flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
        
        {error && (
          <span className="ml-2 text-xs text-destructive">
            {error}
          </span>
        )}
      </div>
      <div className="relative flex min-h-0 flex-1">
        <div
          ref={lineNumbersRef}
          className="w-12 shrink-0 overflow-hidden border-r border-border bg-sidebar py-4 text-right font-mono text-xs leading-6 text-muted-foreground"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="px-2">
              {i + 1}
            </div>
          ))}
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {/* Syntax highlighted background */}
          <pre
            ref={highlightRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre-wrap break-words bg-card p-4 font-mono text-sm leading-6 [&_.json-boolean]:text-orange-400 [&_.json-bracket]:text-muted-foreground [&_.json-null]:text-orange-400 [&_.json-number]:text-emerald-400 [&_.json-punctuation]:text-muted-foreground [&_.json-string]:text-sky-400"
            dangerouslySetInnerHTML={{ __html: highlightedCode || "&nbsp;" }}
          />
          {/* Transparent textarea for editing */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="relative z-10 min-h-full w-full resize-none overflow-y-auto bg-transparent p-4 font-mono text-sm leading-6 text-transparent caret-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Enter your JSON here..."
          />
        </div>
      </div>
    </div>
  )
}

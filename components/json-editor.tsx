"use client"

import { useCallback, useRef, useEffect, useState, useMemo } from "react"
import { Sparkles, Minimize2, Trash2, Copy, Check } from "lucide-react"
import type { HighlightRange } from "@/app/page"

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  error?: string | null
  highlightRange?: HighlightRange | null
  onSelection?: (selectedText: string) => void
}

export function JsonEditor({ value, onChange, error, highlightRange, onSelection }: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const lines = value.split("\n")
  const lineCount = lines.length

  // Calculate per-line highlight ranges (start/end within each line)
  const lineHighlights = useMemo(() => {
    if (!highlightRange) return new Map<number, { start: number; end: number }>()
    
    const { start, end } = highlightRange
    const highlightMap = new Map<number, { start: number; end: number }>()
    
    let charIndex = 0
    for (let i = 0; i < lines.length; i++) {
      const lineStart = charIndex
      const lineEnd = charIndex + lines[i].length
      
      // Check if this line overlaps with the highlight range
      if (lineEnd >= start && lineStart < end) {
        // Calculate the highlight start/end within this line
        const highlightStartInLine = Math.max(0, start - lineStart)
        const highlightEndInLine = Math.min(lines[i].length, end - lineStart)
        highlightMap.set(i, { start: highlightStartInLine, end: highlightEndInLine })
      }
      
      charIndex = lineEnd + 1 // +1 for the newline character
    }
    
    return highlightMap
  }, [highlightRange, lines])

  // Helper to render a line with inline underline for the highlighted portion
  const renderHighlightedLine = useCallback((line: string, lineIndex: number) => {
    const highlight = lineHighlights.get(lineIndex)
    if (!highlight) {
      return <span className="invisible">{line || "\u00A0"}</span>
    }
    
    const before = line.slice(0, highlight.start)
    const highlighted = line.slice(highlight.start, highlight.end)
    const after = line.slice(highlight.end)
    
    return (
      <>
        <span className="invisible">{before}</span>
        <span className="border-b-2 border-yellow-500 bg-yellow-500/20">{highlighted}</span>
        <span className="invisible">{after}</span>
      </>
    )
  }, [lineHighlights])

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }, [])

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.addEventListener("scroll", handleScroll)
      return () => textarea.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  // Handle text selection in the editor
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
        {value && (
          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
            isValidJson 
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
              : "bg-red-500/20 text-red-600 dark:text-red-400"
          }`}>
            {isValidJson ? "Valid" : "Invalid"}
          </span>
        )}
        
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
            <span className={`absolute inset-0 flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 transition-all duration-200 ${copied ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}>
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
          className="w-16 shrink-0 overflow-y-auto border-r border-border bg-sidebar py-4 text-right font-mono text-xs leading-6 text-muted-foreground"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className={`px-2 ${lineHighlights.has(i) ? "bg-yellow-500/20" : ""}`}>
              {i + 1}
            </div>
          ))}
        </div>
        <div className="relative min-h-0 flex-1 bg-card">
          {/* Highlight overlay - shows underlines for selected text */}
          <div
            ref={highlightRef}
            className="pointer-events-none absolute inset-0 overflow-hidden p-4 font-mono text-sm leading-6"
            aria-hidden="true"
          >
            {lines.map((line, i) => (
              <div key={i} className="whitespace-pre">
                {renderHighlightedLine(line, i)}
              </div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
onKeyDown={handleKeyDown}
  onMouseUp={handleMouseUp}
  onSelect={handleMouseUp}
  spellCheck={false}
            className={`absolute inset-0 min-h-0 w-full resize-none overflow-y-auto bg-transparent p-4 font-mono text-sm leading-6 outline-none placeholder:text-muted-foreground ${
              !value ? "text-foreground" : isValidJson ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            }`}
            placeholder="Enter your JSON here..."
          />
        </div>
      </div>
    </div>
  )
}

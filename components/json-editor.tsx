"use client"

import { useCallback, useRef, useEffect } from "react"

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  error?: string | null
}

export function JsonEditor({ value, onChange, error }: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  const lines = value.split("\n")
  const lineCount = lines.length

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
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

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-sidebar px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex size-3 items-center justify-center rounded-full bg-[#ff5f56]" />
          <div className="flex size-3 items-center justify-center rounded-full bg-[#ffbd2e]" />
          <div className="flex size-3 items-center justify-center rounded-full bg-[#27c93f]" />
        </div>
        <span className="ml-4 text-sm text-muted-foreground">editor.json</span>
        {error && (
          <span className="ml-auto text-xs text-destructive">
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
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="min-h-0 flex-1 resize-none overflow-y-auto bg-card p-4 font-mono text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
          placeholder="Enter your JSON here..."
        />
      </div>
    </div>
  )
}

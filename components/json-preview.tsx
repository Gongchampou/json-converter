"use client"

import { useState, useMemo } from "react"
import { Copy, Check } from "lucide-react"

interface JsonPreviewProps {
  data: unknown
  error?: string | null
}

function highlightJson(json: string): React.ReactNode[] {
  const lines = json.split("\n")
  
  return lines.map((line, lineIndex) => {
    const tokens: React.ReactNode[] = []
    let i = 0
    let tokenIndex = 0
    
    while (i < line.length) {
      // Match whitespace
      const wsMatch = line.slice(i).match(/^(\s+)/)
      if (wsMatch) {
        tokens.push(<span key={tokenIndex++}>{wsMatch[1]}</span>)
        i += wsMatch[1].length
        continue
      }
      
      // Match string (key or value)
      const stringMatch = line.slice(i).match(/^"([^"\\]|\\.)*"/)
      if (stringMatch) {
        const str = stringMatch[0]
        // Check if it's a key (followed by colon)
        const afterString = line.slice(i + str.length)
        if (afterString.match(/^\s*:/)) {
          tokens.push(
            <span key={tokenIndex++} className="text-sky-400">{str}</span>
          )
        } else {
          tokens.push(
            <span key={tokenIndex++} className="text-amber-300">{str}</span>
          )
        }
        i += str.length
        continue
      }
      
      // Match number
      const numMatch = line.slice(i).match(/^-?\d+\.?\d*([eE][+-]?\d+)?/)
      if (numMatch) {
        tokens.push(
          <span key={tokenIndex++} className="text-emerald-400">{numMatch[0]}</span>
        )
        i += numMatch[0].length
        continue
      }
      
      // Match boolean and null
      const boolNullMatch = line.slice(i).match(/^(true|false|null)/)
      if (boolNullMatch) {
        tokens.push(
          <span key={tokenIndex++} className="text-orange-400">{boolNullMatch[0]}</span>
        )
        i += boolNullMatch[0].length
        continue
      }
      
      // Match brackets, braces, colons, commas
      const punctMatch = line.slice(i).match(/^[{}\[\]:,]/)
      if (punctMatch) {
        tokens.push(
          <span key={tokenIndex++} className="text-foreground">{punctMatch[0]}</span>
        )
        i += 1
        continue
      }
      
      // Fallback: single character
      tokens.push(<span key={tokenIndex++}>{line[i]}</span>)
      i++
    }
    
    return (
      <div key={lineIndex} className="whitespace-pre">
        {tokens.length > 0 ? tokens : " "}
      </div>
    )
  })
}

export function JsonPreview({ data, error }: JsonPreviewProps) {
  const [copied, setCopied] = useState(false)

  const formattedJson = useMemo(() => {
    if (data === undefined) return ""
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return ""
    }
  }, [data])

  const lines = useMemo(() => {
    if (!formattedJson) return []
    return formattedJson.split("\n")
  }, [formattedJson])

  const highlightedContent = useMemo(() => {
    if (!formattedJson) return null
    return highlightJson(formattedJson)
  }, [formattedJson])

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
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Preview</span>
          {!error && data !== undefined && (
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
              Valid JSON
            </span>
          )}
        </div>
        {!error && data !== undefined && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="size-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3" />
                Copy
              </>
            )}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto bg-card">
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
        ) : data === undefined ? (
          <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
            Enter JSON in the editor to see preview
          </div>
        ) : (
          <div className="flex h-full font-mono text-sm leading-6">
            {/* Line numbers */}
            <div className="sticky left-0 select-none border-r border-border bg-sidebar px-3 py-4 text-right text-muted-foreground">
              {lines.map((_, index) => (
                <div key={index}>{index + 1}</div>
              ))}
            </div>
            {/* Code content */}
            <div className="flex-1 overflow-x-auto p-4">
              {highlightedContent}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

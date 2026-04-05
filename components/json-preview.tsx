"use client"

import { useState, useMemo } from "react"
import { Copy, Check, FileText } from "lucide-react"

interface JsonPreviewProps {
  data: unknown
  error?: string | null
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
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-red-500/20 text-red-400"
        }`}
      >
        {value ? "Yes" : "No"}
      </span>
    )
  }

  if (typeof value === "number") {
    return <span className="font-medium text-sky-400">{value.toLocaleString()}</span>
  }

  if (typeof value === "string") {
    // Check if it's a URL
    if (value.match(/^https?:\/\//)) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {value}
        </a>
      )
    }
    // Check if it's an email
    if (value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return (
        <a
          href={`mailto:${value}`}
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {value}
        </a>
      )
    }
    // Check if it looks like a date
    if (value.match(/^\d{4}-\d{2}-\d{2}/) || value.match(/^\d{2}\/\d{2}\/\d{4}/)) {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return (
            <span className="text-foreground">
              {date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )
        }
      } catch {
        // Not a valid date, render as string
      }
    }
    return <span className="text-foreground">{value}</span>
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
              {String(item)}
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
      <div className={`space-y-3 ${depth > 0 ? "" : ""}`}>
        {entries.map(([key, val]) => {
          const isComplexValue =
            typeof val === "object" && val !== null && Object.keys(val).length > 0

          return (
            <div key={key} className={isComplexValue ? "space-y-2" : ""}>
              <div
                className={`${
                  isComplexValue
                    ? "flex flex-col gap-1"
                    : "flex items-start justify-between gap-4"
                }`}
              >
                <span className="shrink-0 text-sm font-medium text-muted-foreground">
                  {formatKey(key)}
                </span>
                {!isComplexValue && (
                  <div className="text-right">
                    <RenderValue value={val} depth={depth + 1} />
                  </div>
                )}
              </div>
              {isComplexValue && (
                <div className="rounded-lg border border-border bg-card/50 p-4">
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

export function JsonPreview({ data, error }: JsonPreviewProps) {
  const [copied, setCopied] = useState(false)
  
  console.log("[v0] JsonPreview received data:", data)
  console.log("[v0] JsonPreview received error:", error)
  console.log("[v0] data === undefined:", data === undefined)

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
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-2">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Document Preview</span>
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
                Copy JSON
              </>
            )}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto">
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
          <div className="bg-card">
            {/* Document container - like a PDF page */}
            <div className="mx-auto max-w-3xl p-8">
              <div className="rounded-xl border border-border bg-background p-6 shadow-lg">
                <RenderValue value={data} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

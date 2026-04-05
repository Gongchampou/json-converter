"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, Copy, Check } from "lucide-react"

interface JsonPreviewProps {
  data: unknown
  error?: string | null
}

function JsonValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (value === null) {
    return <span className="text-orange-400">null</span>
  }

  if (typeof value === "boolean") {
    return <span className="text-orange-400">{value ? "true" : "false"}</span>
  }

  if (typeof value === "number") {
    return <span className="text-emerald-400">{value}</span>
  }

  if (typeof value === "string") {
    return <span className="text-amber-300">&quot;{value}&quot;</span>
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-foreground">{"[]"}</span>
    }

    return (
      <span>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="inline-flex items-center text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
        <span className="text-foreground">[</span>
        {isCollapsed ? (
          <span className="text-muted-foreground">
            {" "}
            {value.length} items{" "}
          </span>
        ) : (
          <>
            {value.map((item, index) => (
              <div key={index} style={{ paddingLeft: `${(depth + 1) * 20}px` }}>
                <JsonValue value={item} depth={depth + 1} />
                {index < value.length - 1 && (
                  <span className="text-foreground">,</span>
                )}
              </div>
            ))}
          </>
        )}
        {!isCollapsed && (
          <div style={{ paddingLeft: `${depth * 20}px` }}>
            <span className="text-foreground">]</span>
          </div>
        )}
        {isCollapsed && <span className="text-foreground">]</span>}
      </span>
    )
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)

    if (entries.length === 0) {
      return <span className="text-foreground">{"{}"}</span>
    }

    return (
      <span>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="inline-flex items-center text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
        <span className="text-foreground">{"{"}</span>
        {isCollapsed ? (
          <span className="text-muted-foreground">
            {" "}
            {entries.length} keys{" "}
          </span>
        ) : (
          <>
            {entries.map(([key, val], index) => (
              <div key={key} style={{ paddingLeft: `${(depth + 1) * 20}px` }}>
                <span className="text-sky-400">&quot;{key}&quot;</span>
                <span className="text-foreground">: </span>
                <JsonValue value={val} depth={depth + 1} />
                {index < entries.length - 1 && (
                  <span className="text-foreground">,</span>
                )}
              </div>
            ))}
          </>
        )}
        {!isCollapsed && (
          <div style={{ paddingLeft: `${depth * 20}px` }}>
            <span className="text-foreground">{"}"}</span>
          </div>
        )}
        {isCollapsed && <span className="text-foreground">{"}"}</span>}
      </span>
    )
  }

  return <span className="text-foreground">{String(value)}</span>
}

export function JsonPreview({ data, error }: JsonPreviewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
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
      <div className="flex-1 overflow-auto bg-card p-4 font-mono text-sm leading-6">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
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
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Enter JSON in the editor to see preview
          </div>
        ) : (
          <JsonValue value={data} />
        )}
      </div>
    </div>
  )
}

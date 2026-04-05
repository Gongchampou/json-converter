"use client"

import { useState, useMemo } from "react"
import { JsonEditor } from "@/components/json-editor"
import { JsonPreview } from "@/components/json-preview"
import { Code, Eye, Braces, Download, Upload } from "lucide-react"

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

  const { parsedJson, error } = useMemo(() => {
    if (!jsonText.trim()) {
      return { parsedJson: undefined, error: null }
    }
    try {
      const parsed = JSON.parse(jsonText)
      return { parsedJson: parsed, error: null }
    } catch (e) {
      return {
        parsedJson: undefined,
        error: e instanceof Error ? e.message : "Invalid JSON",
      }
    }
  }, [jsonText])

  const handleFormat = () => {
    if (parsedJson !== undefined) {
      setJsonText(JSON.stringify(parsedJson, null, 2))
    }
  }

  const handleMinify = () => {
    if (parsedJson !== undefined) {
      setJsonText(JSON.stringify(parsedJson))
    }
  }

  const handleClear = () => {
    setJsonText("")
  }

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

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3">
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
            Upload
          </button>
          <button
            onClick={handleDownload}
            disabled={parsedJson === undefined}
            className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-3.5" />
            Download
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2">
        <button
          onClick={handleFormat}
          disabled={parsedJson === undefined}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Format
        </button>
        <button
          onClick={handleMinify}
          disabled={parsedJson === undefined}
          className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Minify
        </button>
        <button
          onClick={handleClear}
          className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
        >
          Clear
        </button>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span>Characters: {jsonText.length}</span>
          <span className="text-border">|</span>
          <span>Lines: {jsonText.split("\n").length}</span>
        </div>
      </div>

      {/* Main content */}
      <main className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-2">
        {/* Editor Panel */}
        <div className="flex flex-col border-b border-border md:border-b-0 md:border-r">
          <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
            <Code className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Editor</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <JsonEditor value={jsonText} onChange={setJsonText} error={error} />
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
            <Eye className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Preview
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
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
            <span className="text-emerald-400">Valid</span>
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

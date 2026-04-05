"use client"

import { useEffect, useState } from "react"
import { Moon, Sun, BookOpen } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("read")
    } else {
      setTheme("light")
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground"
        aria-label="Toggle theme"
      >
        <Sun className="size-4" />
        <span>Light</span>
      </button>
    )
  }

  const getIcon = () => {
    if (theme === "dark") return <Moon className="size-4" />
    if (theme === "read") return <BookOpen className="size-4" />
    return <Sun className="size-4" />
  }

  const getLabel = () => {
    if (theme === "dark") return "Dark"
    if (theme === "read") return "Read"
    return "Light"
  }

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
      aria-label={`Current theme: ${getLabel()}. Click to switch.`}
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </button>
  )
}

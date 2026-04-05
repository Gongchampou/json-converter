"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className="relative flex size-9 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground"
        aria-label="Toggle theme"
      >
        <Sun className="size-4" />
      </button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={toggleTheme}
      className="relative flex size-9 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <Sun className={`size-4 transition-all duration-200 ${isDark ? "scale-0 opacity-0" : "scale-100 opacity-100"}`} />
      <Moon className={`absolute size-4 transition-all duration-200 ${isDark ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
    </button>
  )
}

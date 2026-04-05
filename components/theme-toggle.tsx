"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative flex size-9 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <Sun className={`size-4 transition-all ${theme === "dark" ? "scale-0 opacity-0" : "scale-100 opacity-100"}`} />
      <Moon className={`absolute size-4 transition-all ${theme === "dark" ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
    </button>
  )
}

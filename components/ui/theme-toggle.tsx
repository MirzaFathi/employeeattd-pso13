"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by waiting until mounted
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "fixed bottom-6 right-6 z-50 p-3 rounded-full transition-all duration-300",
        "bg-[var(--neu-surface)] text-[var(--neu-accent)] hover:text-white hover:bg-[var(--neu-accent)]",
        "neu-shadow hover:scale-110",
        "border border-[var(--neu-border)] flex items-center justify-center"
      )}
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
    >
      {isDark ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
}

"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="rounded-md border px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-muted"
    >
      {resolvedTheme === "dark" ? "Light" : "Dark"} mode
    </button>
  );
}

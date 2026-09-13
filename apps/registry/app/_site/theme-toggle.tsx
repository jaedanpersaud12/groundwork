"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

/**
 * The `dark` class is already on <html> before React runs — see THEME_SCRIPT in
 * layout.tsx — so the class is the source of truth and this subscribes to it rather
 * than keeping a second copy. Anything else that flips the class keeps the icon honest.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");

/** The server has no way to know, so it renders light and hydration corrects it. */
const isDarkOnServer = () => false;

export function ThemeToggle({ className }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, isDarkOnServer);

  function toggle() {
    const next = !isDark();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("gw-theme", next ? "dark" : "light");
    } catch {
      /* Private browsing. The class still flipped; only the memory is lost. */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
    >
      {dark ? <MoonIcon className="size-4" aria-hidden /> : <SunIcon className="size-4" aria-hidden />}
    </button>
  );
}

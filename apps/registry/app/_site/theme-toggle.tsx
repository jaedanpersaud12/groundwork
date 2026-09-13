"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/registry/groundwork/ui/button";

/**
 * The `dark` class is already on <html> before React runs — see THEME_SCRIPT in
 * layout.tsx — so the class is the source of truth and this subscribes to it rather
 * than keeping a second copy. Anything else that flips the class keeps the state honest.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");

/** The server has no way to know. Only `aria-pressed` reads this; the icon doesn't. */
const isDarkOnServer = () => false;

/**
 * The icon swaps with the `dark:` variant rather than with React state, so a dark reload
 * paints the moon on the first frame instead of flashing the sun until hydration.
 *
 * A fixed label with `aria-pressed` is the whole accessible state: "Dark theme, pressed".
 * A label that also flipped would announce the opposite of the pressed state half the time.
 */
function ThemeToggle({ className }: { className?: string }) {
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
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-pressed={dark}
      aria-label="Dark theme"
      className={cn("size-8 rounded-full", className)}
    >
      <SunIcon className="dark:hidden" aria-hidden />
      <MoonIcon className="hidden dark:block" aria-hidden />
    </Button>
  );
}

export { ThemeToggle };

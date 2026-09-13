"use client";

import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/registry/groundwork/ui/button";

export function ThemeToggle() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => document.documentElement.classList.toggle("dark")}
      aria-label="Toggle dark mode"
    >
      <SunIcon className="dark:hidden" data-icon="inline-start" />
      <MoonIcon className="hidden dark:block" data-icon="inline-start" />
      Theme
    </Button>
  );
}

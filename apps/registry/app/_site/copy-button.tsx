"use client";

import { CheckIcon, CopyIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/registry/groundwork/ui/button";

type Status = "idle" | "copied" | "failed";

const ICON = { idle: CopyIcon, copied: CheckIcon, failed: XIcon } as const;

/**
 * Reverts on its own after two seconds; no toast, no layout change. A failed write — an
 * insecure origin, or a denied clipboard permission — shows a cross rather than nothing,
 * because a copy button that silently does nothing reads as a copy that worked.
 */
function CopyButton({ value, label, className }: { value: string; label: string; className?: string }) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const id = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(id);
  }, [status]);

  const Icon = ICON[status];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() =>
        navigator.clipboard.writeText(value).then(
          () => setStatus("copied"),
          () => setStatus("failed"),
        )
      }
      aria-label={
        status === "copied" ? `${label} copied` : status === "failed" ? `Couldn't copy ${label}` : `Copy ${label}`
      }
      className={cn("size-7 rounded-sm text-subtle-foreground", className)}
    >
      <Icon className="size-3.5" aria-hidden />
    </Button>
  );
}

export { CopyButton };

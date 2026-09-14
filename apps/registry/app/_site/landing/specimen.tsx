"use client";

import { useState } from "react";
import { CircleDotIcon, LayoutGridIcon, ListIcon } from "lucide-react";

import { FilterChip } from "@/registry/groundwork/ui/filter-chip";
import { ViewToggle } from "@/registry/groundwork/ui/view-toggle";

/*
 * The interactive previews for the landing page's component blocks. Each is one registry
 * component, working, with only the state it needs to respond. The static ones (button,
 * status pill, the table) render straight from the page as server components.
 */

function FilterChipDemo() {
  const [status, setStatus] = useState<"merged" | "review" | "draft" | null>("review");
  return (
    <FilterChip
      label="Status"
      icon={<CircleDotIcon />}
      value={status}
      options={[
        { value: "merged", label: "Merged" },
        { value: "review", label: "In review" },
        { value: "draft", label: "Draft" },
      ]}
      onChange={setStatus}
    />
  );
}

function ViewToggleDemo() {
  const [view, setView] = useState<"list" | "grid">("grid");
  return (
    <ViewToggle
      label="Layout"
      value={view}
      onChange={setView}
      options={[
        { value: "list", label: "List", icon: <ListIcon aria-hidden /> },
        { value: "grid", label: "Grid", icon: <LayoutGridIcon aria-hidden /> },
      ]}
    />
  );
}

export { FilterChipDemo, ViewToggleDemo };

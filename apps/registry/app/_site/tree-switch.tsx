"use client";

import { useState } from "react";

import { ViewToggle } from "@/registry/groundwork/ui/view-toggle";

import type { Peek } from "./file-peek";
import type { TreeNode } from "./tree-nodes";
import { TreeView } from "./tree-view";

/**
 * Two or more trees behind the registry's own view toggle: the same folder, seen from two
 * places. The first option shows until another is chosen.
 */
function TreeSwitch({
  label,
  options,
}: {
  label: string;
  options: { value: string; label: string; title: string; nodes: TreeNode[]; peeks?: Record<string, Peek> }[];
}) {
  const [value, setValue] = useState(options[0]?.value ?? "");
  const current = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3">
      <ViewToggle
        label={label}
        value={value}
        onChange={setValue}
        options={options.map((option) => ({ value: option.value, label: option.label }))}
      />
      <TreeView
        key={current.value}
        title={current.title}
        label={`${label}: ${current.label}`}
        nodes={current.nodes}
        peeks={current.peeks}
      />
    </div>
  );
}

export { TreeSwitch };

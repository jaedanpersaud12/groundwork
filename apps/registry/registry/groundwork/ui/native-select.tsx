import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A native `<select>` dressed exactly as `Input`: same height, border, focus ring and invalid state,
 * so a form mixing both reads as one family. Native on purpose — on a phone the OS picker is the
 * best control there is, and it needs no JavaScript to submit with a form.
 *
 * `appearance-none` drops the platform arrow; the chevron is drawn instead, `pointer-events-none`
 * so clicks land on the select underneath. `pr-9` keeps long option text from running under it.
 *
 * With `defaultValue` inside a form that uses a React 19 action, remount the select per submission
 * (a `key`) to keep an echoed value: the post-action form reset puts a select back to its first
 * option rather than the new default.
 */
function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div data-slot="native-select-wrapper" className="relative w-full min-w-0">
      <select
        data-slot="native-select"
        className={cn(
          "h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-card py-2 pr-9 pl-3 text-sm text-foreground transition-[border-color,box-shadow] duration-150 ease-out outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

/** An option styled for the dark theme's native popup, which otherwise inherits a light background on some platforms. */
function NativeSelectOption({ className, ...props }: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" className={cn("bg-popover text-popover-foreground", className)} {...props} />;
}

export { NativeSelect, NativeSelectOption };

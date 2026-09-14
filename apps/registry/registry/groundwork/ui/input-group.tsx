import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Two heights, each with its own inner geometry. Shrinking the field with a height class
 * alone keeps the 36px field's padding, icon and text in a 32px box, which reads loose
 * on the sides and oversized inside. `sm` matches the 32px controls it sits beside —
 * filter chips, view toggles — at their text size.
 *
 * The leading side is a step tighter than the trailing one when there is an icon: the
 * glyph carries its own side bearing, so equal padding looks deeper on the icon's side.
 */
const SIZES = {
  default: { field: "h-9 gap-2 px-3 [&_svg]:size-4", withIcon: "ps-2.5", input: "text-sm" },
  sm: { field: "h-8 gap-1.5 px-2.5 [&_svg]:size-3.5", withIcon: "ps-2", input: "text-xs" },
} as const;

type InputGroupProps = Omit<ComponentProps<"input">, "size"> & {
  /** Leading icon, rendered in the subtle text colour at the size's icon size. */
  icon?: ReactNode;
  /** Trailing content: a clear button, a unit, a keyboard hint. */
  trailing?: ReactNode;
  /**
   * `sm` for a 32px field beside other 32px controls. A number is the native `<input>`
   * `size` (its width in characters) and passes through with the default geometry, so
   * code written against 1.0.0's plain input props keeps compiling.
   */
  size?: keyof typeof SIZES | number;
  /** Classes for the wrapper, which carries the border and focus ring. */
  className?: string;
  inputClassName?: string;
};

/** An input with a leading icon and optional trailing slot. The wrapper is the field. */
function InputGroup({ icon, trailing, size = "default", className, inputClassName, ...props }: InputGroupProps) {
  const variant = typeof size === "number" ? "default" : size;
  const geometry = SIZES[variant];
  return (
    <div
      data-slot="input-group"
      data-size={variant}
      className={cn(
        "flex min-w-0 items-center rounded-md border border-input bg-card transition-[border-color,box-shadow] duration-150 ease-out focus-within:border-ring focus-within:ring-1 focus-within:ring-ring has-disabled:bg-muted has-aria-invalid:border-destructive has-aria-invalid:ring-1 has-aria-invalid:ring-destructive [&_svg]:shrink-0 [&>svg]:text-subtle-foreground",
        geometry.field,
        icon ? geometry.withIcon : null,
        className,
      )}
    >
      {icon}
      <input
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-subtle-foreground disabled:cursor-not-allowed disabled:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none",
          geometry.input,
          inputClassName,
        )}
        size={typeof size === "number" ? size : undefined}
        {...props}
      />
      {trailing}
    </div>
  );
}

export { InputGroup };

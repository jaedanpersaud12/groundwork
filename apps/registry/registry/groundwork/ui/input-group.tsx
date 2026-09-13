import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type InputGroupProps = ComponentProps<"input"> & {
  /** Leading icon, rendered at 16px in the subtle text colour. */
  icon?: ReactNode;
  /** Trailing content: a clear button, a unit, a keyboard hint. */
  trailing?: ReactNode;
  /** Classes for the wrapper, which carries the border and focus ring. */
  className?: string;
  inputClassName?: string;
};

/** An input with a leading icon and optional trailing slot. The wrapper is the field. */
function InputGroup({ icon, trailing, className, inputClassName, ...props }: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "flex h-9 min-w-0 items-center gap-2 rounded-md border border-input bg-card px-3 transition-[border-color,box-shadow] duration-150 ease-out focus-within:border-ring focus-within:ring-1 focus-within:ring-ring has-disabled:bg-muted has-aria-invalid:border-destructive has-aria-invalid:ring-1 has-aria-invalid:ring-destructive [&_svg]:size-4 [&_svg]:shrink-0 [&>svg]:text-subtle-foreground",
        className,
      )}
    >
      {icon}
      <input
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-subtle-foreground disabled:cursor-not-allowed disabled:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none",
          inputClassName,
        )}
        {...props}
      />
      {trailing}
    </div>
  );
}

export { InputGroup };

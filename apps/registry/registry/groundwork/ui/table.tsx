import * as React from "react";

import { cn } from "@/lib/utils";

type TableProps = React.ComponentProps<"table"> & {
  /**
   * Column widths that never change with content — use for paginated, sorted or
   * filtered tables, where auto layout makes columns jump between pages. Widths come
   * from `columns` (or your own `<colgroup>`); cell text that doesn't fit is truncated.
   */
  columns?: readonly string[];
};

/**
 * Pass `columns` for a fixed layout: one width class per column, e.g.
 * `["w-[24%]", "w-[30%]", "w-32", "w-28", "w-36"]`. Leave one column without a
 * fixed width (`""`) to take the remaining space.
 */
function Table({ className, columns, children, ...props }: TableProps) {
  return (
    <div data-slot="table-container" className="scroll-slim relative w-full min-w-0 overflow-x-auto">
      <table
        data-slot="table"
        data-layout={columns ? "fixed" : undefined}
        className={cn(
          "w-full caption-bottom border-collapse text-sm",
          columns && "table-fixed [&_td]:truncate",
          className,
        )}
        {...props}
      >
        {columns ? (
          <colgroup>
            {columns.map((width, index) => (
              <col key={index} className={width || undefined} />
            ))}
          </colgroup>
        ) : null}
        {children}
      </table>
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("border-b border-border bg-muted/40 [&_tr]:border-0", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("divide-y divide-border/70", className)} {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t border-border bg-muted/25 font-medium", className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "h-12 transition-colors duration-150 ease-out hover:bg-muted/40 data-[state=selected]:bg-muted/60",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "px-4 py-2.5 text-left align-middle text-[13px] font-medium tracking-normal whitespace-nowrap text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("px-4 py-2 align-middle text-sm whitespace-nowrap text-foreground", className)}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption data-slot="table-caption" className={cn("mt-4 text-xs text-subtle-foreground", className)} {...props} />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };

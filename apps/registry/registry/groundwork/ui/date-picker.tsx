"use client";

// Source: jobpilot DatePicker on the flvs calendar. The month grid rolls in from the
// direction of travel and is held at six-row height, so paging never resizes the popover.

import { createContext, useContext, useState, type ComponentProps } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CalendarDaysIcon, XIcon } from "lucide-react";
import type { Matcher } from "react-day-picker";

import { clampDate, formatDate, today } from "@/registry/groundwork/lib/dates";
import { ROLL, STILL } from "@/registry/groundwork/lib/motion";
import { Calendar } from "@/registry/groundwork/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/groundwork/ui/popover";
import { cn } from "@/lib/utils";

/** The field-style trigger shared by DatePicker and DateRangePicker. */
const DATE_TRIGGER =
  "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-card px-3 text-left text-sm transition-[border-color,box-shadow,background-color] duration-150 ease-out outline-none hover:bg-accent focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 data-popup-open:border-ring data-popup-open:bg-accent aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive";

type MonthRoll = { month: Date; direction: 1 | -1; setMonth: (next: Date) => void };

/** Tracks the visible month and which way the user paged, for the roll animation. */
function useMonthRoll(initial: () => Date): MonthRoll {
  const [state, setState] = useState(() => ({ month: initial(), direction: 1 as 1 | -1 }));
  return {
    month: state.month,
    direction: state.direction,
    setMonth: (next) => setState((previous) => ({ month: next, direction: next >= previous.month ? 1 : -1 })),
  };
}

const MonthRollContext = createContext<Pick<MonthRoll, "month" | "direction"> | null>(null);

/**
 * Pass as Calendar's `components.MonthGrid` inside a `MonthRollContext` provider. It is a
 * stable component, so selecting a day re-renders the grid without replaying the roll.
 */
function RollingMonthGrid({ className, children, ...props }: ComponentProps<"table">) {
  const reduced = useReducedMotion();
  const roll = useContext(MonthRollContext);
  if (!roll) return <table className={className} {...props}>{children}</table>;
  return (
    <motion.table
      key={`${roll.month.getFullYear()}-${roll.month.getMonth()}`}
      initial={reduced ? false : { opacity: 0, x: 12 * roll.direction }}
      animate={{ opacity: 1, x: 0 }}
      transition={reduced ? STILL : ROLL}
      className={className}
      // DayPicker hands over plain table props; motion's typing of animation handlers is narrower but compatible.
      {...(props as ComponentProps<typeof motion.table>)}
    >
      {children}
    </motion.table>
  );
}

const ROLLING_COMPONENTS = { MonthGrid: RollingMonthGrid };

type DatePickerProps = {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  /** Earliest pickable day. */
  min?: Date;
  /** Latest pickable day. */
  max?: Date;
  /** Extra unavailable days, e.g. `{ dayOfWeek: [0, 6] }` for weekends. */
  disabledDays?: Matcher | Matcher[];
  /** "dropdown" adds month and year selects — use it for birthdays and far-off dates. */
  captionLayout?: "label" | "dropdown";
  /** Show a × to clear the value. */
  clearable?: boolean;
  format?: (date: Date) => string;
  align?: "start" | "center" | "end";
  className?: string;
  "aria-invalid"?: boolean;
};

function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  id,
  disabled = false,
  min,
  max,
  disabledDays,
  captionLayout = "label",
  clearable = false,
  format = formatDate,
  align = "start",
  className,
  "aria-invalid": invalid,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  // Open on the chosen date, or today moved inside the allowed window.
  const landing = () => value ?? clampDate(today(), min, max);
  const roll = useMonthRoll(landing);

  const matchers: Matcher[] = [
    ...(min ? [{ before: min }] : []),
    ...(max ? [{ after: max }] : []),
    ...(disabledDays ? (Array.isArray(disabledDays) ? disabledDays : [disabledDays]) : []),
  ];
  const now = today();

  function handleOpenChange(nextOpen: boolean) {
    // Reopening lands on the chosen date, not wherever the user last paged to.
    if (nextOpen) roll.setMonth(landing());
    setOpen(nextOpen);
  }

  return (
    <div data-slot="date-picker" className={cn("relative", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          id={id}
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(DATE_TRIGGER, clearable && value && "pe-9", value ? "text-foreground" : "text-subtle-foreground")}
        >
          <CalendarDaysIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0 flex-1 truncate">{value ? format(value) : placeholder}</span>
        </PopoverTrigger>
        <PopoverContent align={align} className="w-auto p-2">
          <MonthRollContext.Provider value={roll}>
          <Calendar
            mode="single"
            required={false}
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
            disabled={matchers.length ? matchers : undefined}
            month={roll.month}
            onMonthChange={roll.setMonth}
            captionLayout={captionLayout}
            startMonth={min ?? new Date(now.getFullYear() - 100, 0)}
            endMonth={max ?? new Date(now.getFullYear() + 10, 11)}
            showOutsideDays={false}
            classNames={{ month_grid: cn("w-full border-collapse", captionLayout === "dropdown" ? "min-h-[264px]" : "min-h-[232px]") }}
            components={ROLLING_COMPONENTS}
          />
          </MonthRollContext.Provider>
        </PopoverContent>
      </Popover>
      {clearable && value && !disabled ? (
        <button
          type="button"
          aria-label="Clear date"
          onClick={() => onChange(undefined)}
          className="absolute inset-y-0 end-0 grid w-9 place-items-center text-subtle-foreground outline-none transition-colors duration-150 ease-out hover:text-foreground focus-visible:text-foreground"
        >
          <XIcon className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

export { DatePicker, DATE_TRIGGER, MonthRollContext, ROLLING_COMPONENTS, useMonthRoll };

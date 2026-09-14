"use client";

// Presets beside a range calendar with one
// sliding thumb, the month grid rolling in from the direction of travel. The range is
// a draft until both ends are picked, so the first click never applies a one-day range.

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CalendarRangeIcon, XIcon } from "lucide-react";
import type { DateRange, Matcher } from "react-day-picker";

import { addDays, clampDate, formatDateRange, isSameDay, today } from "@/registry/groundwork/lib/dates";
import { CELL, STILL } from "@/registry/groundwork/lib/motion";
import { Calendar } from "@/registry/groundwork/ui/calendar";
import { DATE_TRIGGER, MonthRollContext, ROLLING_COMPONENTS, useMonthRoll } from "@/registry/groundwork/ui/date-picker";
import { CHIP, CHIP_CLEAR, CHIP_TRIGGER, FilterChipLabel } from "@/registry/groundwork/ui/filter-chip";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/groundwork/ui/popover";
import { cn } from "@/lib/utils";

export type DateRangePreset = { id: string; label: string; range: () => { from: Date; to: Date } };

/** Looking back: reports, activity, "date found". */
const PAST_PRESETS: readonly DateRangePreset[] = [
  { id: "today", label: "Today", range: () => ({ from: today(), to: today() }) },
  { id: "7d", label: "Last 7 days", range: () => ({ from: addDays(today(), -6), to: today() }) },
  { id: "30d", label: "Last 30 days", range: () => ({ from: addDays(today(), -29), to: today() }) },
  {
    id: "month",
    label: "This month",
    range: () => ({ from: new Date(today().getFullYear(), today().getMonth(), 1), to: today() }),
  },
  {
    id: "last-month",
    label: "Last month",
    range: () => {
      const t = today();
      return { from: new Date(t.getFullYear(), t.getMonth() - 1, 1), to: new Date(t.getFullYear(), t.getMonth(), 0) };
    },
  },
];

/** Looking ahead: bookings, availability, scheduling. */
const FUTURE_PRESETS: readonly DateRangePreset[] = [
  { id: "next-7d", label: "Next 7 days", range: () => ({ from: today(), to: addDays(today(), 6) }) },
  { id: "next-14d", label: "Next 14 days", range: () => ({ from: today(), to: addDays(today(), 13) }) },
  { id: "next-30d", label: "Next 30 days", range: () => ({ from: today(), to: addDays(today(), 29) }) },
];

/** Preset row height and gap — fixed so the thumb has somewhere to be. */
const SLOT = 32;
const SLOT_GAP = 4;

type DateRangePickerProps = {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  /** Quick ranges beside the calendar. Default PAST_PRESETS; `false` hides the column. */
  presets?: readonly DateRangePreset[] | false;
  numberOfMonths?: 1 | 2;
  min?: Date;
  max?: Date;
  disabledDays?: Matcher | Matcher[];
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  clearable?: boolean;
  align?: "start" | "center" | "end";
  /** Classes for the wrapper around the default field trigger. */
  className?: string;
  /** Custom trigger content (for chips, toolbar buttons). Replaces the field. */
  children?: ReactNode;
  /** Classes for the trigger when `children` is given. */
  triggerClassName?: string;
  /** Accessible name for a custom trigger. */
  triggerLabel?: string;
};

function DateRangePicker({
  value,
  onChange,
  presets = PAST_PRESETS,
  numberOfMonths = 1,
  min,
  max,
  disabledDays,
  placeholder = "Pick a date range",
  id,
  disabled = false,
  clearable = false,
  align = "start",
  className,
  children,
  triggerClassName,
  triggerLabel,
}: DateRangePickerProps) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(undefined);
  const roll = useMonthRoll(() => value?.from ?? clampDate(today(), min, max));

  const presetList = presets || [];
  const activePreset =
    value?.from && value.to
      ? presetList.findIndex((preset) => {
          const range = preset.range();
          return isSameDay(range.from, value.from) && isSameDay(range.to, value.to);
        })
      : -1;

  const matchers: Matcher[] = [
    ...(min ? [{ before: min }] : []),
    ...(max ? [{ after: max }] : []),
    ...(disabledDays ? (Array.isArray(disabledDays) ? disabledDays : [disabledDays]) : []),
  ];

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(value?.from ? value : undefined);
      // Two months looking back (max is today or earlier) show last month beside this one;
      // otherwise this month beside next.
      const anchor = value?.from ?? clampDate(today(), min, max);
      const lookingBack = numberOfMonths === 2 && !value?.from && max !== undefined && max <= today();
      roll.setMonth(lookingBack ? new Date(anchor.getFullYear(), anchor.getMonth() - 1) : anchor);
    }
    setOpen(nextOpen);
  }

  function apply(range: DateRange | undefined) {
    onChange(range);
    setOpen(false);
  }

  // Two clicks make a range, in either order; the same day twice is a one-day range.
  // DayPicker's own range logic completes on the first click, so the clicked day is used instead.
  function handleSelect(_proposed: DateRange | undefined, day: Date) {
    if (draft?.from && !draft.to) {
      const [from, to] = day < draft.from ? [day, draft.from] : [draft.from, day];
      setDraft({ from, to });
      apply({ from, to });
      return;
    }
    setDraft({ from: day, to: undefined });
  }

  const label = formatDateRange(value);

  const content = (
    <PopoverContent align={align} className="w-auto flex-col gap-3 p-3 sm:flex-row">
      {presetList.length ? (
        <>
          <div className="relative w-full shrink-0 sm:w-32">
            {activePreset >= 0 ? (
              <motion.span
                aria-hidden
                initial={false}
                animate={{ y: activePreset * (SLOT + SLOT_GAP) }}
                transition={reduced ? STILL : CELL}
                style={{ height: SLOT }}
                className="absolute inset-x-0 top-0 rounded-md bg-primary/10"
              />
            ) : null}
            <div className="relative flex flex-col" style={{ gap: SLOT_GAP }}>
              {presetList.map((preset, index) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => apply(preset.range())}
                  aria-pressed={index === activePreset}
                  style={{ height: SLOT }}
                  className={cn(
                    "flex items-center rounded-md px-2 text-left text-xs font-medium outline-none transition-colors duration-150 ease-out focus-visible:ring-1 focus-visible:ring-ring",
                    index === activePreset ? "text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div aria-hidden className="h-px shrink-0 self-stretch bg-border sm:h-auto sm:w-px" />
        </>
      ) : null}
      <MonthRollContext.Provider value={roll}>
      <Calendar
        mode="range"
        required={false}
        selected={draft}
        onSelect={handleSelect}
        numberOfMonths={numberOfMonths}
        month={roll.month}
        onMonthChange={roll.setMonth}
        disabled={matchers.length ? matchers : undefined}
        showOutsideDays={false}
        className="p-0"
        classNames={{ month_grid: "w-full border-collapse min-h-[232px]" }}
        components={ROLLING_COMPONENTS}
      />
      </MonthRollContext.Provider>
    </PopoverContent>
  );

  if (children) {
    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger id={id} disabled={disabled} aria-label={triggerLabel} className={triggerClassName}>
          {children}
        </PopoverTrigger>
        {content}
      </Popover>
    );
  }

  return (
    <div data-slot="date-range-picker" className={cn("relative", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          id={id}
          disabled={disabled}
          className={cn(DATE_TRIGGER, clearable && label && "pe-9", label ? "text-foreground" : "text-subtle-foreground")}
        >
          <CalendarRangeIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0 flex-1 truncate">{label ?? placeholder}</span>
        </PopoverTrigger>
        {content}
      </Popover>
      {clearable && label && !disabled ? (
        <button
          type="button"
          aria-label="Clear date range"
          onClick={() => onChange(undefined)}
          className="absolute inset-y-0 end-0 grid w-9 place-items-center text-subtle-foreground outline-none transition-colors duration-150 ease-out hover:text-foreground focus-visible:text-foreground"
        >
          <XIcon className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

type DateRangeChipProps = Omit<DateRangePickerProps, "children" | "triggerClassName" | "triggerLabel" | "clearable" | "placeholder" | "className"> & {
  label: string;
  icon?: ReactNode;
  className?: string;
};

/** A date-range filter shaped like FilterChip, so a filter bar reads as one family. */
function DateRangeChip({ label, icon = <CalendarRangeIcon />, className, ...props }: DateRangeChipProps) {
  const valueLabel = formatDateRange(props.value);
  return (
    <span data-slot="date-range-chip" className={cn(CHIP, className)}>
      <DateRangePicker
        {...props}
        triggerClassName={CHIP_TRIGGER}
        triggerLabel={`${label}${valueLabel ? `: ${valueLabel}` : ""}. Change filter`}
      >
        <FilterChipLabel icon={icon} label={label} valueLabel={valueLabel} />
      </DateRangePicker>
      {valueLabel ? (
        <button type="button" onClick={() => props.onChange(undefined)} aria-label={`Clear ${label} filter`} className={CHIP_CLEAR}>
          <XIcon className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </span>
  );
}

export { DateRangePicker, DateRangeChip, PAST_PRESETS, FUTURE_PRESETS };

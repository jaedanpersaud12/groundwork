"use client";

import * as React from "react";
import { CircleDotIcon, PlaneIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { addDays, formatDateRange, parseIsoDate, toIsoDate, today } from "@/registry/groundwork/lib/dates";
import { DatePicker } from "@/registry/groundwork/ui/date-picker";
import { DateRangeChip, DateRangePicker, FUTURE_PRESETS } from "@/registry/groundwork/ui/date-range-picker";
import { FilterChip } from "@/registry/groundwork/ui/filter-chip";
import { Label } from "@/registry/groundwork/ui/label";

import type { ExampleSet } from "./types";

function Readout({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs break-all text-subtle-foreground">{children}</p>;
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function BasicDate() {
  const [date, setDate] = React.useState<Date | undefined>(today());
  return (
    <div className="grid w-full max-w-xs gap-3">
      <Field id="basic-date" label="Due date">
        <DatePicker id="basic-date" value={date} onChange={setDate} />
      </Field>
      <Readout>toIsoDate(value) = {date ? `"${toIsoDate(date)}"` : "undefined"}</Readout>
    </div>
  );
}

function StartEndDates() {
  const [start, setStart] = React.useState<Date | undefined>(new Date(2024, 2, 4));
  const [end, setEnd] = React.useState<Date | undefined>(undefined);
  return (
    <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
      <Field id="role-start" label="Start date">
        <DatePicker
          id="role-start"
          value={start}
          onChange={(next) => {
            setStart(next);
            // Moving the start past the end clears the end rather than leaving an impossible range.
            if (next && end && end < next) setEnd(undefined);
          }}
          max={today()}
          placeholder="Start"
        />
      </Field>
      <Field id="role-end" label="End date">
        <DatePicker id="role-end" value={end} onChange={setEnd} min={start} max={today()} placeholder="Present" clearable />
      </Field>
    </div>
  );
}

function Birthday() {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  return (
    <div className="grid w-full max-w-xs gap-3">
      <Field id="dob" label="Date of birth">
        <DatePicker
          id="dob"
          value={date}
          onChange={setDate}
          captionLayout="dropdown"
          min={new Date(1920, 0, 1)}
          max={today()}
          placeholder="Select your birthday"
        />
      </Field>
    </div>
  );
}

function WeekdaysOnly() {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  return (
    <div className="grid w-full max-w-xs gap-3">
      <Field id="delivery" label="Delivery day">
        <DatePicker
          id="delivery"
          value={date}
          onChange={setDate}
          min={addDays(today(), 1)}
          max={addDays(today(), 45)}
          disabledDays={{ dayOfWeek: [0, 6] }}
          placeholder="Weekdays, from tomorrow"
          clearable
        />
      </Field>
    </div>
  );
}

function States() {
  return (
    <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
      <Field id="invalid-date" label="Invalid">
        <DatePicker id="invalid-date" value={undefined} onChange={() => undefined} aria-invalid />
      </Field>
      <Field id="disabled-date" label="Disabled">
        <DatePicker id="disabled-date" value={today()} onChange={() => undefined} disabled />
      </Field>
    </div>
  );
}

function RangeWithPresets() {
  const [range, setRange] = React.useState<DateRange | undefined>({ from: addDays(today(), -6), to: today() });
  return (
    <div className="grid w-full max-w-xs gap-3">
      <Field id="report-range" label="Report period">
        <DateRangePicker id="report-range" value={range} onChange={setRange} max={today()} clearable />
      </Field>
      <Readout>{formatDateRange(range) ?? "no range"}</Readout>
    </div>
  );
}

function TripDates() {
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);
  return (
    <div className="grid w-full max-w-xs gap-3">
      <Field id="trip" label="Trip dates">
        <DateRangePicker
          id="trip"
          value={range}
          onChange={setRange}
          presets={false}
          numberOfMonths={2}
          min={today()}
          placeholder="Check-in – check-out"
        />
      </Field>
    </div>
  );
}

function Availability() {
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);
  return (
    <div className="grid w-full max-w-xs gap-3">
      <Field id="availability" label="Availability">
        <DateRangePicker
          id="availability"
          value={range}
          onChange={setRange}
          presets={FUTURE_PRESETS}
          min={today()}
          max={addDays(today(), 90)}
          disabledDays={{ dayOfWeek: [0, 6] }}
          placeholder="Weekdays in the next 90 days"
        />
      </Field>
    </div>
  );
}

function ChipFilters() {
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);
  const [source, setSource] = React.useState<"search" | "url" | null>(null);
  return (
    <div className="grid justify-items-center gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          label="Source"
          icon={<CircleDotIcon />}
          value={source}
          options={[
            { value: "search", label: "Search" },
            { value: "url", label: "URL" },
          ]}
          onChange={setSource}
        />
        <DateRangeChip label="Date found" value={range} onChange={setRange} max={today()} />
      </div>
      <Readout>{formatDateRange(range) ?? "Date found: any"}</Readout>
    </div>
  );
}

function UrlState() {
  // Stand-in for useSearchParams: the range lives as ISO strings, parsed on the way in.
  const [params, setParams] = React.useState({ from: toIsoDate(addDays(today(), -29)), to: toIsoDate(today()) });
  const value = { from: parseIsoDate(params.from), to: parseIsoDate(params.to) };
  return (
    <div className="grid w-full max-w-xs gap-3">
      <Field id="url-range" label="Found between">
        <DateRangePicker
          id="url-range"
          value={value}
          max={today()}
          onChange={(range) =>
            setParams({ from: range?.from ? toIsoDate(range.from) : "", to: range?.to ? toIsoDate(range.to) : "" })
          }
          clearable
        />
      </Field>
      <Readout>
        ?from={params.from}&amp;to={params.to}
      </Readout>
    </div>
  );
}

function ToolbarTrigger() {
  const [range, setRange] = React.useState<DateRange | undefined>({ from: today(), to: addDays(today(), 4) });
  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
      presets={FUTURE_PRESETS}
      numberOfMonths={2}
      min={today()}
      triggerLabel="Change trip dates"
      triggerClassName="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition-colors duration-150 ease-out hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <PlaneIcon className="size-4" aria-hidden />
      {formatDateRange(range) ?? "Add dates"}
    </DateRangePicker>
  );
}

export const dateExamples: ExampleSet = {
  "date-picker": [
    { title: "Basic", description: "Value is a Date; convert with toIsoDate for storage.", render: () => <BasicDate /> },
    {
      title: "Start and end",
      description: "End can't precede start (`min={start}`); moving start past end clears it. End is clearable — empty means “Present”.",
      render: () => <StartEndDates />,
    },
    { title: "Birthday", description: "`captionLayout=\"dropdown\"` adds month and year selects for far-off dates.", render: () => <Birthday /> },
    { title: "Weekdays only, bounded", description: "`min`, `max` and `disabledDays={{ dayOfWeek: [0, 6] }}`.", render: () => <WeekdaysOnly /> },
    { title: "Invalid and disabled", render: () => <States /> },
  ],
  "date-range-picker": [
    {
      title: "With presets",
      description: "Last 7/30 days, this month and last month, with a sliding highlight on the active preset. Future days are disabled.",
      render: () => <RangeWithPresets />,
    },
    { title: "Two months, no presets", description: "For picking a span across a month boundary.", render: () => <TripDates /> },
    { title: "Future presets, bounded", description: "`FUTURE_PRESETS`, a 90-day window and weekends off.", render: () => <Availability /> },
    { title: "As a filter chip", description: "`DateRangeChip` matches FilterChip so a filter bar reads as one set.", render: () => <ChipFilters /> },
    { title: "Stored in the URL", description: "ISO strings in, Dates to the picker, ISO strings out.", render: () => <UrlState /> },
    { title: "Custom trigger", description: "Pass children and `triggerClassName` to use any control as the trigger.", render: () => <ToolbarTrigger /> },
  ],
};

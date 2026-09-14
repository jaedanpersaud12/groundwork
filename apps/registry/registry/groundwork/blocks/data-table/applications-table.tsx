"use client";

// A complete table card: search, a status filter, a date-range filter, sortable
// columns, a density toggle, pagination and empty states, client-side through
// useDataTable. Install it, then replace the sample rows and columns with your own.
// For server-driven lists, keep the same components and move the state into the URL.

import * as React from "react";
import { BriefcaseBusinessIcon, CircleDotIcon, Rows2Icon, Rows4Icon, SearchIcon, SearchXIcon, XIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { useDataTable } from "@/registry/groundwork/hooks/use-data-table";
import { addDays, formatDate, today } from "@/registry/groundwork/lib/dates";
import { Button } from "@/registry/groundwork/ui/button";
import { DateRangeChip } from "@/registry/groundwork/ui/date-range-picker";
import { EmptyState } from "@/registry/groundwork/ui/empty-state";
import { ClearFilters, FilterBand, FilterChip } from "@/registry/groundwork/ui/filter-chip";
import { InputGroup } from "@/registry/groundwork/ui/input-group";
import { Pagination, PaginationSummary } from "@/registry/groundwork/ui/pagination";
import { ProgressMeter } from "@/registry/groundwork/ui/progress-meter";
import { SortableTableHead } from "@/registry/groundwork/ui/sortable-table-head";
import { StatusPill, type PillTone } from "@/registry/groundwork/ui/status-pill";
import {
  DataTable,
  StackedCell,
  TableCard,
  TableCardHeader,
  Tbody,
  Td,
  Thead,
  Tr,
  mono,
  type Density,
} from "@/registry/groundwork/ui/table-card";
import { ViewToggle } from "@/registry/groundwork/ui/view-toggle";
import { cn } from "@/lib/utils";

type Status = "applied" | "screening" | "interviewing" | "offer" | "rejected";

type Application = {
  id: string;
  company: string;
  location: string;
  role: string;
  status: Status;
  /** Annual, USD. Null when the listing gave no range. */
  salary: number | null;
  applied: Date;
};

const STATUS: Record<Status, { label: string; tone: PillTone; stage: number }> = {
  applied: { label: "Applied", tone: "info", stage: 1 },
  screening: { label: "Screening", tone: "neutral", stage: 2 },
  interviewing: { label: "Interviewing", tone: "warning", stage: 3 },
  offer: { label: "Offer", tone: "success", stage: 4 },
  rejected: { label: "Rejected", tone: "danger", stage: 0 },
};
const STAGES = 4;

const STATUS_OPTIONS = (Object.keys(STATUS) as Status[]).map((value) => ({ value, label: STATUS[value].label }));
const STATUS_ORDER: Record<Status, number> = { offer: 0, interviewing: 1, screening: 2, applied: 3, rejected: 4 };

const COMPANIES = [
  ["Linear", "San Francisco"],
  ["Vercel", "Remote"],
  ["Raycast", "London"],
  ["Figma", "New York"],
  ["Stripe", "Dublin"],
  ["Notion", "San Francisco"],
  ["Supabase", "Remote"],
  ["Arc", "New York"],
  ["Retool", "San Francisco"],
  ["PostHog", "Remote"],
  ["Resend", "Remote"],
  ["Clerk", "Remote"],
] as const;
const ROLES = ["Frontend Engineer", "Design Engineer", "Product Engineer", "Full-stack Engineer", "UI Engineer", "Staff Engineer"];
const STATUSES: Status[] = ["applied", "screening", "interviewing", "applied", "rejected", "offer", "interviewing", "screening"];

/** Deterministic sample rows, dated relative to today so the date presets have results. */
const SAMPLE_APPLICATIONS: Application[] = Array.from({ length: 46 }, (_, i) => {
  const [company, location] = COMPANIES[(i * 5) % COMPANIES.length];
  return {
    id: `app-${i + 1}`,
    company,
    location,
    role: ROLES[(i * 7) % ROLES.length],
    status: STATUSES[i % STATUSES.length],
    salary: i % 6 === 4 ? null : 120_000 + ((i * 37) % 12) * 7_500,
    applied: addDays(today(), -((i * 3) % 58)),
  };
});

const PAGE_SIZE = 8;

/**
 * Fixed widths, so columns hold still while paging, sorting and filtering. Role takes
 * the rest: the fixed columns sum to 640px, so at the 880px minimum it keeps 240px.
 * Company is 160 rather than a rounder 192: the longest sample city ("San Francisco")
 * only needs ~110px, and the extra 32 read as dead space next to short company names.
 */
const COLUMNS = ["w-40", "", "w-36", "w-28", "w-24", "w-32"] as const;

const DENSITY_OPTIONS = [
  { value: "comfortable", label: "Comfortable", icon: <Rows2Icon aria-hidden /> },
  { value: "compact", label: "Compact", icon: <Rows4Icon aria-hidden /> },
] as const;

type Filters = { status: Status | null; applied: DateRange | null };

export function ApplicationsTable({ data = SAMPLE_APPLICATIONS }: { data?: Application[] }) {
  const [density, setDensity] = React.useState<Extract<Density, "comfortable" | "compact">>("comfortable");
  const table = useDataTable<Application, Filters>({
    data,
    pageSize: PAGE_SIZE,
    searchText: (row) => `${row.company} ${row.role} ${row.location}`,
    filters: {
      status: (row, status) => row.status === status,
      applied: (row, range) => (!range.from || row.applied >= range.from) && (!range.to || row.applied <= range.to),
    },
    initialFilters: { status: null, applied: null },
    sortBy: {
      company: (row) => row.company,
      role: (row) => row.role,
      status: (row) => STATUS_ORDER[row.status],
      salary: (row) => row.salary,
      applied: (row) => row.applied,
    },
    initialSort: { column: "applied", direction: "desc" },
    firstDirection: { salary: "desc", applied: "desc" },
  });

  const sortHead = (column: string, label: string, align?: "start" | "end") => (
    <SortableTableHead direction={table.directionFor(column)} onSort={() => table.toggleSort(column)} align={align}>
      {label}
    </SortableTableHead>
  );

  // Short last pages are padded so the card keeps one height while paging.
  const padRows = table.pageCount > 1 ? PAGE_SIZE - table.rows.length : 0;
  const compact = density === "compact";

  return (
    <TableCard aria-labelledby="applications-heading" className="w-full">
      <TableCardHeader
        icon={<BriefcaseBusinessIcon />}
        title={<span id="applications-heading">Applications</span>}
        note={`Sample data · ${table.unfilteredTotal} tracked`}
      >
        {table.unfilteredTotal > 0 ? (
          <>
            <InputGroup
              type="search"
              aria-label="Filter by company, role or location"
              placeholder="Filter by company, role…"
              icon={<SearchIcon aria-hidden />}
              value={table.query}
              onChange={(event) => table.setQuery(event.target.value)}
              className="h-8 min-w-32 flex-1 rounded-lg"
              trailing={
                table.query ? (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => table.setQuery("")}
                    className="grid size-5 place-items-center rounded-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <XIcon className="size-3.5" aria-hidden />
                  </button>
                ) : null
              }
            />
            <ViewToggle
              label="Row density"
              value={density}
              onChange={setDensity}
              options={DENSITY_OPTIONS}
              className="shrink-0"
            />
          </>
        ) : null}
      </TableCardHeader>

      {table.unfilteredTotal > 0 ? (
        <FilterBand
          className="border-b border-border"
          actions={
            <p aria-live="polite" className="text-xs text-muted-foreground tabular-nums">
              {table.total} {table.total === 1 ? "application" : "applications"}
            </p>
          }
        >
          <FilterChip
            label="Status"
            icon={<CircleDotIcon />}
            value={table.filterValues.status}
            options={STATUS_OPTIONS}
            onChange={(status) => table.setFilter("status", status)}
          />
          <DateRangeChip
            label="Applied"
            value={table.filterValues.applied ?? undefined}
            onChange={(range) => table.setFilter("applied", range ?? null)}
            max={today()}
          />
          {table.activeFilterCount > 0 ? <ClearFilters onClear={table.clearFilters} /> : null}
        </FilterBand>
      ) : null}

      {table.unfilteredTotal === 0 ? (
        <EmptyState
          icon={<BriefcaseBusinessIcon />}
          title="No applications yet"
          description="Applications you track show up here, newest first."
        />
      ) : table.total === 0 ? (
        <EmptyState
          icon={<SearchXIcon />}
          title="No applications match"
          description="Try a different search, or clear the filters to see everything."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                table.setQuery("");
                table.clearFilters();
              }}
            >
              Clear search and filters
            </Button>
          }
        />
      ) : (
        <>
          <DataTable columns={COLUMNS} density={density} minWidth={880}>
            <Thead>
              <tr>
                {sortHead("company", "Company")}
                {sortHead("role", "Role")}
                {sortHead("status", "Status")}
                <th scope="col" className="px-4 py-2.5 font-medium whitespace-nowrap">
                  Stage
                </th>
                {sortHead("salary", "Salary", "end")}
                {sortHead("applied", "Applied", "end")}
              </tr>
            </Thead>
            <Tbody>
              {table.rows.map((row) => {
                const status = STATUS[row.status];
                return (
                  <Tr key={row.id}>
                    <Td className={cn(compact && "py-0")}>
                      {compact ? (
                        <span className="font-medium">{row.company}</span>
                      ) : (
                        <StackedCell primary={row.company} secondary={row.location} />
                      )}
                    </Td>
                    <Td className={cn("text-muted-foreground", compact && "py-0")}>{row.role}</Td>
                    <Td className={cn(compact && "py-0")}>
                      <StatusPill tone={status.tone}>{status.label}</StatusPill>
                    </Td>
                    <Td className={cn(compact && "py-0")}>
                      <ProgressMeter
                        value={status.stage / STAGES}
                        segments={STAGES}
                        tone={row.status === "rejected" ? "muted" : "default"}
                        label={row.status === "rejected" ? "Closed" : `${status.stage}/${STAGES}`}
                      />
                    </Td>
                    <Td align="right" className={cn(mono, compact && "py-0")}>
                      {row.salary === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        `$${Math.round(row.salary / 1000)}k`
                      )}
                    </Td>
                    <Td align="right" className={cn(mono, "text-muted-foreground", compact && "py-0")}>
                      {formatDate(row.applied)}
                    </Td>
                  </Tr>
                );
              })}
              {Array.from({ length: padRows }, (_, index) => (
                <tr key={`pad-${index}`} aria-hidden className="h-[var(--row-h,68px)]">
                  <td colSpan={COLUMNS.length} />
                </tr>
              ))}
            </Tbody>
          </DataTable>

          <footer className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
            <PaginationSummary from={table.from} to={table.to} total={table.total} />
            <Pagination label="Applications pages" count={table.pageCount} page={table.page} onPageChange={table.setPage} />
          </footer>
        </>
      )}
    </TableCard>
  );
}

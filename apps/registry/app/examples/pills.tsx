"use client";

import * as React from "react";
import {
  BanknoteIcon,
  CheckIcon,
  CircleDotIcon,
  ClockIcon,
  CreditCardIcon,
  LayoutGridIcon,
  ListIcon,
  PackageCheckIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import type { DateRange } from "react-day-picker";

import { addDays, today } from "@/registry/groundwork/lib/dates";
import { DateRangeChip } from "@/registry/groundwork/ui/date-range-picker";
import { ClearFilters, FilterBand, FilterChip } from "@/registry/groundwork/ui/filter-chip";
import { ProgressMeter } from "@/registry/groundwork/ui/progress-meter";
import { StatusPill, type PillTone } from "@/registry/groundwork/ui/status-pill";
import {
  DataTable,
  StackedCell,
  TableCard,
  TableCardHeader,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  mono,
} from "@/registry/groundwork/ui/table-card";
import { ViewToggle } from "@/registry/groundwork/ui/view-toggle";

import type { ExampleSet } from "./types";

const TONES: { tone: PillTone; label: string }[] = [
  { tone: "success", label: "Paid" },
  { tone: "warning", label: "Pending" },
  { tone: "danger", label: "Failed" },
  { tone: "info", label: "Processing" },
  { tone: "neutral", label: "Draft" },
  { tone: "solid", label: "Delivered" },
];

function StatusFilter() {
  const [status, setStatus] = React.useState<"active" | "paused" | "archived" | null>("active");
  return (
    <div className="grid justify-items-center gap-3">
      <FilterChip
        label="Status"
        icon={<CircleDotIcon />}
        value={status}
        options={[
          { value: "active", label: "Active" },
          { value: "paused", label: "Paused" },
          { value: "archived", label: "Archived" },
        ]}
        onChange={setStatus}
      />
      <p className="font-mono text-xs text-subtle-foreground">status = {JSON.stringify(status)}</p>
    </div>
  );
}

function FilterPills() {
  const [status, setStatus] = React.useState<"paid" | "pending" | "failed" | null>("pending");
  const [method, setMethod] = React.useState<"card" | "bank" | null>(null);
  const [range, setRange] = React.useState<DateRange | undefined>({ from: addDays(today(), -29), to: today() });
  const active = [status, method, range].filter(Boolean).length;
  return (
    <div className="w-full rounded-xl bg-card shadow-border">
      <FilterBand
        actions={<span className="text-xs text-muted-foreground tabular-nums">{active} active</span>}
      >
        <FilterChip
          label="Status"
          icon={<CircleDotIcon />}
          value={status}
          options={[
            { value: "paid", label: "Paid" },
            { value: "pending", label: "Pending" },
            { value: "failed", label: "Failed" },
          ]}
          onChange={setStatus}
        />
        <FilterChip
          label="Method"
          icon={<CreditCardIcon />}
          value={method}
          options={[
            { value: "card", label: "Card" },
            { value: "bank", label: "Bank transfer" },
          ]}
          onChange={setMethod}
        />
        <DateRangeChip label="Ordered" value={range} onChange={setRange} max={today()} />
        {active ? (
          <ClearFilters
            onClear={() => {
              setStatus(null);
              setMethod(null);
              setRange(undefined);
            }}
          />
        ) : null}
      </FilterBand>
    </div>
  );
}

function Toggle() {
  const [view, setView] = React.useState<"list" | "grid">("list");
  return (
    <div className="grid justify-items-center gap-3">
      <ViewToggle
        label="Layout"
        value={view}
        onChange={setView}
        options={[
          { value: "list", label: "List", icon: <ListIcon aria-hidden /> },
          { value: "grid", label: "Grid", icon: <LayoutGridIcon aria-hidden /> },
        ]}
      />
      <p className="font-mono text-xs text-muted-foreground">view = &quot;{view}&quot;</p>
    </div>
  );
}

const ORDERS = [
  { ref: "ORD-2041", name: "Ada Lovelace", email: "ada@example.com", status: "success", label: "Paid", total: 184.5, progress: 1 },
  { ref: "ORD-2040", name: "Grace Hopper", email: "grace@example.com", status: "warning", label: "Pending", total: 62, progress: 0.4 },
  { ref: "ORD-2039", name: "Katherine Johnson", email: "katherine@example.com", status: "danger", label: "Failed", total: 310.25, progress: 0.2 },
  { ref: "ORD-2038", name: "Margaret Hamilton", email: "margaret@example.com", status: "solid", label: "Delivered", total: 99, progress: 1 },
] as const;

function OrdersCard() {
  return (
    <TableCard className="w-full">
      <TableCardHeader icon={<PackageCheckIcon />} title="Orders" note="Last 30 days · 4 orders" />
      <DataTable columns={["w-32", "", "w-36", "w-40", "w-28"]} minWidth={720}>
        <Thead>
          <tr>
            <Th>Ref</Th>
            <Th>Customer</Th>
            <Th>Status</Th>
            <Th>Fulfilment</Th>
            <Th align="right">Total</Th>
          </tr>
        </Thead>
        <Tbody>
          {ORDERS.map((order) => (
            <Tr key={order.ref}>
              <Td className={`${mono} text-muted-foreground`}>{order.ref}</Td>
              <Td>
                <StackedCell primary={order.name} secondary={order.email} />
              </Td>
              <Td>
                <StatusPill tone={order.status}>{order.label}</StatusPill>
              </Td>
              <Td>
                <ProgressMeter value={order.progress} segments={5} tone={order.status === "danger" ? "muted" : "default"} />
              </Td>
              <Td align="right" className={mono}>
                ${order.total.toFixed(2)}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </DataTable>
    </TableCard>
  );
}

export const pillExamples: ExampleSet = {
  "status-pill": [
    {
      title: "Tones",
      description: "Every tone's text reads at small size on its own tint, in both themes.",
      render: () => (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {TONES.map(({ tone, label }) => (
            <StatusPill key={tone} tone={tone}>
              {label}
            </StatusPill>
          ))}
        </div>
      ),
    },
    {
      title: "With icons, or without a dot",
      description: "An icon replaces the dot. Labels that name a thing rather than a state drop the dot.",
      render: () => (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <StatusPill tone="success" icon={<CheckIcon aria-hidden />}>
            Verified
          </StatusPill>
          <StatusPill tone="warning" icon={<ClockIcon aria-hidden />}>
            Awaiting review
          </StatusPill>
          <StatusPill tone="info" icon={<UsersIcon aria-hidden />}>
            Team plan
          </StatusPill>
          <StatusPill dot={false} icon={<BanknoteIcon aria-hidden />}>
            Bank transfer
          </StatusPill>
          <StatusPill dot={false} icon={<TagIcon aria-hidden />}>
            SUMMER-25
          </StatusPill>
          <StatusPill dot={false}>Card</StatusPill>
        </div>
      ),
    },
  ],
  "filter-chip": [
    {
      title: "Single filter",
      description: "Off is a chip with no value and no ×. Picking one names it on the control; the × puts it back.",
      render: () => <StatusFilter />,
    },
    {
      title: "Filter band",
      description: "Dropdown pills and a date-range pill share one height and shape; × drops a single filter, Clear filters drops them all.",
      render: () => <FilterPills />,
      wide: true,
    },
  ],
  "progress-meter": [
    {
      title: "Segments",
      render: () => (
        <div className="grid gap-3">
          <ProgressMeter value={0} segments={4} label="0/4" />
          <ProgressMeter value={0.5} segments={4} label="2/4" />
          <ProgressMeter value={0.72} />
          <ProgressMeter value={1} segments={4} label="Done" />
          <ProgressMeter value={0.25} segments={4} tone="muted" label="Closed" />
        </div>
      ),
    },
  ],
  "view-toggle": [{ title: "List or grid", render: () => <Toggle /> }],
  "table-card": [
    {
      title: "Orders",
      description: "TableCard, TableCardHeader, StackedCell, StatusPill and ProgressMeter with fixed columns and comfortable rows.",
      render: () => <OrdersCard />,
      wide: true,
    },
  ],
};

"use client";

import * as React from "react";
import { InboxIcon, SearchIcon, XIcon } from "lucide-react";

import { ApplicationsTable } from "@/registry/groundwork/blocks/data-table/applications-table";
import { Button } from "@/registry/groundwork/ui/button";
import { EmptyState } from "@/registry/groundwork/ui/empty-state";
import { InputGroup } from "@/registry/groundwork/ui/input-group";
import { Pagination, PaginationSummary } from "@/registry/groundwork/ui/pagination";
import { SortableTableHead } from "@/registry/groundwork/ui/sortable-table-head";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/groundwork/ui/table";

import type { ExampleSet } from "./types";

function Readout({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs text-subtle-foreground">{children}</p>;
}

const PEOPLE = [
  { name: "Ada Lovelace", team: "Research", joined: 2019 },
  { name: "Grace Hopper", team: "Platform", joined: 2016 },
  { name: "Katherine Johnson", team: "Research", joined: 2021 },
  { name: "Margaret Hamilton", team: "Mobile", joined: 2018 },
];

function SortOnlyTable() {
  const [sort, setSort] = React.useState<{ column: "name" | "joined"; direction: "asc" | "desc" }>({
    column: "name",
    direction: "asc",
  });
  const rows = [...PEOPLE].sort((a, b) => {
    const result = sort.column === "name" ? a.name.localeCompare(b.name) : a.joined - b.joined;
    return sort.direction === "asc" ? result : -result;
  });
  const toggle = (column: "name" | "joined") =>
    setSort((previous) =>
      previous.column === column
        ? { column, direction: previous.direction === "asc" ? "desc" : "asc" }
        : { column, direction: "asc" },
    );

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border">
      <Table columns={["", "w-40", "w-32"]}>
        <TableHeader>
          <TableRow className="hover:bg-muted">
            <SortableTableHead direction={sort.column === "name" ? sort.direction : null} onSort={() => toggle("name")}>
              Name
            </SortableTableHead>
            <TableHead>Team</TableHead>
            <SortableTableHead
              direction={sort.column === "joined" ? sort.direction : null}
              onSort={() => toggle("joined")}
              align="end"
            >
              Joined
            </SortableTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="text-muted-foreground">{row.team}</TableCell>
              <TableCell className="text-right tabular-nums">{row.joined}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function BasicPagination() {
  const [page, setPage] = React.useState(3);
  return (
    <div className="grid justify-items-center gap-3">
      <Pagination count={8} page={page} onPageChange={setPage} />
      <Readout>page = {page}</Readout>
    </div>
  );
}

function LongPagination() {
  const [page, setPage] = React.useState(24);
  return (
    <div className="grid justify-items-center gap-3">
      <Pagination count={120} page={page} onPageChange={setPage} siblings={2} />
      <PaginationSummary from={(page - 1) * 25 + 1} to={page * 25} total={3000} noun="orders" />
    </div>
  );
}

function LinkPagination() {
  const [page, setPage] = React.useState(1);
  return (
    <div className="grid justify-items-center gap-3">
      <Pagination count={5} page={page} onPageChange={setPage} hrefFor={(target) => `?page=${target}`} />
      <Readout>href of page {page} = ?page={page} (cmd-click opens a new tab)</Readout>
    </div>
  );
}

function SearchField() {
  const [query, setQuery] = React.useState("design engineer");
  return (
    <InputGroup
      type="search"
      aria-label="Search"
      placeholder="Search roles..."
      icon={<SearchIcon aria-hidden />}
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      className="w-full max-w-sm"
      trailing={
        query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="grid size-5 place-items-center rounded-sm text-subtle-foreground hover:text-foreground"
          >
            <XIcon className="size-3.5" aria-hidden />
          </button>
        ) : null
      }
    />
  );
}

export const tableExamples: ExampleSet = {
  "data-table": [
    {
      title: "Search, filters, sorting and pagination",
      description:
        "Type in the search, pick a status or an Applied range, click column heads to sort, page through. The filter resets to page 1.",
      render: () => <ApplicationsTable />,
      wide: true,
    },
    {
      title: "Empty",
      description: "No rows at all shows the first-run state instead of an empty table.",
      render: () => <ApplicationsTable data={[]} />,
      wide: true,
    },
  ],
  "sortable-table-head": [
    {
      title: "Sorting with plain state",
      description: "No hook needed: the head only reports clicks. Name and Joined sort; Team does not.",
      render: () => <SortOnlyTable />,
      wide: true,
    },
  ],
  pagination: [
    { title: "Basic", render: () => <BasicPagination /> },
    { title: "Many pages", description: "Gaps collapse the middle; `siblings={2}` widens the window.", render: () => <LongPagination /> },
    {
      title: "As links",
      description: "`hrefFor` makes every page a real URL for server-rendered lists; a plain click still calls `onPageChange`.",
      render: () => <LinkPagination />,
    },
  ],
  "input-group": [
    { title: "Search with clear", render: () => <SearchField /> },
    {
      title: "Small",
      description: "`size=\"sm\"` for a 32px field beside chips and toggles: tighter padding, 14px icon, 12px text.",
      render: () => (
        <InputGroup type="search" size="sm" aria-label="Filter" placeholder="Filter by company, role…" icon={<SearchIcon aria-hidden />} className="w-full max-w-xs rounded-lg" />
      ),
    },
    {
      title: "Trailing unit",
      render: () => (
        <InputGroup aria-label="Salary" inputMode="numeric" defaultValue="150000" className="w-48" trailing={<span className="text-xs text-subtle-foreground">USD</span>} />
      ),
    },
  ],
  "empty-state": [
    {
      title: "With action",
      render: () => (
        <EmptyState
          icon={<InboxIcon />}
          title="No messages"
          description="When someone replies to an application, it lands here."
          action={<Button size="sm" variant="outline">Refresh</Button>}
        />
      ),
    },
  ],
};

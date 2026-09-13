"use client";

import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";
export type SortValue = string | number | Date | boolean | null | undefined;
export type SortState = { column: string; direction: SortDirection };

export type DataTableOptions<T, F extends Record<string, unknown> = Record<string, unknown>> = {
  data: readonly T[];
  /** Rows per page. Default 10. */
  pageSize?: number;
  /** Text the search box matches against, case-insensitively. Omit to disable search. */
  searchText?: (row: T) => string;
  /**
   * One predicate per filter. A filter whose value is `null` or `undefined` is off.
   * The value type comes from `initialFilters`.
   */
  filters?: { [K in keyof F]: (row: T, value: NonNullable<F[K]>) => boolean };
  initialFilters?: F;
  /** How each sortable column reads its value. Nulls always sort last. */
  sortBy?: Record<string, (row: T) => SortValue>;
  initialSort?: SortState | null;
  /** Direction a column starts in the first time it is clicked. Default "asc". */
  firstDirection?: Record<string, SortDirection>;
};

function compare(a: SortValue, b: SortValue): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

/**
 * Client-side search, filters, sort and pagination for a table. Changing the
 * search, a filter or the sort returns to page 1. For server-driven tables, keep
 * this state in the URL instead and use the table components on their own.
 */
export function useDataTable<T, F extends Record<string, unknown> = Record<string, unknown>>({
  data,
  pageSize = 10,
  searchText,
  filters,
  initialFilters,
  sortBy,
  initialSort = null,
  firstDirection,
}: DataTableOptions<T, F>) {
  const [query, setQueryState] = useState("");
  const [filterValues, setFilterValues] = useState<F>(() => initialFilters ?? ({} as F));
  const [sort, setSort] = useState<SortState | null>(initialSort);
  const [page, setPageState] = useState(1);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data.filter((row) => {
      if (needle && searchText && !searchText(row).toLowerCase().includes(needle)) return false;
      if (!filters) return true;
      return (Object.keys(filters) as (keyof F)[]).every((key) => {
        const value = filterValues[key];
        return value == null || filters[key](row, value as NonNullable<F[typeof key]>);
      });
    });
  }, [data, query, searchText, filters, filterValues]);

  const sorted = useMemo(() => {
    const read = sort && sortBy?.[sort.column];
    if (!sort || !read) return filtered;
    const sign = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = read(a);
      const vb = read(b);
      // Nulls stay last in both directions.
      if (va == null || vb == null) return compare(va, vb);
      return sign * compare(va, vb);
    });
  }, [filtered, sort, sortBy]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const rows = sorted.slice(start, start + pageSize);

  function setQuery(next: string) {
    setQueryState(next);
    setPageState(1);
  }

  function setFilter<K extends keyof F>(key: K, value: F[K] | null) {
    setFilterValues((previous) => ({ ...previous, [key]: value }));
    setPageState(1);
  }

  function clearFilters() {
    setFilterValues({} as F);
    setPageState(1);
  }

  function toggleSort(column: string) {
    setSort((previous) =>
      previous?.column === column
        ? { column, direction: previous.direction === "asc" ? "desc" : "asc" }
        : { column, direction: firstDirection?.[column] ?? "asc" },
    );
    setPageState(1);
  }

  const activeFilterCount = Object.values(filterValues).filter((value) => value != null).length;

  return {
    /** Rows on the current page. */
    rows,
    /** Rows matching search and filters, across all pages. */
    total: sorted.length,
    /** Rows before search and filters. */
    unfilteredTotal: data.length,
    page: currentPage,
    pageCount,
    pageSize,
    /** 1-based index of the first and last row shown; 0 when empty. */
    from: sorted.length === 0 ? 0 : start + 1,
    to: start + rows.length,
    setPage: (next: number) => setPageState(Math.min(Math.max(1, next), pageCount)),
    query,
    setQuery,
    filterValues,
    setFilter,
    clearFilters,
    activeFilterCount,
    sort,
    toggleSort,
    /** The direction `column` is sorted in, or null when another column is. */
    directionFor: (column: string): SortDirection | null => (sort?.column === column ? sort.direction : null),
  };
}

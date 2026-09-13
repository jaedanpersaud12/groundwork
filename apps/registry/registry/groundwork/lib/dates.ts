// Calendar-day helpers. Everything works in local time at midnight, which is what
// react-day-picker uses; ISO `YYYY-MM-DD` strings are for URLs and storage.

export type DayRange = { from: Date | undefined; to?: Date | undefined };

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function today(): Date {
  return startOfDay(new Date());
}

export function addDays(date: Date, days: number): Date {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isSameDay(a: Date | undefined, b: Date | undefined): boolean {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** `date` moved inside [min, max] when it falls outside. */
export function clampDate(date: Date, min?: Date, max?: Date): Date {
  if (min && date < min) return min;
  if (max && date > max) return max;
  return date;
}

/** `2026-09-13`. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Parses `YYYY-MM-DD` as local midnight; anything else is undefined. */
export function parseIsoDate(value: string | null | undefined): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 ? date : undefined;
}

/** `Sep 13, 2026`. */
export function formatDate(date: Date, locale = "en-US"): string {
  return date.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

/** `Sep 7 – Sep 13, 2026`, dropping the year from the start when both ends share it. */
export function formatDateRange(range: DayRange | undefined, locale = "en-US"): string | null {
  const { from, to } = range ?? {};
  if (!from && !to) return null;
  if (from && !to) return `From ${formatDate(from, locale)}`;
  if (!from && to) return `Until ${formatDate(to, locale)}`;
  if (isSameDay(from, to)) return formatDate(from!, locale);
  const sameYear = from!.getFullYear() === to!.getFullYear();
  const start = from!.toLocaleDateString(locale, { month: "short", day: "numeric", ...(sameYear ? {} : { year: "numeric" }) });
  return `${start} – ${formatDate(to!, locale)}`;
}

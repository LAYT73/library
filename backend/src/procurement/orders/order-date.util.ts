/** Календарный день в UTC (YYYY-MM-DD) для сравнения дат. */
export function toUtcDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function isExpectedDateBefore(
  expectedDate: string,
  notBefore: Date,
): boolean {
  return toUtcDateKey(new Date(expectedDate)) < toUtcDateKey(notBefore);
}

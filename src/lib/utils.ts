/**
 * Get the start of the week (Sunday) for a given date.
 * Returns YYYY-MM-DD string.
 */
export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return formatDate(d);
}

/**
 * Format a Date to YYYY-MM-DD string.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date object (local timezone).
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

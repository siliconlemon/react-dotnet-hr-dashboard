import type { Dayjs } from 'dayjs';

/** Sunday = 0, Saturday = 6 */
export function isWeekendDay(d: Dayjs): boolean {
  const dow = d.day();
  return dow === 0 || dow === 6;
}

export function countWeekdaysInclusive(start: Dayjs, endInclusive: Dayjs): number {
  let n = 0;
  let d = start.startOf('day');
  const last = endInclusive.startOf('day');
  if (d.isAfter(last, 'day')) return 0;
  while (!d.isAfter(last, 'day')) {
    if (!isWeekendDay(d)) n++;
    d = d.add(1, 'day');
  }
  return n;
}

/** First weekday on or after `start` within `[start, endInclusive]`, or `null` if none. */
export function firstWeekdayInInclusiveRange(start: Dayjs, endInclusive: Dayjs): Dayjs | null {
  let d = start.startOf('day');
  const last = endInclusive.startOf('day');
  if (d.isAfter(last, 'day')) return null;
  while (!d.isAfter(last, 'day')) {
    if (!isWeekendDay(d)) return d;
    d = d.add(1, 'day');
  }
  return null;
}

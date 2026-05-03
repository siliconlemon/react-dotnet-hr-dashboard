import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import type { PtoLedgerEntryReadDto } from '../../api/types';
import type { EmployeeCardAccent } from '../../theme/employeeCardPalette';
import { formatEmployeeLedgerDisplay } from '../../utils/formatEmployeeLedger';

dayjs.extend(isoWeek);

export type EmployeeDayDetail = {
  employeeId: number;
  label: string;
  departmentId: number;
  departmentName: string;
  ledgerRows: PtoLedgerEntryReadDto[];
};

export function mondayOfDate(d: Dayjs): Dayjs {
  const dow = d.day();
  const delta = dow === 0 ? -6 : 1 - dow;
  return d.add(delta, 'day').startOf('day');
}

/** Sat/Sun in local time — usage is not counted on weekends. */
export function isWeekend(d: Dayjs): boolean {
  const dow = d.day();
  return dow === 0 || dow === 6;
}

/**
 * Muted fill for in-month weekends only. Keep visually distinct from
 * {@link Theme.palette.action.hover} used for adjacent-month spillover days.
 */
export function weekendInMonthWash(theme: Theme): string {
  const { grey } = theme.palette;
  return theme.palette.mode === 'dark'
    ? alpha(grey[700], 0.38)
    : alpha(grey[400], 0.14);
}

/** ISO weeks that overlap `[month]` (each row Mon–Sun). */
export function weeksOverlappingMonth(month: Dayjs): Dayjs[][] {
  const y = month.year();
  const mo = month.month();
  let weekMon = mondayOfDate(month.startOf('month'));
  const lastWeekMon = mondayOfDate(month.endOf('month'));
  const rows: Dayjs[][] = [];
  while (!weekMon.isAfter(lastWeekMon)) {
    const days = Array.from({ length: 7 }, (_, i) => weekMon.add(i, 'day'));
    if (days.some((d) => d.month() === mo && d.year() === y)) {
      rows.push(days);
    }
    weekMon = weekMon.add(7, 'day');
  }
  return rows;
}

export function rowsForDate(rows: PtoLedgerEntryReadDto[], dateKey: string): PtoLedgerEntryReadDto[] {
  return rows.filter((r) => r.effectiveDate.slice(0, 10) === dateKey);
}

export function buildEmployeeGroups(rows: PtoLedgerEntryReadDto[]): EmployeeDayDetail[] {
  const byId = new Map<number, PtoLedgerEntryReadDto[]>();
  for (const r of rows) {
    const list = byId.get(r.employeeId);
    if (list) list.push(r);
    else byId.set(r.employeeId, [r]);
  }
  return [...byId.entries()]
    .map(([employeeId, ledgerRows]) => {
      ledgerRows.sort((a, b) => a.id - b.id);
      const first = ledgerRows[0]!;
      return {
        employeeId,
        label: formatEmployeeLedgerDisplay(first),
        departmentId: first.departmentId,
        departmentName: first.departmentName,
        ledgerRows,
      };
    })
    .sort((a, b) => {
      const d = a.departmentName.localeCompare(b.departmentName);
      if (d !== 0) return d;
      return a.label.localeCompare(b.label);
    });
}

export function departmentBuckets(groups: EmployeeDayDetail[]): Map<string, EmployeeDayDetail[]> {
  const m = new Map<string, EmployeeDayDetail[]>();
  for (const g of groups) {
    const key = g.departmentName || '—';
    const list = m.get(key);
    if (list) list.push(g);
    else m.set(key, [g]);
  }
  return new Map([...m.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

/** Distinct employees away per department (one square per department in the cell). */
export function departmentAwaySegments(
  groups: EmployeeDayDetail[],
): { departmentId: number; departmentName: string; count: number }[] {
  const m = new Map<number, { departmentName: string; count: number }>();
  for (const g of groups) {
    const cur = m.get(g.departmentId);
    if (cur) cur.count += 1;
    else m.set(g.departmentId, { departmentName: g.departmentName || '—', count: 1 });
  }
  return [...m.entries()]
    .map(([departmentId, v]) => ({
      departmentId,
      departmentName: v.departmentName,
      count: v.count,
    }))
    .sort((a, b) => a.departmentName.localeCompare(b.departmentName));
}

/** Usage rows Mon–Fri only for the given ISO week row. */
export function rowsForWeekWeekdays(days: Dayjs[], usageRows: PtoLedgerEntryReadDto[]): PtoLedgerEntryReadDto[] {
  const keys = new Set<string>();
  for (const d of days) {
    if (isWeekend(d)) continue;
    keys.add(d.format('YYYY-MM-DD'));
  }
  return usageRows.filter((r) => keys.has(r.effectiveDate.slice(0, 10)));
}

export function formatWeekRangeLabel(weekMonday: Dayjs, localeTag: string): string {
  const sun = weekMonday.add(6, 'day');
  const df = new Intl.DateTimeFormat(localeTag, { month: 'short', day: 'numeric' });
  const y = weekMonday.year();
  return `${df.format(weekMonday.toDate())}–${df.format(sun.toDate())}, ${y}`;
}

/**
 * Department count badges: match employee card headers — light = pastel fill + deep name tone
 * (readable on primary heat tints); dark = deep fill + pastel text on `paper`.
 */
export function departmentLookupChipColors(theme: Theme, accent: EmployeeCardAccent) {
  if (theme.palette.mode === 'dark') {
    return { bgcolor: accent.nameColor, color: accent.headerBg };
  }
  return { bgcolor: accent.headerBg, color: accent.nameColor };
}

/** Normalized intensity in [0, 1] from (away / maxAway). */
export function calendarAwayHeatWash(theme: Theme, intensity: number): string {
  const x = Math.min(1, Math.max(0, intensity));
  if (theme.palette.mode === 'dark') {
    const low = 0.14;
    const high = 0.36;
    return alpha(theme.palette.primary.main, low + x * (high - low));
  }
  const low = 0.06;
  const high = 0.26;
  return alpha(theme.palette.primary.main, low + x * (high - low));
}

/** Spillover days outside the visible month — muted but distinct in both modes. */
export function calendarOutsideMonthWash(theme: Theme): string {
  return theme.palette.mode === 'dark'
    ? alpha(theme.palette.primary.light, 0.06)
    : theme.palette.action.hover;
}

export function weekContainsToday(weekMonday: Dayjs): boolean {
  const today = dayjs().startOf('day');
  const mon = weekMonday.startOf('day');
  const sun = weekMonday.add(6, 'day').startOf('day');
  return !today.isBefore(mon, 'day') && !today.isAfter(sun, 'day');
}

/** Hover summary: `Engineering: 2 (Jordan Lee, Riley Okonkwo) • Sales: 1 (Taylor Chen)`. */
export function calendarDepartmentTooltip(groups: EmployeeDayDetail[]): string {
  if (groups.length === 0) return '';
  const buckets = departmentBuckets(groups);
  const parts: string[] = [];
  for (const [deptName, people] of buckets.entries()) {
    const names = people.map((p) => p.label).join(', ');
    parts.push(`${deptName}: ${people.length} (${names})`);
  }
  return parts.join(' • ');
}

/** ISO week number (Monday-based), aligned with previous `date-fns` `getISOWeek`. */
export function isoWeekNumber(weekMonday: Dayjs): number {
  return weekMonday.isoWeek();
}

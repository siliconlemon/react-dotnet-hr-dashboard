import { useStore } from '@base-ui/utils/store';
import { getDayList } from '@mui/x-scheduler-headless/get-day-list';
import {
  eventCalendarAgendaSelectors,
  eventCalendarPreferenceSelectors,
  eventCalendarViewSelectors,
} from '@mui/x-scheduler-headless/event-calendar-selectors';
import { schedulerOtherSelectors } from '@mui/x-scheduler-headless/scheduler-selectors';
import { useAdapterContext } from '@mui/x-scheduler-headless/use-adapter-context';
import { useEventCalendarStoreContext } from '@mui/x-scheduler-headless/use-event-calendar-store-context';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { eventCalendarClasses } from '@mui/x-scheduler/event-calendar';
import { isWeekendDay } from '../../utils/weekdayCalendar';

type ProcessedDay = ReturnType<typeof getDayList>[number];

function groupIntoWeeks(adapter: ReturnType<typeof useAdapterContext>, flatDays: ProcessedDay[]): ProcessedDay[][] {
  const weeks: ProcessedDay[][] = [];
  let weekNumber: number | null = null;
  for (const day of flatDays) {
    const wn = adapter.getWeekNumber(day.value);
    if (weekNumber !== wn) {
      weekNumber = wn;
      weeks.push([day]);
    } else {
      weeks[weeks.length - 1].push(day);
    }
  }
  return weeks;
}

function gridCellToDay(
  gridCell: HTMLElement,
  monthBody: HTMLElement,
  weeks: ProcessedDay[][],
): ProcessedDay | null {
  const row = gridCell.closest<HTMLElement>('[role="row"]');
  if (!row || !monthBody.contains(row)) return null;
  const rowIdx = Array.from(monthBody.children).indexOf(row);
  if (rowIdx < 0 || rowIdx >= weeks.length) return null;
  const cells = Array.from(row.querySelectorAll<HTMLElement>('[role="gridcell"]'));
  const colIdx = cells.indexOf(gridCell);
  if (colIdx < 0) return null;
  const week = weeks[rowIdx];
  return week[colIdx] ?? null;
}

function agendaRowToDay(
  row: HTMLElement,
  agendaRoot: HTMLElement,
  visibleDays: ProcessedDay[],
): ProcessedDay | null {
  const rows = Array.from(
    agendaRoot.querySelectorAll<HTMLElement>(`:scope > .${eventCalendarClasses.agendaViewRow}`),
  );
  const idx = rows.indexOf(row);
  if (idx < 0 || idx >= visibleDays.length) return null;
  return visibleDays[idx] ?? null;
}

function pickGridCellUnderPoint(clientX: number, clientY: number, root: HTMLElement): HTMLElement | null {
  const stack = document.elementsFromPoint(clientX, clientY);
  for (const el of stack) {
    if (!(el instanceof HTMLElement)) continue;
    if (!root.contains(el)) continue;
    const cell = el.closest<HTMLElement>('[role="gridcell"]');
    if (cell && root.contains(cell)) return cell;
  }
  return null;
}

function pickAgendaRowUnderPoint(clientX: number, clientY: number, root: HTMLElement): HTMLElement | null {
  const stack = document.elementsFromPoint(clientX, clientY);
  for (const el of stack) {
    if (!(el instanceof HTMLElement)) continue;
    if (!root.contains(el)) continue;
    const row = el.closest<HTMLElement>(`.${eventCalendarClasses.agendaViewRow}`);
    if (row && root.contains(row)) return row;
  }
  return null;
}

function shouldIgnorePointerTargetMonth(target: EventTarget | null, monthBody: HTMLElement): boolean {
  if (!(target instanceof Element)) return true;
  if (!monthBody.contains(target)) return true;
  if (target.closest('button')) return true;
  if (target.closest(`.${eventCalendarClasses.dayGridEvent}`)) return true;
  if (target.closest(`.${eventCalendarClasses.monthViewMoreEvents}`)) return true;
  return false;
}

function shouldIgnorePointerTargetAgenda(target: EventTarget | null, agendaRoot: HTMLElement): boolean {
  if (!(target instanceof Element)) return true;
  if (!agendaRoot.contains(target)) return true;
  if (target.closest('button')) return true;
  if (target.closest(`.${eventCalendarClasses.eventItemCard}`)) return true;
  return false;
}

/** Applied while dragging a range (month cells or agenda rows); styled in `LeaveCalendarTab` like DataGrid focus-within. */
export const LEAVE_CALENDAR_MONTH_RANGE_PREVIEW_CLASS = 'leave-calendar-month-range-preview';

function orderedDayRange(a: Dayjs, b: Dayjs): [Dayjs, Dayjs] {
  const x = a.startOf('day');
  const y = b.startOf('day');
  return x.isBefore(y) ? [x, y] : y.isBefore(x) ? [y, x] : [x, y];
}

function updateMonthPreviewHighlight(
  monthBody: HTMLElement,
  weeks: ProcessedDay[][],
  rangeStart: Dayjs,
  rangeEnd: Dayjs,
) {
  const [lo, hi] = orderedDayRange(rangeStart, rangeEnd);
  const cells = monthBody.querySelectorAll<HTMLElement>('[role="gridcell"]');
  cells.forEach((cell) => {
    const day = gridCellToDay(cell, monthBody, weeks);
    if (!day) {
      cell.classList.remove(LEAVE_CALENDAR_MONTH_RANGE_PREVIEW_CLASS);
      return;
    }
    const d = dayjs(day.value).startOf('day');
    const inRange = !d.isBefore(lo, 'day') && !d.isAfter(hi, 'day');
    cell.classList.toggle(
      LEAVE_CALENDAR_MONTH_RANGE_PREVIEW_CLASS,
      inRange && !isWeekendDay(d),
    );
  });
}

function updateAgendaPreviewHighlight(
  agendaRoot: HTMLElement,
  visibleDays: ProcessedDay[],
  rangeStart: Dayjs,
  rangeEnd: Dayjs,
) {
  const [lo, hi] = orderedDayRange(rangeStart, rangeEnd);
  const rows = agendaRoot.querySelectorAll<HTMLElement>(`:scope > .${eventCalendarClasses.agendaViewRow}`);
  rows.forEach((row, idx) => {
    const day = visibleDays[idx];
    if (!day) {
      row.classList.remove(LEAVE_CALENDAR_MONTH_RANGE_PREVIEW_CLASS);
      return;
    }
    const d = dayjs(day.value).startOf('day');
    const inRange = !d.isBefore(lo, 'day') && !d.isAfter(hi, 'day');
    row.classList.toggle(
      LEAVE_CALENDAR_MONTH_RANGE_PREVIEW_CLASS,
      inRange && !isWeekendDay(d),
    );
  });
}

function clearPreviewHighlight(surface: HTMLElement) {
  surface
    .querySelectorAll<HTMLElement>(`.${LEAVE_CALENDAR_MONTH_RANGE_PREVIEW_CLASS}`)
    .forEach((el) => el.classList.remove(LEAVE_CALENDAR_MONTH_RANGE_PREVIEW_CLASS));
}

export type LeaveCalendarMonthDragBridgeProps = {
  /** Element that wraps `<EventCalendar />`; used for hit-testing containment. */
  containerRef: RefObject<HTMLElement | null>;
  onCommitRange: (range: { start: Dayjs; endInclusive: Dayjs }) => void;
};

const DRAG_THRESHOLD_PX = 4;

type DragSurfaceMode = 'month' | 'agenda';

type DragState = {
  pointerId: number;
  mode: DragSurfaceMode;
  surface: HTMLElement;
  startDay: ProcessedDay;
  startClientX: number;
  startClientY: number;
  lastHit: HTMLElement | null;
  maxMove: number;
};

/**
 * Month & agenda views: click or drag to select an inclusive date range and open the ledger dialog.
 * Must be rendered as a child of `<EventCalendar />` so scheduler store + adapter context are available.
 */
export function LeaveCalendarMonthDragBridge({ containerRef, onCommitRange }: LeaveCalendarMonthDragBridgeProps) {
  const store = useEventCalendarStoreContext();
  const adapter = useAdapterContext();
  const view = useStore(store, eventCalendarViewSelectors.view);
  const visibleDate = useStore(store, schedulerOtherSelectors.visibleDate);
  const showWeekends = useStore(store, eventCalendarPreferenceSelectors.showWeekends);
  const agendaVisibleDays = useStore(store, eventCalendarAgendaSelectors.visibleDays);

  const weeks = useMemo(
    () =>
      groupIntoWeeks(
        adapter,
        getDayList({
          adapter,
          start: adapter.startOfWeek(adapter.startOfMonth(visibleDate)),
          end: adapter.endOfWeek(adapter.endOfMonth(visibleDate)),
          excludeWeekends: !showWeekends,
        }),
      ),
    [adapter, visibleDate, showWeekends],
  );

  const weeksRef = useRef(weeks);
  useEffect(() => {
    weeksRef.current = weeks;
  }, [weeks]);

  const agendaDaysRef = useRef(agendaVisibleDays);
  useEffect(() => {
    agendaDaysRef.current = agendaVisibleDays;
  }, [agendaVisibleDays]);

  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    if (view !== 'month' && view !== 'agenda') return undefined;

    /** Snapshot for cleanup so we do not read `containerRef.current` after it may have changed. */
    const mountRoot = containerRef.current;

    const onPointerDownCapture = (ev: PointerEvent) => {
      if (ev.button !== 0) return;
      const root = containerRef.current;
      if (!root) return;

      if (view === 'month') {
        const monthBody = root.querySelector<HTMLElement>(`.${eventCalendarClasses.monthViewBody}`);
        if (!monthBody) return;
        if (shouldIgnorePointerTargetMonth(ev.target, monthBody)) return;

        const gridCell = (ev.target as Element).closest<HTMLElement>('[role="gridcell"]');
        if (!gridCell || !monthBody.contains(gridCell)) return;

        const startDay = gridCellToDay(gridCell, monthBody, weeksRef.current);
        if (!startDay) return;
        if (isWeekendDay(dayjs(startDay.value).startOf('day'))) return;

        ev.preventDefault();
        dragRef.current = {
          pointerId: ev.pointerId,
          mode: 'month',
          surface: monthBody,
          startDay,
          startClientX: ev.clientX,
          startClientY: ev.clientY,
          lastHit: gridCell,
          maxMove: 0,
        };
        const startJs = dayjs(startDay.value).startOf('day');
        updateMonthPreviewHighlight(monthBody, weeksRef.current, startJs, startJs);
        return;
      }

      if (view === 'agenda') {
        const agendaRoot = root.querySelector<HTMLElement>(`.${eventCalendarClasses.agendaView}`);
        if (!agendaRoot) return;
        if (shouldIgnorePointerTargetAgenda(ev.target, agendaRoot)) return;

        const row = (ev.target as Element).closest<HTMLElement>(`.${eventCalendarClasses.agendaViewRow}`);
        if (!row || !agendaRoot.contains(row)) return;

        const startDay = agendaRowToDay(row, agendaRoot, agendaDaysRef.current);
        if (!startDay) return;
        if (isWeekendDay(dayjs(startDay.value).startOf('day'))) return;

        ev.preventDefault();
        dragRef.current = {
          pointerId: ev.pointerId,
          mode: 'agenda',
          surface: agendaRoot,
          startDay,
          startClientX: ev.clientX,
          startClientY: ev.clientY,
          lastHit: row,
          maxMove: 0,
        };
        const startJs = dayjs(startDay.value).startOf('day');
        updateAgendaPreviewHighlight(agendaRoot, agendaDaysRef.current, startJs, startJs);
      }
    };

    const onPointerMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d || ev.pointerId !== d.pointerId) return;
      const dx = ev.clientX - d.startClientX;
      const dy = ev.clientY - d.startClientY;
      d.maxMove = Math.max(d.maxMove, Math.hypot(dx, dy));

      const root = containerRef.current;
      if (!root) return;

      if (d.mode === 'month') {
        const cell = pickGridCellUnderPoint(ev.clientX, ev.clientY, root);
        if (cell && d.surface.contains(cell)) {
          d.lastHit = cell;
        }

        const startJs = dayjs(d.startDay.value).startOf('day');
        let endJs = startJs;
        if (d.lastHit) {
          const mapped = gridCellToDay(d.lastHit, d.surface, weeksRef.current);
          if (mapped) endJs = dayjs(mapped.value).startOf('day');
        }
        updateMonthPreviewHighlight(d.surface, weeksRef.current, startJs, endJs);
        return;
      }

      if (d.mode === 'agenda') {
        const row = pickAgendaRowUnderPoint(ev.clientX, ev.clientY, root);
        if (row && d.surface.contains(row)) {
          d.lastHit = row;
        }

        const startJs = dayjs(d.startDay.value).startOf('day');
        let endJs = startJs;
        if (d.lastHit) {
          const mapped = agendaRowToDay(d.lastHit, d.surface, agendaDaysRef.current);
          if (mapped) endJs = dayjs(mapped.value).startOf('day');
        }
        updateAgendaPreviewHighlight(d.surface, agendaDaysRef.current, startJs, endJs);
      }
    };

    const finish = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d || ev.pointerId !== d.pointerId) return;
      dragRef.current = null;
      clearPreviewHighlight(d.surface);

      let start = dayjs(d.startDay.value).startOf('day');
      let endDayProcessed = d.startDay;
      if (d.maxMove >= DRAG_THRESHOLD_PX && d.lastHit) {
        if (d.mode === 'month') {
          const mapped = gridCellToDay(d.lastHit, d.surface, weeksRef.current);
          if (mapped) endDayProcessed = mapped;
        } else {
          const mapped = agendaRowToDay(d.lastHit, d.surface, agendaDaysRef.current);
          if (mapped) endDayProcessed = mapped;
        }
      }
      let end = dayjs(endDayProcessed.value).startOf('day');
      if (end.isBefore(start)) {
        const t = start;
        start = end;
        end = t;
      }

      onCommitRange({ start, endInclusive: end });
    };

    document.addEventListener('pointerdown', onPointerDownCapture, true);
    document.addEventListener('pointermove', onPointerMove, true);
    document.addEventListener('pointerup', finish, true);
    document.addEventListener('pointercancel', finish, true);

    return () => {
      document.removeEventListener('pointerdown', onPointerDownCapture, true);
      document.removeEventListener('pointermove', onPointerMove, true);
      document.removeEventListener('pointerup', finish, true);
      document.removeEventListener('pointercancel', finish, true);
      const monthBody = mountRoot?.querySelector<HTMLElement>(`.${eventCalendarClasses.monthViewBody}`);
      const agendaRoot = mountRoot?.querySelector<HTMLElement>(`.${eventCalendarClasses.agendaView}`);
      if (monthBody) clearPreviewHighlight(monthBody);
      if (agendaRoot) clearPreviewHighlight(agendaRoot);
    };
  }, [containerRef, onCommitRange, view]);

  return null;
}

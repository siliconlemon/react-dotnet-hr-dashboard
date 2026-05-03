import { Alert, Box, LinearProgress, Paper, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { EventCalendar, eventCalendarClasses } from '@mui/x-scheduler/event-calendar';
import type { EventCalendarPreferences, SchedulerEvent } from '@mui/x-scheduler/models';
import { cs, enUS } from 'date-fns/locale';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LeaveCalendarMonthDragBridge,
  LEAVE_CALENDAR_MONTH_RANGE_PREVIEW_CLASS,
} from './LeaveCalendarMonthDragBridge';
import { fetchPtoLedgerUsageInRange } from '../../api/ptoLedgerApi';
import type { PtoLedgerEntryReadDto } from '../../api/types';
import { strings } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';
import {
  getEventCalendarToolbarOutlinedButtonSx,
  getEventCalendarToolbarTodayButtonSx,
} from '../../theme/enterpriseTheme';
import { formatPtoDays } from '../../utils/formatPto';

/**
 * One all-day event per usage ledger row (MUI X Event Calendar).
 * End is exclusive start of next day (common all-day convention).
 */
function usageRowsToEvents(rows: PtoLedgerEntryReadDto[]): SchedulerEvent[] {
  return rows.map((r) => {
    const d = r.effectiveDate.slice(0, 10);
    const name = `${r.employeeFirstName} ${r.employeeLastName}`.trim();
    const dayLabel = formatPtoDays(r.amount);
    const title = name ? `${name} - ${dayLabel}` : dayLabel;
    const endD = dayjs(d).add(1, 'day').format('YYYY-MM-DD');
    return {
      id: `usage-${r.id}`,
      title,
      start: `${d}T00:00:00`,
      end: `${endD}T00:00:00`,
      allDay: true,
      readOnly: true,
      draggable: false,
      resizable: false,
    };
  });
}

/** Locked calendar chrome: 24h, ISO week numbers, show weekends (weekday-only selection in drag bridge); prefs menu hidden via prop + CSS fallback. */
function sanitizeCalendarPreferences(next: Partial<EventCalendarPreferences>): EventCalendarPreferences {
  return {
    ...next,
    ampm: false,
    showWeekends: next.showWeekends ?? true,
    showWeekNumber: next.showWeekNumber ?? true,
    isSidePanelOpen: next.isSidePanelOpen ?? false,
    showEmptyDaysInAgenda: next.showEmptyDaysInAgenda ?? true,
  };
}

const INITIAL_CALENDAR_PREFERENCES = sanitizeCalendarPreferences({
  ampm: false,
  showWeekends: true,
  showWeekNumber: true,
  isSidePanelOpen: false,
  showEmptyDaysInAgenda: true,
});

export type LeaveCalendarTabProps = {
  /** When set, month view supports click / drag on days to open the ledger dialog with those dates prefilled. */
  onSelectDaysForLedger?: (range: { start: Dayjs; endInclusive: Dayjs }) => void;
  /** When both are provided, the parent owns view state (e.g. persisted account settings). */
  calendarView?: 'month' | 'agenda';
  onCalendarViewChange?: (view: 'month' | 'agenda') => void;
};

export function LeaveCalendarTab({
  onSelectDaysForLedger,
  calendarView: controlledView,
  onCalendarViewChange,
}: LeaveCalendarTabProps) {
  const theme = useTheme();
  const { locale } = useLocale();
  const dateLocale = locale === 'cs' ? cs : enUS;
  const calendarMountRef = useRef<HTMLDivElement | null>(null);

  const [uncontrolledView, setUncontrolledView] = useState<'month' | 'agenda'>('month');
  let calendarView: 'month' | 'agenda';
  let setCalendarView: (next: 'month' | 'agenda') => void;
  if (controlledView !== undefined && onCalendarViewChange !== undefined) {
    calendarView = controlledView;
    setCalendarView = onCalendarViewChange;
  } else {
    calendarView = uncontrolledView;
    setCalendarView = setUncontrolledView;
  }
  const [calendarPreferences, setCalendarPreferences] =
    useState<EventCalendarPreferences>(INITIAL_CALENDAR_PREFERENCES);

  const [usageRows, setUsageRows] = useState<PtoLedgerEntryReadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  /** Wide window so built-in month/week navigation finds events without extra API calls. */
  const fetchWindow = useMemo(() => {
    const t = dayjs();
    const from = t.subtract(3, 'month').startOf('month').format('YYYY-MM-DD');
    const to = t.add(9, 'month').endOf('month').format('YYYY-MM-DD');
    return { from, to };
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    queueMicrotask(() => {
      if (ac.signal.aborted) return;
      setLoading(true);
      setLoadError(null);
    });
    void (async () => {
      try {
        const rows = await fetchPtoLedgerUsageInRange(fetchWindow.from, fetchWindow.to, ac.signal);
        if (!ac.signal.aborted) {
          setUsageRows(rows);
        }
      } catch {
        if (!ac.signal.aborted) {
          setLoadError(strings.leave.calendarLoadError);
          setUsageRows([]);
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [fetchWindow.from, fetchWindow.to]);

  const events = useMemo(() => usageRowsToEvents(usageRows), [usageRows]);

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          px: 2,
          pt: 2,
          pb: 2,
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ flexShrink: 0, mb: 1.5 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={(theme) => ({
              fontWeight: 600,
              color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
            })}
          >
            {strings.leave.calendarTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {strings.leave.calendarHint}
          </Typography>
        </Box>

        {loadError ? (
          <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setLoadError(null)}>
            {loadError}
          </Alert>
        ) : null}

        {loading ? <LinearProgress sx={{ mb: 1 }} /> : null}

        <Box
          ref={calendarMountRef}
          sx={(theme) => ({
            flex: 1,
            minHeight: 360,
            position: 'relative',
            '& .MuiEventCalendar-root': {
              minHeight: 360,
            },
            /** Match `MuiDataGrid` cell `focus-within` tint in `enterpriseTheme`. */
            ...(onSelectDaysForLedger
              ? {
                  [`& .${eventCalendarClasses.monthViewCell}.${LEAVE_CALENDAR_MONTH_RANGE_PREVIEW_CLASS}`]: {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                  [`& .${eventCalendarClasses.agendaViewRow}.${LEAVE_CALENDAR_MONTH_RANGE_PREVIEW_CLASS}`]: {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }
              : {}),
          })}
        >
          <EventCalendar
            sx={{
              height: '100%',
              maxHeight: '100%',
              /**
               * Today has no `headerToolbarTodayButton` class (see MUI X `HeaderToolbar` source).
               * Today = contained primary; view switcher = ledger-outlined.
               */
              [`& .${eventCalendarClasses.headerToolbarActions} > .MuiButton-root`]:
                getEventCalendarToolbarTodayButtonSx(theme),
              [`& .${eventCalendarClasses.viewSwitcherButton}`]:
                getEventCalendarToolbarOutlinedButtonSx(theme),
              /** Side panel is empty for our setup (`isSidePanelOpen: false`). Hide the toggle. */
              [`& .${eventCalendarClasses.headerToolbarSidePanelToggle}`]: { display: 'none' },
              /** `p` + class beats default slot `h6` + bold from the scheduler. */
              [`& p.${eventCalendarClasses.headerToolbarLabel}`]: {
                ...theme.typography.subtitle1,
                margin: 0,
                fontWeight: theme.typography.fontWeightMedium,
                color: theme.palette.text.primary,
                lineHeight: 1.43,
              },
              '& .MuiEventCalendar-preferencesMenuButton': { display: 'none' },
            }}
            events={events}
            readOnly
            eventCreation={false}
            areEventsDraggable={false}
            areEventsResizable={false}
            view={calendarView}
            onViewChange={(next) => {
              if (next === 'month' || next === 'agenda') setCalendarView(next);
            }}
            views={['month', 'agenda']}
            dateLocale={dateLocale}
            defaultVisibleDate={new Date()}
            preferences={calendarPreferences}
            onPreferencesChange={(next) => setCalendarPreferences(sanitizeCalendarPreferences(next))}
            preferencesMenuConfig={false}
            eventColor="teal"
            displayTimezone="default"
            localeText={locale === 'cs' ? { today: strings.leave.calendarToday } : undefined}
          >
            {onSelectDaysForLedger ? (
              <LeaveCalendarMonthDragBridge
                containerRef={calendarMountRef}
                onCommitRange={onSelectDaysForLedger}
              />
            ) : null}
          </EventCalendar>
        </Box>
      </Paper>
    </Box>
  );
}

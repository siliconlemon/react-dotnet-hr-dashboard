import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  MenuItem,
  Paper,
  Popover,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { fetchPtoLedgerUsageInRange } from '../../api/ptoLedgerApi';
import type { PtoLedgerEntryReadDto } from '../../api/types';
import { useLocale } from '../../i18n/useLocale';
import { getDepartmentAccent } from '../../theme/employeeCardPalette';
import { formatDateOnly } from '../../utils/formatDate';
import {
  buildEmployeeGroups,
  calendarAwayHeatWash,
  calendarDepartmentTooltip,
  calendarOutsideMonthWash,
  departmentAwaySegments,
  departmentBuckets,
  departmentLookupChipColors,
  formatWeekRangeLabel,
  isoWeekNumber,
  isWeekend,
  rowsForDate,
  rowsForWeekWeekdays,
  weekContainsToday,
  weekendInMonthWash,
  weeksOverlappingMonth,
} from './leaveLookupCalendarModel';

/** Same 13px / compact row scale as PTO ledger filter Autocomplete dropdown options. */
const LEAVE_LOOKUP_MENU_FONT_SIZE = '0.8125rem';
const LEAVE_LOOKUP_MENU_LINE_HEIGHT = 1.5;

export function LeaveLookupTab() {
  const theme = useTheme();
  const { locale, strings } = useLocale();
  const localeTag = locale === 'cs' ? 'cs-CZ' : 'en-US';

  const [visibleMonth, setVisibleMonth] = useState(() => dayjs().startOf('month'));
  /** `week` = Mon–Sun day columns; `month` = one aggregated cell per ISO week row. */
  const [layoutMode, setLayoutMode] = useState<'week' | 'month'>('week');
  const [usageRows, setUsageRows] = useState<PtoLedgerEntryReadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [popover, setPopover] = useState<{
    anchor: HTMLElement;
    rows: PtoLedgerEntryReadDto[];
    title: string;
  } | null>(null);

  /** Include spillover Mon–Sun days so partial weeks show usage for adjacent months. */
  const fetchRange = useMemo(() => {
    const wr = weeksOverlappingMonth(visibleMonth);
    if (wr.length === 0) {
      const start = visibleMonth.startOf('month');
      const end = visibleMonth.endOf('month');
      return { from: start.format('YYYY-MM-DD'), to: end.format('YYYY-MM-DD') };
    }
    const from = wr[0]![0]!.format('YYYY-MM-DD');
    const to = wr[wr.length - 1]![6]!.format('YYYY-MM-DD');
    return { from, to };
  }, [visibleMonth]);

  useEffect(() => {
    const ac = new AbortController();
    queueMicrotask(() => {
      if (ac.signal.aborted) return;
      setLoading(true);
      setLoadError(null);
    });
    void (async () => {
      try {
        const rows = await fetchPtoLedgerUsageInRange(fetchRange.from, fetchRange.to, ac.signal);
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
  }, [fetchRange.from, fetchRange.to, strings.leave.calendarLoadError]);

  const monthTitle = useMemo(() => {
    const d = visibleMonth.toDate();
    return new Intl.DateTimeFormat(localeTag, { month: 'long', year: 'numeric' }).format(d);
  }, [localeTag, visibleMonth]);

  const weekRows = useMemo(() => weeksOverlappingMonth(visibleMonth), [visibleMonth]);

  const weekdayLabels = useMemo(() => {
    const mondayRef = dayjs('2026-01-05');
    return Array.from({ length: 7 }, (_, i) =>
      new Intl.DateTimeFormat(localeTag, { weekday: 'short' }).format(mondayRef.add(i, 'day').toDate()),
    );
  }, [localeTag]);

  const countsByDate = useMemo(() => {
    const distinct = new Map<string, Set<number>>();
    for (const r of usageRows) {
      const key = r.effectiveDate.slice(0, 10);
      let set = distinct.get(key);
      if (!set) {
        set = new Set();
        distinct.set(key, set);
      }
      set.add(r.employeeId);
    }
    const out = new Map<string, number>();
    for (const [k, s] of distinct) out.set(k, s.size);
    return out;
  }, [usageRows]);

  const maxAwayOnGrid = useMemo(() => {
    let m = 0;
    for (const row of weekRows) {
      for (const day of row) {
        if (isWeekend(day)) continue;
        const key = day.format('YYYY-MM-DD');
        m = Math.max(m, countsByDate.get(key) ?? 0);
      }
    }
    return m;
  }, [weekRows, countsByDate]);

  const maxAwayWeekGrid = useMemo(() => {
    let m = 0;
    for (const days of weekRows) {
      const wr = rowsForWeekWeekdays(days, usageRows);
      m = Math.max(m, buildEmployeeGroups(wr).length);
    }
    return m;
  }, [weekRows, usageRows]);

  const closePopover = useCallback(() => setPopover(null), []);

  const formatDayHeading = useCallback(
    (d: Dayjs) =>
      new Intl.DateTimeFormat(localeTag, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(d.toDate()),
    [localeTag],
  );

  const openDayPopover = useCallback(
    (ev: MouseEvent<HTMLElement>, day: Dayjs, dateRows: PtoLedgerEntryReadDto[]) => {
      if (dateRows.length === 0) return;
      setPopover({
        anchor: ev.currentTarget,
        rows: dateRows,
        title: strings.leave.calendarDetailTitle(formatDayHeading(day)),
      });
    },
    [formatDayHeading, strings.leave],
  );

  const openWeekPopover = useCallback(
    (ev: MouseEvent<HTMLElement>, weekMonday: Dayjs, rows: PtoLedgerEntryReadDto[]) => {
      if (rows.length === 0) return;
      setPopover({
        anchor: ev.currentTarget,
        rows,
        title: strings.leave.calendarDetailTitleWeek(formatWeekRangeLabel(weekMonday, localeTag)),
      });
    },
    [localeTag, strings.leave],
  );

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'stretch',
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          boxSizing: 'border-box',
          px: 2,
          pt: 2,
          pb: 2,
        }}
      >
        <Box sx={{ flexShrink: 0, mb: 1.5 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {strings.leave.calendarTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {layoutMode === 'week' ? strings.leave.calendarHintDayGrid : strings.leave.calendarHintWeekGrid}
          </Typography>
        </Box>

        {loadError ? (
          <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setLoadError(null)}>
            {loadError}
          </Alert>
        ) : null}

        {loading ? <LinearProgress sx={{ mb: 1 }} /> : null}

        <Box
          sx={{
            flexShrink: 0,
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={strings.leave.calendarPrevMonthAria}>
              <IconButton
                aria-label={strings.leave.calendarPrevMonthAria}
                size="small"
                onClick={() => setVisibleMonth((m) => m.subtract(1, 'month'))}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, minWidth: 140, textAlign: 'center' }}>
              {monthTitle}
            </Typography>
            <Tooltip title={strings.leave.calendarNextMonthAria}>
              <IconButton
                aria-label={strings.leave.calendarNextMonthAria}
                size="small"
                onClick={() => setVisibleMonth((m) => m.add(1, 'month'))}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            <FormControl
              color="primary"
              variant="outlined"
              size="small"
              sx={{ width: 100, height: 40, maxHeight: 40, flexShrink: 0, boxSizing: 'border-box' }}
            >
              <Select
                color="primary"
                size="small"
                value={layoutMode}
                aria-label={strings.leave.calendarViewToggleAria}
                onChange={(e) => setLayoutMode(e.target.value as 'week' | 'month')}
                MenuProps={{
                  slotProps: {
                    paper: {
                      sx: {
                        minWidth: 140,
                        '& .MuiMenuItem-root': {
                          fontSize: LEAVE_LOOKUP_MENU_FONT_SIZE,
                          lineHeight: LEAVE_LOOKUP_MENU_LINE_HEIGHT,
                          fontWeight: 400,
                          textTransform: 'none',
                          letterSpacing: 'normal',
                          color: theme.palette.text.primary,
                          minHeight: 32,
                          py: theme.spacing(0.5),
                          pl: theme.spacing(2),
                          pr: theme.spacing(2),
                          '&.Mui-selected': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          },
                          '&.Mui-selected:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.12),
                          },
                        },
                      },
                    },
                  },
                }}
                sx={(t) => ({
                  borderRadius: `${Number(t.shape.borderRadius)}px`,
                  boxSizing: 'border-box',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  '& .MuiOutlinedInput-root': {
                    boxSizing: 'border-box',
                    height: 40,
                    maxHeight: 40,
                    minHeight: 40,
                    padding: 0,
                    color: t.palette.primary.main,
                    ...t.typography.button,
                    fontSize: '13px',
                    lineHeight: 1.5,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '2px',
                      borderColor: t.palette.primary.main,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '2px',
                      borderColor: t.palette.primary.dark,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '2px',
                      borderColor: t.palette.primary.main,
                    },
                  },
                  '& .MuiSelect-select': {
                    boxSizing: 'border-box',
                    minHeight: 40,
                    maxHeight: 40,
                    height: 40,
                    py: 0,
                    pl: 1.5,
                    /** Reserve space for the caret so it matches outlined primary buttons visually. */
                    pr: 4,
                    display: 'inline-flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    ...t.typography.button,
                    fontSize: '13px',
                    lineHeight: 1,
                    color: t.palette.primary.main,
                  },
                  '& .MuiSelect-icon': {
                    color: t.palette.primary.main,
                  },
                })}
              >
                <MenuItem value="week">{strings.leave.calendarViewWeek}</MenuItem>
                <MenuItem value="month">{strings.leave.calendarViewMonth}</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={() => setVisibleMonth(dayjs().startOf('month'))}
              sx={(t) => ({
                ...t.typography.button,
                minHeight: 40,
                boxSizing: 'border-box',
                fontSize: '13px',
                lineHeight: 1.5,
                py: 0.75,
                px: 2,
                whiteSpace: 'nowrap',
              })}
            >
              {strings.leave.calendarToday}
            </Button>
          </Box>
        </Box>

        {!loading && usageRows.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {strings.leave.calendarEmptyMonth}
          </Typography>
        ) : null}

        <TableContainer
          sx={{
            width: '100%',
            overflow: 'auto',
            border: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 1,
          }}
        >
          {layoutMode === 'week' ? (
            <Table size="small" stickyHeader sx={{ tableLayout: 'fixed', width: '100%', minWidth: 560 }}>
              <colgroup>
                <col style={{ width: 72 }} />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
              </colgroup>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      bgcolor: 'background.paper',
                      width: 72,
                      maxWidth: 72,
                      position: 'sticky',
                      left: 0,
                      zIndex: 3,
                      boxShadow: (t) => `1px 0 0 ${t.palette.divider}`,
                    }}
                  >
                    {strings.leave.calendarWeekCol}
                  </TableCell>
                  {weekdayLabels.map((label, wi) => (
                    <TableCell key={`wd-${wi}`} align="center" sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {weekRows.map((days) => {
                  const weekMonday = days[0]!;
                  const weekNum = isoWeekNumber(weekMonday);
                  return (
                    <TableRow key={weekMonday.format('YYYY-MM-DD')}>
                      <TableCell
                        sx={{
                          fontWeight: 500,
                          color: 'text.secondary',
                          bgcolor: 'background.paper',
                          position: 'sticky',
                          left: 0,
                          zIndex: 1,
                          boxShadow: (t) => `1px 0 0 ${t.palette.divider}`,
                        }}
                      >
                        <Typography variant="caption" component="span" sx={{ fontWeight: 600 }}>
                          W{weekNum}
                        </Typography>
                      </TableCell>
                      {days.map((day) => {
                        const inMonth =
                          day.month() === visibleMonth.month() && day.year() === visibleMonth.year();
                        const isToday = day.isSame(dayjs(), 'day');
                        const dateKey = day.format('YYYY-MM-DD');
                        const isWeekendDay = isWeekend(day);
                        const dateRows = isWeekendDay ? [] : rowsForDate(usageRows, dateKey);
                        const awayRaw = countsByDate.get(dateKey) ?? 0;
                        const away = isWeekendDay ? 0 : awayRaw;

                        let bgcolor: string = 'transparent';
                        if (!inMonth) {
                          bgcolor = calendarOutsideMonthWash(theme);
                        } else if (isWeekendDay) {
                          bgcolor = weekendInMonthWash(theme);
                        } else if (away > 0 && maxAwayOnGrid > 0) {
                          bgcolor = calendarAwayHeatWash(theme, away / maxAwayOnGrid);
                        }

                        const groups = buildEmployeeGroups(dateRows);
                        const deptSegments = departmentAwaySegments(groups);
                        const tooltipPreview = away === 0 ? '' : calendarDepartmentTooltip(groups);

                        const cellInner = (
                          <Box
                            role={away > 0 ? 'button' : undefined}
                            tabIndex={away > 0 ? 0 : undefined}
                            onClick={(e) => openDayPopover(e, day, dateRows)}
                            onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
                              if ((e.key === 'Enter' || e.key === ' ') && away > 0) {
                                e.preventDefault();
                                openDayPopover(e as unknown as MouseEvent<HTMLElement>, day, dateRows);
                              }
                            }}
                            sx={{
                              minHeight: 36,
                              display: 'flex',
                              flexWrap: away > 0 ? 'wrap' : 'nowrap',
                              alignItems: 'center',
                              alignContent: 'center',
                              justifyContent: 'center',
                              gap: away > 0 ? 0.5 : 0,
                              px: away > 0 ? 0.25 : 0,
                              boxSizing: 'border-box',
                              borderRadius: 1,
                              cursor: away > 0 ? 'pointer' : 'default',
                              bgcolor,
                              color:
                                !inMonth || (isWeekendDay && inMonth)
                                  ? 'text.secondary'
                                  : 'text.primary',
                              outline: 'none',
                              boxShadow: isToday ? `inset 0 0 0 2px ${theme.palette.primary.main}` : undefined,
                              '&:focus-visible': {
                                boxShadow: (t) =>
                                  `${isToday ? `inset 0 0 0 2px ${theme.palette.primary.main}, ` : ''}0 0 0 2px ${t.palette.primary.main}`,
                              },
                            }}
                            aria-label={strings.leave.calendarCellAria(formatDateOnly(dateKey), away, {
                              isToday,
                              outsideSelectedMonth: !inMonth,
                              isWeekend: isWeekendDay,
                            })}
                          >
                            {away > 0 ? (
                              deptSegments.map((seg) => {
                                const accent = getDepartmentAccent(seg.departmentId);
                                return (
                                  <Box
                                    key={seg.departmentId}
                                    sx={{
                                      minWidth: 22,
                                      height: 22,
                                      px: 0.375,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderRadius: 0.75,
                                      ...departmentLookupChipColors(theme, accent),
                                      fontSize: '0.75rem',
                                      fontWeight: theme.typography.fontWeightMedium,
                                      lineHeight: 1,
                                      boxSizing: 'border-box',
                                    }}
                                  >
                                    {seg.count}
                                  </Box>
                                );
                              })
                            ) : isWeekendDay && inMonth ? (
                              <Typography variant="caption" component="span" color="text.disabled" sx={{ fontWeight: 500 }}>
                                —
                              </Typography>
                            ) : (
                              <Typography variant="body2" component="span" sx={{ fontWeight: 400 }}>
                                {'\u00a0'}
                              </Typography>
                            )}
                          </Box>
                        );

                        return (
                          <TableCell
                            key={dateKey}
                            align="center"
                            sx={{
                              verticalAlign: 'middle',
                              px: 0.75,
                              py: 0.5,
                              borderBottom: (t) => `1px solid ${t.palette.divider}`,
                            }}
                          >
                            {away > 0 ? (
                              <Tooltip title={tooltipPreview} enterDelay={400} placement="top">
                                <span>{cellInner}</span>
                              </Tooltip>
                            ) : (
                              cellInner
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Table size="small" stickyHeader sx={{ tableLayout: 'fixed', width: '100%', minWidth: 320 }}>
              <colgroup>
                <col style={{ width: 72 }} />
                <col />
              </colgroup>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      bgcolor: 'background.paper',
                      width: 72,
                      maxWidth: 72,
                      position: 'sticky',
                      left: 0,
                      zIndex: 3,
                      boxShadow: (t) => `1px 0 0 ${t.palette.divider}`,
                    }}
                  >
                    {strings.leave.calendarWeekCol}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                    {strings.leave.calendarWeekSummaryCol}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weekRows.map((days) => {
                  const weekMonday = days[0]!;
                  const weekNum = isoWeekNumber(weekMonday);
                  const rowsW = rowsForWeekWeekdays(days, usageRows);
                  const groupsW = buildEmployeeGroups(rowsW);
                  const awayW = groupsW.length;
                  const deptSegmentsW = departmentAwaySegments(groupsW);
                  const weekRangeLabel = formatWeekRangeLabel(weekMonday, localeTag);
                  const containsToday = weekContainsToday(weekMonday);

                  let bgcolorW: string = 'transparent';
                  if (awayW > 0 && maxAwayWeekGrid > 0) {
                    bgcolorW = calendarAwayHeatWash(theme, awayW / maxAwayWeekGrid);
                  }

                  const tooltipWeek = awayW > 0 ? calendarDepartmentTooltip(groupsW) : '';

                  const cellWeekInner = (
                    <Box
                      role={awayW > 0 ? 'button' : undefined}
                      tabIndex={awayW > 0 ? 0 : undefined}
                      onClick={(e) => openWeekPopover(e, weekMonday, rowsW)}
                      onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
                        if ((e.key === 'Enter' || e.key === ' ') && awayW > 0) {
                          e.preventDefault();
                          openWeekPopover(e as unknown as MouseEvent<HTMLElement>, weekMonday, rowsW);
                        }
                      }}
                      sx={{
                        minHeight: 36,
                        display: 'flex',
                        flexWrap: awayW > 0 ? 'wrap' : 'nowrap',
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'center',
                        gap: awayW > 0 ? 0.5 : 0,
                        px: awayW > 0 ? 0.25 : 0,
                        boxSizing: 'border-box',
                        borderRadius: 1,
                        cursor: awayW > 0 ? 'pointer' : 'default',
                        bgcolor: bgcolorW,
                        color: 'text.primary',
                        outline: 'none',
                        boxShadow: containsToday ? `inset 0 0 0 2px ${theme.palette.primary.main}` : undefined,
                        '&:focus-visible': {
                          boxShadow: (t) =>
                            `${containsToday ? `inset 0 0 0 2px ${theme.palette.primary.main}, ` : ''}0 0 0 2px ${t.palette.primary.main}`,
                        },
                      }}
                      aria-label={strings.leave.calendarWeekCellAria(weekRangeLabel, awayW, {
                        weekContainsToday: containsToday,
                      })}
                    >
                      {awayW > 0 ? (
                        deptSegmentsW.map((seg) => {
                          const accent = getDepartmentAccent(seg.departmentId);
                          return (
                            <Box
                              key={seg.departmentId}
                              sx={{
                                minWidth: 22,
                                height: 22,
                                px: 0.375,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 0.75,
                                ...departmentLookupChipColors(theme, accent),
                                fontSize: '0.75rem',
                                fontWeight: theme.typography.fontWeightMedium,
                                lineHeight: 1,
                                boxSizing: 'border-box',
                              }}
                            >
                              {seg.count}
                            </Box>
                          );
                        })
                      ) : (
                        <Typography variant="body2" component="span" sx={{ fontWeight: 400 }}>
                          {'\u00a0'}
                        </Typography>
                      )}
                    </Box>
                  );

                  return (
                    <TableRow key={`wk-sum-${weekMonday.format('YYYY-MM-DD')}`}>
                      <TableCell
                        sx={{
                          fontWeight: 500,
                          color: 'text.secondary',
                          bgcolor: 'background.paper',
                          position: 'sticky',
                          left: 0,
                          zIndex: 1,
                          boxShadow: (t) => `1px 0 0 ${t.palette.divider}`,
                        }}
                      >
                        <Typography variant="caption" component="span" sx={{ fontWeight: 600 }}>
                          W{weekNum}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          verticalAlign: 'middle',
                          px: 0.75,
                          py: 0.5,
                          borderBottom: (t) => `1px solid ${t.palette.divider}`,
                        }}
                      >
                        {awayW > 0 ? (
                          <Tooltip title={tooltipWeek} enterDelay={400} placement="top">
                            <span>{cellWeekInner}</span>
                          </Tooltip>
                        ) : (
                          cellWeekInner
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>

      <Popover
        open={Boolean(popover)}
        anchorEl={popover?.anchor}
        onClose={closePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              maxWidth: 400,
              maxHeight: 360,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {popover ? (
          <>
            <Box sx={{ px: 2, pt: 1.25, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                {popover.title}
              </Typography>
            </Box>
            <Box sx={{ overflow: 'auto', px: 1, py: 0.5 }}>
              {[...departmentBuckets(buildEmployeeGroups(popover.rows)).entries()].map(([dept, people]) => (
                <Box key={dept} sx={{ mb: 1, mt: 1.025 }}>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ px: 1, letterSpacing: 0.06, display: 'block', lineHeight: 1.2, mb: 0.25 }}
                  >
                    {dept}
                  </Typography>
                  <List dense disablePadding>
                    {people.map((p) => {
                      const amountLabel = p.ledgerRows
                        .map((r) => strings.leave.calendarPopoverPtoAmountLabel(r.amount))
                        .join(' + ');
                      return (
                        <ListItem key={p.employeeId} dense disableGutters sx={{ px: 1, py: 0.125, minHeight: 0 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1,
                              width: '100%',
                              minWidth: 0,
                            }}
                          >
                            <Typography
                              variant="body2"
                              component="span"
                              sx={{
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {p.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              component="span"
                              color="text.secondary"
                              sx={{
                                flexShrink: 0,
                                fontVariantNumeric: 'tabular-nums',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {amountLabel}
                            </Typography>
                          </Box>
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              ))}
            </Box>
          </>
        ) : null}
      </Popover>
    </Box>
  );
}

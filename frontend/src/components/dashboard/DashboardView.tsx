import { Alert, Box, Card, CardContent, Grid, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { ViewLoadingGate } from '../layout/ViewLoadingGate';
import { fetchDepartmentPtoMatrix } from '../../api/departmentsApi';
import type { DepartmentPtoMatrixResponseDto } from '../../api/types';
import { strings } from '../../i18n';
import { formatDateOnly } from '../../utils/formatDate';
import { formatPtoDays } from '../../utils/formatPto';
import { accentAmbientHalo } from '../../theme/enterpriseTheme';
import {
  buildWorkforceKpis,
  HIGH_BALANCE_THRESHOLD_DAYS,
  LOW_BALANCE_THRESHOLD_DAYS,
  type WorkforceKpis,
} from './workforceKpisFromMatrix';

function formatMean(n: number | null): string {
  if (n === null) return '-';
  return formatPtoDays(n);
}

/** Card section labels: match app section tone (semibold body, not all-caps caption). */
const cardTitleSx = {
  fontWeight: 600,
  color: 'text.secondary',
  fontSize: '0.8125rem',
  lineHeight: 1.35,
} as const;

/** Align popper to the **start** (left) of the anchor; open above (`top-start`). MUI may flip if there is no room. */
const dashboardFieldTooltipProps = {
  placement: 'top-start' as const,
  slotProps: {
    tooltip: {
      sx: {
        maxWidth: 320,
        textAlign: 'left',
      },
    },
  },
};

type KpiCardProps = {
  title: string;
  primary: string;
  secondary?: string;
  /** When non-empty, hovering the primary value lists these names in a tooltip. */
  tooltipNames?: readonly string[];
};

function KpiCard({ title, primary, secondary, tooltipNames }: KpiCardProps) {
  const namesForTip = tooltipNames ?? [];
  const showNameTooltip = namesForTip.length > 0;

  const primaryEl = (
    <Typography
      variant="h5"
      component={showNameTooltip ? 'span' : 'p'}
      sx={{
        fontWeight: 600,
        lineHeight: 1.2,
        m: 0,
        ...(showNameTooltip ? { cursor: 'help' } : {}),
      }}
    >
      {primary}
    </Typography>
  );

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          pt: 1.5,
          pb: 2,
          '&:last-child': { pb: 2 },
        }}
      >
        <Typography component="div" sx={cardTitleSx}>
          {title}
        </Typography>
        {showNameTooltip ? (
          <Tooltip
            {...dashboardFieldTooltipProps}
            title={
              <Typography
                variant="body2"
                component="div"
                sx={{ whiteSpace: 'pre-line', textAlign: 'left' }}
              >
                {namesForTip.join('\n')}
              </Typography>
            }
          >
            {primaryEl}
          </Tooltip>
        ) : (
          primaryEl
        )}
        {secondary ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {secondary}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SpotlightCard({
  title,
  primaryName,
  tiedNames,
  valueLabel,
  accent,
}: {
  title: string;
  primaryName: string;
  tiedNames: readonly string[];
  valueLabel: string;
  accent: 'high' | 'low';
}) {
  const theme = useTheme();
  const accentMain =
    accent === 'high' ? theme.palette.primary.main : theme.palette.warning.main;
  const bg = alpha(accentMain, accent === 'high' ? 0.06 : 0.09);

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: alpha(accentMain, 0.45),
        boxShadow: accentAmbientHalo(theme, accentMain),
        bgcolor: bg,
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          pt: 1.5,
          pb: 2,
          '&:last-child': { pb: 2 },
        }}
      >
        <Typography component="div" sx={cardTitleSx}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 0.75, rowGap: 0.25 }}>
          <Typography variant="subtitle1" component="span" sx={{ fontWeight: 700 }}>
            {primaryName}
          </Typography>
          {tiedNames.length > 1 ? (
            <Tooltip
              {...dashboardFieldTooltipProps}
              title={
                <Typography
                  variant="body2"
                  component="div"
                  sx={{ whiteSpace: 'pre-line', textAlign: 'left' }}
                >
                  {tiedNames.join('\n')}
                </Typography>
              }
            >
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 600, cursor: 'help' }}
              >
                {strings.dashboard.spotlightTieMore(tiedNames.length - 1)}
              </Typography>
            </Tooltip>
          ) : null}
        </Box>
        <Typography variant="h5" component="p" sx={{ fontWeight: 600, m: 0 }}>
          {valueLabel}
        </Typography>
      </CardContent>
    </Card>
  );
}

function DepartmentBreakdownCard({ kpis }: { kpis: WorkforceKpis }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          pt: 1.5,
          pb: 2,
          '&:last-child': { pb: 2 },
        }}
      >
        <Typography component="div" sx={{ ...cardTitleSx, mb: 1 }}>
          {strings.dashboard.cardDeptBreakdown}
        </Typography>
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            maxHeight: { xs: 200, sm: 240 },
            pr: 0.5,
          }}
        >
          {kpis.departmentsByHeadcount.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {strings.dashboard.emptyWorkforce}
            </Typography>
          ) : (
            kpis.departmentsByHeadcount.map((row) => (
              <Box
                key={row.name}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 2,
                  py: 0.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Typography variant="body2" noWrap sx={{ minWidth: 0 }}>
                  {row.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, flexShrink: 0 }}>
                  {row.count}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

/**
 * Workforce digest: KPI tiles derived from `GET /api/departments/pto-matrix` (client-side aggregates).
 */
export function DashboardView() {
  const [matrix, setMatrix] = useState<DepartmentPtoMatrixResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetchDepartmentPtoMatrix(undefined, ac.signal)
      .then((data) => {
        setError(null);
        setMatrix(data);
      })
      .catch(() => {
        if (!ac.signal.aborted) {
          setError(strings.dashboard.loadError);
        }
      });
    return () => ac.abort();
  }, []);

  const kpis = useMemo(() => (matrix ? buildWorkforceKpis(matrix) : null), [matrix]);

  const asOfLabel =
    kpis != null
      ? strings.dashboard.subtitle(kpis.calendarYear, formatDateOnly(kpis.asOfDate))
      : '';

  const fetching = matrix === null && !error;

  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        minHeight: 0,
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        my: 1,
        overflow: 'hidden',
      }}
    >
        <CardContent
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            py: 2,
            '&:last-child': { pb: 2 },
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <Typography variant="h2" gutterBottom={!!kpis} sx={{ flexShrink: 0 }}>
              {strings.dashboard.title}
            </Typography>
            {kpis ? (
              <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                {asOfLabel}
              </Typography>
            ) : null}
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              flexShrink: 0,
              minWidth: 0,
              flex: 1,
              minHeight: 0,
            }}
          >
          <ViewLoadingGate rawPending={fetching}>
            {error ? (
              <Alert severity="error" sx={{ flexShrink: 0 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            ) : null}

            {!error && kpis ? (
          <Grid container spacing={2} sx={{ flexShrink: 0 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <KpiCard
                title={strings.dashboard.cardHeadcount}
                primary={String(kpis.totalEmployees)}
                secondary={
                  kpis.departmentCount === 1
                    ? strings.dashboard.deptCountOne
                    : strings.dashboard.deptCountMany(kpis.departmentCount)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <KpiCard
                title={strings.dashboard.cardMeanAvailable}
                primary={formatMean(kpis.meanAvailableDays)}
                secondary={strings.dashboard.cardMeanHint}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <KpiCard
                title={strings.dashboard.cardMeanAccrued}
                primary={formatMean(kpis.meanAccruedDays)}
                secondary={strings.dashboard.cardMeanHint}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <KpiCard
                title={strings.dashboard.cardMeanUsed}
                primary={formatMean(kpis.meanUsedDays)}
                secondary={strings.dashboard.cardMeanHint}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <KpiCard
                title={strings.dashboard.cardHighBalance}
                primary={String(kpis.aboveHighThresholdCount)}
                secondary={strings.dashboard.cardHighBalanceHint(HIGH_BALANCE_THRESHOLD_DAYS)}
                tooltipNames={
                  kpis.aboveHighThresholdCount > 0 ? kpis.aboveHighThresholdNames : undefined
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <KpiCard
                title={strings.dashboard.cardLowBalance}
                primary={String(kpis.belowThresholdCount)}
                secondary={strings.dashboard.cardLowBalanceHint(LOW_BALANCE_THRESHOLD_DAYS)}
                tooltipNames={
                  kpis.belowThresholdCount > 0 ? kpis.belowThresholdNames : undefined
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {kpis.highestAvailable ? (
                <SpotlightCard
                  title={strings.dashboard.spotlightHighest}
                  primaryName={kpis.highestAvailable.primaryName}
                  tiedNames={kpis.highestAvailable.tiedNames}
                  valueLabel={strings.dashboard.spotlightAvailable(formatPtoDays(kpis.highestAvailable.availableDays))}
                  accent="high"
                />
              ) : (
                <KpiCard title={strings.dashboard.spotlightHighest} primary="-" secondary={strings.dashboard.emptyWorkforce} />
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {kpis.lowestAvailable ? (
                <SpotlightCard
                  title={strings.dashboard.spotlightLowest}
                  primaryName={kpis.lowestAvailable.primaryName}
                  tiedNames={kpis.lowestAvailable.tiedNames}
                  valueLabel={strings.dashboard.spotlightAvailable(formatPtoDays(kpis.lowestAvailable.availableDays))}
                  accent="low"
                />
              ) : (
                <KpiCard title={strings.dashboard.spotlightLowest} primary="-" secondary={strings.dashboard.emptyWorkforce} />
              )}
            </Grid>
            <Grid size={{ xs: 12 }}>
              <DepartmentBreakdownCard kpis={kpis} />
            </Grid>
          </Grid>
            ) : null}
          </ViewLoadingGate>
          </Box>
        </CardContent>
    </Card>
  );
}

import { Alert, Box, Paper, Skeleton, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { EmployeeReadDto, PtoBalanceDto } from '../../api/types';
import { strings } from '../../i18n';
import { getEmployeeCardAccent } from '../../theme/employeeCardPalette';
import { formatPtoDays } from '../../utils/formatPto';

function formatDateOnly(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

const detailGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '72px 1fr' },
  columnGap: { xs: 0.5, sm: 0.5 },
  rowGap: 0.75,
  alignItems: 'baseline',
} as const;

const ptoGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '88px 1fr' },
  columnGap: { xs: 0.75, sm: 1.25 },
  rowGap: 0.75,
  alignItems: 'baseline',
} as const;

type DetailTab = 'profile' | 'pto';

export type EmployeeDetailCardsProps = {
  employees: EmployeeReadDto[];
  detailTab: DetailTab;
  ptoByEmployeeId: Partial<Record<number, PtoBalanceDto>>;
  ptoErrorByEmployeeId: Partial<Record<number, boolean>>;
  /** When on PTO tab, hide real cards until balances have finished loading (avoids layout jump). */
  ptoLoading?: boolean;
};

const cardsGridBaseSx = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(auto-fill, minmax(300px, 1fr))',
  },
  gap: 2,
  alignContent: 'start',
} as const;

const cardsGridSx = (theme: Theme) => ({
  ...cardsGridBaseSx,
  width: '100%',
  maxWidth: theme.spacing(125),
});

function EmployeeDetailCardsSkeleton({ count }: { count: number }) {
  return (
    <Box sx={cardsGridSx} aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <Paper
          key={i}
          variant="outlined"
          sx={{
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 212,
          }}
        >
          <Box sx={{ px: 1.75, py: 0.75, bgcolor: 'action.hover' }}>
            <Skeleton variant="text" animation="wave" sx={{ fontSize: '1.25rem', width: '72%' }} />
          </Box>
          <Box sx={{ px: 1.75, pt: 1.25, pb: 1.85, flex: 1 }}>
            <Skeleton variant="text" animation="wave" sx={{ mb: 0.5 }} />
            <Skeleton variant="text" animation="wave" sx={{ mb: 0.5 }} />
            <Skeleton variant="text" animation="wave" sx={{ mb: 0.5, width: '92%' }} />
            <Skeleton variant="text" animation="wave" sx={{ mb: 0.5 }} />
            <Skeleton variant="text" animation="wave" sx={{ mb: 0.5, width: '88%' }} />
            <Skeleton variant="text" animation="wave" sx={{ width: '70%' }} />
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

/**
 * Responsive grid of employee summary cards; profile and PTO share layout patterns and labels.
 */
export function EmployeeDetailCards({
  employees,
  detailTab,
  ptoByEmployeeId,
  ptoErrorByEmployeeId,
  ptoLoading = false,
}: EmployeeDetailCardsProps) {
  if (detailTab === 'pto' && ptoLoading && employees.length > 0) {
    return <EmployeeDetailCardsSkeleton count={employees.length} />;
  }

  return (
    <Box sx={cardsGridSx}>
      {employees.map((row) => {
        const accent = getEmployeeCardAccent(row.id);
        const fullName = `${row.firstName} ${row.lastName}`.trim();
        const pto = ptoByEmployeeId[row.id];
        const ptoErr = ptoErrorByEmployeeId[row.id];

        return (
          <Paper
            key={row.id}
            variant="outlined"
            sx={{
              borderLeftWidth: 4,
              borderLeftStyle: 'solid',
              borderLeftColor: accent.border,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                px: 1.75,
                py: 0.75,
                bgcolor: accent.headerBg,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: accent.nameColor }}>
                {fullName}
              </Typography>
            </Box>
            <Box sx={{ px: 1.75, pt: 1.25, pb: 1.75, flex: 1, minHeight: 0 }}>
              {detailTab === 'profile' && (
                <Box sx={detailGridSx}>
                  <Typography variant="caption" color="text.secondary">
                    {strings.employees.fieldName}
                  </Typography>
                  <Typography variant="body2">
                    {row.firstName} {row.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {strings.employees.fieldEmail}
                  </Typography>
                  <Typography variant="body2">{row.email}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {strings.employees.fieldJobTitle}
                  </Typography>
                  <Typography variant="body2">{row.jobTitle}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {strings.employees.fieldDepartment}
                  </Typography>
                  <Typography variant="body2">{row.departmentName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {strings.employees.fieldHireDate}
                  </Typography>
                  <Typography variant="body2">{formatDateOnly(row.hireDate)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {strings.employees.fieldIds}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {strings.employees.idLinePrefix}
                    {row.id}
                    {strings.employees.idLineMid}
                    {row.departmentId}
                  </Typography>
                </Box>
              )}
              {detailTab === 'pto' && (
                <Box>
                  {ptoErr && (
                    <Alert severity="error" sx={{ mb: 1 }}>
                      {strings.employees.ptoError}
                    </Alert>
                  )}
                  {!ptoErr && pto && (
                    <Box sx={ptoGridSx}>
                      <Typography variant="caption" color="text.secondary">
                        {strings.employees.ptoYear}
                      </Typography>
                      <Typography variant="body2">{pto.calendarYear}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {strings.employees.ptoAsOf}
                      </Typography>
                      <Typography variant="body2">{formatDateOnly(pto.asOfDate)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {strings.employees.ptoAnnual}
                      </Typography>
                      <Typography variant="body2">{formatPtoDays(pto.annualEntitlementDays)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {strings.employees.ptoAccrued}
                      </Typography>
                      <Typography variant="body2">{formatPtoDays(pto.accruedDays)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {strings.employees.ptoUsed}
                      </Typography>
                      <Typography variant="body2">{formatPtoDays(pto.usedDays)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {strings.employees.ptoPending}
                      </Typography>
                      <Typography variant="body2">{formatPtoDays(pto.pendingDays)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {strings.employees.ptoAvailable}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatPtoDays(pto.availableDays)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}

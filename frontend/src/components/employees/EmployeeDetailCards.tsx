import { Alert, Box, Paper, Skeleton, Typography, useTheme } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';
import { Fragment, type ReactNode } from 'react';
import type { EmployeeReadDto, PtoBalanceDto } from '../../api/types';
import { strings } from '../../i18n';
import { accentAmbientHalo } from '../../theme/enterpriseTheme';
import { getDepartmentAccent } from '../../theme/employeeCardPalette';
import { formatDateOnly } from '../../utils/formatDate';
import { formatPtoDays } from '../../utils/formatPto';
import {
  DEFAULT_EMPLOYEE_DETAIL_FIELD_VISIBILITY,
  type EmployeeProfileFieldId,
  type EmployeePtoFieldId,
} from './employeeDetailFields';

const detailGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '72px 1fr' },
  columnGap: { xs: 0.5, sm: 0.5 },
  rowGap: 0.75,
  alignItems: 'baseline',
} as const;

const ptoGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'minmax(120px, auto) 1fr' },
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
  profileFieldVisibility?: Record<EmployeeProfileFieldId, boolean>;
  ptoFieldVisibility?: Record<EmployeePtoFieldId, boolean>;
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

function ProfileFieldsGrid({
  row,
  visibility,
}: {
  row: EmployeeReadDto;
  visibility: Record<EmployeeProfileFieldId, boolean>;
}) {
  const rows: {
    id: EmployeeProfileFieldId;
    label: string;
    value: ReactNode;
    valueColor?: 'text.secondary' | 'text.primary';
  }[] = [
    { id: 'email', label: strings.employees.fieldEmail, value: row.email },
    { id: 'jobTitle', label: strings.employees.fieldJobTitle, value: row.jobTitle },
    { id: 'department', label: strings.employees.fieldDepartment, value: row.departmentName },
    {
      id: 'hireDate',
      label: strings.employees.fieldHireDate,
      value: formatDateOnly(row.hireDate),
    },
  ];

  const visible = rows.filter((r) => visibility[r.id]);

  return (
    <Box sx={detailGridSx}>
      {visible.map((r) => (
        <Fragment key={r.id}>
          <Typography variant="caption" color="text.secondary">
            {r.label}
          </Typography>
          <Typography variant="body2" color={r.valueColor ?? 'text.primary'}>
            {r.value}
          </Typography>
        </Fragment>
      ))}
    </Box>
  );
}

function PtoFieldsGrid({
  pto,
  visibility,
}: {
  pto: PtoBalanceDto;
  visibility: Record<EmployeePtoFieldId, boolean>;
}) {
  const rows: {
    id: EmployeePtoFieldId;
    label: string;
    value: ReactNode;
    valueSx?: SxProps<Theme>;
  }[] = [
    {
      id: 'calendarYear',
      label: strings.employees.ptoYear,
      value: pto.calendarYear,
    },
    {
      id: 'asOf',
      label: strings.employees.ptoAsOf,
      value: formatDateOnly(pto.asOfDate),
    },
    {
      id: 'annualEntitlement',
      label: strings.employees.ptoAnnual,
      value: formatPtoDays(pto.annualEntitlementDays),
    },
    {
      id: 'accrued',
      label: strings.employees.ptoAccrued,
      value: formatPtoDays(pto.accruedDays),
    },
    {
      id: 'used',
      label: strings.employees.ptoUsed,
      value: formatPtoDays(pto.usedDays),
    },
    {
      id: 'pending',
      label: strings.employees.ptoPending,
      value: formatPtoDays(pto.pendingDays),
    },
    {
      id: 'available',
      label: strings.employees.ptoAvailable,
      value: formatPtoDays(pto.availableDays),
      valueSx: { fontWeight: 600 },
    },
  ];

  const visible = rows.filter((r) => visibility[r.id]);

  return (
    <Box sx={ptoGridSx}>
      {visible.map((r) => (
        <Fragment key={r.id}>
          <Typography variant="caption" color="text.secondary">
            {r.label}
          </Typography>
          <Typography variant="body2" sx={r.valueSx}>
            {r.value}
          </Typography>
        </Fragment>
      ))}
    </Box>
  );
}

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
  profileFieldVisibility = DEFAULT_EMPLOYEE_DETAIL_FIELD_VISIBILITY.profile,
  ptoFieldVisibility = DEFAULT_EMPLOYEE_DETAIL_FIELD_VISIBILITY.pto,
}: EmployeeDetailCardsProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (detailTab === 'pto' && ptoLoading && employees.length > 0) {
    return <EmployeeDetailCardsSkeleton count={employees.length} />;
  }

  return (
    <Box sx={cardsGridSx}>
      {employees.map((row) => {
        const accent = getDepartmentAccent(row.departmentId);
        const headerBg = isDark ? accent.nameColor : accent.headerBg;
        const nameColor = isDark ? accent.headerBg : accent.nameColor;
        const fullName = `${row.firstName} ${row.lastName}`.trim();
        const pto = ptoByEmployeeId[row.id];
        const ptoErr = ptoErrorByEmployeeId[row.id];

        return (
          <Paper
            key={row.id}
            variant="outlined"
            sx={{
              borderWidth: 2,
              borderStyle: 'solid',
              borderColor: alpha(accent.border, isDark ? 0.62 : 0.48),
              boxShadow: accentAmbientHalo(theme, accent.border),
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
                bgcolor: headerBg,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: nameColor }}>
                {fullName}
              </Typography>
            </Box>
            <Box sx={{ px: 1.75, pt: 1.25, pb: 1.75, flex: 1, minHeight: 0 }}>
              {detailTab === 'profile' && (
                <ProfileFieldsGrid
                  row={row}
                  visibility={profileFieldVisibility}
                />
              )}
              {detailTab === 'pto' && (
                <Box>
                  {ptoErr && (
                    <Alert severity="error" sx={{ mb: 1 }}>
                      {strings.employees.ptoError}
                    </Alert>
                  )}
                  {!ptoErr && pto && (
                    <PtoFieldsGrid pto={pto} visibility={ptoFieldVisibility} />
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

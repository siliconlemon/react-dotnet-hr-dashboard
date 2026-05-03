import { Box, Tab, Tabs } from '@mui/material';
import type { GridPaginationModel } from '@mui/x-data-grid';
import { shellUnderBarTabsSx } from '../layout/shellViewChrome';
import dayjs, { type Dayjs } from 'dayjs';
import { startTransition, useCallback, useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { fetchDepartments } from '../../api/departmentsApi';
import { fetchEmployees } from '../../api/employeesApi';
import { createPtoLedgerEntries, fetchPtoLedgerPage } from '../../api/ptoLedgerApi';
import type {
  DepartmentReadDto,
  EmployeeReadDto,
  PtoLedgerCreateDto,
  PtoLedgerEntryReadDto,
  PtoLedgerEntryTypeDto,
} from '../../api/types';
import { useLocale } from '../../i18n/useLocale';
import type { LeaveManagementViewTab } from '../../navigation/viewTabs';
import { LeaveLedgerCreateDialog } from './LeaveLedgerCreateDialog.tsx';
import { LeaveLedgerPanel } from './LeaveLedgerPanel.tsx';
import { LeaveLookupTab } from './LeaveLookupTab.tsx';

type LeaveManagementViewProps = {
  viewTab: LeaveManagementViewTab;
  onViewTabChange: (tab: LeaveManagementViewTab) => void;
};

export function LeaveManagementView({ viewTab, onViewTabChange }: LeaveManagementViewProps) {
  const { strings } = useLocale();
  const [employees, setEmployees] = useState<EmployeeReadDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentReadDto[]>([]);
  const [loadMetaError, setLoadMetaError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const [rows, setRows] = useState<PtoLedgerEntryReadDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [gridLoading, setGridLoading] = useState(true);
  const [gridError, setGridError] = useState<string | null>(null);

  const [filterEmployeeId, setFilterEmployeeId] = useState<number | ''>('');
  const [filterDepartmentId, setFilterDepartmentId] = useState<number | ''>('');
  const [filterFrom, setFilterFrom] = useState<Dayjs | null>(null);
  const [filterTo, setFilterTo] = useState<Dayjs | null>(null);
  const [filterEntryType, setFilterEntryType] = useState<PtoLedgerEntryTypeDto | ''>('');

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogScope, setDialogScope] = useState<'employee' | 'department'>('employee');
  const [dialogEmployeeId, setDialogEmployeeId] = useState<number | ''>('');
  const [dialogDepartmentId, setDialogDepartmentId] = useState<number | ''>('');
  const [dialogEntryType, setDialogEntryType] = useState<PtoLedgerEntryTypeDto>('accrual');
  const [dialogAmount, setDialogAmount] = useState('');
  const [dialogEffective, setDialogEffective] = useState<Dayjs | null>(dayjs());
  const [dialogNote, setDialogNote] = useState('');
  const [dialogSubmitting, setDialogSubmitting] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const ledgerLoadBannerError = loadMetaError ?? gridError;

  const handleViewTabChange = useCallback(
    (_: SyntheticEvent, value: LeaveManagementViewTab) => {
      onViewTabChange(value);
    },
    [onViewTabChange],
  );

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      setLoadMetaError(null);
      try {
        const [emps, depts] = await Promise.all([
          fetchEmployees(ac.signal),
          fetchDepartments(ac.signal),
        ]);
        setEmployees(emps);
        setDepartments(depts);
      } catch {
        if (!ac.signal.aborted) setLoadMetaError(strings.leave.loadError);
      }
    })();
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch roster once on mount (locale does not affect API payload)
  }, []);

  const reloadLedger = useCallback(async () => {
    void refreshToken;
    setGridLoading(true);
    setGridError(null);
    try {
      const page = await fetchPtoLedgerPage({
        employeeId: filterEmployeeId === '' ? undefined : Number(filterEmployeeId),
        departmentId: filterDepartmentId === '' ? undefined : Number(filterDepartmentId),
        fromDate: filterFrom ? filterFrom.format('YYYY-MM-DD') : undefined,
        toDate: filterTo ? filterTo.format('YYYY-MM-DD') : undefined,
        entryType: filterEntryType || undefined,
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
      });
      setRows(page.items);
      setTotalCount(page.totalCount);
    } catch {
      setGridError(strings.leave.loadError);
      setRows([]);
      setTotalCount(0);
    } finally {
      setGridLoading(false);
    }
  }, [
    filterDepartmentId,
    filterEmployeeId,
    filterEntryType,
    filterFrom,
    filterTo,
    paginationModel.page,
    paginationModel.pageSize,
    refreshToken,
    strings.leave.loadError,
  ]);

  useEffect(() => {
    startTransition(() => {
      void reloadLedger();
    });
  }, [reloadLedger]);

  const deptMemberCount = useMemo(() => {
    if (dialogDepartmentId === '') return 0;
    const did = Number(dialogDepartmentId);
    return employees.filter((e) => e.departmentId === did).length;
  }, [dialogDepartmentId, employees]);

  const clearFilters = useCallback(() => {
    setFilterEmployeeId('');
    setFilterDepartmentId('');
    setFilterFrom(null);
    setFilterTo(null);
    setFilterEntryType('');
    setPaginationModel((m) => ({ ...m, page: 0 }));
  }, []);

  const openDialog = () => {
    setDialogError(null);
    setDialogScope('employee');
    setDialogEmployeeId('');
    setDialogDepartmentId('');
    setDialogEntryType('accrual');
    setDialogAmount('');
    setDialogEffective(dayjs());
    setDialogNote('');
    setDialogOpen(true);
  };

  const validateDialog = (): string | null => {
    if (dialogScope === 'employee' && dialogEmployeeId === '') {
      return strings.leave.validationEmployee;
    }
    if (dialogScope === 'department' && dialogDepartmentId === '') {
      return strings.leave.validationDepartment;
    }
    const n = Number(dialogAmount);
    if (!Number.isFinite(n)) {
      return strings.leave.validationAmountRange;
    }
    if (Math.abs(n) > 999.99) {
      return strings.leave.validationAmountRange;
    }
    if (dialogEntryType === 'accrual' && n <= 0) return strings.leave.validationAmountAccrual;
    if (dialogEntryType === 'usage' && n <= 0) return strings.leave.validationAmountUsage;
    if (dialogEntryType === 'adjustment' && n === 0) return strings.leave.validationAmountAdjustment;
    return null;
  };

  const submitDialog = async () => {
    const v = validateDialog();
    if (v) {
      setDialogError(v);
      return;
    }
    if (!dialogEffective) {
      setDialogError(strings.onboard.required);
      return;
    }

    setDialogSubmitting(true);
    setDialogError(null);
    try {
      const amount = Number(dialogAmount);
      const body: PtoLedgerCreateDto = {
        scope: dialogScope,
        entryType: dialogEntryType,
        amount,
        effectiveDate: dialogEffective.format('YYYY-MM-DD'),
      };
      const trimmed = dialogNote.trim();
      if (trimmed) body.note = trimmed;
      if (dialogScope === 'employee') body.employeeId = Number(dialogEmployeeId);
      else body.departmentId = Number(dialogDepartmentId);

      await createPtoLedgerEntries(body);
      setDialogOpen(false);
      setPaginationModel((m) => ({ ...m, page: 0 }));
      setRefreshToken((x) => x + 1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      setDialogError(msg || strings.leave.createFailed);
    } finally {
      setDialogSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 0,
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Tabs value={viewTab} onChange={handleViewTabChange} sx={shellUnderBarTabsSx}>
        <Tab value="ledger" label={strings.leave.tabLedger} />
        <Tab value="lookup" label={strings.leave.tabLookup} />
      </Tabs>

      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          aria-hidden={viewTab !== 'ledger'}
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            opacity: viewTab === 'ledger' ? 1 : 0,
            visibility: viewTab === 'ledger' ? 'visible' : 'hidden',
            pointerEvents: viewTab === 'ledger' ? 'auto' : 'none',
            zIndex: viewTab === 'ledger' ? 1 : 0,
            transition: (theme) =>
              theme.transitions.create(['opacity', 'visibility'], { duration: 120 }),
          }}
        >
          <LeaveLedgerPanel
            employees={employees}
            departments={departments}
            ledgerLoadBannerError={ledgerLoadBannerError}
            rows={rows}
            totalCount={totalCount}
            gridLoading={gridLoading}
            filterEmployeeId={filterEmployeeId}
            setFilterEmployeeId={setFilterEmployeeId}
            filterDepartmentId={filterDepartmentId}
            setFilterDepartmentId={setFilterDepartmentId}
            filterFrom={filterFrom}
            setFilterFrom={setFilterFrom}
            filterTo={filterTo}
            setFilterTo={setFilterTo}
            filterEntryType={filterEntryType}
            setFilterEntryType={setFilterEntryType}
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
            onClearFilters={clearFilters}
            onOpenCreateDialog={openDialog}
          />
        </Box>
        <Box
          aria-hidden={viewTab !== 'lookup'}
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            overflowX: 'hidden',
            overflowY: 'auto',
            opacity: viewTab === 'lookup' ? 1 : 0,
            visibility: viewTab === 'lookup' ? 'visible' : 'hidden',
            pointerEvents: viewTab === 'lookup' ? 'auto' : 'none',
            zIndex: viewTab === 'lookup' ? 1 : 0,
            transition: (theme) =>
              theme.transitions.create(['opacity', 'visibility'], { duration: 120 }),
          }}
        >
          <LeaveLookupTab />
        </Box>
      </Box>

      <LeaveLedgerCreateDialog
        open={dialogOpen}
        submitting={dialogSubmitting}
        error={dialogError}
        onDismissError={() => setDialogError(null)}
        onClose={() => setDialogOpen(false)}
        onSubmit={submitDialog}
        employees={employees}
        departments={departments}
        scope={dialogScope}
        onScopeChange={setDialogScope}
        employeeId={dialogEmployeeId}
        onEmployeeIdChange={setDialogEmployeeId}
        departmentId={dialogDepartmentId}
        onDepartmentIdChange={setDialogDepartmentId}
        entryType={dialogEntryType}
        onEntryTypeChange={setDialogEntryType}
        amount={dialogAmount}
        onAmountChange={setDialogAmount}
        effective={dialogEffective}
        onEffectiveChange={setDialogEffective}
        note={dialogNote}
        onNoteChange={setDialogNote}
        deptMemberCount={deptMemberCount}
      />
    </Box>
  );
}

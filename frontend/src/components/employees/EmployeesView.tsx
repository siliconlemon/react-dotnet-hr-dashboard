import { Alert, Box, Paper, Tab, Tabs, Typography } from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridRowSelectionModel,
} from '@mui/x-data-grid';
import { useCallback, useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { fetchEmployees, fetchPtoBalance } from '../../api/employeesApi';
import type { EmployeeReadDto, PtoBalanceDto } from '../../api/types';
import { strings } from '../../i18n';

function formatDateOnly(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

function formatDays(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

type DetailTab = 'profile' | 'pto';

/**
 * Employee directory: sortable/paginated grid plus tabbed detail (profile + PTO).
 */
export function EmployeesView() {
  const [rows, setRows] = useState<EmployeeReadDto[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  });
  const [detailTab, setDetailTab] = useState<DetailTab>('profile');
  const [pto, setPto] = useState<PtoBalanceDto | null>(null);
  const [ptoError, setPtoError] = useState<string | null>(null);
  const [ptoLoading, setPtoLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      await Promise.resolve();
      try {
        const data = await fetchEmployees(ac.signal);
        setRows(data);
        setLoadError(null);
      } catch (e: unknown) {
        if ((e as Error).name === 'AbortError') return;
        setLoadError(strings.employees.listError);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const selectedId = useMemo(() => {
    const first = selectionModel.ids.values().next().value;
    return first !== undefined && first !== null ? Number(first) : null;
  }, [selectionModel]);

  const selectedRow = useMemo(
    () => (selectedId === null ? null : rows.find((r) => r.id === selectedId) ?? null),
    [rows, selectedId],
  );

  useEffect(() => {
    if (detailTab !== 'pto' || selectedId === null) return;
    const ac = new AbortController();
    void (async () => {
      await Promise.resolve();
      try {
        setPtoLoading(true);
        setPtoError(null);
        const data = await fetchPtoBalance(selectedId, ac.signal);
        setPto(data);
      } catch (e: unknown) {
        if ((e as Error).name === 'AbortError') return;
        setPtoError(strings.employees.ptoError);
        setPto(null);
      } finally {
        setPtoLoading(false);
      }
    })();
    return () => ac.abort();
  }, [detailTab, selectedId]);

  const handleDetailTabChange = useCallback(
    (_: SyntheticEvent, value: DetailTab) => {
      setDetailTab(value);
      if (value !== 'pto') {
        setPto(null);
        setPtoError(null);
        setPtoLoading(false);
      }
    },
    [],
  );

  const onSelectionChange = useCallback((model: GridRowSelectionModel) => {
    setSelectionModel(model);
    setPto(null);
    setPtoError(null);
  }, []);

  const columns: GridColDef<EmployeeReadDto>[] = useMemo(
    () => [
      {
        field: 'fullName',
        headerName: strings.employees.colName,
        flex: 1,
        minWidth: 160,
        sortable: true,
        valueGetter: (_v, row) => `${row.firstName} ${row.lastName}`.trim(),
      },
      {
        field: 'email',
        headerName: strings.employees.colEmail,
        flex: 1.2,
        minWidth: 200,
      },
      {
        field: 'jobTitle',
        headerName: strings.employees.colJobTitle,
        flex: 1,
        minWidth: 120,
      },
      {
        field: 'departmentName',
        headerName: strings.employees.colDepartment,
        flex: 0.9,
        minWidth: 130,
      },
      {
        field: 'hireDate',
        headerName: strings.employees.colHireDate,
        width: 130,
        valueFormatter: (value: string) => formatDateOnly(value),
      },
    ],
    [],
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: 'calc(100vh - 96px)',
        minHeight: 420,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Paper
        sx={{
          p: 2,
          flex: '1 1 50%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        variant="outlined"
      >
        <Typography variant="h2" gutterBottom>
          {strings.employees.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {strings.employees.subtitle}
        </Typography>
        {loadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loadError}
          </Alert>
        )}
        <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id}
            density="compact"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              sorting: { sortModel: [{ field: 'fullName', sort: 'asc' }] },
            }}
            checkboxSelection
            disableMultipleRowSelection
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={onSelectionChange}
            sx={{
              border: 'none',
              height: '100%',
              '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover' },
            }}
          />
        </Box>
      </Paper>

      <Paper
        sx={{
          p: 2,
          flex: '1 1 50%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        variant="outlined"
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, flexShrink: 0 }}>
          {strings.employees.detailTitle}
        </Typography>
        {selectedRow === null ? (
          <Typography variant="body2" color="text.secondary">
            {strings.employees.selectPrompt}
          </Typography>
        ) : (
          <>
            <Tabs
              value={detailTab}
              onChange={handleDetailTabChange}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, flexShrink: 0 }}
            >
              <Tab value="profile" label={strings.employees.tabProfile} />
              <Tab value="pto" label={strings.employees.tabPto} />
            </Tabs>
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
            {detailTab === 'profile' && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '140px 1fr' },
                  gap: { xs: 0.5, sm: 1 },
                  rowGap: 1,
                  alignItems: 'baseline',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {strings.employees.fieldName}
                </Typography>
                <Typography variant="body2">
                  {selectedRow.firstName} {selectedRow.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {strings.employees.fieldEmail}
                </Typography>
                <Typography variant="body2">{selectedRow.email}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {strings.employees.fieldJobTitle}
                </Typography>
                <Typography variant="body2">{selectedRow.jobTitle}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {strings.employees.fieldDepartment}
                </Typography>
                <Typography variant="body2">{selectedRow.departmentName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {strings.employees.fieldHireDate}
                </Typography>
                <Typography variant="body2">{formatDateOnly(selectedRow.hireDate)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {strings.employees.fieldIds}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {strings.employees.idLinePrefix}
                  {selectedRow.id}
                  {strings.employees.idLineMid}
                  {selectedRow.departmentId}
                </Typography>
              </Box>
            )}
            {detailTab === 'pto' && (
              <Box>
                {ptoLoading && (
                  <Typography variant="body2" color="text.secondary">
                    {strings.employees.ptoLoading}
                  </Typography>
                )}
                {ptoError && (
                  <Alert severity="error" sx={{ mb: 1 }}>
                    {ptoError}
                  </Alert>
                )}
                {!ptoLoading && pto && (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' },
                      gap: 1,
                      rowGap: 1,
                      alignItems: 'baseline',
                    }}
                  >
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
                    <Typography variant="body2">{formatDays(pto.annualEntitlementDays)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {strings.employees.ptoAccrued}
                    </Typography>
                    <Typography variant="body2">{formatDays(pto.accruedDays)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {strings.employees.ptoUsed}
                    </Typography>
                    <Typography variant="body2">{formatDays(pto.usedDays)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {strings.employees.ptoPending}
                    </Typography>
                    <Typography variant="body2">{formatDays(pto.pendingDays)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {strings.employees.ptoAvailable}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatDays(pto.availableDays)}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}

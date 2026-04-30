import { Alert, Box, Paper, Tab, Tabs, Typography } from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridRowSelectionModel,
} from '@mui/x-data-grid';
import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { fetchEmployees, fetchPtoBalance } from '../../api/employeesApi';
import type { EmployeeReadDto, PtoBalanceDto } from '../../api/types';
import { strings } from '../../i18n';
import { formatDateOnly } from '../../utils/formatDate';
import { EmployeeDetailCards } from './EmployeeDetailCards';
import { EmployeeEditForm } from './EmployeeEditForm';
import { EmployeeRemovePane } from './EmployeeRemovePane';
import { OnboardingForm } from './OnboardingForm';

type DetailTab = 'profile' | 'pto';

type EmployeesViewTab = 'directory' | 'onboard' | 'edit' | 'remove';

const SPLIT_MIN = 0.2;
const SPLIT_MAX = 0.78;
const SPLIT_DEFAULT = 0.48;

/**
 * Employees area: directory (grid + profile/PTO), onboard, edit, or remove.
 */
export function EmployeesView() {
  const [viewTab, setViewTab] = useState<EmployeesViewTab>('directory');
  const [rows, setRows] = useState<EmployeeReadDto[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  });
  const [detailTab, setDetailTab] = useState<DetailTab>('profile');
  const [ptoByEmployeeId, setPtoByEmployeeId] = useState<Partial<Record<number, PtoBalanceDto>>>({});
  const [ptoErrorByEmployeeId, setPtoErrorByEmployeeId] = useState<Partial<Record<number, boolean>>>(
    {},
  );
  const [ptoLoading, setPtoLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [splitFraction, setSplitFraction] = useState(SPLIT_DEFAULT);
  const [splitDragging, setSplitDragging] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);

  const reloadEmployees = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchEmployees(signal);
      setRows(data);
    } catch (e: unknown) {
      if ((e as Error).name === 'AbortError') return;
      setLoadError(strings.employees.listError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      await Promise.resolve();
      await reloadEmployees(ac.signal);
    })();
    return () => ac.abort();
  }, [reloadEmployees]);

  const handleEmployeeCreated = useCallback(
    (created: EmployeeReadDto) => {
      void (async () => {
        await reloadEmployees();
        setViewTab('directory');
        setSelectionModel({ type: 'include', ids: new Set([created.id]) });
      })();
    },
    [reloadEmployees],
  );

  const handleEmployeeUpdated = useCallback(() => {
    void (async () => {
      await reloadEmployees();
    })();
  }, [reloadEmployees]);

  const handleEmployeeRemoved = useCallback(
    (removedId: number) => {
      void (async () => {
        await reloadEmployees();
        setSelectionModel((prev) => {
          const nextIds = new Set(prev.ids);
          nextIds.delete(removedId);
          return { type: 'include' as const, ids: nextIds };
        });
      })();
    },
    [reloadEmployees],
  );

  const selectedIdsSorted = useMemo(() => {
    const arr = Array.from(selectionModel.ids, (id) => Number(id)).filter(
      (n) => !Number.isNaN(n),
    );
    arr.sort((a, b) => a - b);
    return arr;
  }, [selectionModel]);

  const preferredSingleEmployeeId =
    selectedIdsSorted.length === 1 ? selectedIdsSorted[0]! : null;

  const selectedKey = selectedIdsSorted.join(',');

  const selectedRows = useMemo(
    () => selectedIdsSorted.map((id) => rows.find((r) => r.id === id)).filter(Boolean) as EmployeeReadDto[],
    [rows, selectedIdsSorted],
  );

  useEffect(() => {
    if (detailTab !== 'pto') {
      return;
    }
    const ac = new AbortController();
    const ids = selectedIdsSorted;

    void (async () => {
      await Promise.resolve();
      if (ac.signal.aborted) return;

      if (ids.length === 0) {
        setPtoByEmployeeId({});
        setPtoErrorByEmployeeId({});
        setPtoLoading(false);
        return;
      }

      setPtoLoading(true);
      setPtoErrorByEmployeeId({});
      setPtoByEmployeeId({});

      const next: Partial<Record<number, PtoBalanceDto>> = {};
      const errs: Partial<Record<number, boolean>> = {};
      await Promise.all(
        ids.map(async (id) => {
          try {
            const p = await fetchPtoBalance(id, ac.signal);
            next[id] = p;
          } catch (e: unknown) {
            if ((e as Error).name === 'AbortError') return;
            errs[id] = true;
          }
        }),
      );
      if (ac.signal.aborted) return;
      setPtoByEmployeeId(next);
      setPtoErrorByEmployeeId(errs);
      setPtoLoading(false);
    })();

    return () => ac.abort();
  }, [detailTab, selectedKey, selectedIdsSorted]);

  const handleDetailTabChange = useCallback(
    (_: SyntheticEvent, value: DetailTab) => {
      setDetailTab(value);
      if (value !== 'pto') {
        setPtoByEmployeeId({});
        setPtoErrorByEmployeeId({});
        setPtoLoading(false);
      }
    },
    [],
  );

  const handleViewTabChange = useCallback((_: SyntheticEvent, value: EmployeesViewTab) => {
    setViewTab(value);
  }, []);

  const onSelectionChange = useCallback((model: GridRowSelectionModel) => {
    setSelectionModel(model);
  }, []);

  useEffect(() => {
    if (!splitDragging) return;
    const onMove = (e: PointerEvent) => {
      const el = splitContainerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const h = rect.height;
      if (h <= 0) return;
      const y = e.clientY - rect.top;
      const f = y / h;
      setSplitFraction(Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, f)));
    };
    const onUp = () => setSplitDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [splitDragging]);

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
        minWidth: 0,
        flex: 1,
        minHeight: 0,
        height: 'calc(100vh - 96px)',
        overflow: 'hidden',
      }}
    >
      <Tabs
        value={viewTab}
        onChange={handleViewTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Tab value="directory" label={strings.employees.tabDirectory} />
        <Tab value="onboard" label={strings.employees.tabOnboard} />
        <Tab value="edit" label={strings.employees.tabEdit} />
        <Tab value="remove" label={strings.employees.tabRemove} />
      </Tabs>

      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          aria-hidden={viewTab !== 'directory'}
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            opacity: viewTab === 'directory' ? 1 : 0,
            visibility: viewTab === 'directory' ? 'visible' : 'hidden',
            pointerEvents: viewTab === 'directory' ? 'auto' : 'none',
            zIndex: viewTab === 'directory' ? 1 : 0,
            transition: (theme) =>
              theme.transitions.create(['opacity', 'visibility'], { duration: 120 }),
          }}
        >
          <Box
            ref={splitContainerRef}
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: '100%',
                maxWidth: (theme) => theme.spacing(125),
                alignSelf: 'flex-start',
                boxSizing: 'border-box',
              }}
            >
            <Paper
              sx={{
                flex: '0 0 auto',
                height: `${splitFraction * 100}%`,
                minHeight: 140,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: '100%',
                boxSizing: 'border-box',
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
                  rowSelectionModel={selectionModel}
                  onRowSelectionModelChange={onSelectionChange}
                  sx={{
                    border: 'none',
                    height: '100%',
                    '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover' },
                    '& .MuiDataGrid-footerContainer': {
                      minHeight: 47,
                      height: 47,
                      maxHeight: 47,
                      alignItems: 'center',
                      pt: 1.5,
                      pb: 0,
                      px: 0.5,
                      boxSizing: 'border-box',
                    },
                    '& .MuiDataGrid-footerContainer .MuiTablePagination-root': { py: 0, minHeight: 35 },
                    '& .MuiDataGrid-footerContainer .MuiTablePagination-toolbar': {
                      minHeight: 35,
                      height: 35,
                      alignItems: 'center',
                      py: 0,
                    },
                  }}
                />
              </Box>
            </Paper>

            <Box
              role="separator"
              aria-orientation="horizontal"
              aria-valuemin={Math.round(SPLIT_MIN * 100)}
              aria-valuemax={Math.round(SPLIT_MAX * 100)}
              aria-valuenow={Math.round(splitFraction * 100)}
              onPointerDown={(e) => {
                e.preventDefault();
                setSplitDragging(true);
              }}
              sx={{
                flexShrink: 0,
                py: 1,
                px: 1,
                display: 'flex',
                alignItems: 'center',
                cursor: 'row-resize',
                touchAction: 'none',
                userSelect: 'none',
                bgcolor: 'transparent',
                '&:hover .EmployeesView-splitterLine': {
                  opacity: 1,
                },
                ...(splitDragging && {
                  '& .EmployeesView-splitterLine': { opacity: 1 },
                }),
              }}
            >
              <Box
                className="EmployeesView-splitterLine"
                sx={(theme) => ({
                  height: '1px',
                  width: '100%',
                  bgcolor: theme.palette.divider,
                  opacity: 0,
                  transition: theme.transitions.create('opacity', { duration: 100 }),
                })}
              />
            </Box>

            <Paper
              sx={{
                flex: 1,
                minHeight: 0,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: '100%',
                boxSizing: 'border-box',
              }}
              variant="outlined"
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, flexShrink: 0 }}>
                {strings.employees.detailTitle}
              </Typography>
              {selectedRows.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {strings.employees.selectPrompt}
                </Typography>
              ) : (
                <>
                  <Tabs
                    value={detailTab}
                    onChange={handleDetailTabChange}
                    sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                      mb: 2,
                      flexShrink: 0,
                    }}
                  >
                    <Tab value="profile" label={strings.employees.tabProfile} />
                    <Tab value="pto" label={strings.employees.tabPto} />
                  </Tabs>
                  <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
                    <EmployeeDetailCards
                      employees={selectedRows}
                      detailTab={detailTab}
                      ptoByEmployeeId={ptoByEmployeeId}
                      ptoErrorByEmployeeId={ptoErrorByEmployeeId}
                      ptoLoading={detailTab === 'pto' && ptoLoading}
                    />
                  </Box>
                </>
              )}
            </Paper>
            </Box>
          </Box>
        </Box>

        <Box
          aria-hidden={viewTab !== 'onboard'}
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            opacity: viewTab === 'onboard' ? 1 : 0,
            visibility: viewTab === 'onboard' ? 'visible' : 'hidden',
            pointerEvents: viewTab === 'onboard' ? 'auto' : 'none',
            zIndex: viewTab === 'onboard' ? 1 : 0,
            transition: (theme) =>
              theme.transitions.create(['opacity', 'visibility'], { duration: 120 }),
          }}
        >
          <OnboardingForm onCreated={handleEmployeeCreated} />
        </Box>

        <Box
          aria-hidden={viewTab !== 'edit'}
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            opacity: viewTab === 'edit' ? 1 : 0,
            visibility: viewTab === 'edit' ? 'visible' : 'hidden',
            pointerEvents: viewTab === 'edit' ? 'auto' : 'none',
            zIndex: viewTab === 'edit' ? 1 : 0,
            transition: (theme) =>
              theme.transitions.create(['opacity', 'visibility'], { duration: 120 }),
          }}
        >
          <EmployeeEditForm
            employees={rows}
            preferredEmployeeId={preferredSingleEmployeeId}
            onUpdated={handleEmployeeUpdated}
          />
        </Box>

        <Box
          aria-hidden={viewTab !== 'remove'}
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            opacity: viewTab === 'remove' ? 1 : 0,
            visibility: viewTab === 'remove' ? 'visible' : 'hidden',
            pointerEvents: viewTab === 'remove' ? 'auto' : 'none',
            zIndex: viewTab === 'remove' ? 1 : 0,
            transition: (theme) =>
              theme.transitions.create(['opacity', 'visibility'], { duration: 120 }),
          }}
        >
          <EmployeeRemovePane
            employees={rows}
            preferredEmployeeId={preferredSingleEmployeeId}
            onRemoved={handleEmployeeRemoved}
          />
        </Box>
      </Box>
    </Box>
  );
}

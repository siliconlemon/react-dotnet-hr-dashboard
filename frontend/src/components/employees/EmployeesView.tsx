import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Alert, Box, IconButton, Paper, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridFilterItem,
  type GridFilterModel,
  type GridPaginationModel,
  type GridRowSelectionModel,
} from '@mui/x-data-grid';
import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { fetchEmployees, fetchPtoBalance } from '../../api/employeesApi';
import type { EmployeeReadDto, PtoBalanceDto } from '../../api/types';
import { strings } from '../../i18n';
import { useDataGridLocaleText } from '../../i18n/useDataGridLocaleText';
import { formatDateOnly } from '../../utils/formatDate';
import { EmployeeDetailCards } from './EmployeeDetailCards';
import { EmployeeDetailFieldsPicker } from './EmployeeDetailFieldsPicker';
import { useEmployeeDetailFieldVisibility } from './useEmployeeDetailFieldVisibility';
import { EmployeeEditForm } from './EmployeeEditForm';
import { EmployeeRemoveForm } from './EmployeeRemoveForm';
import { OnboardingForm } from './OnboardingForm';

type DetailTab = 'profile' | 'pto';

export type EmployeesViewTab = 'directory' | 'onboard' | 'edit' | 'remove';

type EmployeesViewProps = {
  /** Fires when the top-level area tab changes (and once on mount). */
  onViewTabChange?: (tab: EmployeesViewTab) => void;
};

/** Resolves MUI Data Grid row ids (include / exclude selection semantics). */
function effectiveSelectedRowIds(
  rows: EmployeeReadDto[],
  model: GridRowSelectionModel,
): number[] {
  const rowIds = rows.map((r) => r.id);
  if (model.type === 'exclude') {
    const excluded = new Set(
      Array.from(model.ids, (id) => Number(id)).filter((n) => !Number.isNaN(n)),
    );
    return rowIds.filter((id) => !excluded.has(id));
  }
  return Array.from(model.ids, (id) => Number(id)).filter((n) => !Number.isNaN(n));
}

const NAME_COLUMN_FIELD = 'fullName';

function hasActiveQuickFilter(model: GridFilterModel): boolean {
  const vals = model.quickFilterValues;
  if (!vals?.length) return false;
  return vals.some((v) => String(v ?? '').trim().length > 0);
}

function isActiveColumnFilterItem(item: GridFilterItem): boolean {
  if (!item.field) return false;
  const op = item.operator;
  if (op === 'isEmpty' || op === 'isNotEmpty') return true;
  const v = item.value;
  if (v == null) return false;
  if (typeof v === 'string' && v.trim() === '') return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
}

function activeColumnFilterFields(model: GridFilterModel): Set<string> {
  const set = new Set<string>();
  for (const item of model.items ?? []) {
    if (isActiveColumnFilterItem(item)) set.add(item.field);
  }
  return set;
}

/** Name is never hideable; while quick filter is on, no column may be hidden; column filters lock their fields. */
function employeeColumnHideable(
  field: string,
  hasQuickFilter: boolean,
  filteredFields: Set<string>,
): boolean {
  if (field === NAME_COLUMN_FIELD) return false;
  if (hasQuickFilter) return false;
  if (filteredFields.has(field)) return false;
  return true;
}

const SPLIT_MIN = 0.2;
const SPLIT_MAX = 0.78;
const SPLIT_DEFAULT = 0.48;

/** Directory detail panel: full overlay, split view, or one-line bar. */
type DetailPanelTier = 'expanded' | 'normal' | 'collapsed';

const DETAIL_COLLAPSED_PX = 48;

/** Matches split gutter: splitter `py: 1` + 1px line + `py: 1` ≈ 17px at default spacing. */
const DETAIL_PANEL_COLLAPSED_TOP_GAP = 2.125;

const detailPanelHeaderRowSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  flexShrink: 0,
  pl: 2.75,
  pr: 2.25,
  py: 1,
  borderBottom: 1,
  borderColor: 'divider' as const,
};

const detailPanelTitleTypographySx = {
  fontWeight: 600,
  fontSize: '20px',
  lineHeight: 1.2,
  minWidth: 0,
};

/**
 * Employees area: directory (grid + profile/PTO), onboard, edit, or remove.
 */
export function EmployeesView({ onViewTabChange }: EmployeesViewProps) {
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
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [splitFraction, setSplitFraction] = useState(SPLIT_DEFAULT);
  const [splitDragging, setSplitDragging] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const [detailPanelTier, setDetailPanelTier] = useState<DetailPanelTier>('normal');
  const {
    visibility: detailFieldVisibility,
    setProfileVisibility,
    setPtoVisibility,
    resetProfile: resetDetailProfileFields,
    resetPto: resetDetailPtoFields,
  } = useEmployeeDetailFieldVisibility();

  const dataGridLocaleText = useDataGridLocaleText();

  const reloadEmployees = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchEmployees(signal);
      setRows(data);
      return data;
    } catch (e: unknown) {
      if ((e as Error).name === 'AbortError') return undefined;
      setLoadError(strings.employees.listError);
      return undefined;
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

  useEffect(() => {
    onViewTabChange?.(viewTab);
  }, [viewTab, onViewTabChange]);

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
        const data = await reloadEmployees();
        if (!data) return;
        setSelectionModel((prev) => {
          const effective = effectiveSelectedRowIds(data, prev).filter((id) => id !== removedId);
          return { type: 'include' as const, ids: new Set(effective) };
        });
      })();
    },
    [reloadEmployees],
  );

  const selectedIdsSorted = useMemo(() => {
    const arr = effectiveSelectedRowIds(rows, selectionModel);
    arr.sort((a, b) => a - b);
    return arr;
  }, [rows, selectionModel]);

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

  const moveDetailPanelUp = useCallback(() => {
    setDetailPanelTier((t) => (t === 'collapsed' ? 'normal' : t === 'normal' ? 'expanded' : t));
  }, []);

  const moveDetailPanelDown = useCallback(() => {
    setDetailPanelTier((t) => (t === 'expanded' ? 'normal' : t === 'normal' ? 'collapsed' : t));
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

  const hasQuickFilter = useMemo(() => hasActiveQuickFilter(filterModel), [filterModel]);
  const columnFilterFields = useMemo(
    () => activeColumnFilterFields(filterModel),
    [filterModel],
  );

  const columns: GridColDef<EmployeeReadDto>[] = useMemo(
    () => [
      {
        field: 'fullName',
        headerName: strings.employees.colName,
        flex: 1,
        minWidth: 160,
        sortable: true,
        hideable: false,
        valueGetter: (_v, row) => `${row.firstName} ${row.lastName}`.trim(),
      },
      {
        field: 'email',
        headerName: strings.employees.colEmail,
        flex: 1.2,
        minWidth: 200,
        hideable: employeeColumnHideable('email', hasQuickFilter, columnFilterFields),
      },
      {
        field: 'jobTitle',
        headerName: strings.employees.colJobTitle,
        flex: 1,
        minWidth: 120,
        hideable: employeeColumnHideable('jobTitle', hasQuickFilter, columnFilterFields),
      },
      {
        field: 'departmentName',
        headerName: strings.employees.colDepartment,
        flex: 0.9,
        minWidth: 130,
        hideable: employeeColumnHideable('departmentName', hasQuickFilter, columnFilterFields),
      },
      {
        field: 'hireDate',
        headerName: strings.employees.colHireDate,
        width: 130,
        valueFormatter: (value: string) => formatDateOnly(value),
        hideable: employeeColumnHideable('hireDate', hasQuickFilter, columnFilterFields),
      },
    ],
    [columnFilterFields, hasQuickFilter],
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
                position: 'relative',
                flex: 1,
                minHeight: 0,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: '100%',
                maxWidth: (theme) =>
                  detailPanelTier === 'expanded' ? 'none' : theme.spacing(125),
                alignSelf: detailPanelTier === 'expanded' ? 'stretch' : 'flex-start',
                boxSizing: 'border-box',
              }}
            >
            <Paper
              sx={{
                flex:
                  detailPanelTier === 'normal' ? '0 0 auto' : '1 1 auto',
                ...(detailPanelTier === 'normal'
                  ? { height: `${splitFraction * 100}%` }
                  : {}),
                minHeight: 140,
                px: 2,
                pb: 0,
                pt: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: '100%',
                boxSizing: 'border-box',
                opacity: detailPanelTier === 'expanded' ? 0 : 1,
                pointerEvents: detailPanelTier === 'expanded' ? 'none' : 'auto',
                transition: (theme) => theme.transitions.create('opacity', { duration: 160 }),
              }}
              variant="outlined"
            >
              {loadError && (
                <Alert severity="error" sx={{ mt: 2, mb: 0 }}>
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
                  localeText={dataGridLocaleText}
                  label={strings.employees.title}
                  showToolbar
                  filterModel={filterModel}
                  onFilterModelChange={setFilterModel}
                  slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                      showHistoryControls: false,
                      csvOptions: { disableToolbarButton: true },
                      printOptions: { disableToolbarButton: true },
                      quickFilterProps: {
                        debounceMs: 200,
                        slotProps: {
                          root: {
                            placeholder: strings.employees.quickFilterPlaceholder,
                            size: 'small',
                          },
                        },
                      },
                    },
                  }}
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
                    '& .MuiDataGrid-toolbarContainer': { px: 0, py: 1 },
                    '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover' },
                    '& .MuiDataGrid-footerContainer': {
                      minHeight: 47,
                      height: 47,
                      maxHeight: 47,
                      alignItems: 'center',
                      py: 0,
                      pl: 0.5,
                      pr: 0,
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

            {detailPanelTier === 'normal' && (
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
                  /** Page backdrop so `Paper` halo does not tint the gutter; drag strip stays visually neutral. */
                  bgcolor: 'background.default',
                  boxShadow: 'none',
                  filter: 'none',
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
            )}

            <Paper
              sx={{
                ...(detailPanelTier === 'expanded'
                  ? {
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                      zIndex: 2,
                      flex: 'none',
                      maxWidth: 'none',
                    }
                  : detailPanelTier === 'collapsed'
                    ? {
                        flex: '0 0 auto',
                        height: DETAIL_COLLAPSED_PX,
                        minHeight: DETAIL_COLLAPSED_PX,
                        mt: DETAIL_PANEL_COLLAPSED_TOP_GAP,
                      }
                    : {
                        flex: 1,
                        minHeight: 0,
                      }),
                p: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: '100%',
                boxSizing: 'border-box',
                mb: 1,
              }}
              variant="outlined"
            >
              {detailPanelTier === 'collapsed' ? (
                <Box sx={{ ...detailPanelHeaderRowSx, height: DETAIL_COLLAPSED_PX, boxSizing: 'border-box' }}>
                  <Typography
                    variant="subtitle1"
                    component="h2"
                    sx={detailPanelTitleTypographySx}
                  >
                    {strings.employees.detailTitle}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <Tooltip title={strings.employees.detailPanelRestoreSplit}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={moveDetailPanelUp}
                          aria-label={strings.employees.detailPanelRestoreSplit}
                        >
                          <KeyboardArrowUp />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={strings.employees.detailPanelMinimize}>
                      <span>
                        <IconButton
                          size="small"
                          disabled
                          aria-label={strings.employees.detailPanelMinimize}
                        >
                          <KeyboardArrowDown />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
              ) : (
                <>
                  <Box sx={detailPanelHeaderRowSx}>
                    <Typography variant="subtitle1" component="h2" sx={detailPanelTitleTypographySx}>
                      {strings.employees.detailTitle}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <Tooltip
                      title={
                        detailPanelTier === 'expanded'
                          ? strings.employees.detailPanelAlreadyFull
                          : strings.employees.detailPanelFullHeight
                      }
                    >
                      <span>
                        <IconButton
                          size="small"
                          onClick={moveDetailPanelUp}
                          disabled={detailPanelTier === 'expanded'}
                          aria-label={
                            detailPanelTier === 'expanded'
                              ? strings.employees.detailPanelAlreadyFull
                              : strings.employees.detailPanelFullHeight
                          }
                        >
                          <KeyboardArrowUp />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip
                      title={
                        detailPanelTier === 'expanded'
                          ? strings.employees.detailPanelSplitWithTable
                          : strings.employees.detailPanelMinimize
                      }
                    >
                      <span>
                        <IconButton
                          size="small"
                          onClick={moveDetailPanelDown}
                          aria-label={
                            detailPanelTier === 'expanded'
                              ? strings.employees.detailPanelSplitWithTable
                              : strings.employees.detailPanelMinimize
                          }
                        >
                          <KeyboardArrowDown />
                        </IconButton>
                      </span>
                    </Tooltip>
                    </Box>
                  </Box>
                  {selectedRows.length === 0 ? (
                    <Box sx={{ px: 3, py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {strings.employees.selectPrompt}
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          borderBottom: 1,
                          borderColor: 'divider',
                          mb: 1,
                          flexShrink: 0,
                        }}
                      >
                        <Tabs
                          value={detailTab}
                          onChange={handleDetailTabChange}
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            px: 1,
                            borderBottom: 0,
                            marginBlockEnd: 0,
                          }}
                        >
                          <Tab value="profile" label={strings.employees.tabProfile} />
                          <Tab value="pto" label={strings.employees.tabPto} />
                        </Tabs>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            alignSelf: 'stretch',
                            width: 48,
                            pr: 1,
                          }}
                        >
                          <EmployeeDetailFieldsPicker
                            detailTab={detailTab}
                            profileVisibility={detailFieldVisibility.profile}
                            ptoVisibility={detailFieldVisibility.pto}
                            onProfileVisibilityChange={setProfileVisibility}
                            onPtoVisibilityChange={setPtoVisibility}
                            onResetProfile={resetDetailProfileFields}
                            onResetPto={resetDetailPtoFields}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pl: 2, pr: 2, pb: 2 }}>
                        <EmployeeDetailCards
                          employees={selectedRows}
                          detailTab={detailTab}
                          ptoByEmployeeId={ptoByEmployeeId}
                          ptoErrorByEmployeeId={ptoErrorByEmployeeId}
                          ptoLoading={detailTab === 'pto' && ptoLoading}
                          profileFieldVisibility={detailFieldVisibility.profile}
                          ptoFieldVisibility={detailFieldVisibility.pto}
                        />
                      </Box>
                    </>
                  )}
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
          <EmployeeEditForm employees={rows} onUpdated={handleEmployeeUpdated} />
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
          <EmployeeRemoveForm employees={rows} onRemoved={handleEmployeeRemoved} />
        </Box>
      </Box>
    </Box>
  );
}

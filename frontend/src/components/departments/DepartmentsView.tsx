import { ChevronRight, ExpandMore, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Alert, Box, IconButton, Paper, TextField, Typography } from '@mui/material';
import TablePaginationActions from '@mui/material/TablePaginationActions';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridRenderCellParams,
  useGridApiContext,
} from '@mui/x-data-grid';
import type { MouseEvent } from 'react';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { fetchDepartmentPtoMatrix } from '../../api/departmentsApi';
import type { DepartmentPtoMatrixResponseDto } from '../../api/types';
import { strings } from '../../i18n';
import { EMPLOYEE_CARD_ACCENTS, getDepartmentAccent, getDepartmentAccentIndex } from '../../theme/employeeCardPalette';
import { formatDateOnly } from '../../utils/formatDate';
import { formatPtoDays } from '../../utils/formatPto';

/**
 * Department PTO matrix: parent rows (team rollups) and child rows (per employee).
 * MUI X community `DataGrid` has no `treeData`; we flatten parent/child rows and
 * show hierarchy with expand/collapse plus indentation (see SETUP.md).
 */

type MatrixGridRow = {
  id: string;
  kind: 'department' | 'employee';
  departmentId: number;
  name: string;
  headcount: number;
  annualEntitlementDays: number;
  accruedDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
};

/** One group = department row plus optional employee rows (never split across pages). */
function buildDepartmentRowGroups(
  matrix: DepartmentPtoMatrixResponseDto | null,
  expandedDeptIds: ReadonlySet<number>,
): MatrixGridRow[][] {
  if (!matrix) return [];
  const groups: MatrixGridRow[][] = [];
  for (const d of matrix.departments) {
    const block: MatrixGridRow[] = [
      {
        id: `dept-${d.departmentId}`,
        kind: 'department',
        departmentId: d.departmentId,
        name: d.name,
        headcount: d.headcount,
        annualEntitlementDays: d.rollup.annualEntitlementDays,
        accruedDays: d.rollup.accruedDays,
        usedDays: d.rollup.usedDays,
        pendingDays: d.rollup.pendingDays,
        availableDays: d.rollup.availableDays,
      },
    ];
    if (expandedDeptIds.has(d.departmentId)) {
      for (const e of d.employees) {
        const p = e.balance;
        block.push({
          id: `emp-${e.employeeId}`,
          kind: 'employee',
          departmentId: d.departmentId,
          name: `${e.firstName} ${e.lastName}`.trim(),
          headcount: 0,
          annualEntitlementDays: p.annualEntitlementDays,
          accruedDays: p.accruedDays,
          usedDays: p.usedDays,
          pendingDays: p.pendingDays,
          availableDays: p.availableDays,
        });
      }
    }
    groups.push(block);
  }
  return groups;
}

type DepartmentsPaginationProps = {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: MouseEvent<HTMLButtonElement> | null, page: number) => void;
  /** Data Grid passes a numeric page size (see `GridPagination` + material `BasePagination`). */
  onRowsPerPageChange?: (pageSize: number) => void;
  disabled?: boolean;
};

type DepartmentsPageSizeStepperProps = {
  rowsPerPage: number;
  maxSize: number;
  disabled?: boolean;
  onRowsPerPageChange?: (pageSize: number) => void;
  adjustSize: (delta: number) => void;
};

/** `key={rowsPerPage}` on the parent remounts this when the grid size changes, so draft stays in sync without an effect. */
function DepartmentsPageSizeStepper({
  rowsPerPage,
  maxSize,
  disabled,
  onRowsPerPageChange,
  adjustSize,
}: DepartmentsPageSizeStepperProps) {
  const [draftSize, setDraftSize] = useState(String(rowsPerPage));

  const commitDraft = useCallback(() => {
    const parsed = parseInt(draftSize, 10);
    if (!Number.isFinite(parsed)) {
      setDraftSize(String(rowsPerPage));
      return;
    }
    const next = Math.max(1, Math.min(maxSize, parsed));
    setDraftSize(String(next));
    if (next !== rowsPerPage) {
      onRowsPerPageChange?.(next);
    }
  }, [draftSize, maxSize, onRowsPerPageChange, rowsPerPage]);

  return (
    <>
      <IconButton
        size="small"
        disabled={disabled || rowsPerPage <= 1}
        onClick={() => adjustSize(-1)}
        aria-label={strings.departments.departmentsPerPageDecreaseAria}
      >
        <KeyboardArrowDown fontSize="small" />
      </IconButton>
      <TextField
        value={draftSize}
        onChange={(e) => setDraftSize(e.target.value.replace(/\D/g, ''))}
        onBlur={() => commitDraft()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitDraft();
          }
        }}
        size="small"
        disabled={disabled}
        slotProps={{
          htmlInput: {
            'aria-label': strings.departments.departmentsPerPageInputAria,
            inputMode: 'numeric',
            pattern: '[0-9]*',
            style: { textAlign: 'center' },
          },
        }}
        sx={{
          width: 40,
          '& .MuiOutlinedInput-root': {
            height: 28,
            fontSize: '0.8125rem',
          },
          '& .MuiOutlinedInput-input': {
            py: 0,
            px: 0.5,
          },
        }}
      />
      <IconButton
        size="small"
        disabled={disabled || rowsPerPage >= maxSize}
        onClick={() => adjustSize(1)}
        aria-label={strings.departments.departmentsPerPageIncreaseAria}
      >
        <KeyboardArrowUp fontSize="small" />
      </IconButton>
    </>
  );
}

/**
 * Replaces the default TablePagination select with a compact numeric stepper so page size
 * is not limited to preset options. Must render inside `DataGrid` (uses grid API for labels).
 */
const DepartmentsPagination = forwardRef<HTMLDivElement, DepartmentsPaginationProps>(
  function DepartmentsPagination(
    { count, page, rowsPerPage, onPageChange, onRowsPerPageChange, disabled },
    ref,
  ) {
    const apiRef = useGridApiContext();
    const maxSize = Math.max(1, count);

    const getItemAriaLabel = useCallback(
      (type: 'first' | 'last' | 'next' | 'previous') =>
        apiRef.current.getLocaleText('paginationItemAriaLabel')(type),
      [apiRef],
    );

    const adjustSize = useCallback(
      (delta: number) => {
        const next = Math.max(1, Math.min(maxSize, rowsPerPage + delta));
        if (next !== rowsPerPage) {
          onRowsPerPageChange?.(next);
        }
      },
      [maxSize, onRowsPerPageChange, rowsPerPage],
    );

    const from = count === 0 ? 0 : page * rowsPerPage + 1;
    const to = count === 0 ? 0 : Math.min(count, (page + 1) * rowsPerPage);
    const displayedRowsLabel =
      count == null || count < 0 ? `${from}–${to}` : strings.departments.paginationRange(from, to, count);

    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          gap: 2,
          rowGap: 0.5,
          minHeight: 35,
          height: 35,
          maxHeight: 35,
          px: 1,
          py: 0,
          flex: 1,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
            {strings.departments.departmentsPerPage}
          </Typography>
          <DepartmentsPageSizeStepper
            key={rowsPerPage}
            rowsPerPage={rowsPerPage}
            maxSize={maxSize}
            disabled={disabled}
            onRowsPerPageChange={onRowsPerPageChange}
            adjustSize={adjustSize}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
          {displayedRowsLabel}
        </Typography>

        <TablePaginationActions
          count={count}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          getItemAriaLabel={getItemAriaLabel}
          showFirstButton={false}
          showLastButton={false}
          disabled={disabled}
        />
      </Box>
    );
  },
);

export function DepartmentsView() {
  const [matrix, setMatrix] = useState<DepartmentPtoMatrixResponseDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDeptIds, setExpandedDeptIds] = useState<Set<number>>(new Set());
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 1,
  });

  useEffect(() => {
    const ac = new AbortController();
    const run = async () => {
      setLoadError(null);
      try {
        const data = await fetchDepartmentPtoMatrix(undefined, ac.signal);
        setMatrix(data);
        setExpandedDeptIds(new Set(data.departments.map((d) => d.departmentId)));
        const n = data.departments.length;
        setPaginationModel({ page: 0, pageSize: n > 0 ? n : 1 });
      } catch (e: unknown) {
        if ((e as Error).name === 'AbortError') return;
        setLoadError(strings.departments.loadError);
        setMatrix(null);
      } finally {
        setLoading(false);
      }
    };
    void run();
    return () => ac.abort();
  }, []);

  const toggleDept = useCallback((departmentId: number) => {
    setExpandedDeptIds((prev) => {
      const next = new Set(prev);
      if (next.has(departmentId)) next.delete(departmentId);
      else next.add(departmentId);
      return next;
    });
  }, []);

  const departmentGroups = useMemo(
    () => buildDepartmentRowGroups(matrix, expandedDeptIds),
    [matrix, expandedDeptIds],
  );

  const departmentCount = matrix?.departments.length ?? 0;

  const effectivePaginationModel = useMemo((): GridPaginationModel => {
    const prev = paginationModel;
    if (departmentCount === 0) {
      return prev.page === 0 ? prev : { ...prev, page: 0 };
    }
    const maxPage = Math.max(0, Math.ceil(departmentCount / prev.pageSize) - 1);
    return prev.page > maxPage ? { ...prev, page: maxPage } : prev;
  }, [departmentCount, paginationModel]);

  const gridRows = useMemo(() => {
    const start = effectivePaginationModel.page * effectivePaginationModel.pageSize;
    return departmentGroups.slice(start, start + effectivePaginationModel.pageSize).flat();
  }, [departmentGroups, effectivePaginationModel]);

  const pageSizeOptions = useMemo(() => {
    const raw = [10, 25, 50, departmentCount, paginationModel.pageSize].filter((x) => x > 0);
    return Array.from(new Set(raw)).sort((a, b) => a - b);
  }, [departmentCount, paginationModel.pageSize]);

  const renderNameCell = useCallback(
    (p: GridRenderCellParams<MatrixGridRow>) => {
      const row = p.row;
      if (row.kind === 'department') {
        const open = expandedDeptIds.has(row.departmentId);
        const accent = getDepartmentAccent(row.departmentId);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, width: '100%', height: '100%' }}>
            <IconButton
              size="small"
              sx={{ flexShrink: 0 }}
              aria-expanded={open}
              aria-label={strings.departments.expandRow}
              onClick={(e) => {
                e.stopPropagation();
                toggleDept(row.departmentId);
              }}
            >
              {open ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
            </IconButton>
            <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 0, flex: 1, color: accent.nameColor }} noWrap>
              {row.name}
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 400 }}>
                ({row.headcount})
              </Typography>
            </Typography>
          </Box>
        );
      }
      return (
        <Box sx={{ pl: 4, display: 'flex', alignItems: 'center', minWidth: 0, width: '100%', height: '100%' }}>
          <Typography variant="body2" noWrap>
            {row.name}
          </Typography>
        </Box>
      );
    },
    [expandedDeptIds, toggleDept],
  );

  const columns = useMemo<GridColDef<MatrixGridRow>[]>(
    () => [
      {
        field: 'name',
        headerName: strings.departments.colTree,
        flex: 0,
        minWidth: 220,
        maxWidth: 300,
        sortable: false,
        renderCell: renderNameCell,
      },
      {
        field: 'annualEntitlementDays',
        headerName: strings.employees.ptoAnnual,
        type: 'number',
        flex: 1,
        minWidth: 128,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        valueFormatter: (_value, row) => formatPtoDays(row.annualEntitlementDays),
      },
      {
        field: 'accruedDays',
        headerName: strings.employees.ptoAccrued,
        type: 'number',
        flex: 1,
        minWidth: 116,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        valueFormatter: (_value, row) => formatPtoDays(row.accruedDays),
      },
      {
        field: 'usedDays',
        headerName: strings.employees.ptoUsed,
        type: 'number',
        flex: 1,
        minWidth: 108,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        valueFormatter: (_value, row) => formatPtoDays(row.usedDays),
      },
      {
        field: 'pendingDays',
        headerName: strings.employees.ptoPending,
        type: 'number',
        flex: 1,
        minWidth: 120,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        valueFormatter: (_value, row) => formatPtoDays(row.pendingDays),
      },
      {
        field: 'availableDays',
        headerName: strings.employees.ptoAvailable,
        type: 'number',
        flex: 1,
        minWidth: 128,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        valueFormatter: (_value, row) => formatPtoDays(row.availableDays),
      },
    ],
    [renderNameCell],
  );

  const departmentAccentGridSx = useMemo(
    () =>
      EMPLOYEE_CARD_ACCENTS.reduce<Record<string, object>>((acc, a, i) => {
        acc[`& .dept-pto-parent.dept-accent-${i}`] = {
          bgcolor: a.headerBg,
          borderLeftWidth: 4,
          borderLeftStyle: 'solid',
          borderLeftColor: a.border,
          fontWeight: 600,
        };
        acc[`& .dept-pto-child.dept-accent-${i}`] = {
          bgcolor: 'background.paper',
          borderLeftWidth: 4,
          borderLeftStyle: 'solid',
          borderLeftColor: a.border,
        };
        return acc;
      }, {}),
    [],
  );

  return (
    <Paper
      sx={{
        p: 2,
        mt: 1,
        mb: 1,
        maxWidth: 900,
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
      variant="outlined"
    >
      <Typography variant="h2" gutterBottom sx={{ flexShrink: 0 }}>
        {strings.departments.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexShrink: 0 }}>
        {strings.departments.subtitle}
      </Typography>

      {loadError && (
        <Alert severity="error" sx={{ mt: 2, mb: 0, flexShrink: 0 }}>
          {loadError}
        </Alert>
      )}

      {matrix && !loadError && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, flexShrink: 0 }}>
          {strings.employees.ptoYear}: {matrix.calendarYear} · {strings.employees.ptoAsOf}:{' '}
          {formatDateOnly(matrix.asOfDate)}
        </Typography>
      )}

      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, width: '100%', overflow: 'hidden' }}>
        <DataGrid<MatrixGridRow>
          loading={loading}
          rows={gridRows}
          columns={columns}
          getRowId={(r) => r.id}
          getRowClassName={(p) => {
            const row = p.row;
            const i = getDepartmentAccentIndex(row.departmentId);
            const kind = row.kind === 'department' ? 'dept-pto-parent' : 'dept-pto-child';
            return `${kind} dept-accent-${i}`;
          }}
          density="compact"
          disableColumnMenu
          disableRowSelectionOnClick
          paginationMode="server"
          rowCount={departmentCount}
          paginationModel={effectivePaginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={pageSizeOptions}
          slots={{ basePagination: DepartmentsPagination }}
          localeText={{
            paginationDisplayedRows: ({ from, to, count }) => {
              if (count == null || count < 0) {
                return `${from}–${to}`;
              }
              return strings.departments.paginationRange(from, to, count);
            },
          }}
          onRowClick={(params) => {
            if (params.row.kind === 'department') {
              toggleDept(params.row.departmentId);
            }
          }}
          sx={{
            height: '100%',
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'background.default' },
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
            '& .MuiDataGrid-cell[data-field="name"]': {
              display: 'flex',
              alignItems: 'center',
            },
            ...departmentAccentGridSx,
          }}
        />
      </Box>
    </Paper>
  );
}

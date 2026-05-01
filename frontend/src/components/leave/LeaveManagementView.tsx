import ClearIcon from '@mui/icons-material/Clear';
import Autocomplete from '@mui/material/Autocomplete';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { strings } from '../../i18n';
import { EmployeePickerField } from '../employees/EmployeePickerField';
import { formatDateOnly, formatDateTime } from '../../utils/formatDate';
import { formatPtoDays } from '../../utils/formatPto';

function formatEmployeeNameEmail(row: PtoLedgerEntryReadDto, rosterEmail?: string): string {
  const name = `${row.employeeFirstName} ${row.employeeLastName}`.trim();
  const email = row.employeeEmail?.trim() || rosterEmail?.trim() || '';
  if (email && name) return `${name} (${email})`;
  if (email) return email;
  return name || `#${row.employeeId}`;
}

/** Ledger grid default min width for columns using fixed `width`; matches effective date column. */
const LEDGER_COL_MIN_WIDTH_PX = 107;

/** Match MUI Autocomplete `ClearIndicator`: hidden until hover (fine pointer) or focus-within. */
const filterSelectFormControlSx = {
  minWidth: 0,
  '& .leave-filter-select-clear': { visibility: 'hidden' },
  '&:focus-within .leave-filter-select-clear': { visibility: 'visible' },
  '@media (pointer: fine)': {
    '&:hover .leave-filter-select-clear': { visibility: 'visible' },
  },
} as const;

export function LeaveManagementView() {
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
  }, []);

  const reloadLedger = useCallback(async () => {
    setGridLoading(true);
    setGridError(null);
    try {
      const page = await fetchPtoLedgerPage(
        {
          employeeId: filterEmployeeId === '' ? undefined : Number(filterEmployeeId),
          departmentId: filterDepartmentId === '' ? undefined : Number(filterDepartmentId),
          fromDate: filterFrom ? filterFrom.format('YYYY-MM-DD') : undefined,
          toDate: filterTo ? filterTo.format('YYYY-MM-DD') : undefined,
          entryType: filterEntryType || undefined,
          page: paginationModel.page,
          pageSize: paginationModel.pageSize,
        },
      );
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
  ]);

  useEffect(() => {
    void reloadLedger();
  }, [reloadLedger]);

  const deptMemberCount = useMemo(() => {
    if (dialogDepartmentId === '') return 0;
    const did = Number(dialogDepartmentId);
    return employees.filter((e) => e.departmentId === did).length;
  }, [dialogDepartmentId, employees]);

  const entryTypeLabel = useCallback((t: PtoLedgerEntryTypeDto) => {
    switch (t) {
      case 'accrual':
        return strings.leave.entryAccrual;
      case 'usage':
        return strings.leave.entryUsage;
      case 'adjustment':
        return strings.leave.entryAdjustment;
      default:
        return t;
    }
  }, []);

  /** Ledger rows may omit email; match picker roster so the grid still shows name (email). */
  const employeeEmailById = useMemo(() => {
    const m = new Map<number, string>();
    for (const e of employees) {
      const em = e.email?.trim();
      if (em) m.set(e.id, em);
    }
    return m;
  }, [employees]);

  const columns = useMemo<GridColDef<PtoLedgerEntryReadDto>[]>(
    () => [
      {
        field: 'effectiveDate',
        headerName: strings.leave.colEffectiveDate,
        width: LEDGER_COL_MIN_WIDTH_PX,
        minWidth: LEDGER_COL_MIN_WIDTH_PX,
        sortable: false,
        valueGetter: (_, row) => formatDateOnly(row.effectiveDate),
      },
      {
        field: 'entryType',
        headerName: strings.leave.colEntryType,
        width: 105,
        minWidth: LEDGER_COL_MIN_WIDTH_PX,
        sortable: false,
        valueGetter: (_, row) => entryTypeLabel(row.entryType),
      },
      {
        field: 'amount',
        headerName: strings.leave.colAmount,
        width: 110,
        minWidth: LEDGER_COL_MIN_WIDTH_PX,
        sortable: false,
        align: 'right',
        headerAlign: 'right',
        valueGetter: (_, row) => formatPtoDays(row.amount),
      },
      {
        field: 'employee',
        headerName: strings.leave.colEmployee,
        flex: 1.375,
        minWidth: 219,
        sortable: false,
        valueGetter: (_, row) =>
          formatEmployeeNameEmail(row, employeeEmailById.get(row.employeeId)),
      },
      {
        field: 'departmentName',
        headerName: strings.leave.colDepartment,
        flex: 0.6,
        minWidth: LEDGER_COL_MIN_WIDTH_PX,
        sortable: false,
      },
      {
        field: 'note',
        headerName: strings.leave.colNote,
        flex: 1.2,
        minWidth: 140,
        sortable: false,
        valueGetter: (_, row) => row.note ?? '',
      },
      {
        field: 'createdAt',
        headerName: strings.leave.colCreatedAt,
        width: 188,
        minWidth: LEDGER_COL_MIN_WIDTH_PX,
        sortable: false,
        valueGetter: (_, row) => formatDateTime(row.createdAt),
      },
      {
        field: 'createdBy',
        headerName: strings.leave.colCreatedBy,
        width: 100,
        minWidth: LEDGER_COL_MIN_WIDTH_PX,
        sortable: false,
        valueGetter: (_, row) => row.createdBy ?? '—',
      },
    ],
    [employeeEmailById, entryTypeLabel],
  );

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
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            {strings.leave.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {strings.leave.subtitle}
          </Typography>
        </Box>

        {loadMetaError ? (
          <Alert severity="error" sx={{ mt: 2, flexShrink: 0 }}>
            {loadMetaError}
          </Alert>
        ) : null}

        <Divider sx={{ my: 2, flexShrink: 0 }} />

        <Box
          sx={{
            display: 'grid',
            gap: 1,
            alignItems: 'end',
            mb: 1,
            flexShrink: 0,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
              xl:
                'minmax(180px, 1.75fr) minmax(160px, 1fr) minmax(170px, 0.75fr) minmax(170px, 0.75fr) minmax(130px, 1fr) auto auto',
            },
            /** One row height for employee picker, selects, date fields, and actions (~theme small OutlinedInput). */
            '& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root': {
              fontSize: '0.8125rem',
              minHeight: 40,
              boxSizing: 'border-box',
            },
            '& .MuiInputLabel-root': { fontSize: '0.8125rem' },
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <EmployeePickerField
              employees={employees}
              valueId={filterEmployeeId}
              onChangeId={(id) => {
                setFilterEmployeeId(id);
                setPaginationModel((m) => ({ ...m, page: 0 }));
              }}
              label={strings.leave.filterEmployee}
              clearButtonAriaLabel={strings.leave.clearField}
            />
          </Box>
          <FormControl fullWidth size="small" sx={{ minWidth: 0 }}>
            <Autocomplete
              size="small"
              options={departments}
              value={
                filterDepartmentId === ''
                  ? null
                  : departments.find((d) => Number(d.id) === Number(filterDepartmentId)) ?? null
              }
              onChange={(_, next) => {
                setFilterDepartmentId(next == null ? '' : Number(next.id));
                setPaginationModel((m) => ({ ...m, page: 0 }));
              }}
              getOptionLabel={(d) => d.name}
              isOptionEqualToValue={(a, b) => Number(a.id) === Number(b.id)}
              autoHighlight
              blurOnSelect
              disableClearable={filterDepartmentId === ''}
              slotProps={{
                popper: {
                  placement: 'bottom-start',
                  modifiers: [{ name: 'offset', options: { offset: [0, 4] } }],
                  sx: {
                    '& .MuiPaper-root': {
                      transition: (theme) =>
                        theme.transitions.create(['box-shadow', 'opacity'], { duration: 150 }),
                    },
                  },
                },
                paper: {
                  elevation: 4,
                  sx: (theme) => ({
                    mt: 0.25,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[8],
                  }),
                },
                clearIndicator: { 'aria-label': strings.leave.clearField },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={strings.leave.filterDepartment}
                  size="small"
                  placeholder={strings.leave.filterAll}
                  slotProps={{
                    ...params.slotProps,
                    htmlInput: {
                      ...params.slotProps?.htmlInput,
                      autoComplete: 'off',
                    },
                  }}
                />
              )}
            />
          </FormControl>
          <DatePicker
            label={strings.leave.filterFrom}
            value={filterFrom}
            onChange={(v) => {
              setFilterFrom(v);
              setPaginationModel((m) => ({ ...m, page: 0 }));
            }}
            slotProps={{
              field: { clearable: true },
              textField: { size: 'small', fullWidth: true },
            }}
          />
          <DatePicker
            label={strings.leave.filterTo}
            value={filterTo}
            onChange={(v) => {
              setFilterTo(v);
              setPaginationModel((m) => ({ ...m, page: 0 }));
            }}
            slotProps={{
              field: { clearable: true },
              textField: { size: 'small', fullWidth: true },
            }}
          />
          <FormControl size="small" fullWidth sx={filterSelectFormControlSx}>
            <InputLabel id="leave-filter-type-label">{strings.leave.filterEntryType}</InputLabel>
            <Select
              labelId="leave-filter-type-label"
              label={strings.leave.filterEntryType}
              value={filterEntryType}
              onChange={(e) => {
                setFilterEntryType(e.target.value as PtoLedgerEntryTypeDto | '');
                setPaginationModel((m) => ({ ...m, page: 0 }));
              }}
              endAdornment={
                filterEntryType !== '' ? (
                  <InputAdornment position="end" sx={{ mr: 1.5, maxHeight: 'unset' }}>
                    <IconButton
                      className="leave-filter-select-clear"
                      size="small"
                      aria-label={strings.leave.clearField}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilterEntryType('');
                        setPaginationModel((m) => ({ ...m, page: 0 }));
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined
              }
            >
              <MenuItem value="">{strings.leave.filterAll}</MenuItem>
              <MenuItem value="accrual">{strings.leave.entryAccrual}</MenuItem>
              <MenuItem value="usage">{strings.leave.entryUsage}</MenuItem>
              <MenuItem value="adjustment">{strings.leave.entryAdjustment}</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            size="small"
            onClick={clearFilters}
            sx={{
              justifySelf: { xs: 'stretch', xl: 'start' },
              width: { xs: '100%', xl: 'auto' },
              minWidth: { xs: 'auto', sm: 112 },
              minHeight: 40,
              boxSizing: 'border-box',
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              py: 0.75,
              whiteSpace: 'nowrap',
            }}
          >
            {strings.leave.clearFilters}
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={openDialog}
            sx={{
              justifySelf: { xs: 'stretch', xl: 'start' },
              width: { xs: '100%', xl: 'auto' },
              minWidth: { xs: 'auto', sm: 112 },
              minHeight: 40,
              boxSizing: 'border-box',
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              py: 0.75,
              whiteSpace: 'nowrap',
            }}
          >
            {strings.leave.addEntry}
          </Button>
        </Box>

        {gridError ? (
          <Alert severity="error" sx={{ mb: 1 }}>
            {gridError}
          </Alert>
        ) : null}

        <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(r) => r.id}
            density="compact"
            label={strings.leave.title}
            loading={gridLoading}
            paginationMode="server"
            rowCount={totalCount}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50]}
            disableColumnSorting
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              height: '100%',
              width: '100%',
              '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover' },
              '& .MuiDataGrid-footerContainer': {
                minHeight: 47,
                height: 47,
                maxHeight: 47,
                alignItems: 'center',
                pt: 1.5,
                pb: 0,
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

      <Dialog open={dialogOpen} onClose={() => !dialogSubmitting && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{strings.leave.dialogTitle}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {dialogError ? (
              <Alert severity="error" onClose={() => setDialogError(null)}>
                {dialogError}
              </Alert>
            ) : null}
            <FormControl component="fieldset">
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {strings.leave.scopeLabel}
              </Typography>
              <RadioGroup
                row
                value={dialogScope}
                onChange={(_, v) => setDialogScope(v as 'employee' | 'department')}
              >
                <FormControlLabel value="employee" control={<Radio size="small" />} label={strings.leave.scopeEmployee} />
                <FormControlLabel
                  value="department"
                  control={<Radio size="small" />}
                  label={strings.leave.scopeDepartment}
                />
              </RadioGroup>
            </FormControl>

            {dialogScope === 'employee' ? (
              <EmployeePickerField
                employees={employees}
                valueId={dialogEmployeeId}
                onChangeId={setDialogEmployeeId}
                label={strings.leave.pickEmployee}
              />
            ) : (
              <>
                <FormControl fullWidth size="small">
                  <InputLabel id="leave-dialog-dept">{strings.leave.pickDepartment}</InputLabel>
                  <Select
                    labelId="leave-dialog-dept"
                    label={strings.leave.pickDepartment}
                    value={dialogDepartmentId === '' ? '' : String(dialogDepartmentId)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDialogDepartmentId(v === '' ? '' : Number(v));
                    }}
                  >
                    <MenuItem value="">
                      <em>{strings.onboard.departmentPlaceholder}</em>
                    </MenuItem>
                    {departments.map((d) => (
                      <MenuItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {dialogDepartmentId !== '' ? (
                  <Alert severity="info">{strings.leave.scopeDeptExplain(deptMemberCount)}</Alert>
                ) : null}
              </>
            )}

            <FormControl fullWidth size="small">
              <InputLabel id="leave-dialog-entry-type">{strings.leave.fieldEntryType}</InputLabel>
              <Select
                labelId="leave-dialog-entry-type"
                label={strings.leave.fieldEntryType}
                value={dialogEntryType}
                onChange={(e) => setDialogEntryType(e.target.value as PtoLedgerEntryTypeDto)}
              >
                <MenuItem value="accrual">{strings.leave.entryAccrual}</MenuItem>
                <MenuItem value="usage">{strings.leave.entryUsage}</MenuItem>
                <MenuItem value="adjustment">{strings.leave.entryAdjustment}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={strings.leave.fieldAmount}
              size="small"
              fullWidth
              type="number"
              slotProps={{ htmlInput: { step: 0.5 } }}
              value={dialogAmount}
              onChange={(e) => setDialogAmount(e.target.value)}
              helperText={
                dialogEntryType === 'adjustment' ? strings.leave.adjustmentAmountHint : undefined
              }
            />

            <DatePicker
              label={strings.leave.fieldEffectiveDate}
              value={dialogEffective}
              onChange={(v) => setDialogEffective(v)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />

            <TextField
              label={strings.leave.fieldNote}
              size="small"
              fullWidth
              multiline
              minRows={2}
              value={dialogNote}
              onChange={(e) => setDialogNote(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={dialogSubmitting}>
            {strings.leave.dialogCancel}
          </Button>
          <Button variant="contained" onClick={() => void submitDialog()} disabled={dialogSubmitting}>
            {dialogSubmitting ? strings.leave.dialogSaving : strings.leave.dialogSave}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

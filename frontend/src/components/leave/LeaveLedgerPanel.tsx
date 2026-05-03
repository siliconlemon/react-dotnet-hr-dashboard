import ClearIcon from '@mui/icons-material/Clear';
import Autocomplete from '@mui/material/Autocomplete';
import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Dayjs } from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import type {
  DepartmentReadDto,
  EmployeeReadDto,
  PtoLedgerEntryReadDto,
  PtoLedgerEntryTypeDto,
} from '../../api/types';
import { dayjsPickerDateFormat } from '../../i18n';
import { useDataGridLocaleText } from '../../i18n/useDataGridLocaleText';
import { useLocale } from '../../i18n/useLocale';
import { dataGridShellSx } from '../../theme/dataGridShellSx';
import { formatDateOnly, formatDateTime } from '../../utils/formatDate';
import { formatEmployeeLedgerDisplay } from '../../utils/formatEmployeeLedger';
import { formatPtoDays } from '../../utils/formatPto';
import { EmployeePickerField } from '../employees/EmployeePickerField';
import { ViewLoadingGate } from '../layout/ViewLoadingGate';
import {
  filterSelectFormControlSx,
  LEDGER_COL_MIN_WIDTH_PX,
  leaveFilterFieldFontSize,
  leaveFilterFieldLineHeight,
  leaveLedgerFilterAutocompleteListboxSx,
} from './leaveLedgerConstants';

function LedgerLoadErrorBanner({ message }: { message: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <Alert severity="error" sx={{ mt: 2, flexShrink: 0 }} onClose={() => setDismissed(true)}>
      {message}
    </Alert>
  );
}

export type LeaveLedgerPanelProps = {
  employees: EmployeeReadDto[];
  departments: DepartmentReadDto[];
  ledgerLoadBannerError: string | null;
  rows: PtoLedgerEntryReadDto[];
  totalCount: number;
  gridLoading: boolean;
  filterEmployeeId: number | '';
  setFilterEmployeeId: (v: number | '') => void;
  filterDepartmentId: number | '';
  setFilterDepartmentId: (v: number | '') => void;
  filterFrom: Dayjs | null;
  setFilterFrom: (v: Dayjs | null) => void;
  filterTo: Dayjs | null;
  setFilterTo: (v: Dayjs | null) => void;
  filterEntryType: PtoLedgerEntryTypeDto | '';
  setFilterEntryType: (v: PtoLedgerEntryTypeDto | '') => void;
  paginationModel: GridPaginationModel;
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>;
  onClearFilters: () => void;
  onOpenCreateDialog: () => void;
};

export function LeaveLedgerPanel({
  employees,
  departments,
  ledgerLoadBannerError,
  rows,
  totalCount,
  gridLoading,
  filterEmployeeId,
  setFilterEmployeeId,
  filterDepartmentId,
  setFilterDepartmentId,
  filterFrom,
  setFilterFrom,
  filterTo,
  setFilterTo,
  filterEntryType,
  setFilterEntryType,
  paginationModel,
  setPaginationModel,
  onClearFilters,
  onOpenCreateDialog,
}: LeaveLedgerPanelProps) {
  const { strings } = useLocale();
  const dataGridLocaleText = useDataGridLocaleText();

  const entryTypeLabel = useCallback(
    (t: PtoLedgerEntryTypeDto) => {
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
    },
    [strings],
  );

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
          formatEmployeeLedgerDisplay(row, employeeEmailById.get(row.employeeId)),
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
        valueGetter: (_, row) => row.createdBy ?? '-',
      },
    ],
    [employeeEmailById, entryTypeLabel, strings],
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        px: 2,
        pt: 2,
        pb: 0,
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          {strings.leave.ledgerTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {strings.leave.ledgerSubtitle}
        </Typography>
      </Box>

      {ledgerLoadBannerError ? (
        <LedgerLoadErrorBanner key={ledgerLoadBannerError} message={ledgerLoadBannerError} />
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gap: 1,
          alignItems: 'end',
          mb: 1,
          mt: 2,
          flexShrink: 0,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
            xl:
              'minmax(180px, 1.75fr) minmax(160px, 1fr) minmax(170px, 0.75fr) minmax(170px, 0.75fr) minmax(130px, 1fr) auto auto',
          },
          '& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root, & .MuiPickersInputBase-root': {
            fontSize: leaveFilterFieldFontSize,
            lineHeight: leaveFilterFieldLineHeight,
            minHeight: 40,
            boxSizing: 'border-box',
          },
          '& .MuiOutlinedInput-input, & .MuiInputBase-input': {
            fontSize: 'inherit',
            lineHeight: 'inherit',
            '&::placeholder': {
              fontSize: 'inherit',
              lineHeight: 'inherit',
            },
          },
          '& .MuiPickersSectionList-root, & .MuiPickersInputBase-sectionContent, & .MuiPickersSectionList-sectionContent':
            {
              fontSize: leaveFilterFieldFontSize,
              lineHeight: leaveFilterFieldLineHeight,
            },
          '& .MuiInputLabel-root': { fontSize: leaveFilterFieldFontSize },
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            fontSize: leaveFilterFieldFontSize,
            lineHeight: leaveFilterFieldLineHeight,
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
            listboxSlotSx={leaveLedgerFilterAutocompleteListboxSx}
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
              listbox: {
                sx: leaveLedgerFilterAutocompleteListboxSx,
              },
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
          format={dayjsPickerDateFormat()}
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
          format={dayjsPickerDateFormat()}
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
          onClick={onClearFilters}
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
          onClick={onOpenCreateDialog}
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

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ViewLoadingGate rawPending={gridLoading}>
          <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, width: '100%', overflow: 'hidden' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(r) => r.id}
              density="compact"
              localeText={dataGridLocaleText}
              label={strings.leave.ledgerTitle}
              loading={false}
              paginationMode="server"
              rowCount={totalCount}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 25, 50]}
              disableColumnSorting
              disableRowSelectionOnClick
              sx={{
                ...dataGridShellSx,
                border: 'none',
                height: '100%',
                width: '100%',
              }}
            />
          </Box>
        </ViewLoadingGate>
      </Box>
    </Paper>
  );
}

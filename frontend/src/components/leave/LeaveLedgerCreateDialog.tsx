import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';
import type { Dayjs } from 'dayjs';
import type {
  DepartmentReadDto,
  EmployeeReadDto,
  PtoLedgerEntryTypeDto,
} from '../../api/types';
import { dayjsPickerDateFormat } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';
import { EmployeePickerField } from '../employees/EmployeePickerField';
import { leaveLedgerFilterAutocompleteListboxSx } from './leaveLedgerConstants';

function ScopeDeptInfoAlert({
  deptMemberCount,
  explain,
}: {
  deptMemberCount: number;
  explain: (count: number) => string;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <Alert severity="info" onClose={() => setDismissed(true)}>
      {explain(deptMemberCount)}
    </Alert>
  );
}

type LeaveLedgerCreateDialogProps = {
  open: boolean;
  submitting: boolean;
  error: string | null;
  onDismissError: () => void;
  onClose: () => void;
  onSubmit: () => void;
  employees: EmployeeReadDto[];
  departments: DepartmentReadDto[];
  scope: 'employee' | 'department';
  onScopeChange: (scope: 'employee' | 'department') => void;
  employeeId: number | '';
  onEmployeeIdChange: (id: number | '') => void;
  departmentId: number | '';
  onDepartmentIdChange: (id: number | '') => void;
  entryType: PtoLedgerEntryTypeDto;
  onEntryTypeChange: (t: PtoLedgerEntryTypeDto) => void;
  amount: string;
  onAmountChange: (v: string) => void;
  effective: Dayjs | null;
  onEffectiveChange: (v: Dayjs | null) => void;
  note: string;
  onNoteChange: (v: string) => void;
  deptMemberCount: number;
};

export function LeaveLedgerCreateDialog({
  open,
  submitting,
  error,
  onDismissError,
  onClose,
  onSubmit,
  employees,
  departments,
  scope,
  onScopeChange,
  employeeId,
  onEmployeeIdChange,
  departmentId,
  onDepartmentIdChange,
  entryType,
  onEntryTypeChange,
  amount,
  onAmountChange,
  effective,
  onEffectiveChange,
  note,
  onNoteChange,
  deptMemberCount,
}: LeaveLedgerCreateDialogProps) {
  const { strings } = useLocale();

  return (
    <Dialog open={open} onClose={() => !submitting && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>{strings.leave.dialogTitle}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? (
            <Alert severity="error" onClose={onDismissError}>
              {error}
            </Alert>
          ) : null}
          <FormControl component="fieldset">
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              {strings.leave.scopeLabel}
            </Typography>
            <RadioGroup row value={scope} onChange={(_, v) => onScopeChange(v as 'employee' | 'department')}>
              <FormControlLabel value="employee" control={<Radio size="small" />} label={strings.leave.scopeEmployee} />
              <FormControlLabel value="department" control={<Radio size="small" />} label={strings.leave.scopeDepartment} />
            </RadioGroup>
          </FormControl>

          {scope === 'employee' ? (
            <EmployeePickerField
              employees={employees}
              valueId={employeeId}
              onChangeId={onEmployeeIdChange}
              label={strings.leave.pickEmployee}
              listboxSlotSx={leaveLedgerFilterAutocompleteListboxSx}
            />
          ) : (
            <>
              <FormControl fullWidth size="small">
                <InputLabel id="leave-dialog-dept">{strings.leave.pickDepartment}</InputLabel>
                <Select
                  labelId="leave-dialog-dept"
                  label={strings.leave.pickDepartment}
                  value={departmentId === '' ? '' : String(departmentId)}
                  onChange={(e) => {
                    const v = e.target.value;
                    onDepartmentIdChange(v === '' ? '' : Number(v));
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
              {departmentId !== '' ? (
                <ScopeDeptInfoAlert
                  key={departmentId}
                  deptMemberCount={deptMemberCount}
                  explain={strings.leave.scopeDeptExplain}
                />
              ) : null}
            </>
          )}

          <FormControl fullWidth size="small">
            <InputLabel id="leave-dialog-entry-type">{strings.leave.fieldEntryType}</InputLabel>
            <Select
              labelId="leave-dialog-entry-type"
              label={strings.leave.fieldEntryType}
              value={entryType}
              onChange={(e) => onEntryTypeChange(e.target.value as PtoLedgerEntryTypeDto)}
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
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            helperText={entryType === 'adjustment' ? strings.leave.adjustmentAmountHint : undefined}
          />

          <DatePicker
            format={dayjsPickerDateFormat()}
            label={strings.leave.fieldEffectiveDate}
            value={effective}
            onChange={(v) => onEffectiveChange(v)}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />

          <TextField
            label={strings.leave.fieldNote}
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {strings.leave.dialogCancel}
        </Button>
        <Button variant="contained" onClick={() => void onSubmit()} disabled={submitting}>
          {submitting ? strings.leave.dialogSaving : strings.leave.dialogSave}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

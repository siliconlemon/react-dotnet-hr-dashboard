import {
  Alert,
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { EmployeePickerField, getEmployeeById } from './EmployeePickerField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { fetchDepartments } from '../../api/departmentsApi';
import { updateEmployee } from '../../api/employeesApi';
import type { DepartmentReadDto, EmployeeReadDto } from '../../api/types';
import { strings } from '../../i18n';

const HELPER_PLACEHOLDER = '\u00a0';

const compactFieldSlotProps = {
  formHelperText: {
    sx: { minHeight: 20, m: 0, mt: 0.5 },
  },
} as const;

/** Same as the edit form grid `gap` — space between full field rows (label + input + helper). */
const FIELD_STACK_GAP = 1.5;

/** Helper strip under an input/outlined control (matches TextField `formHelperText` slot). */
const selectAttachedHelperSpacerSx = (theme: { spacing: (n: number) => string }) => ({
  minHeight: 20,
  m: 0,
  mt: 0.5,
  mb: theme.spacing(FIELD_STACK_GAP),
});

type EditFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  hireDate: string;
  departmentId: number | '';
};

function rowToValues(row: EmployeeReadDto): EditFormValues {
  return {
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    jobTitle: row.jobTitle,
    hireDate: row.hireDate,
    departmentId: row.departmentId,
  };
}

type EmployeeEditFormProps = {
  employees: EmployeeReadDto[];
  preferredEmployeeId: number | null;
  onUpdated: () => void;
};

/**
 * Full PUT form for an existing employee; employee chosen via dropdown (syncs from Directory when one row is selected).
 */
export function EmployeeEditForm({
  employees,
  preferredEmployeeId,
  onUpdated,
}: EmployeeEditFormProps) {
  const [departments, setDepartments] = useState<DepartmentReadDto[]>([]);
  const [deptError, setDeptError] = useState<string | null>(null);
  const [deptLoading, setDeptLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | ''>('');

  const selectedRow = useMemo(
    () => getEmployeeById(employees, selectedId),
    [employees, selectedId],
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      jobTitle: '',
      hireDate: '',
      departmentId: '',
    },
    mode: 'onTouched',
  });

  const hireDateValue = (raw: string) => {
    if (!raw?.trim()) return null;
    const d = dayjs(raw);
    return d.isValid() ? d : null;
  };

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      try {
        setDeptLoading(true);
        const list = await fetchDepartments(ac.signal);
        setDepartments(list);
        setDeptError(null);
      } catch (e: unknown) {
        if ((e as Error).name === 'AbortError') return;
        setDeptError(strings.onboard.departmentsLoadError);
      } finally {
        setDeptLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (employees.length === 0) {
      setSelectedId('');
      return;
    }
    if (preferredEmployeeId != null) {
      const row = getEmployeeById(employees, preferredEmployeeId);
      if (row) {
        setSelectedId(Number(row.id));
        return;
      }
    }
    setSelectedId((prev) => {
      if (prev !== '' && getEmployeeById(employees, prev) != null) return prev;
      return '';
    });
  }, [employees, preferredEmployeeId]);

  useEffect(() => {
    if (!selectedRow) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        jobTitle: '',
        hireDate: '',
        departmentId: '',
      });
      return;
    }
    reset(rowToValues(selectedRow));
  }, [selectedRow, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (selectedId === '') return;
    setSubmitError(null);
    if (values.departmentId === '') {
      setSubmitError(strings.onboard.departmentRequired);
      return;
    }
    try {
      await updateEmployee(selectedId, {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        jobTitle: values.jobTitle.trim(),
        hireDate: values.hireDate,
        departmentId: values.departmentId,
      });
      onUpdated();
    } catch (e: unknown) {
      const err = e as Error & { status?: number };
      const msg = err.message?.trim();
      if (err.status === 409) {
        setSubmitError(msg || strings.onboard.duplicateEmail);
        return;
      }
      if (err.status === 400) {
        setSubmitError(msg || strings.onboard.badRequest);
        return;
      }
      if (err.status === 404) {
        setSubmitError(strings.employees.updateFailed);
        return;
      }
      setSubmitError(strings.employees.updateFailed);
    }
  });

  const noEmployees = employees.length === 0;

  return (
    <Paper
      sx={{
        p: 2,
        width: '100%',
        maxWidth: 880,
        alignSelf: { xs: 'stretch', md: 'flex-start' },
      }}
      variant="outlined"
    >
      <Typography variant="h2" gutterBottom>
        {strings.employees.editTitle}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ pb: 3 }}>
        {strings.employees.editSubtitle}
      </Typography>
      <EmployeePickerField
        employees={employees}
        valueId={selectedId}
        onChangeId={(id) => {
          setSelectedId(id);
          setSubmitError(null);
        }}
        label={strings.employees.editPickEmployee}
        disabled={noEmployees}
        helperText={noEmployees ? undefined : strings.employees.editSelectPrompt}
        helperSpacerSx={selectAttachedHelperSpacerSx}
        helperPlaceholder={HELPER_PLACEHOLDER}
      />
      {noEmployees && (
        <Typography variant="body2" color="text.secondary">
          {strings.employees.editNoEmployees}
        </Typography>
      )}
      {deptError && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {deptError}
        </Alert>
      )}
      {submitError && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}
      {!noEmployees && selectedRow && (
        <Box
          component="form"
          onSubmit={onSubmit}
          noValidate
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 1.5,
            columnGap: 2,
            alignItems: 'start',
          }}
        >
          <TextField
            label={strings.onboard.fieldFirstName}
            size="small"
            fullWidth
            required
            error={!!errors.firstName}
            helperText={errors.firstName?.message ?? HELPER_PLACEHOLDER}
            {...register('firstName', {
              required: strings.onboard.required,
              maxLength: { value: 100, message: strings.onboard.maxLength100 },
            })}
            slotProps={{
              htmlInput: { maxLength: 100 },
              ...compactFieldSlotProps,
            }}
          />
          <TextField
            label={strings.onboard.fieldLastName}
            size="small"
            fullWidth
            required
            error={!!errors.lastName}
            helperText={errors.lastName?.message ?? HELPER_PLACEHOLDER}
            {...register('lastName', {
              required: strings.onboard.required,
              maxLength: { value: 100, message: strings.onboard.maxLength100 },
            })}
            slotProps={{
              htmlInput: { maxLength: 100 },
              ...compactFieldSlotProps,
            }}
          />
          <TextField
            label={strings.onboard.fieldEmail}
            type="email"
            size="small"
            fullWidth
            required
            autoComplete="email"
            error={!!errors.email}
            helperText={errors.email?.message ?? HELPER_PLACEHOLDER}
            sx={{ gridColumn: { xs: '1', md: 'auto' } }}
            {...register('email', {
              required: strings.onboard.required,
              maxLength: { value: 256, message: strings.onboard.maxLength256 },
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: strings.onboard.emailInvalid,
              },
            })}
            slotProps={{
              htmlInput: { maxLength: 256 },
              ...compactFieldSlotProps,
            }}
          />
          <TextField
            label={strings.onboard.fieldJobTitle}
            size="small"
            fullWidth
            required
            error={!!errors.jobTitle}
            helperText={errors.jobTitle?.message ?? HELPER_PLACEHOLDER}
            sx={{ gridColumn: { xs: '1', md: 'auto' } }}
            {...register('jobTitle', {
              required: strings.onboard.required,
              maxLength: { value: 128, message: strings.onboard.maxLength128 },
            })}
            slotProps={{
              htmlInput: { maxLength: 128 },
              ...compactFieldSlotProps,
            }}
          />
          <Controller
            name="hireDate"
            control={control}
            rules={{ required: strings.onboard.required }}
            render={({ field, fieldState }) => (
              <DatePicker
                format="YYYY-MM-DD"
                label={strings.onboard.fieldHireDate}
                value={hireDateValue(field.value)}
                onChange={(v) => {
                  field.onChange(v && v.isValid() ? v.format('YYYY-MM-DD') : '');
                }}
                slotProps={{
                  textField: {
                    required: true,
                    size: 'small',
                    fullWidth: true,
                    name: field.name,
                    inputRef: field.ref,
                    onBlur: field.onBlur,
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message ?? HELPER_PLACEHOLDER,
                    ...compactFieldSlotProps,
                  },
                  calendarHeader: {
                    format: 'YYYY-MM',
                  } as { format: string },
                  popper: {
                    placement: 'bottom-start',
                    sx: { zIndex: (t) => t.zIndex.modal },
                  },
                }}
              />
            )}
          />
          <Controller
            name="departmentId"
            control={control}
            rules={{
              validate: (v: number | '') => v !== '' || strings.onboard.departmentRequired,
            }}
            render={({ field }) => (
              <FormControl
                fullWidth
                required
                size="small"
                error={!!errors.departmentId}
                disabled={deptLoading}
              >
                <InputLabel id="edit-department-label">{strings.onboard.fieldDepartment}</InputLabel>
                <Select
                  labelId="edit-department-label"
                  label={strings.onboard.fieldDepartment}
                  value={field.value === '' ? '' : field.value}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const s = String(raw);
                    field.onChange(s === '' ? '' : Number(s));
                  }}
                >
                  <MenuItem value="">
                    <em>{strings.onboard.departmentPlaceholder}</em>
                  </MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText
                  error={!!errors.departmentId}
                  sx={{ minHeight: 20, m: 0, mt: 0.5 }}
                >
                  {errors.departmentId?.message ?? HELPER_PLACEHOLDER}
                </FormHelperText>
              </FormControl>
            )}
          />
          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !!deptError || deptLoading || departments.length === 0}
            >
              {isSubmitting ? strings.employees.editSaving : strings.employees.editSave}
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { fetchDepartments } from '../../api/departmentsApi';
import { createEmployee } from '../../api/employeesApi';
import type { DepartmentReadDto, EmployeeReadDto } from '../../api/types';
import { dayjsCalendarMonthFormat, dayjsPickerDateFormat, strings } from '../../i18n';

function todayLocalIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Keeps one helper-text line of vertical space so rows stay stable when errors appear. */
const HELPER_PLACEHOLDER = '\u00a0';

const compactFieldSlotProps = {
  formHelperText: {
    sx: { minHeight: 20, m: 0, mt: 0.5 },
  },
} as const;

type OnboardFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  hireDate: string;
  departmentId: number | '';
};

type OnboardingFormProps = {
  /** Called after a successful create with the API response row. */
  onCreated: (employee: EmployeeReadDto) => void;
};

/**
 * Create-employee form using react-hook-form and MUI fields (POST /api/employees).
 */
export function OnboardingForm({ onCreated }: OnboardingFormProps) {
  const [departments, setDepartments] = useState<DepartmentReadDto[]>([]);
  const [deptError, setDeptError] = useState<string | null>(null);
  const [deptLoading, setDeptLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues = useMemo<OnboardFormValues>(
    () => ({
      firstName: '',
      lastName: '',
      email: '',
      jobTitle: '',
      hireDate: todayLocalIsoDate(),
      departmentId: '',
    }),
    [],
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OnboardFormValues>({ defaultValues, mode: 'onTouched' });

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

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    if (values.departmentId === '') {
      setSubmitError(strings.onboard.departmentRequired);
      return;
    }
    try {
      const created = await createEmployee({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        jobTitle: values.jobTitle.trim(),
        hireDate: values.hireDate,
        departmentId: values.departmentId,
      });
      reset(defaultValues);
      onCreated(created);
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
      setSubmitError(strings.onboard.createFailed);
    }
  });

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
        {strings.onboard.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {strings.onboard.subtitle}
      </Typography>
      {deptError && (
        <Alert severity="error" sx={{ mt: 2, mb: 0 }} onClose={() => setDeptError(null)}>
          {deptError}
        </Alert>
      )}
      {submitError && (
        <Alert severity="error" sx={{ mt: 2, mb: 0 }} onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}
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
              format={dayjsPickerDateFormat()}
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
                /** Stock header uses long month names (`April 2026`); keep numeric months to match the field and `formatDateOnly`. */
                calendarHeader: {
                  format: dayjsCalendarMonthFormat(),
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
              <InputLabel id="onboard-department-label">{strings.onboard.fieldDepartment}</InputLabel>
              <Select
                labelId="onboard-department-label"
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
        <Box
          sx={{
            gridColumn: { xs: '1', md: '1 / -1' },
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !!deptError || deptLoading || departments.length === 0}
          >
            {isSubmitting ? strings.onboard.saving : strings.onboard.submit}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

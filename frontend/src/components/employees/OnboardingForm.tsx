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
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { fetchDepartments } from '../../api/departmentsApi';
import { createEmployee } from '../../api/employeesApi';
import type { DepartmentReadDto, EmployeeReadDto } from '../../api/types';
import { strings } from '../../i18n';

function todayLocalIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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
    <Paper sx={{ p: 2, maxWidth: 560 }} variant="outlined">
      <Typography variant="h2" gutterBottom>
        {strings.onboard.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {strings.onboard.subtitle}
      </Typography>
      {deptError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {deptError}
        </Alert>
      )}
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2}>
          <TextField
            label={strings.onboard.fieldFirstName}
            fullWidth
            required
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            {...register('firstName', {
              required: strings.onboard.required,
              maxLength: { value: 100, message: strings.onboard.maxLength100 },
            })}
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
          <TextField
            label={strings.onboard.fieldLastName}
            fullWidth
            required
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            {...register('lastName', {
              required: strings.onboard.required,
              maxLength: { value: 100, message: strings.onboard.maxLength100 },
            })}
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
          <TextField
            label={strings.onboard.fieldEmail}
            type="email"
            fullWidth
            required
            autoComplete="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email', {
              required: strings.onboard.required,
              maxLength: { value: 256, message: strings.onboard.maxLength256 },
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: strings.onboard.emailInvalid,
              },
            })}
            slotProps={{ htmlInput: { maxLength: 256 } }}
          />
          <TextField
            label={strings.onboard.fieldJobTitle}
            fullWidth
            required
            error={!!errors.jobTitle}
            helperText={errors.jobTitle?.message}
            {...register('jobTitle', {
              required: strings.onboard.required,
              maxLength: { value: 128, message: strings.onboard.maxLength128 },
            })}
            slotProps={{ htmlInput: { maxLength: 128 } }}
          />
          <TextField
            label={strings.onboard.fieldHireDate}
            type="date"
            fullWidth
            required
            error={!!errors.hireDate}
            helperText={errors.hireDate?.message}
            {...register('hireDate', { required: strings.onboard.required })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Controller
            name="departmentId"
            control={control}
            rules={{
              validate: (v: number | '') => v !== '' || strings.onboard.departmentRequired,
            }}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.departmentId} disabled={deptLoading}>
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
                {errors.departmentId && (
                  <FormHelperText>{errors.departmentId.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
          <Box sx={{ pt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={
                isSubmitting || !!deptError || deptLoading || departments.length === 0
              }
            >
              {isSubmitting ? strings.onboard.saving : strings.onboard.submit}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}

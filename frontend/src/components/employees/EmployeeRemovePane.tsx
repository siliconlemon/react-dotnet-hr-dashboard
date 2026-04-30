import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { deleteEmployee } from '../../api/employeesApi';
import type { EmployeeReadDto } from '../../api/types';
import { strings } from '../../i18n';

/** Kept in sync with EmployeeEditForm field stack / grid row gap. */
const FIELD_STACK_GAP = 1.5;

const selectAttachedHelperSpacerSx = (theme: { spacing: (n: number) => string }) => ({
  minHeight: 20,
  m: 0,
  mt: 0.5,
  mb: theme.spacing(FIELD_STACK_GAP),
});

const HELPER_PLACEHOLDER = '\u00a0';

type EmployeeRemovePaneProps = {
  employees: EmployeeReadDto[];
  preferredEmployeeId: number | null;
  onRemoved: (id: number) => void;
};

function displayName(e: EmployeeReadDto) {
  return `${e.firstName} ${e.lastName}`.trim();
}

/**
 * Select an employee and confirm permanent deletion (DELETE /api/employees/:id).
 */
export function EmployeeRemovePane({
  employees,
  preferredEmployeeId,
  onRemoved,
}: EmployeeRemovePaneProps) {
  const [selectedId, setSelectedId] = useState<number | ''>('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const selectedRow = useMemo(
    () => (selectedId === '' ? undefined : employees.find((e) => e.id === selectedId)),
    [employees, selectedId],
  );

  useEffect(() => {
    if (employees.length === 0) {
      setSelectedId('');
      return;
    }
    if (preferredEmployeeId != null) {
      const match = employees.some((e) => e.id === preferredEmployeeId);
      if (match) {
        setSelectedId(preferredEmployeeId);
        return;
      }
    }
    setSelectedId((prev) => {
      if (prev !== '' && employees.some((e) => e.id === prev)) return prev;
      return employees[0]!.id;
    });
  }, [employees, preferredEmployeeId]);

  const handleConfirmRemove = async () => {
    if (selectedId === '') return;
    setSubmitError(null);
    setRemoving(true);
    try {
      await deleteEmployee(selectedId);
      setConfirmOpen(false);
      onRemoved(selectedId);
      setSelectedId('');
    } catch {
      setSubmitError(strings.employees.removeFailed);
    } finally {
      setRemoving(false);
    }
  };

  const noEmployees = employees.length === 0;

  return (
    <>
      <Paper
        sx={{
          p: 2,
          width: '100%',
          maxWidth: 560,
          alignSelf: { xs: 'stretch', md: 'flex-start' },
        }}
        variant="outlined"
      >
        <Typography variant="h2" gutterBottom>
          {strings.employees.removeTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ pb: 3 }}>
          {strings.employees.removeSubtitle}
        </Typography>
        {noEmployees && (
          <Typography variant="body2" color="text.secondary">
            {strings.employees.removeNoEmployees}
          </Typography>
        )}
        {!noEmployees && (
          <>
            <FormControl fullWidth size="small">
              <InputLabel id="remove-employee-label">{strings.employees.removePickEmployee}</InputLabel>
              <Select
                labelId="remove-employee-label"
                label={strings.employees.removePickEmployee}
                value={selectedId === '' ? '' : selectedId}
                onChange={(e) => {
                  const raw = e.target.value;
                  setSelectedId(typeof raw === 'number' ? raw : Number(raw));
                  setSubmitError(null);
                }}
              >
                {employees.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {displayName(e)} ({e.email})
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText sx={selectAttachedHelperSpacerSx} aria-hidden>
                {HELPER_PLACEHOLDER}
              </FormHelperText>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {strings.employees.removeSelectPrompt}
            </Typography>
            {submitError && (
              <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setSubmitError(null)}>
                {submitError}
              </Alert>
            )}
            <Box>
              <Button
                variant="contained"
                color="error"
                disabled={selectedId === '' || removing}
                onClick={() => setConfirmOpen(true)}
              >
                {strings.employees.removeButton}
              </Button>
            </Box>
          </>
        )}
      </Paper>

      <Dialog open={confirmOpen} onClose={() => !removing && setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{strings.employees.removeConfirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedRow
              ? strings.employees.removeConfirmBody(displayName(selectedRow))
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={removing}>
            {strings.employees.removeConfirmCancel}
          </Button>
          <Button onClick={handleConfirmRemove} color="error" variant="contained" disabled={removing}>
            {removing ? strings.employees.removing : strings.employees.removeConfirmAction}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

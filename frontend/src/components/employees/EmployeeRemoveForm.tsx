import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { EmployeePickerField, getEmployeeById } from './EmployeePickerField';
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

type EmployeeRemoveFormProps = {
  employees: EmployeeReadDto[];
  /** Set when exactly one row is selected in Directory; otherwise picker stays empty. */
  preferredEmployeeId: number | null;
  onRemoved: (id: number) => void;
};

function displayName(e: EmployeeReadDto) {
  return `${e.firstName} ${e.lastName}`.trim();
}

/**
 * Select an employee and confirm permanent deletion (DELETE /api/employees/:id).
 */
export function EmployeeRemoveForm({
  employees,
  preferredEmployeeId,
  onRemoved,
}: EmployeeRemoveFormProps) {
  const [selectedId, setSelectedId] = useState<number | ''>('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmNameInput, setConfirmNameInput] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const selectedRow = useMemo(
    () => getEmployeeById(employees, selectedId),
    [employees, selectedId],
  );

  useEffect(() => {
    if (confirmOpen) setConfirmNameInput('');
  }, [confirmOpen]);

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
    setSelectedId('');
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
  const expectedConfirmName = selectedRow ? displayName(selectedRow) : '';
  const nameConfirmMatches =
    expectedConfirmName !== '' && confirmNameInput.trim() === expectedConfirmName;

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
            <EmployeePickerField
              employees={employees}
              valueId={selectedId}
              onChangeId={(id) => {
                setSelectedId(id);
                setSubmitError(null);
              }}
              label={strings.employees.removePickEmployee}
              helperText={strings.employees.removeSelectPrompt}
              helperSpacerSx={selectAttachedHelperSpacerSx}
              helperPlaceholder={HELPER_PLACEHOLDER}
            />
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
        <DialogTitle>{strings.employees.removeConfirmTitle(expectedConfirmName)}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {selectedRow && (
              <>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    {strings.employees.removeConfirmBody(expectedConfirmName)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {strings.employees.removeConfirmWriteBefore}{' '}
                    <Box
                      component="span"
                      sx={{ fontStyle: 'italic', color: 'text.primary' }}
                    >
                      {expectedConfirmName}
                    </Box>{' '}
                    {strings.employees.removeConfirmWriteAfter}
                  </Typography>
                </Stack>
                <TextField
                  autoFocus
                  size="small"
                  fullWidth
                  autoComplete="off"
                  spellCheck={false}
                  label={strings.employees.removeConfirmNameLabel}
                  value={confirmNameInput}
                  onChange={(e) => setConfirmNameInput(e.target.value)}
                  disabled={removing}
                  error={confirmNameInput.length > 0 && !nameConfirmMatches}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={removing}>
            {strings.employees.removeConfirmCancel}
          </Button>
          <Button
            onClick={handleConfirmRemove}
            color="error"
            variant="contained"
            disabled={removing || !nameConfirmMatches}
          >
            {removing ? strings.employees.removing : strings.employees.removeConfirmAction}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

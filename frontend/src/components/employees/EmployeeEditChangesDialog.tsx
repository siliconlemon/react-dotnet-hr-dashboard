import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Fragment, useState } from 'react';

export type EmployeeEditChangeRow = {
  label: string;
  from: string;
  to: string;
};

type EmployeeEditChangesDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  changes: EmployeeEditChangeRow[];
  cancelLabel: string;
  confirmLabel: string;
  confirmingLabel: string;
  onConfirm: () => void | Promise<void>;
  confirming: boolean;
  errorMessage?: string | null;
};

function ChangesDialogErrorBanner({ message }: { message: string }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <Alert severity="error" onClose={() => setHidden(true)}>
      {message}
    </Alert>
  );
}

/**
 * Changes sit in one grid: column 1 is as wide as the longest field label (plus padding);
 * column 2 holds the before → after blocks.
 */
export function EmployeeEditChangesDialog({
  open,
  onClose,
  title,
  subtitle,
  changes,
  cancelLabel,
  confirmLabel,
  confirmingLabel,
  onConfirm,
  confirming,
  errorMessage,
}: EmployeeEditChangesDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={confirming ? undefined : onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="employee-edit-changes-title"
    >
      <DialogTitle id="employee-edit-changes-title">{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5, width: '100%', minWidth: 0 }}>
          {errorMessage ? (
            <ChangesDialogErrorBanner key={errorMessage} message={errorMessage} />
          ) : null}
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              {subtitle}
            </Typography>
          ) : null}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'max-content minmax(0, 1fr)',
              columnGap: 0,
              rowGap: 1.25,
              width: '100%',
              minWidth: 0,
              alignItems: 'center',
            }}
          >
            {changes.map((row) => (
              <Fragment key={row.label}>
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    pr: 2,
                    justifySelf: 'start',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    fontWeight: (theme) => theme.typography.subtitle2.fontWeight,
                    color: 'text.primary',
                    lineHeight: 1.35,
                  }}
                >
                  {row.label}:
                </Typography>
                <Box
                  sx={(theme) => ({
                    minWidth: 0,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'stretch',
                    borderRadius: theme.shape.borderRadius,
                    py: 0.5,
                    px: 0.25,
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                  })}
                >
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      px: 0.75,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      component="span"
                      title={row.from}
                      sx={{
                        display: 'block',
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'center',
                        fontSize: (theme) => theme.typography.body2.fontSize,
                        lineHeight: 1.35,
                      }}
                    >
                      {row.from}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'action.active',
                    }}
                    aria-hidden
                  >
                    <ArrowForwardIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      px: 0.75,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.primary"
                      noWrap
                      component="span"
                      title={row.to}
                      sx={{
                        display: 'block',
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'center',
                        fontWeight: (theme) => theme.typography.fontWeightMedium,
                        fontSize: (theme) => theme.typography.body2.fontSize,
                        lineHeight: 1.35,
                      }}
                    >
                      {row.to}
                    </Typography>
                  </Box>
                </Box>
              </Fragment>
            ))}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={confirming}>
          {cancelLabel}
        </Button>
        <Button variant="contained" onClick={() => void onConfirm()} disabled={confirming}>
          {confirming ? confirmingLabel : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

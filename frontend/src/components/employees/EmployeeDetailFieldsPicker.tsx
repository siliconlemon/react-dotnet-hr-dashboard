import { Search as SearchIcon, ViewColumn as ViewColumnIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import { inputBaseClasses } from '@mui/material/InputBase';
import { useTheme } from '@mui/material/styles';
import type { MouseEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { strings } from '../../i18n';
import {
  EMPLOYEE_PROFILE_FIELD_IDS,
  EMPLOYEE_PTO_FIELD_IDS,
  type EmployeeProfileFieldId,
  type EmployeePtoFieldId,
} from './employeeDetailFields';

type DetailTab = 'profile' | 'pto';

export type EmployeeDetailFieldsPickerProps = {
  detailTab: DetailTab;
  profileVisibility: Record<EmployeeProfileFieldId, boolean>;
  ptoVisibility: Record<EmployeePtoFieldId, boolean>;
  onProfileVisibilityChange: (next: Record<EmployeeProfileFieldId, boolean>) => void;
  onPtoVisibilityChange: (next: Record<EmployeePtoFieldId, boolean>) => void;
  onResetProfile: () => void;
  onResetPto: () => void;
};

function profileLabel(id: EmployeeProfileFieldId): string {
  switch (id) {
    case 'email':
      return strings.employees.fieldEmail;
    case 'jobTitle':
      return strings.employees.fieldJobTitle;
    case 'department':
      return strings.employees.fieldDepartment;
    case 'hireDate':
      return strings.employees.fieldHireDate;
    case 'identifiers':
      return strings.employees.fieldIds;
    default:
      return id;
  }
}

function ptoLabel(id: EmployeePtoFieldId): string {
  switch (id) {
    case 'calendarYear':
      return strings.employees.ptoYear;
    case 'asOf':
      return strings.employees.ptoAsOf;
    case 'annualEntitlement':
      return strings.employees.ptoAnnual;
    case 'accrued':
      return strings.employees.ptoAccrued;
    case 'used':
      return strings.employees.ptoUsed;
    case 'pending':
      return strings.employees.ptoPending;
    case 'available':
      return strings.employees.ptoAvailable;
    default:
      return id;
  }
}

function EmployeeDetailFieldsPickerPanel({
  detailTab,
  profileVisibility,
  ptoVisibility,
  onProfileVisibilityChange,
  onPtoVisibilityChange,
  onResetProfile,
  onResetPto,
}: EmployeeDetailFieldsPickerProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState('');

  const open = Boolean(anchorEl);

  const handleOpen = useCallback((e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setSearch('');
    setAnchorEl(null);
  }, []);

  const profileItems = useMemo(
    () =>
      EMPLOYEE_PROFILE_FIELD_IDS.map((id) => ({
        id,
        label: profileLabel(id),
      })),
    [],
  );

  const ptoItems = useMemo(
    () =>
      EMPLOYEE_PTO_FIELD_IDS.map((id) => ({
        id,
        label: ptoLabel(id),
      })),
    [],
  );

  const items =
    detailTab === 'profile'
      ? profileItems
      : ptoItems;

  const q = search.trim().toLowerCase();
  const filteredItems = useMemo(
    () => (q ? items.filter((it) => it.label.toLowerCase().includes(q)) : items),
    [items, q],
  );

  const allVisible =
    detailTab === 'profile'
      ? EMPLOYEE_PROFILE_FIELD_IDS.every((id) => profileVisibility[id])
      : EMPLOYEE_PTO_FIELD_IDS.every((id) => ptoVisibility[id]);

  const someVisible =
    detailTab === 'profile'
      ? EMPLOYEE_PROFILE_FIELD_IDS.some((id) => profileVisibility[id])
      : EMPLOYEE_PTO_FIELD_IDS.some((id) => ptoVisibility[id]);

  const toggleOne = useCallback(
    (id: EmployeeProfileFieldId | EmployeePtoFieldId, checked: boolean) => {
      if (detailTab === 'profile') {
        onProfileVisibilityChange({
          ...profileVisibility,
          [id as EmployeeProfileFieldId]: checked,
        });
      } else {
        onPtoVisibilityChange({
          ...ptoVisibility,
          [id as EmployeePtoFieldId]: checked,
        });
      }
    },
    [
      detailTab,
      profileVisibility,
      ptoVisibility,
      onProfileVisibilityChange,
      onPtoVisibilityChange,
    ],
  );

  const toggleShowAll = useCallback(() => {
    const show = !allVisible;
    if (detailTab === 'profile') {
      onProfileVisibilityChange(
        Object.fromEntries(
          EMPLOYEE_PROFILE_FIELD_IDS.map((id) => [id, show]),
        ) as Record<EmployeeProfileFieldId, boolean>,
      );
    } else {
      onPtoVisibilityChange(
        Object.fromEntries(EMPLOYEE_PTO_FIELD_IDS.map((id) => [id, show])) as Record<
          EmployeePtoFieldId,
          boolean
        >,
      );
    }
  }, [allVisible, detailTab, onProfileVisibilityChange, onPtoVisibilityChange]);

  const reset = useCallback(() => {
    if (detailTab === 'profile') {
      onResetProfile();
    } else {
      onResetPto();
    }
  }, [detailTab, onResetProfile, onResetPto]);

  /** Matches MUI X DataGrid `GridColumnsManagement` + material `FormControlLabel` label size. */
  const rowLabelSx = {
    fontSize: theme.typography.pxToRem(14),
    lineHeight: 1.43,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as const;

  const formRowSx = {
    m: 0,
    gap: 0.5,
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    '& .MuiFormControlLabel-label': rowLabelSx,
  } as const;

  /** Slightly roomier than the bulk toggle row — list rows only. */
  const listRowSx = {
    ...formRowSx,
    py: 0.4,
  } as const;

  /** Fixed 30×30 hit area; 24px icon matches standard MUI checkbox graphic at this scale. */
  const pickerCheckboxSx = {
    p: 0,
    width: 30,
    height: 30,
    '& .MuiSvgIcon-root': { fontSize: 22 },
  } as const;

  return (
    <>
      <IconButton
        size="small"
        onClick={handleOpen}
        aria-label={strings.employees.detailFieldsPickerAria}
        aria-expanded={open}
        sx={{ color: 'text.secondary' }}
      >
        <ViewColumnIcon fontSize="small" />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { mt: 0.5, width: 300, maxWidth: 'calc(100vw - 24px)' },
          },
        }}
      >
        <Paper elevation={0} sx={{ p: 0, overflow: 'hidden', bgcolor: 'background.paper' }}>
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              type="search"
              autoComplete="off"
              placeholder={strings.employees.detailFieldsPickerSearch}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: 'action.active', opacity: 0.72 }} />
                    </InputAdornment>
                  ),
                },
                htmlInput: {
                  'aria-label': strings.employees.detailFieldsPickerSearch,
                },
              }}
              sx={{
                [`& .${inputBaseClasses.input}::-webkit-search-decoration,
                  & .${inputBaseClasses.input}::-webkit-search-cancel-button,
                  & .${inputBaseClasses.input}::-webkit-search-results-button,
                  & .${inputBaseClasses.input}::-webkit-search-results-decoration`]: {
                  display: 'none',
                },
                '& .MuiOutlinedInput-root': {
                  ...theme.typography.body1,
                },
                '& .MuiInputBase-input': {
                  ...theme.typography.body1,
                },
              }}
            />
          </Box>

          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            <Box sx={{ py: 0.5, px: 1.5 }}>
              {filteredItems.length === 0 ? (
                <Typography
                  color="text.secondary"
                  sx={{
                    py: 1,
                    alignSelf: 'center',
                    fontSize: theme.typography.pxToRem(14),
                    lineHeight: 1.43,
                  }}
                >
                  {strings.employees.detailFieldsPickerNoMatches}
                </Typography>
              ) : (
                filteredItems.map((it) => {
                  const checked =
                    detailTab === 'profile'
                      ? profileVisibility[it.id as EmployeeProfileFieldId]
                      : ptoVisibility[it.id as EmployeePtoFieldId];
                  return (
                    <FormControlLabel
                      key={it.id}
                      sx={listRowSx}
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={(_, v) => toggleOne(it.id, v)}
                          sx={pickerCheckboxSx}
                        />
                      }
                      label={it.label}
                    />
                  );
                })
              )}
            </Box>
          </Box>

          <Box
            sx={{
              pt: 1,
              pr: 1,
              pb: 1,
              pl: 1.5,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <FormControlLabel
              sx={{ ...formRowSx, flex: 1, minWidth: 0 }}
              control={
                <Checkbox
                  checked={allVisible}
                  indeterminate={!allVisible && someVisible}
                  onChange={() => toggleShowAll()}
                  sx={pickerCheckboxSx}
                />
              }
              label={strings.employees.detailFieldsPickerShowHideAll}
            />
            <Button
              variant="text"
              color="primary"
              size="small"
              onClick={reset}
              sx={{
                flexShrink: 0,
                minHeight: 32,
                px: 1,
                fontSize: theme.typography.pxToRem(14),
                fontWeight: theme.typography.fontWeightBold,
              }}
            >
              {strings.employees.detailFieldsPickerReset}
            </Button>
          </Box>
        </Paper>
      </Popover>
    </>
  );
}

/**
 * Column-picker style control for which profile / PTO fields appear on employee detail cards.
 */
export function EmployeeDetailFieldsPicker(props: EmployeeDetailFieldsPickerProps) {
  return <EmployeeDetailFieldsPickerPanel key={props.detailTab} {...props} />;
}

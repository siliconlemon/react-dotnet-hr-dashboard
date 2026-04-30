import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import type { EmployeeReadDto } from '../../api/types';

const filterEmployees = createFilterOptions<EmployeeReadDto>({
  matchFrom: 'any',
  stringify: (option) =>
    [
      option.firstName,
      option.lastName,
      `${option.firstName} ${option.lastName}`.trim(),
      option.email,
    ]
      .filter((s) => s.length > 0)
      .join(' '),
});

function fullName(e: EmployeeReadDto) {
  return `${e.firstName} ${e.lastName}`.trim();
}

/** Single-line label: `Name (email)`; falls back to email if name is empty. */
function employeeChoiceLabel(e: EmployeeReadDto) {
  const name = fullName(e);
  return name ? `${name} (${e.email})` : e.email;
}

export type EmployeePickerFieldProps = {
  employees: EmployeeReadDto[];
  valueId: number | '';
  onChangeId: (id: number | '') => void;
  label: string;
  disabled?: boolean;
  /** Renders under the field like TextField helper text (keeps layout aligned with other inputs). */
  helperSpacerSx?: object;
  helperPlaceholder?: string;
};

/**
 * Searchable employee combobox (MUI Autocomplete). Filters by name and email; list opens below the field.
 */
export function EmployeePickerField({
  employees,
  valueId,
  onChangeId,
  label,
  disabled = false,
  helperSpacerSx,
  helperPlaceholder = '\u00a0',
}: EmployeePickerFieldProps) {
  const value: EmployeeReadDto | undefined =
    valueId === '' ? undefined : employees.find((e) => e.id === valueId);

  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <Autocomplete<EmployeeReadDto, false, true, false>
        size="small"
        options={employees}
        value={value}
        onChange={(_, next) => {
          onChangeId(next?.id ?? '');
        }}
        filterOptions={filterEmployees}
        getOptionLabel={(e) => employeeChoiceLabel(e)}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        disableClearable
        autoHighlight
        blurOnSelect
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
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            size="small"
            slotProps={{
              ...params.slotProps,
              htmlInput: {
                ...params.slotProps.htmlInput,
                autoComplete: 'off',
              },
            }}
          />
        )}
      />
      {helperSpacerSx != null && (
        <FormHelperText sx={helperSpacerSx} aria-hidden>
          {helperPlaceholder}
        </FormHelperText>
      )}
    </FormControl>
  );
}

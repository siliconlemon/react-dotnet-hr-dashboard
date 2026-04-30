import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import type { Theme } from '@mui/material/styles';
import type { EmployeeReadDto } from '../../api/types';
import { getEmployeeById } from './getEmployeeById';

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
  /** Hint under the field (same slot as TextField helper text; uses secondary gray). */
  helperText?: string;
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
  helperText,
  helperSpacerSx,
  helperPlaceholder = '\u00a0',
}: EmployeePickerFieldProps) {
  const value: EmployeeReadDto | null = getEmployeeById(employees, valueId) ?? null;

  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <Autocomplete<EmployeeReadDto, false, false, false>
        size="small"
        options={employees}
        value={value}
        onChange={(_, next) => {
          if (next == null) {
            onChangeId('');
            return;
          }
          const n = Number(next.id);
          onChangeId(Number.isNaN(n) ? '' : n);
        }}
        filterOptions={filterEmployees}
        getOptionLabel={(e) => employeeChoiceLabel(e)}
        isOptionEqualToValue={(a, b) => Number(a.id) === Number(b.id)}
        autoHighlight
        blurOnSelect
        key={valueId === '' ? 'none' : String(Number(valueId))}
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
      {(helperText != null && helperText !== '') || helperSpacerSx != null ? (
        <FormHelperText
          sx={(theme: Theme) => ({
            ...(typeof helperSpacerSx === 'function'
              ? helperSpacerSx(theme)
              : helperSpacerSx ?? {}),
            ...(helperText != null && helperText !== ''
              ? {
                  minHeight: 'unset',
                  color: theme.palette.text.secondary,
                  ml: 1,
                }
              : {}),
          })}
          aria-hidden={!(helperText != null && helperText !== '')}
        >
          {helperText != null && helperText !== '' ? helperText : helperPlaceholder}
        </FormHelperText>
      ) : null}
    </FormControl>
  );
}

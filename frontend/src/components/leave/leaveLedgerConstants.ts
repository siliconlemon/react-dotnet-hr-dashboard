/** Ledger grid default min width for columns using fixed `width`; matches effective date column. */
export const LEDGER_COL_MIN_WIDTH_PX = 107;

/** Match MUI Autocomplete `ClearIndicator`: hidden until hover (fine pointer) or focus-within. */
export const filterSelectFormControlSx = {
  minWidth: 0,
  '& .leave-filter-select-clear': { visibility: 'hidden' },
  '&:focus-within .leave-filter-select-clear': { visibility: 'visible' },
  '@media (pointer: fine)': {
    '&:hover .leave-filter-select-clear': { visibility: 'visible' },
  },
} as const;

/** Ledger filters: one typography scale for value text, placeholders, and date-picker sections. */
export const leaveFilterFieldFontSize = '0.8125rem';
export const leaveFilterFieldLineHeight = 1.5;

/**
 * Autocomplete dropdowns use a portal; option text inherits Paper `body1`. Ledger filters only — keep options
 * at the same 13px scale as the inputs and DataGrid cells.
 */
export const leaveLedgerFilterAutocompleteListboxSx = {
  '& .MuiAutocomplete-option': {
    fontSize: leaveFilterFieldFontSize,
    lineHeight: leaveFilterFieldLineHeight,
    fontWeight: 400,
  },
} as const;

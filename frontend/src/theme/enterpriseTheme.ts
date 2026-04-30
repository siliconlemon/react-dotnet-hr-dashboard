import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import { alpha, createTheme } from '@mui/material/styles';
import { EMPLOYEE_CARD_ACCENTS } from './employeeCardPalette';

const paperShadow = '0 1px 2px rgba(15, 31, 53, 0.08)';
const paperShadowRaised = '0 2px 8px rgba(15, 31, 53, 0.1)';

/** One typographic step for all in-popup calendar text (matches `typography.fontSize` 13). */
const calRem = (px: number) => `${px / 16}rem`;

/**
 * Calendar day cell diameter (`--PickerDay-size`). MUI default is 36px.
 * Keep in sync with week grid min-heights below.
 */
const PICKER_DAY_SIZE_PX = 40;
const PICKER_DAY_MARGIN_PX = 2;
/** Six full week rows (loading skeleton); day view sizes by actual week count via `min-content`. */
const PICKER_WEEKS_GRID_MIN_HEIGHT =
  (PICKER_DAY_SIZE_PX + PICKER_DAY_MARGIN_PX * 2) * 6;

/**
 * Segoe UI (Windows) does not ship a true 500 face; browsers synthesize it differently
 * (e.g. Firefox vs Chromium). Stick to 400 / 600 / 700 so every weight maps to a real face.
 */
const FW = {
  regular: 400,
  semibold: 600,
} as const;

/**
 * Compact enterprise theme: restrained elevation, navy primary, cool neutrals.
 */
export const enterpriseTheme = createTheme({
  employeeCard: {
    accents: EMPLOYEE_CARD_ACCENTS,
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#1e3a5f',
      light: '#3d5a80',
      dark: '#0f1f35',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#546e7a',
    },
    background: {
      default: '#eef1f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a2332',
      secondary: '#5c6570',
    },
    divider: 'rgba(15, 31, 53, 0.1)',
  },
  shape: {
    borderRadius: 6,
  },
  typography: {
    fontFamily:
      '"Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: 13,
    fontWeightMedium: FW.semibold,
    body1: { fontWeight: FW.regular },
    body2: { fontWeight: FW.regular },
    caption: { fontWeight: FW.regular },
    button: { fontWeight: FW.semibold },
    h1: { fontSize: '1.5rem', fontWeight: FW.semibold },
    h2: {
      fontSize: '1.25rem',
      fontWeight: FW.semibold,
      textTransform: 'capitalize',
    },
    h3: { fontSize: '1.1rem', fontWeight: FW.semibold },
    subtitle1: { fontWeight: FW.regular },
    subtitle2: { fontWeight: FW.semibold },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#eef1f5',
        },
      },
    },
    MuiButton: {
      defaultProps: { size: 'medium', disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'capitalize',
          fontWeight: theme.typography.fontWeightMedium,
          /** Match `TextField` / `OutlinedInput` `size="small"` control height (~40px). */
          minHeight: 40,
        }),
      },
    },
    MuiIconButton: {
      defaultProps: { size: 'small' },
    },
    MuiListItemButton: {
      defaultProps: { dense: true },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: { minWidth: 36 },
      },
    },
    MuiToolbar: {
      defaultProps: { variant: 'dense' },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: { boxShadow: paperShadow },
        elevation2: { boxShadow: paperShadowRaised },
        elevation3: { boxShadow: paperShadowRaised },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'default' },
      styleOverrides: {
        root: {
          borderBottom: '1px solid',
          borderColor: 'rgba(15, 31, 53, 0.1)',
        },
      },
    },
    /** Dialog body gutters stay 24px; tuck actions closer to content and align button row with content inset. */
    MuiDialogContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingBottom: theme.spacing(1.75),
        }),
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingTop: theme.spacing(1),
          /** Slightly under side inset — full symmetry reads heavy at the bottom edge. */
          paddingBottom: theme.spacing(2.5),
          paddingLeft: theme.spacing(3),
          paddingRight: theme.spacing(3),
        }),
      },
    },
    // MUI X Date Pickers — align popups with enterprise Paper/shape and primary palette.
    /** Popper surface wrapping the layout; round this so the outer shell matches `shape` (not just the inner layout). */
    MuiPickerPopper: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          boxShadow: paperShadowRaised,
          overflow: 'hidden',
        }),
      },
    },
    MuiPickersLayout: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          boxShadow: 'none',
          overflow: 'hidden',
          fontFamily: theme.typography.fontFamily,
        }),
      },
    },
    /** Picker field uses this instead of `MuiTextField`; keep defaults aligned with the rest of the app. */
    MuiPickersTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          /** Calendar adornment button; default `edgeEnd` is `-3px`, pull in slightly more for alignment. */
          '& [data-mui-picker-open-button="true"]': {
            marginRight: '-8px',
          },
        },
      },
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: ({ theme }) => ({
          marginTop: theme.spacing(1),
          marginBottom: theme.spacing(0.5),
          /** Inset from popper edge (16px; was MUI default 24px). */
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          '& .MuiIconButton-root': {
            color: theme.palette.primary.main,
          },
          /**
           * Default styles merge `body1` on the label container; replace with compact body scale
           * so the header matches form typography (not oversized title text).
           */
          '& .MuiPickersCalendarHeader-labelContainer': {
            color: theme.palette.text.primary,
            fontFamily: theme.typography.fontFamily,
            fontSize: calRem(13),
            fontWeight: theme.typography.fontWeightMedium,
            lineHeight: 1.35,
            letterSpacing: '0.01em',
          },
        }),
      },
    },
    MuiDateCalendar: {
      styleOverrides: {
        root: {
          /** Calendar panel height (matches date-picker popup layout). */
          height: '320px',
          minHeight: 0,
          maxHeight: 'none',
          paddingBottom: 0,
          '& .MuiPickersFadeTransitionGroup-root': {
            flex: '0 0 auto',
          },
        },
      },
    },
    MuiDayCalendar: {
      styleOverrides: {
        root: {
          paddingBottom: 0,
        },
        monthContainer: {
          paddingBottom: 0,
        },
        /** Default `2px` top/bottom × six rows adds noticeable dead air under the grid. */
        weekContainer: {
          margin: '1px 0',
        },
        /** Single-letter row: keep close to date numerals so the grid feels one system. */
        weekDayLabel: ({ theme }) => ({
          width: PICKER_DAY_SIZE_PX,
          height: PICKER_DAY_SIZE_PX + 2,
          margin: `0 ${PICKER_DAY_MARGIN_PX}px`,
          fontSize: calRem(12),
          fontWeight: theme.typography.fontWeightMedium,
          color: theme.palette.text.secondary,
          letterSpacing: '0.04em',
        }),
        slideTransition: {
          minHeight: PICKER_WEEKS_GRID_MIN_HEIGHT,
        },
        loadingContainer: {
          minHeight: PICKER_WEEKS_GRID_MIN_HEIGHT,
        },
      },
    },
    MuiPickerDay: {
      styleOverrides: {
        root: ({ theme }) => ({
          '--PickerDay-size': `${PICKER_DAY_SIZE_PX}px`,
          fontSize: calRem(13),
          fontWeight: theme.typography.fontWeightMedium,
        }),
      },
    },
    /**
     * Year / month pick views default to `subtitle1` + oversized pills; align with app body scale.
     */
    MuiYearCalendar: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
          rowGap: theme.spacing(1),
          columnGap: theme.spacing(1),
        }),
        button: ({ theme }) => ({
          fontFamily: theme.typography.fontFamily,
          fontSize: calRem(13),
          fontWeight: theme.typography.fontWeightMedium,
          lineHeight: 1.2,
          height: 32,
          width: 68,
          maxWidth: '100%',
          /** ~36px pill height 32 → rounded chip aligned with `shape` scale */
          borderRadius: Number(theme.shape.borderRadius) * 3,
          '@media (max-width: 340px)': {
            width: 60,
            fontSize: calRem(12),
          },
        }),
      },
    },
    MuiMonthCalendar: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
          rowGap: theme.spacing(1),
          columnGap: theme.spacing(1),
        }),
        button: ({ theme }) => ({
          fontFamily: theme.typography.fontFamily,
          fontSize: calRem(13),
          fontWeight: theme.typography.fontWeightMedium,
          lineHeight: 1.2,
          height: 32,
          width: 72,
          maxWidth: '100%',
          borderRadius: Number(theme.shape.borderRadius) * 3,
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontWeight: theme.typography.fontWeightMedium,
        }),
      },
    },
    /** Softer focus than the default thick outline; keeps keyboard focus visible via primary tint. */
    MuiDataGrid: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-cell:focus-within': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
          '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within':
            {
              outline: 'none',
            },
          '& .MuiDataGrid-columnHeader:focus-within': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
        }),
      },
    },
  },
});

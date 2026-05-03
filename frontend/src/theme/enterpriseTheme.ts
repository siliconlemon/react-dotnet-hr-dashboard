import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type { PaletteMode } from '@mui/material';
import { csCZ, enUS } from '@mui/material/locale';
import { alpha, createTheme, type Theme } from '@mui/material/styles';
import type { Locale } from '../i18n';
import { EMPLOYEE_CARD_ACCENTS } from './employeeCardPalette';

/**
 * Symmetric depth (`0 0` blur only) so surfaces don’t read as directional cast shadows next to
 * {@link ambientHalo}.
 */
const paperLift = '0 0 10px rgba(25, 79, 130, 0.055)';
const paperLiftRaised = '0 0 16px rgba(25, 79, 130, 0.075)';

/** Shared chrome weight: papers, dividers, drawer edge, fields, outlined buttons. */
const CONTROL_OUTLINE = '2px';

/**
 * Omnidirectional primary tint only (`0 0` blur — no offsets). Two soft layers read clearly
 * without mimicking a cast shadow.
 */
function ambientHalo(theme: Theme): string {
  const main = theme.palette.primary.main;
  const strong = theme.palette.mode === 'dark' ? 0.09 : 0.058;
  const soft = theme.palette.mode === 'dark' ? 0.045 : 0.028;
  return [
    `0 0 18px ${alpha(main, strong)}`,
    `0 0 36px ${alpha(main, soft)}`,
  ].join(', ');
}

function modalLift(theme: Theme): string {
  return theme.palette.mode === 'dark'
    ? '0 0 28px rgba(0, 0, 0, 0.5)'
    : '0 0 22px rgba(25, 79, 130, 0.12)';
}

function paperChrome(
  theme: Theme,
  depthShadow?: string,
): { border: string; boxShadow: string; backgroundImage: string } {
  const shadow = depthShadow
    ? `${depthShadow}, ${ambientHalo(theme)}`
    : ambientHalo(theme);
  return {
    border: `${CONTROL_OUTLINE} solid ${theme.palette.divider}`,
    boxShadow: shadow,
    backgroundImage: 'none',
  };
}

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

const LIGHT_PAPER = '#ffffff';

/** Brand: navy `#194f82` / sky `#56ace0` swap by mode (see `primary`), gold `#ffc10d` (`warning`). */
const lightPalette = {
  mode: 'light' as const,
  primary: {
    /** Navy — default interactive color on light surfaces (high contrast). */
    main: '#194f82',
    /** Sky blue — lighter ramp step for chips / selection tint. */
    light: '#56ace0',
    dark: '#123d63',
    contrastText: '#ffffff',
  },
  secondary: {
    /** Steel blue between primary and navy — secondary actions / chips without competing with CTAs. */
    main: '#4a7bad',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ffc10d',
    light: '#fff4cc',
    dark: '#d9a000',
    contrastText: '#1a2433',
  },
  background: {
    default: '#edf2f8',
    paper: LIGHT_PAPER,
  },
  /** Align MUI X Data Grid canvas with {@link background.paper} (default dark mix differs). */
  DataGrid: {
    bg: LIGHT_PAPER,
  },
  text: {
    /** Navy-tinted body copy for contrast without pure black. */
    primary: '#152a45',
    secondary: '#5a6b7d',
  },
  divider: 'rgba(25, 79, 130, 0.12)',
};

const DARK_PAPER = '#161f2e';

const darkPalette = {
  mode: 'dark' as const,
  primary: {
    /** Sky blue — reads clearly on dark surfaces without heavy navy fills. */
    main: '#56ace0',
    light: '#8ec5eb',
    dark: '#194f82',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#8fabbf',
    contrastText: '#0c1520',
  },
  warning: {
    main: '#ffc10d',
    light: '#ffe066',
    dark: '#d9a000',
    contrastText: '#1a2433',
  },
  background: {
    default: '#0f1825',
    paper: DARK_PAPER,
  },
  DataGrid: {
    bg: DARK_PAPER,
  },
  text: {
    primary: '#e8eef5',
    secondary: '#9eb0c4',
  },
  divider: 'rgba(143, 171, 191, 0.16)',
};

/** Scrollbar thumb/track + `color-scheme` value aligned with the active palette (root + nested scrollers). */
function baselineScrollbarChrome(theme: Theme) {
  const isDark = theme.palette.mode === 'dark';
  const thumb = isDark
    ? alpha(theme.palette.common.white, 0.28)
    : alpha(theme.palette.common.black, 0.35);
  const thumbHover = isDark
    ? alpha(theme.palette.common.white, 0.42)
    : alpha(theme.palette.common.black, 0.5);
  const track = theme.palette.background.default;
  return { thumb, thumbHover, track };
}

/**
 * Compact enterprise theme: navy primary in light mode, sky primary in dark mode; gold warnings;
 * cool blue-gray surfaces (light) or navy-tinted dark surfaces.
 */
export function createEnterpriseTheme(mode: PaletteMode = 'light', uiLocale: Locale = 'en') {
  const materialLocale = uiLocale === 'cs' ? csCZ : enUS;

  return createTheme({
    employeeCard: {
      accents: EMPLOYEE_CARD_ACCENTS,
    },
    palette: mode === 'light' ? lightPalette : darkPalette,
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
      button: {
        fontWeight: FW.semibold,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      },
      h1: { fontSize: '1.5rem', fontWeight: FW.semibold },
      h2: {
        fontSize: '1.25rem',
        fontWeight: FW.semibold,
      },
      h3: { fontSize: '1.1rem', fontWeight: FW.semibold },
      subtitle1: { fontWeight: FW.regular },
      subtitle2: { fontWeight: FW.semibold },
    },
    components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: ({ theme }: { theme: Theme }) => {
          const { thumb, track } = baselineScrollbarChrome(theme);
          return {
            /** `color-scheme` is set on the DOM in ColorModeProvider (Chromium relies on it reliably). */
            scrollbarColor: `${thumb} ${track}`,
            scrollbarWidth: 'thin',
          };
        },
        body: ({ theme }: { theme: Theme }) => {
          const { thumb, track } = baselineScrollbarChrome(theme);
          return {
            backgroundColor: theme.palette.background.default,
            scrollbarColor: `${thumb} ${track}`,
            scrollbarWidth: 'thin',
          };
        },
        '*': ({ theme }: { theme: Theme }) => {
          const { thumb, thumbHover, track } = baselineScrollbarChrome(theme);
          return {
            scrollbarWidth: 'thin',
            scrollbarColor: `${thumb} ${track}`,
            '&::-webkit-scrollbar': {
              width: 10,
              height: 10,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: track,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: thumb,
              borderRadius: 5,
              border: `2px solid ${track}`,
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: thumbHover,
            },
          };
        },
      },
    },
    MuiButton: {
      defaultProps: { size: 'medium', disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          fontWeight: theme.typography.fontWeightMedium,
          /** Match `TextField` / `OutlinedInput` `size="small"` control height (~40px). */
          minHeight: 40,
        }),
        outlined: {
          borderWidth: CONTROL_OUTLINE,
          '&:hover': { borderWidth: CONTROL_OUTLINE },
          '&:active': { borderWidth: CONTROL_OUTLINE },
          '&:focus-visible': { borderWidth: CONTROL_OUTLINE },
          '&.Mui-disabled': { borderWidth: CONTROL_OUTLINE },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `${CONTROL_OUTLINE} solid ${theme.palette.divider}`,
          '&.Mui-disabled': {
            border: `${CONTROL_OUTLINE} solid ${theme.palette.action.disabledBackground}`,
          },
        }),
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          '&:not(.MuiToggleButtonGroup-vertical) .MuiToggleButtonGroup-middleButton, &:not(.MuiToggleButtonGroup-vertical) .MuiToggleButtonGroup-lastButton':
            {
              marginLeft: '-2px',
              borderLeft: '2px solid transparent',
            },
          '&.MuiToggleButtonGroup-vertical .MuiToggleButtonGroup-middleButton, &.MuiToggleButtonGroup-vertical .MuiToggleButtonGroup-lastButton':
            {
              marginTop: '-2px',
              borderTop: '2px solid transparent',
            },
        },
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
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.palette.divider,
          '&:not(.MuiDivider-vertical)': {
            borderBottomWidth: CONTROL_OUTLINE,
          },
          '&.MuiDivider-vertical': {
            borderBottomWidth: 0,
            borderRightWidth: CONTROL_OUTLINE,
          },
        }),
      },
    },
    /** Permanent/temporary drawer panel — match divider weight on the outer edge. */
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRight: `${CONTROL_OUTLINE} solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation0: ({ theme }) => paperChrome(theme),
        elevation1: ({ theme }) => paperChrome(theme, paperLift),
        elevation2: ({ theme }) => paperChrome(theme, paperLiftRaised),
        elevation3: ({ theme }) => paperChrome(theme, paperLiftRaised),
        outlined: ({ theme }) => ({
          borderWidth: CONTROL_OUTLINE,
          boxShadow: ambientHalo(theme),
        }),
      },
    },
    /** Same outline weight as `OutlinedInput` / buttons — pickers use this root. */
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderWidth: CONTROL_OUTLINE,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderWidth: CONTROL_OUTLINE,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: CONTROL_OUTLINE,
          },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            borderWidth: CONTROL_OUTLINE,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderWidth: CONTROL_OUTLINE,
          },
        },
      },
    },
    /** Date/time fields — separate root from `MuiOutlinedInput`; keep outline weight aligned. */
    MuiPickersOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiPickersOutlinedInput-notchedOutline': {
            borderWidth: CONTROL_OUTLINE,
          },
          '&:hover .MuiPickersOutlinedInput-notchedOutline': {
            borderWidth: CONTROL_OUTLINE,
          },
          '&.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
            borderWidth: CONTROL_OUTLINE,
          },
          '&.Mui-disabled .MuiPickersOutlinedInput-notchedOutline': {
            borderWidth: CONTROL_OUTLINE,
          },
          '&.Mui-error .MuiPickersOutlinedInput-notchedOutline': {
            borderWidth: CONTROL_OUTLINE,
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'default' },
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `${CONTROL_OUTLINE} solid`,
          borderColor: theme.palette.divider,
          boxShadow: ambientHalo(theme),
          // AppBar uses `Paper` elevation0 (`paperChrome` = border on all sides). The permanent drawer
          // paper already has `borderRight`; without this, the seam beside the rail reads as a double-weight line.
          [theme.breakpoints.up('md')]: {
            borderLeft: 'none',
          },
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => paperChrome(theme, modalLift(theme)),
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
          overflow: 'hidden',
          ...paperChrome(theme, paperLiftRaised),
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
          /**
           * Toolbar: title stays left; columns / filter / quick filter cluster on the right.
           * (MUI default gives the label `flex: 1`, which eats horizontal space.)
           */
          '& .MuiDataGrid-toolbarContainer': {
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: theme.spacing(1),
            justifyContent: 'flex-start',
            width: '100%',
          },
          '& .MuiDataGrid-toolbarLabel': {
            ...theme.typography.h2,
            flex: '0 1 auto',
          },
          '& .MuiDataGrid-toolbarLabel + *': {
            marginLeft: 'auto',
          },
          /**
           * Collapsed quick filter should only use the trigger width (`--trigger-width`), not a
           * wide min-width — otherwise empty space remains beside the icon.
           */
          '& .MuiDataGrid-toolbarQuickFilter': {
            flex: '0 0 auto',
            minWidth: 0,
            maxWidth: 400,
          },
        }),
      },
    },
  },
}, materialLocale);
}

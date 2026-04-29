import { createTheme } from '@mui/material/styles';
import { EMPLOYEE_CARD_ACCENTS } from './employeeCardPalette';

const paperShadow = '0 1px 2px rgba(15, 31, 53, 0.08)';
const paperShadowRaised = '0 2px 8px rgba(15, 31, 53, 0.1)';

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
    h1: { fontSize: '1.5rem', fontWeight: 600 },
    h2: { fontSize: '1.25rem', fontWeight: 600 },
    h3: { fontSize: '1.1rem', fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
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
      defaultProps: { size: 'small', disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500 },
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
  },
});

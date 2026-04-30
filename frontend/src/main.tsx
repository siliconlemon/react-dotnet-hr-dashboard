import { CssBaseline, ThemeProvider } from '@mui/material';
import { enUS } from '@mui/x-date-pickers/locales';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { enterpriseTheme } from './theme/enterpriseTheme';

const pickersLocaleText = {
  ...enUS.components.MuiLocalizationProvider.defaultProps.localeText,
  /** Prefer numeric month hint over letter placeholders (avoids "MMM" style hints). */
  fieldMonthPlaceholder: () => 'MM',
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={enterpriseTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} localeText={pickersLocaleText}>
        <CssBaseline />
        <App />
      </LocalizationProvider>
    </ThemeProvider>
  </StrictMode>,
);

import { CssBaseline, ThemeProvider } from '@mui/material';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppWithPickers } from './AppWithPickers';
import './index.css';
import { LocaleProvider } from './i18n/LocaleProvider';
import { enterpriseTheme } from './theme/enterpriseTheme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={enterpriseTheme}>
      <LocaleProvider>
        <CssBaseline />
        <AppWithPickers />
      </LocaleProvider>
    </ThemeProvider>
  </StrictMode>,
);

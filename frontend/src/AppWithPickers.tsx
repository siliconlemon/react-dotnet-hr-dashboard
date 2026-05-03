import { csCZ, enUS } from '@mui/x-date-pickers/locales';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { useLocale } from './i18n/useLocale';

export function AppWithPickers() {
  const { locale } = useLocale();

  const pickersLocaleText = useMemo(
    () => ({
      ...(locale === 'cs'
        ? csCZ.components.MuiLocalizationProvider.defaultProps.localeText
        : enUS.components.MuiLocalizationProvider.defaultProps.localeText),
      fieldMonthPlaceholder: () => 'MM',
    }),
    [locale],
  );

  return (
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterDayjs} localeText={pickersLocaleText}>
        <App />
      </LocalizationProvider>
    </BrowserRouter>
  );
}

import { csCZ, enUS } from '@mui/x-data-grid/locales';
import { useMemo } from 'react';
import { useLocale } from './useLocale';

/** MUI X Data Grid strings (`noRowsLabel`, filter panel, toolbar, etc.) aligned with app locale. */
export function useDataGridLocaleText() {
  const { locale } = useLocale();
  return useMemo(
    () => (locale === 'cs' ? csCZ : enUS).components.MuiDataGrid.defaultProps.localeText,
    [locale],
  );
}

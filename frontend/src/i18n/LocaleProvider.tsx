import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { applyLocale, readStoredLocale, type Locale } from './index';
import { LocaleContext } from './localeContext';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(() => readStoredLocale());

  const setLocale = useCallback((next: Locale) => {
    applyLocale(next);
    setLocaleState(next);
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

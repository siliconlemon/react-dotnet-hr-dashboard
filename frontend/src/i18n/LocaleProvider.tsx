import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { applyLocale, messagesByLocale, readStoredLocale, type Locale } from './index';
import type { EnMessages } from './locales/en';
import { LocaleContext } from './localeContext';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(() => readStoredLocale());

  const setLocale = useCallback((next: Locale) => {
    applyLocale(next);
    setLocaleState(next);
  }, []);

  const strings = useMemo((): EnMessages => messagesByLocale[locale], [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, strings }),
    [locale, setLocale, strings],
  );

  useLayoutEffect(() => {
    document.documentElement.lang = locale === 'cs' ? 'cs' : 'en';
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

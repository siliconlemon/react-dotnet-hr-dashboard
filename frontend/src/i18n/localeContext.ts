import { createContext } from 'react';
import type { Locale } from './index';
import type { EnMessages } from './locales/en';

export type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  /** Message bundle for {@link locale}; prefer this in React components over the module-level `strings` export. */
  strings: EnMessages;
};

export const LocaleContext = createContext<LocaleContextValue | null>(null);

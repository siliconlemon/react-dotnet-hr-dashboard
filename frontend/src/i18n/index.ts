import { en } from './locales/en';

export type { EnMessages } from './locales/en';

/** Active locale id; wire to user preference or URL when you add more locales. */
export type Locale = 'en';

export const defaultLocale: Locale = 'en';

/** Resolved message bundle for {@link defaultLocale}. */
export const strings = en;

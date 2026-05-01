import dayjs from 'dayjs';
import { cs } from './locales/cs';
import { en } from './locales/en';
import type { EnMessages } from './locales/en';

export type { EnMessages };

export type Locale = 'en' | 'cs';

export const defaultLocale: Locale = 'en';

export const LOCALE_STORAGE_KEY = 'hr-dashboard-locale';

export function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  try {
    const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (raw === 'en' || raw === 'cs') return raw;
  } catch {
    /* ignore */
  }
  return defaultLocale;
}

export const messagesByLocale = { en, cs } as const;

/**
 * Active UI locale for formatting (dates, pickers). Updated by {@link applyLocale} and on load from storage.
 */
export let locale: Locale = defaultLocale;

/** Resolved message bundle for {@link locale}. */
export let strings: EnMessages = en;

/** Keeps {@link locale}, {@link strings}, and Day.js in sync; persists to {@link LOCALE_STORAGE_KEY}. */
export function applyLocale(next: Locale): void {
  locale = next;
  strings = messagesByLocale[next];
  dayjs.locale(next === 'cs' ? 'cs' : 'en');
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
}

function bootstrapLocale(): void {
  const initial = readStoredLocale();
  locale = initial;
  strings = messagesByLocale[initial];
  dayjs.locale(initial === 'cs' ? 'cs' : 'en');
}

bootstrapLocale();

function pickerDateFormat(forLocale: Locale): string {
  return forLocale === 'cs' ? 'DD.MM.YYYY' : 'YYYY-MM-DD';
}

function calendarMonthFormat(forLocale: Locale): string {
  return forLocale === 'cs' ? 'MM.YYYY' : 'YYYY-MM';
}

/**
 * Day.js tokens for MUI X DatePicker — reads {@link locale} each call (cs → `DD.MM.YYYY`).
 * Use as `format={dayjsPickerDateFormat()}` so updates apply after you wire a language switcher.
 */
export function dayjsPickerDateFormat(): string {
  return pickerDateFormat(locale);
}

/** Calendar header month in pickers — numeric months for consistency with {@link formatDateOnly}. */
export function dayjsCalendarMonthFormat(): string {
  return calendarMonthFormat(locale);
}

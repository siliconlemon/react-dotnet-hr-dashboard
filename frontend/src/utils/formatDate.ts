import { locale } from '../i18n';

/**
 * Formats an ISO calendar date (YYYY-MM-DD) for display using numeric year, month, and day only.
 * Czech locale uses `dd.mm.yyyy`; English uses ISO `yyyy-mm-dd`.
 */
export function formatDateOnly(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (locale === 'cs') {
    return `${day}.${m}.${y}`;
  }
  return `${y}-${m}-${day}`;
}

/**
 * Formats an ISO date-time string for display: same calendar date as {@link formatDateOnly},
 * plus local time in 24-hour `HH:mm`.
 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  if (locale === 'cs') {
    return `${day}.${m}.${y} ${h}:${min}`;
  }
  return `${y}-${m}-${day} ${h}:${min}`;
}

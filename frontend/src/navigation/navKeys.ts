export const NAV_KEYS = ['dashboard', 'employees', 'departments', 'leave'] as const;

export type NavKey = (typeof NAV_KEYS)[number];

export function parseStoredNavKey(raw: string | null | undefined): NavKey | null {
  if (raw != null && (NAV_KEYS as readonly string[]).includes(raw)) {
    return raw as NavKey;
  }
  return null;
}

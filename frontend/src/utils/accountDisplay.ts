/** Shared display helpers for account rows (toolbar, login tray). */

export function initialsFromAccount(displayName: string, email: string): string {
  const raw = displayName.trim() || email.split('@')[0] || '?';
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase().slice(0, 2);
  }
  return raw.slice(0, 2).toUpperCase();
}

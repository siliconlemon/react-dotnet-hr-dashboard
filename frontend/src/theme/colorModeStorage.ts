import type { PaletteMode } from '@mui/material';

export const COLOR_MODE_STORAGE_KEY = 'hr-dashboard-color-mode';

export function readStoredColorMode(): PaletteMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const raw = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    if (raw === 'light' || raw === 'dark') return raw;
  } catch {
    /* ignore */
  }
  return 'light';
}

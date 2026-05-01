import type { PaletteMode } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { createEnterpriseTheme } from './enterpriseTheme';

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

export type ColorModeContextValue = {
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
};

export const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<PaletteMode>(() => readStoredColorMode());

  const setMode = useCallback((next: PaletteMode) => {
    try {
      window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setModeState(next);
  }, []);

  const theme = useMemo(() => createEnterpriseTheme(mode), [mode]);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}

import type { PaletteMode } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import {
  createContext,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocale } from '../i18n/useLocale';
import { createEnterpriseTheme } from './enterpriseTheme';

export const COLOR_MODE_STORAGE_KEY = 'hr-dashboard-color-mode';

/**
 * Chromium uses the document's used `color-scheme` for native overlay scrollbars. Setting it on
 * the DOM (not only via MUI/Emotion) keeps light/dark scrollbars in sync with the app palette.
 */
function applyDocumentColorScheme(mode: PaletteMode) {
  if (typeof document === 'undefined') return;
  const scheme = mode === 'dark' ? 'dark' : 'light';
  document.documentElement.style.setProperty('color-scheme', scheme);
  if (document.body) {
    document.body.style.setProperty('color-scheme', scheme);
  }
}

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
  const { locale } = useLocale();
  const [mode, setModeState] = useState<PaletteMode>(() => readStoredColorMode());

  const setMode = useCallback((next: PaletteMode) => {
    try {
      window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setModeState(next);
  }, []);

  const theme = useMemo(() => createEnterpriseTheme(mode, locale), [mode, locale]);

  useLayoutEffect(() => {
    applyDocumentColorScheme(mode);
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}

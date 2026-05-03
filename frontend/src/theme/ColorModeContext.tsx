import type { PaletteMode } from '@mui/material';
import { createContext } from 'react';

export type ColorModeContextValue = {
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
};

export const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

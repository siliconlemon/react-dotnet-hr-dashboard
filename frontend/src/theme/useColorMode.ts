import { useContext } from 'react';
import { ColorModeContext } from './ColorModeContext';

export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (ctx === undefined) {
    throw new Error('useColorMode must be used within ColorModeProvider');
  }
  return ctx;
}

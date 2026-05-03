import { CssBaseline } from '@mui/material';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './auth/AuthContext';
import { AppWithPickers } from './AppWithPickers';
import './index.css';
import { LocaleProvider } from './i18n/LocaleProvider';
import { ColorModeProvider } from './theme/ColorModeProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <ColorModeProvider>
        <AuthProvider>
          <CssBaseline />
          <AppWithPickers />
        </AuthProvider>
      </ColorModeProvider>
    </LocaleProvider>
  </StrictMode>,
);

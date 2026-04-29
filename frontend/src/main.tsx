import { CssBaseline, ThemeProvider } from '@mui/material';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { enterpriseTheme } from './theme/enterpriseTheme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={enterpriseTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);

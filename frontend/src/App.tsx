import { Paper, Typography } from '@mui/material';
import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { strings } from './i18n';

function App() {
  useEffect(() => {
    document.title = strings.app.documentTitle;
  }, []);

  return (
    <AppShell>
      <Paper sx={{ p: 2 }} variant="outlined">
        <Typography variant="h2" gutterBottom>
          {strings.dashboard.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {strings.dashboard.placeholder}
        </Typography>
      </Paper>
    </AppShell>
  );
}

export default App;

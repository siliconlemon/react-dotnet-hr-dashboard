import { Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { EmployeesView } from './components/employees/EmployeesView';
import { AppShell, type NavKey } from './components/layout/AppShell';
import { strings } from './i18n';

function App() {
  const [navKey, setNavKey] = useState<NavKey>('dashboard');

  useEffect(() => {
    document.title = strings.app.documentTitle;
  }, []);

  return (
    <AppShell activeNavKey={navKey} onNavKeyChange={setNavKey}>
      {navKey === 'employees' ? (
        <EmployeesView />
      ) : (
        <Paper sx={{ p: 2 }} variant="outlined">
          <Typography variant="h2" gutterBottom>
            {navKey === 'dashboard' ? strings.dashboard.title : strings.nav.departments}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {strings.dashboard.placeholder}
          </Typography>
        </Paper>
      )}
    </AppShell>
  );
}

export default App;

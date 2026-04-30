import { Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { DepartmentsView } from './components/departments/DepartmentsView';
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
      ) : navKey === 'departments' ? (
        <DepartmentsView />
      ) : (
        <Paper sx={{ p: 2 }} variant="outlined">
          <Typography variant="h2" gutterBottom>
            {strings.dashboard.title}
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

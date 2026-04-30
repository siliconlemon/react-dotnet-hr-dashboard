import { Box, Paper, Typography } from '@mui/material';
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
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
      <AppShell activeNavKey={navKey} onNavKeyChange={setNavKey}>
        {navKey === 'employees' ? (
          <EmployeesView />
        ) : navKey === 'departments' ? (
          <DepartmentsView />
        ) : (
          <Paper sx={{ p: 2, my: 1 }} variant="outlined">
            <Typography variant="h2" gutterBottom>
              {strings.dashboard.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {strings.dashboard.placeholder}
            </Typography>
          </Paper>
        )}
      </AppShell>
    </Box>
  );
}

export default App;

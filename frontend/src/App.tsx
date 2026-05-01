import { Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardView } from './components/dashboard/DashboardView';
import { DepartmentsView } from './components/departments/DepartmentsView';
import { EmployeesView, type EmployeesViewTab } from './components/employees/EmployeesView';
import { AppShell, type NavKey } from './components/layout/AppShell';
import { LeaveManagementView } from './components/leave/LeaveManagementView';
import { strings } from './i18n';

function navLabel(key: NavKey): string {
  switch (key) {
    case 'dashboard':
      return strings.nav.dashboard;
    case 'employees':
      return strings.nav.employees;
    case 'departments':
      return strings.nav.departments;
    case 'leave':
      return strings.nav.leave;
  }
}

function employeesTabLabel(tab: EmployeesViewTab): string {
  switch (tab) {
    case 'directory':
      return strings.employees.tabDirectory;
    case 'onboard':
      return strings.employees.tabOnboard;
    case 'edit':
      return strings.employees.tabEdit;
    case 'remove':
      return strings.employees.tabRemove;
  }
}

function App() {
  const [navKey, setNavKey] = useState<NavKey>('dashboard');
  const [employeesViewTab, setEmployeesViewTab] = useState<EmployeesViewTab>('directory');

  useEffect(() => {
    document.title = strings.app.documentTitle;
  }, []);

  useEffect(() => {
    if (navKey !== 'employees') {
      setEmployeesViewTab('directory');
    }
  }, [navKey]);

  const breadcrumbItems = useMemo(() => {
    const items: string[] = [navLabel(navKey)];
    if (navKey === 'employees') {
      items.push(employeesTabLabel(employeesViewTab));
    }
    return items;
  }, [navKey, employeesViewTab]);

  const handleEmployeesViewTabChange = useCallback((tab: EmployeesViewTab) => {
    setEmployeesViewTab(tab);
  }, []);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
      <AppShell
        activeNavKey={navKey}
        onNavKeyChange={setNavKey}
        breadcrumbItems={breadcrumbItems}
      >
        {navKey === 'employees' ? (
          <EmployeesView onViewTabChange={handleEmployeesViewTabChange} />
        ) : navKey === 'departments' ? (
          <DepartmentsView />
        ) : navKey === 'leave' ? (
          <LeaveManagementView />
        ) : (
          <DashboardView />
        )}
      </AppShell>
    </Box>
  );
}

export default App;

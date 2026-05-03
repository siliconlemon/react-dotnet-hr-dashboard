import { Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardView } from './components/dashboard/DashboardView';
import { DepartmentsView } from './components/departments/DepartmentsView';
import { EmployeesView, type EmployeesViewTab } from './components/employees/EmployeesView';
import { AppShell, type NavKey } from './components/layout/AppShell';
import {
  LeaveManagementView,
  type LeaveManagementViewTab,
} from './components/leave/LeaveManagementView';
import { strings } from './i18n';
import { useLocale } from './i18n/useLocale';

const NAV_STORAGE_KEY = 'hr-dashboard-nav';

function readStoredNavKey(): NavKey {
  if (typeof window === 'undefined') return 'dashboard';
  try {
    const raw = window.localStorage.getItem(NAV_STORAGE_KEY);
    if (raw === 'dashboard' || raw === 'employees' || raw === 'departments' || raw === 'leave') {
      return raw;
    }
  } catch {
    /* ignore quota / private mode */
  }
  return 'dashboard';
}

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

function leaveTabLabel(tab: LeaveManagementViewTab): string {
  switch (tab) {
    case 'ledger':
      return strings.leave.tabLedger;
    case 'calendar':
      return strings.leave.tabCalendar;
  }
}

function App() {
  const { locale } = useLocale();
  const [navKey, setNavKey] = useState<NavKey>(readStoredNavKey);
  const [employeesViewTab, setEmployeesViewTab] = useState<EmployeesViewTab>('directory');
  const [leaveViewTab, setLeaveViewTab] = useState<LeaveManagementViewTab>('ledger');

  useEffect(() => {
    document.title = strings.app.documentTitle;
  }, [locale]);

  useEffect(() => {
    try {
      window.localStorage.setItem(NAV_STORAGE_KEY, navKey);
    } catch {
      /* ignore */
    }
  }, [navKey]);

  const breadcrumbItems = useMemo(() => {
    void locale;
    const items: string[] = [navLabel(navKey)];
    if (navKey === 'employees') {
      items.push(employeesTabLabel(employeesViewTab));
    }
    if (navKey === 'leave') {
      items.push(leaveTabLabel(leaveViewTab));
    }
    return items;
  }, [locale, navKey, employeesViewTab, leaveViewTab]);

  const handleNavKeyChange = useCallback((key: NavKey) => {
    setNavKey(key);
    if (key !== 'employees') {
      setEmployeesViewTab('directory');
    }
    if (key !== 'leave') {
      setLeaveViewTab('ledger');
    }
  }, []);

  const handleEmployeesViewTabChange = useCallback((tab: EmployeesViewTab) => {
    setEmployeesViewTab(tab);
  }, []);

  const handleLeaveViewTabChange = useCallback((tab: LeaveManagementViewTab) => {
    setLeaveViewTab(tab);
  }, []);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
      <AppShell
        activeNavKey={navKey}
        onNavKeyChange={handleNavKeyChange}
        breadcrumbItems={breadcrumbItems}
      >
        {navKey === 'employees' ? (
          <EmployeesView onViewTabChange={handleEmployeesViewTabChange} />
        ) : navKey === 'departments' ? (
          <DepartmentsView />
        ) : navKey === 'leave' ? (
          <LeaveManagementView onViewTabChange={handleLeaveViewTabChange} />
        ) : (
          <DashboardView />
        )}
      </AppShell>
    </Box>
  );
}

export default App;

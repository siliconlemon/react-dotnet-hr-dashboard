import { Box, CircularProgress } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { patchAccountSettings } from './api/accountApi';
import { useAuth } from './auth/AuthContext';
import { LoginView } from './components/auth/LoginView';
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
import { useColorMode } from './theme/useColorMode';

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
    case 'lookup':
      return strings.leave.tabLookup;
  }
}

export default function App() {
  const { status, user, replaceUser } = useAuth();
  const { mode } = useColorMode();
  const { locale } = useLocale();

  const [navKey, setNavKey] = useState<NavKey>(readStoredNavKey);
  const [employeesViewTab, setEmployeesViewTab] = useState<EmployeesViewTab>('directory');
  const [leaveViewTab, setLeaveViewTab] = useState<LeaveManagementViewTab>('ledger');

  const hydratedUserIdRef = useRef<number | null>(null);
  const [leavePreferencesReady, setLeavePreferencesReady] = useState(false);

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

  useEffect(() => {
    if (status !== 'authenticated') {
      hydratedUserIdRef.current = null;
      setLeavePreferencesReady(false);
    }
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated' || !user) {
      return;
    }
    if (hydratedUserIdRef.current === user.id) {
      return;
    }
    hydratedUserIdRef.current = user.id;
    const s = user.settings;
    setLeaveViewTab(
      s.leaveManagementTab === 'lookup' || s.leaveManagementTab === 'calendar' ? 'lookup' : 'ledger',
    );
    setLeavePreferencesReady(true);
  }, [status, user]);

  useEffect(() => {
    if (status !== 'authenticated' || !user || !leavePreferencesReady) {
      return;
    }
    const cur = user.settings;
    const themeStr = mode === 'dark' ? 'dark' : 'light';
    if (cur.theme === themeStr && cur.uiLocale === locale && cur.leaveManagementTab === leaveViewTab) {
      return;
    }

    const handle = window.setTimeout(() => {
      void patchAccountSettings({
        theme: themeStr,
        uiLocale: locale,
        leaveManagementTab: leaveViewTab,
      })
        .then(replaceUser)
        .catch(() => {});
    }, 450);

    return () => window.clearTimeout(handle);
  }, [
    status,
    user,
    leavePreferencesReady,
    mode,
    locale,
    leaveViewTab,
    replaceUser,
  ]);

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
  }, []);

  const handleEmployeesViewTabChange = useCallback((tab: EmployeesViewTab) => {
    setEmployeesViewTab(tab);
  }, []);

  const handleLeaveViewTabChange = useCallback((tab: LeaveManagementViewTab) => {
    setLeaveViewTab(tab);
  }, []);

  if (status === 'loading') {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%',
          width: '100%',
        }}
      >
        <CircularProgress aria-label={strings.auth.loadingSession} />
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    return <LoginView />;
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
      <AppShell activeNavKey={navKey} onNavKeyChange={handleNavKeyChange} breadcrumbItems={breadcrumbItems}>
        {navKey === 'employees' ? (
          <EmployeesView onViewTabChange={handleEmployeesViewTabChange} />
        ) : navKey === 'departments' ? (
          <DepartmentsView />
        ) : navKey === 'leave' ? (
          <LeaveManagementView viewTab={leaveViewTab} onViewTabChange={handleLeaveViewTabChange} />
        ) : (
          <DashboardView />
        )}
      </AppShell>
    </Box>
  );
}

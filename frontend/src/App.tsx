import { Box, CircularProgress } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { patchAccountSettings } from './api/accountApi';
import { useAuth } from './auth/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { DepartmentsView } from './components/departments/DepartmentsView';
import type { EmployeesViewTab } from './components/employees/EmployeesView';
import { AppShell } from './components/layout/AppShell';
import type { LeaveManagementViewTab } from './components/leave/LeaveManagementView';
import {
  employeesTabFromPathname,
  leaveTabFromPathname,
  navKeyFromPathname,
} from './navigation/appPaths';
import type { NavKey } from './navigation/navKeys';
import { EmployeesSection, LeaveSection } from './navigation/routedSections';
import { strings } from './i18n';
import { useLocale } from './i18n/useLocale';
import { useColorMode } from './theme/useColorMode';

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

function AuthenticatedApp() {
  const { user, replaceUser } = useAuth();
  const { mode } = useColorMode();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navKey = useMemo(() => navKeyFromPathname(pathname), [pathname]);

  const breadcrumbItems = useMemo(() => {
    void locale;
    const items: string[] = [navLabel(navKey)];
    if (navKey === 'employees') {
      items.push(employeesTabLabel(employeesTabFromPathname(pathname)));
    }
    if (navKey === 'leave') {
      items.push(leaveTabLabel(leaveTabFromPathname(pathname)));
    }
    return items;
  }, [locale, pathname, navKey]);

  const leaveTabForPersistence = useMemo((): LeaveManagementViewTab => {
    if (pathname.startsWith('/leave')) {
      return leaveTabFromPathname(pathname);
    }
    const s = user?.settings.leaveManagementTab;
    return s === 'lookup' || s === 'calendar' ? 'lookup' : 'ledger';
  }, [pathname, user?.settings.leaveManagementTab]);

  useEffect(() => {
    document.title = strings.app.documentTitle;
  }, [locale]);

  useEffect(() => {
    if (!user) {
      return;
    }
    const cur = user.settings;
    const themeStr = mode === 'dark' ? 'dark' : 'light';
    if (
      cur.theme === themeStr &&
      cur.uiLocale === locale &&
      cur.leaveManagementTab === leaveTabForPersistence
    ) {
      return;
    }

    const handle = window.setTimeout(() => {
      void patchAccountSettings({
        theme: themeStr,
        uiLocale: locale,
        leaveManagementTab: leaveTabForPersistence,
      })
        .then(replaceUser)
        .catch(() => {});
    }, 450);

    return () => window.clearTimeout(handle);
  }, [user, mode, locale, leaveTabForPersistence, replaceUser]);

  const handleNavKeyChange = useCallback(
    (key: NavKey) => {
      switch (key) {
        case 'dashboard':
          navigate('/dashboard');
          return;
        case 'employees':
          navigate('/employees');
          return;
        case 'departments':
          navigate('/departments');
          return;
        case 'leave': {
          const pref = user?.settings.leaveManagementTab;
          const tab = pref === 'lookup' || pref === 'calendar' ? 'lookup' : 'ledger';
          navigate(tab === 'lookup' ? '/leave/lookup' : '/leave');
          return;
        }
        default: {
          const _exhaustive: never = key;
          return _exhaustive;
        }
      }
    },
    [navigate, user?.settings.leaveManagementTab],
  );

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
      <AppShell activeNavKey={navKey} onNavKeyChange={handleNavKeyChange} breadcrumbItems={breadcrumbItems}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/employees" element={<EmployeesSection />} />
          <Route path="/employees/:tab" element={<EmployeesSection />} />
          <Route path="/departments" element={<DepartmentsView />} />
          <Route path="/leave" element={<LeaveSection />} />
          <Route path="/leave/:tab" element={<LeaveSection />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppShell>
    </Box>
  );
}

export default function App() {
  const { status } = useAuth();
  const { locale } = useLocale();

  useEffect(() => {
    document.title = strings.app.documentTitle;
  }, [locale]);

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

  return <AuthenticatedApp />;
}

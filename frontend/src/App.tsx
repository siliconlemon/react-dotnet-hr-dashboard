import { Box, CircularProgress } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { patchAccountSettings } from './api/accountApi';
import { useAuth } from './auth/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { DepartmentsView } from './components/departments/DepartmentsView';
import { AppShell } from './components/layout/AppShell';
import {
  employeesTabFromPathname,
  leaveTabFromPathname,
  navKeyFromPathname,
} from './navigation/appPaths';
import type { NavKey } from './navigation/navKeys';
import type { EmployeesViewTab, LeaveManagementViewTab } from './navigation/viewTabs';
import { EmployeesSection, LeaveSection } from './navigation/routedSections';
import type { EnMessages } from './i18n/locales/en';
import { useLocale } from './i18n/useLocale';
import { useColorMode } from './theme/useColorMode';

function navLabel(key: NavKey, s: EnMessages): string {
  switch (key) {
    case 'dashboard':
      return s.nav.dashboard;
    case 'employees':
      return s.nav.employees;
    case 'departments':
      return s.nav.departments;
    case 'leave':
      return s.nav.leave;
  }
}

function employeesTabLabel(tab: EmployeesViewTab, s: EnMessages): string {
  switch (tab) {
    case 'directory':
      return s.employees.tabDirectory;
    case 'onboard':
      return s.employees.tabOnboard;
    case 'edit':
      return s.employees.tabEdit;
    case 'remove':
      return s.employees.tabRemove;
  }
}

function leaveTabLabel(tab: LeaveManagementViewTab, s: EnMessages): string {
  switch (tab) {
    case 'ledger':
      return s.leave.tabLedger;
    case 'lookup':
      return s.leave.tabLookup;
  }
}

function AuthenticatedApp() {
  const { user, replaceUser } = useAuth();
  const { mode } = useColorMode();
  const { locale, strings } = useLocale();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navKey = useMemo(() => navKeyFromPathname(pathname), [pathname]);

  const breadcrumbItems = useMemo(() => {
    const items: string[] = [navLabel(navKey, strings)];
    if (navKey === 'employees') {
      items.push(employeesTabLabel(employeesTabFromPathname(pathname), strings));
    }
    if (navKey === 'leave') {
      items.push(leaveTabLabel(leaveTabFromPathname(pathname), strings));
    }
    return items;
  }, [strings, pathname, navKey]);

  const leaveTabForPersistence = useMemo((): LeaveManagementViewTab => {
    if (pathname.startsWith('/leave')) {
      return leaveTabFromPathname(pathname);
    }
    const s = user?.settings.leaveManagementTab;
    return s === 'lookup' || s === 'calendar' ? 'lookup' : 'ledger';
  }, [pathname, user?.settings.leaveManagementTab]);

  useEffect(() => {
    document.title = strings.app.formatDocumentTitle(breadcrumbItems);
  }, [strings.app.formatDocumentTitle, breadcrumbItems]);

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
  const { strings } = useLocale();

  useEffect(() => {
    if (status === 'authenticated') {
      return;
    }
    if (status === 'loading') {
      document.title = strings.app.formatDocumentTitle([]);
      return;
    }
    document.title = strings.app.formatDocumentTitle([strings.auth.loginTitle]);
  }, [status, strings.app.formatDocumentTitle, strings.auth.loginTitle]);

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

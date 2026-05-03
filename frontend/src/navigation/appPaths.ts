import type { NavKey } from './navKeys';
import type { EmployeesViewTab, LeaveManagementViewTab } from './viewTabs';

/** Valid URL segments after `/employees/` (directory uses `/employees` only). */
export function parseEmployeesTabSegment(raw: string): EmployeesViewTab | null {
  if (raw === 'onboard' || raw === 'edit' || raw === 'remove') {
    return raw;
  }
  return null;
}

export function employeesPath(tab: EmployeesViewTab): string {
  if (tab === 'directory') return '/employees';
  return `/employees/${tab}`;
}

export function leavePath(tab: LeaveManagementViewTab): string {
  return tab === 'lookup' ? '/leave/lookup' : '/leave';
}

export function navKeyFromPathname(pathname: string): NavKey {
  if (pathname.startsWith('/employees')) return 'employees';
  if (pathname.startsWith('/departments')) return 'departments';
  if (pathname.startsWith('/leave')) return 'leave';
  return 'dashboard';
}

export function employeesTabFromPathname(pathname: string): EmployeesViewTab {
  const m = pathname.match(/^\/employees\/([^/]+)$/);
  if (!m) return 'directory';
  const parsed = parseEmployeesTabSegment(m[1]);
  return parsed ?? 'directory';
}

export function leaveTabFromPathname(pathname: string): LeaveManagementViewTab {
  return pathname === '/leave/lookup' ? 'lookup' : 'ledger';
}

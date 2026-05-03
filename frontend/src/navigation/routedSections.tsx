import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { EmployeesView, type EmployeesViewTab } from '../components/employees/EmployeesView';
import { LeaveManagementView, type LeaveManagementViewTab } from '../components/leave/LeaveManagementView';
import { employeesPath, leavePath, parseEmployeesTabSegment } from './appPaths';

export function EmployeesSection() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  if (tab === 'directory') {
    return <Navigate to="/employees" replace />;
  }

  let viewTab: EmployeesViewTab = 'directory';
  if (tab !== undefined) {
    const parsed = parseEmployeesTabSegment(tab);
    if (parsed === null) {
      return <Navigate to="/employees" replace />;
    }
    viewTab = parsed;
  }

  return (
    <EmployeesView
      viewTab={viewTab}
      onViewTabChange={(next) => {
        void navigate(employeesPath(next));
      }}
    />
  );
}

export function LeaveSection() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  if (tab != null && tab !== 'lookup') {
    return <Navigate to="/leave" replace />;
  }

  const viewTab: LeaveManagementViewTab = tab === 'lookup' ? 'lookup' : 'ledger';

  return (
    <LeaveManagementView
      viewTab={viewTab}
      onViewTabChange={(next) => {
        void navigate(leavePath(next));
      }}
    />
  );
}

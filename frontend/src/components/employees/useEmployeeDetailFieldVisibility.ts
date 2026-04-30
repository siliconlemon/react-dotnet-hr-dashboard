import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_EMPLOYEE_DETAIL_FIELD_VISIBILITY,
  ensureProfileFieldsVisible,
  ensurePtoFieldsVisible,
  mergeEmployeeDetailFieldVisibility,
  type EmployeeDetailFieldVisibility,
  type EmployeeProfileFieldId,
  type EmployeePtoFieldId,
} from './employeeDetailFields';

const STORAGE_KEY = 'hr-dashboard-employee-detail-fields';

function readStored(): EmployeeDetailFieldVisibility {
  if (typeof window === 'undefined') {
    return DEFAULT_EMPLOYEE_DETAIL_FIELD_VISIBILITY;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EMPLOYEE_DETAIL_FIELD_VISIBILITY;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_EMPLOYEE_DETAIL_FIELD_VISIBILITY;
    }
    return mergeEmployeeDetailFieldVisibility(parsed as Partial<EmployeeDetailFieldVisibility>);
  } catch {
    return DEFAULT_EMPLOYEE_DETAIL_FIELD_VISIBILITY;
  }
}

export function useEmployeeDetailFieldVisibility() {
  const [visibility, setVisibility] = useState<EmployeeDetailFieldVisibility>(() =>
    readStored(),
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility));
    } catch {
      /* ignore quota / private mode */
    }
  }, [visibility]);

  const setProfileField = useCallback((id: EmployeeProfileFieldId, value: boolean) => {
    setVisibility((prev) => ({
      ...prev,
      profile: ensureProfileFieldsVisible({ ...prev.profile, [id]: value }),
    }));
  }, []);

  const setPtoField = useCallback((id: EmployeePtoFieldId, value: boolean) => {
    setVisibility((prev) => ({
      ...prev,
      pto: ensurePtoFieldsVisible({ ...prev.pto, [id]: value }),
    }));
  }, []);

  const setProfileVisibility = useCallback((next: Record<EmployeeProfileFieldId, boolean>) => {
    setVisibility((prev) => ({
      ...prev,
      profile: ensureProfileFieldsVisible(next),
    }));
  }, []);

  const setPtoVisibility = useCallback((next: Record<EmployeePtoFieldId, boolean>) => {
    setVisibility((prev) => ({
      ...prev,
      pto: ensurePtoFieldsVisible(next),
    }));
  }, []);

  const resetProfile = useCallback(() => {
    setVisibility((prev) => ({
      ...prev,
      profile: { ...DEFAULT_EMPLOYEE_DETAIL_FIELD_VISIBILITY.profile },
    }));
  }, []);

  const resetPto = useCallback(() => {
    setVisibility((prev) => ({
      ...prev,
      pto: { ...DEFAULT_EMPLOYEE_DETAIL_FIELD_VISIBILITY.pto },
    }));
  }, []);

  return useMemo(
    () => ({
      visibility,
      setProfileField,
      setPtoField,
      setProfileVisibility,
      setPtoVisibility,
      resetProfile,
      resetPto,
    }),
    [
      visibility,
      setProfileField,
      setPtoField,
      setProfileVisibility,
      setPtoVisibility,
      resetProfile,
      resetPto,
    ],
  );
}

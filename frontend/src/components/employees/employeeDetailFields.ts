/** Profile tab field keys for detail cards and the fields picker. */
export const EMPLOYEE_PROFILE_FIELD_IDS = [
  'email',
  'jobTitle',
  'department',
  'hireDate',
] as const;

export type EmployeeProfileFieldId = (typeof EMPLOYEE_PROFILE_FIELD_IDS)[number];

/** PTO tab field keys for detail cards and the fields picker. */
export const EMPLOYEE_PTO_FIELD_IDS = [
  'calendarYear',
  'asOf',
  'annualEntitlement',
  'accrued',
  'used',
  'pending',
  'available',
] as const;

export type EmployeePtoFieldId = (typeof EMPLOYEE_PTO_FIELD_IDS)[number];

export type EmployeeDetailFieldVisibility = {
  profile: Record<EmployeeProfileFieldId, boolean>;
  pto: Record<EmployeePtoFieldId, boolean>;
};

function allTrue<K extends string>(ids: readonly K[]): Record<K, boolean> {
  return Object.fromEntries(ids.map((id) => [id, true])) as Record<K, boolean>;
}

export const DEFAULT_EMPLOYEE_DETAIL_FIELD_VISIBILITY: EmployeeDetailFieldVisibility = {
  profile: allTrue(EMPLOYEE_PROFILE_FIELD_IDS),
  pto: allTrue(EMPLOYEE_PTO_FIELD_IDS),
};

/** Email is always shown on profile detail cards (picker locks it on). */
export function ensureProfileFieldsVisible(
  profile: Record<EmployeeProfileFieldId, boolean>,
): Record<EmployeeProfileFieldId, boolean> {
  return { ...profile, email: true };
}

/** Available balance is always shown on PTO detail cards (picker locks it on). */
export function ensurePtoFieldsVisible(
  pto: Record<EmployeePtoFieldId, boolean>,
): Record<EmployeePtoFieldId, boolean> {
  return { ...pto, available: true };
}

export function mergeEmployeeDetailFieldVisibility(
  partial: Partial<EmployeeDetailFieldVisibility> | null | undefined,
): EmployeeDetailFieldVisibility {
  const base = DEFAULT_EMPLOYEE_DETAIL_FIELD_VISIBILITY;
  if (!partial) return base;

  const profile = { ...base.profile };
  for (const id of EMPLOYEE_PROFILE_FIELD_IDS) {
    if (typeof partial.profile?.[id] === 'boolean') {
      profile[id] = partial.profile[id]!;
    }
  }

  const pto = { ...base.pto };
  for (const id of EMPLOYEE_PTO_FIELD_IDS) {
    if (typeof partial.pto?.[id] === 'boolean') {
      pto[id] = partial.pto[id]!;
    }
  }

  return {
    profile: ensureProfileFieldsVisible(profile),
    pto: ensurePtoFieldsVisible(pto),
  };
}

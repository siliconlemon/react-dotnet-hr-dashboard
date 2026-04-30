/** Profile tab field keys for detail cards and the fields picker. */
export const EMPLOYEE_PROFILE_FIELD_IDS = [
  'email',
  'jobTitle',
  'department',
  'hireDate',
  'identifiers',
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

  return { profile, pto };
}

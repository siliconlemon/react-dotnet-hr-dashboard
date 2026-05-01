/**
 * Accent tokens for department-grouped UI (Departments matrix + employee detail cards).
 * Mirrors {@link enterpriseTheme} via theme augmentation.
 */
export type EmployeeCardAccent = {
  border: string;
  headerBg: string;
  nameColor: string;
};

export const EMPLOYEE_CARD_ACCENTS: readonly EmployeeCardAccent[] = [
  { border: '#56ace0', headerBg: '#e8f4fc', nameColor: '#194f82' },
  { border: '#2e7d32', headerBg: '#e8f5e9', nameColor: '#1b5e20' },
  { border: '#6a1b9a', headerBg: '#f3e5f5', nameColor: '#4a148c' },
  { border: '#455a64', headerBg: '#eceff1', nameColor: '#263238' },
  { border: '#ef6c00', headerBg: '#fff3e0', nameColor: '#e65100' },
  { border: '#00838f', headerBg: '#e0f7fa', nameColor: '#006064' },
  { border: '#283593', headerBg: '#e8eaf6', nameColor: '#1a237e' },
  { border: '#558b2f', headerBg: '#f1f8e9', nameColor: '#33691e' },
];

/** Index into {@link EMPLOYEE_CARD_ACCENTS} for DataGrid row class names (stable per department). */
export function getDepartmentAccentIndex(departmentId: number): number {
  const n = EMPLOYEE_CARD_ACCENTS.length;
  return (Math.abs(departmentId) * 13 + 7) % n;
}

/** Same palette as employee cards; groups department parent + child rows by department id. */
export function getDepartmentAccent(departmentId: number): EmployeeCardAccent {
  return EMPLOYEE_CARD_ACCENTS[getDepartmentAccentIndex(departmentId)]!;
}

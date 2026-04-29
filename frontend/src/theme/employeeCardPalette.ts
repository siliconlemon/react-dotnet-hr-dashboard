/**
 * Accent tokens for selected-employee summary cards (directory).
 * Used by detail cards; mirrors {@link enterpriseTheme} via theme augmentation.
 */
export type EmployeeCardAccent = {
  border: string;
  headerBg: string;
  nameColor: string;
};

export const EMPLOYEE_CARD_ACCENTS: readonly EmployeeCardAccent[] = [
  { border: '#1565c0', headerBg: '#e3f2fd', nameColor: '#0d47a1' },
  { border: '#2e7d32', headerBg: '#e8f5e9', nameColor: '#1b5e20' },
  { border: '#6a1b9a', headerBg: '#f3e5f5', nameColor: '#4a148c' },
  { border: '#455a64', headerBg: '#eceff1', nameColor: '#263238' },
  { border: '#ef6c00', headerBg: '#fff3e0', nameColor: '#e65100' },
  { border: '#00838f', headerBg: '#e0f7fa', nameColor: '#006064' },
  { border: '#283593', headerBg: '#e8eaf6', nameColor: '#1a237e' },
  { border: '#558b2f', headerBg: '#f1f8e9', nameColor: '#33691e' },
];

/** Stable accent for an employee id (same id → same colors across views). */
export function getEmployeeCardAccent(employeeId: number): EmployeeCardAccent {
  const n = EMPLOYEE_CARD_ACCENTS.length;
  const i = (Math.abs(employeeId) * 7 + 3) % n;
  return EMPLOYEE_CARD_ACCENTS[i]!;
}

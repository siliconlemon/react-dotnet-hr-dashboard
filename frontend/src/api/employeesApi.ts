import type { EmployeeReadDto, PtoBalanceDto } from './types';

const jsonHeaders = { Accept: 'application/json' } as const;

/**
 * Loads all employees (list endpoint returns full collection; grid paginates client-side).
 */
export async function fetchEmployees(signal?: AbortSignal): Promise<EmployeeReadDto[]> {
  const res = await fetch('/api/employees', { headers: jsonHeaders, signal });
  if (!res.ok) {
    throw new Error('employees_fetch_failed');
  }
  return res.json() as Promise<EmployeeReadDto[]>;
}

/**
 * PTO snapshot for the calendar year of the as-of date (optional; server defaults to today UTC).
 */
export async function fetchPtoBalance(
  employeeId: number,
  signal?: AbortSignal,
  asOf?: string,
): Promise<PtoBalanceDto> {
  const qs = asOf ? `?asOf=${encodeURIComponent(asOf)}` : '';
  const res = await fetch(`/api/employees/${employeeId}/pto-balance${qs}`, {
    headers: jsonHeaders,
    signal,
  });
  if (res.status === 404) {
    throw new Error('employee_not_found');
  }
  if (!res.ok) {
    throw new Error('pto_fetch_failed');
  }
  return res.json() as Promise<PtoBalanceDto>;
}

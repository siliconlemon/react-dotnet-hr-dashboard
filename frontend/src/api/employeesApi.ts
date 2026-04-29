import type { EmployeeCreateDto, EmployeeReadDto, PtoBalanceDto } from './types';

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
 * Creates an employee; returns the persisted row. Throws on validation or conflict (see message).
 */
export async function createEmployee(
  body: EmployeeCreateDto,
  signal?: AbortSignal,
): Promise<EmployeeReadDto> {
  const res = await fetch('/api/employees', {
    method: 'POST',
    headers: { ...jsonHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (res.status === 201) {
    return res.json() as Promise<EmployeeReadDto>;
  }
  const text = (await res.text()).trim();
  const err = new Error(text || 'employee_create_failed') as Error & { status: number };
  err.status = res.status;
  throw err;
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

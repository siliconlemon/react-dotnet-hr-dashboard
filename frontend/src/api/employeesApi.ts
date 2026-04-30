import type {
  EmployeeCreateDto,
  EmployeeReadDto,
  EmployeeUpdateDto,
  PtoBalanceDto,
} from './types';

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
 * Replaces an employee (PUT). Throws on validation, conflict, or missing row (see message / status).
 */
export async function updateEmployee(
  id: number,
  body: EmployeeUpdateDto,
  signal?: AbortSignal,
): Promise<EmployeeReadDto> {
  const res = await fetch(`/api/employees/${id}`, {
    method: 'PUT',
    headers: { ...jsonHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (res.status === 200) {
    return res.json() as Promise<EmployeeReadDto>;
  }
  const text = (await res.text()).trim();
  const err = new Error(text || 'employee_update_failed') as Error & { status: number };
  err.status = res.status;
  throw err;
}

/**
 * Deletes an employee and related leave requests. Throws if not found.
 */
export async function deleteEmployee(id: number, signal?: AbortSignal): Promise<void> {
  const res = await fetch(`/api/employees/${id}`, { method: 'DELETE', signal });
  if (res.status === 204) {
    return;
  }
  const text = (await res.text()).trim();
  const err = new Error(text || 'employee_delete_failed') as Error & { status: number };
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

import type { DepartmentReadDto } from './types';

const jsonHeaders = { Accept: 'application/json' } as const;

/**
 * Loads departments for selects (sorted by name on the server).
 */
export async function fetchDepartments(signal?: AbortSignal): Promise<DepartmentReadDto[]> {
  const res = await fetch('/api/departments', { headers: jsonHeaders, signal });
  if (!res.ok) {
    throw new Error('departments_fetch_failed');
  }
  return res.json() as Promise<DepartmentReadDto[]>;
}

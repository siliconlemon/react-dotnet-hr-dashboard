import { apiFetch } from './http';
import type { DepartmentPtoMatrixResponseDto, DepartmentReadDto } from './types';

const jsonHeaders = { Accept: 'application/json' } as const;

/**
 * Loads departments for selects (sorted by name on the server).
 */
export async function fetchDepartments(signal?: AbortSignal): Promise<DepartmentReadDto[]> {
  const res = await apiFetch('/api/departments', { headers: jsonHeaders, signal });
  if (!res.ok) {
    throw new Error('departments_fetch_failed');
  }
  return res.json() as Promise<DepartmentReadDto[]>;
}

/**
 * Department rollups and nested employee PTO rows (same rules as single-employee PTO balance).
 */
export async function fetchDepartmentPtoMatrix(
  asOfIso?: string,
  signal?: AbortSignal,
): Promise<DepartmentPtoMatrixResponseDto> {
  const qs = asOfIso ? `?asOf=${encodeURIComponent(asOfIso)}` : '';
  const res = await apiFetch(`/api/departments/pto-matrix${qs}`, { headers: jsonHeaders, signal });
  if (!res.ok) {
    throw new Error('department_pto_matrix_failed');
  }
  return res.json() as Promise<DepartmentPtoMatrixResponseDto>;
}

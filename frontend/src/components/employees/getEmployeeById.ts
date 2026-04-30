import type { EmployeeReadDto } from '../../api/types';

/** Resolves a row from the list; uses numeric id comparison so grid / JSON id types stay in sync. */
export function getEmployeeById(
  employees: EmployeeReadDto[],
  id: number | '',
): EmployeeReadDto | undefined {
  if (id === '') return undefined;
  const n = Number(id);
  if (Number.isNaN(n)) return undefined;
  return employees.find((e) => Number(e.id) === n);
}

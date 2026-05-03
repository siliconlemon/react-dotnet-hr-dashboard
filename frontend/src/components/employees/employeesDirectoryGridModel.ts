import type {
  GridFilterItem,
  GridFilterModel,
  GridRowSelectionModel,
} from '@mui/x-data-grid';
import type { EmployeeReadDto } from '../../api/types';

/** Resolves MUI Data Grid row ids (include / exclude selection semantics). */
export function effectiveSelectedRowIds(
  rows: EmployeeReadDto[],
  model: GridRowSelectionModel,
): number[] {
  const rowIds = rows.map((r) => r.id);
  if (model.type === 'exclude') {
    const excluded = new Set(
      Array.from(model.ids, (id) => Number(id)).filter((n) => !Number.isNaN(n)),
    );
    return rowIds.filter((id) => !excluded.has(id));
  }
  return Array.from(model.ids, (id) => Number(id)).filter((n) => !Number.isNaN(n));
}

export const NAME_COLUMN_FIELD = 'fullName';

export function hasActiveQuickFilter(model: GridFilterModel): boolean {
  const vals = model.quickFilterValues;
  if (!vals?.length) return false;
  return vals.some((v) => String(v ?? '').trim().length > 0);
}

export function isActiveColumnFilterItem(item: GridFilterItem): boolean {
  if (!item.field) return false;
  const op = item.operator;
  if (op === 'isEmpty' || op === 'isNotEmpty') return true;
  const v = item.value;
  if (v == null) return false;
  if (typeof v === 'string' && v.trim() === '') return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
}

export function activeColumnFilterFields(model: GridFilterModel): Set<string> {
  const set = new Set<string>();
  for (const item of model.items ?? []) {
    if (isActiveColumnFilterItem(item)) set.add(item.field);
  }
  return set;
}

/** Name is never hideable; while quick filter is on, no column may be hidden; column filters lock their fields. */
export function employeeColumnHideable(
  field: string,
  hasQuickFilter: boolean,
  filteredFields: Set<string>,
): boolean {
  if (field === NAME_COLUMN_FIELD) return false;
  if (hasQuickFilter) return false;
  if (filteredFields.has(field)) return false;
  return true;
}

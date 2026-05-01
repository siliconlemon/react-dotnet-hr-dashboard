/**
 * Mirrors {@link HrDashboard.Api.Contracts.DepartmentReadDto}.
 */
export type DepartmentReadDto = {
  id: number;
  name: string;
};

/**
 * Mirrors {@link HrDashboard.Api.Contracts.EmployeeCreateDto}; JSON uses camelCase.
 */
export type EmployeeCreateDto = {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  hireDate: string;
  departmentId: number;
};

/**
 * Mirrors {@link HrDashboard.Api.Contracts.EmployeeUpdateDto}; same shape as create (full replace).
 */
export type EmployeeUpdateDto = EmployeeCreateDto;

/**
 * Mirrors {@link HrDashboard.Api.Contracts.EmployeeReadDto}; JSON uses camelCase.
 */
export type EmployeeReadDto = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  hireDate: string;
  departmentId: number;
  departmentName: string;
};

/**
 * Mirrors {@link HrDashboard.Api.Contracts.PtoBalanceDto}.
 */
export type PtoBalanceDto = {
  employeeId: number;
  calendarYear: number;
  asOfDate: string;
  annualEntitlementDays: number;
  accruedDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
};

/** Mirrors {@link HrDashboard.Api.Contracts.PtoRollupDto}. */
export type PtoRollupDto = {
  annualEntitlementDays: number;
  accruedDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
};

/** Mirrors {@link HrDashboard.Api.Contracts.EmployeePtoMatrixRowDto}. */
export type EmployeePtoMatrixRowDto = {
  employeeId: number;
  firstName: string;
  lastName: string;
  balance: PtoBalanceDto;
};

/** Mirrors {@link HrDashboard.Api.Contracts.DepartmentPtoMatrixItemDto}. */
export type DepartmentPtoMatrixItemDto = {
  departmentId: number;
  name: string;
  headcount: number;
  rollup: PtoRollupDto;
  employees: EmployeePtoMatrixRowDto[];
};

/** Mirrors {@link HrDashboard.Api.Contracts.DepartmentPtoMatrixResponseDto}. */
export type DepartmentPtoMatrixResponseDto = {
  calendarYear: number;
  asOfDate: string;
  departments: DepartmentPtoMatrixItemDto[];
};

/** Mirrors {@link HrDashboard.Api.Entities.PtoLedgerEntryType} (camelCase JSON enum). */
export type PtoLedgerEntryTypeDto = 'accrual' | 'usage' | 'adjustment';

/** Mirrors {@link HrDashboard.Api.Contracts.PtoLedgerEntryReadDto}. */
export type PtoLedgerEntryReadDto = {
  id: number;
  employeeId: number;
  employeeFirstName: string;
  employeeLastName: string;
  /** Present when API returns employee email (omit on older backends). */
  employeeEmail?: string;
  departmentId: number;
  departmentName: string;
  entryType: PtoLedgerEntryTypeDto;
  amount: number;
  effectiveDate: string;
  note: string | null;
  createdAt: string;
  createdBy: string | null;
  batchId: string | null;
};

/** Mirrors {@link HrDashboard.Api.Contracts.PtoLedgerPageDto}. */
export type PtoLedgerPageDto = {
  items: PtoLedgerEntryReadDto[];
  totalCount: number;
};

/** Mirrors {@link HrDashboard.Api.Contracts.PtoLedgerCreateDto}. */
export type PtoLedgerCreateDto = {
  scope: 'employee' | 'department';
  employeeId?: number | null;
  departmentId?: number | null;
  entryType: PtoLedgerEntryTypeDto;
  amount: number;
  effectiveDate: string;
  note?: string | null;
};

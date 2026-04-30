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

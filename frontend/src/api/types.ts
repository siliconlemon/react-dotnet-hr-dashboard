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

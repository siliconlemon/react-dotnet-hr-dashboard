import type { DepartmentPtoMatrixResponseDto } from '../../api/types';

/** Employees with fewer available days than this count toward the “low balance” KPI. */
export const LOW_BALANCE_THRESHOLD_DAYS = 5;

/** “Over three weeks” = more than this many available workdays (5-day weeks). */
export const HIGH_BALANCE_THRESHOLD_DAYS = 15;

/** Highest/lowest available balance; `tiedNames` lists everyone at that value (sorted). */
export type BalanceSpotlight = {
  primaryName: string;
  availableDays: number;
  tiedNames: readonly string[];
};

export type DepartmentHeadcount = {
  name: string;
  count: number;
};

export type WorkforceKpis = {
  calendarYear: number;
  asOfDate: string;
  totalEmployees: number;
  departmentCount: number;
  departmentsByHeadcount: DepartmentHeadcount[];
  meanAvailableDays: number | null;
  meanAccruedDays: number | null;
  meanUsedDays: number | null;
  highestAvailable: BalanceSpotlight | null;
  lowestAvailable: BalanceSpotlight | null;
  belowThresholdCount: number;
  /** Sorted names of employees with available PTO strictly below the low-balance day threshold. */
  belowThresholdNames: readonly string[];
  aboveHighThresholdCount: number;
  /** Sorted names of employees with available PTO strictly above the high-balance day threshold. */
  aboveHighThresholdNames: readonly string[];
};

/**
 * Derives workforce-wide KPIs from the department PTO matrix (same rules as Directory PTO).
 */
export function buildWorkforceKpis(matrix: DepartmentPtoMatrixResponseDto): WorkforceKpis {
  const departments = matrix.departments;
  const employees = departments.flatMap((d) =>
    d.employees.map((e) => ({
      fullName: `${e.firstName} ${e.lastName}`.trim(),
      balance: e.balance,
    })),
  );

  const availableList = employees.map((e) => e.balance.availableDays);
  const accruedList = employees.map((e) => e.balance.accruedDays);
  const usedList = employees.map((e) => e.balance.usedDays);

  const n = employees.length;
  const meanOf = (arr: number[]) => (n === 0 ? null : arr.reduce((a, b) => a + b, 0) / n);

  let highestAvailable: BalanceSpotlight | null = null;
  let lowestAvailable: BalanceSpotlight | null = null;
  if (n > 0) {
    let maxVal = employees[0].balance.availableDays;
    let minVal = employees[0].balance.availableDays;
    for (let i = 1; i < employees.length; i++) {
      const v = employees[i].balance.availableDays;
      if (v > maxVal) maxVal = v;
      if (v < minVal) minVal = v;
    }
    const tiedMax = employees
      .filter((e) => e.balance.availableDays === maxVal)
      .map((e) => e.fullName)
      .sort((a, b) => a.localeCompare(b));
    const tiedMin = employees
      .filter((e) => e.balance.availableDays === minVal)
      .map((e) => e.fullName)
      .sort((a, b) => a.localeCompare(b));
    highestAvailable = {
      primaryName: tiedMax[0],
      availableDays: maxVal,
      tiedNames: tiedMax,
    };
    lowestAvailable = {
      primaryName: tiedMin[0],
      availableDays: minVal,
      tiedNames: tiedMin,
    };
  }

  const belowThresholdNames = employees
    .filter((e) => e.balance.availableDays < LOW_BALANCE_THRESHOLD_DAYS)
    .map((e) => e.fullName)
    .sort((a, b) => a.localeCompare(b));
  const belowThresholdCount = belowThresholdNames.length;

  const aboveHighThresholdNames = employees
    .filter((e) => e.balance.availableDays > HIGH_BALANCE_THRESHOLD_DAYS)
    .map((e) => e.fullName)
    .sort((a, b) => a.localeCompare(b));
  const aboveHighThresholdCount = aboveHighThresholdNames.length;

  const departmentsByHeadcount = [...departments]
    .map((d) => ({ name: d.name, count: d.headcount }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    calendarYear: matrix.calendarYear,
    asOfDate: matrix.asOfDate,
    totalEmployees: n,
    departmentCount: departments.length,
    departmentsByHeadcount,
    meanAvailableDays: meanOf(availableList),
    meanAccruedDays: meanOf(accruedList),
    meanUsedDays: meanOf(usedList),
    highestAvailable,
    lowestAvailable,
    belowThresholdCount,
    belowThresholdNames,
    aboveHighThresholdCount,
    aboveHighThresholdNames,
  };
}

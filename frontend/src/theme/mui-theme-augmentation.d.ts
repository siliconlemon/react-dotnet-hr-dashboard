import type { EmployeeCardAccent } from './employeeCardPalette';

declare module '@mui/material/styles' {
  interface Theme {
    employeeCard: {
      accents: readonly EmployeeCardAccent[];
    };
  }
  interface ThemeOptions {
    employeeCard?: Theme['employeeCard'];
  }
}

export {};

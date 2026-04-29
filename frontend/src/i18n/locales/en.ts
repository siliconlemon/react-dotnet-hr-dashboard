/**
 * English UI strings. Add other locale files alongside this and switch in `../index.ts`.
 */
export const en = {
  app: {
    documentTitle: 'HR Dashboard',
    shellTitle: 'HR Dashboard',
  },
  nav: {
    listAriaLabel: 'Main',
    dashboard: 'Dashboard',
    employees: 'Employees',
    departments: 'Departments',
    drawerTitle: 'Navigation',
  },
  shell: {
    brandShort: 'HR',
    brandFull: 'Acme HR',
    expandSidebar: 'Expand sidebar',
    collapseSidebar: 'Collapse sidebar',
    openMenu: 'Open navigation menu',
  },
  dashboard: {
    title: 'Dashboard',
    placeholder: 'Employee list and forms will connect here in later phases.',
  },
  employees: {
    title: 'Employees',
    subtitle: 'Select a row to view profile and PTO. Sort columns and use the grid footer for pagination.',
    listError: 'Could not load employees. Is the API running?',
    colName: 'Name',
    colEmail: 'Email',
    colJobTitle: 'Job title',
    colDepartment: 'Department',
    colHireDate: 'Hire date',
    detailTitle: 'Details',
    selectPrompt: 'Select an employee in the table above.',
    tabProfile: 'Profile',
    tabPto: 'PTO balance',
    fieldName: 'Name',
    fieldEmail: 'Email',
    fieldJobTitle: 'Job title',
    fieldDepartment: 'Department',
    fieldHireDate: 'Hire date',
    fieldIds: 'Identifiers',
    idLinePrefix: 'Employee #',
    idLineMid: ' · Department ID ',
    ptoLoading: 'Loading PTO…',
    ptoError: 'Could not load PTO balance.',
    ptoYear: 'Calendar year',
    ptoAsOf: 'As of',
    ptoAnnual: 'Annual entitlement (days)',
    ptoAccrued: 'Accrued (days)',
    ptoUsed: 'Used (days)',
    ptoPending: 'Pending (days)',
    ptoAvailable: 'Available (days)',
  },
} as const;

export type EnMessages = typeof en;

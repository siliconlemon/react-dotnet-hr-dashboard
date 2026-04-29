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
} as const;

export type EnMessages = typeof en;

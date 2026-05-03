import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Shared column header wash and compact footer/pagination styling for feature DataGrids
 * (employees directory, leave ledger).
 */
export const dataGridShellSx: SxProps<Theme> = {
  '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover' },
  '& .MuiDataGrid-footerContainer': {
    minHeight: 47,
    height: 47,
    maxHeight: 47,
    alignItems: 'center',
    py: 0,
    pl: 0.5,
    pr: 0,
    boxSizing: 'border-box',
  },
  '& .MuiDataGrid-footerContainer .MuiTablePagination-root': { py: 0, minHeight: 35 },
  '& .MuiDataGrid-footerContainer .MuiTablePagination-toolbar': {
    minHeight: 35,
    height: 35,
    alignItems: 'center',
    py: 0,
  },
};

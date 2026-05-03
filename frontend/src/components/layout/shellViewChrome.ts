import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Applied to the primary tab strip on views whose root is tabs directly under the shell breadcrumb bar.
 * Pulls the strip up one spacing step (~8px) so it sits tighter under the bar.
 */
export const shellTopTabStripSx: SxProps<Theme> = {
  mt: -1,
};

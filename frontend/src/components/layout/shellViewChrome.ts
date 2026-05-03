import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Applied to the primary tab strip on views whose root is tabs directly under the shell breadcrumb bar.
 * Pulls the strip up one spacing step (~8px) so it sits tighter under the bar.
 */
export const shellTopTabStripSx: SxProps<Theme> = {
  mt: -1,
};

/** Tabs row directly under the app breadcrumb: tighter top + divider aligned with shell chrome. */
export const shellUnderBarTabsSx: SxProps<Theme> = {
  ...shellTopTabStripSx,
  borderBottom: 1,
  borderColor: 'divider',
  flexShrink: 0,
};

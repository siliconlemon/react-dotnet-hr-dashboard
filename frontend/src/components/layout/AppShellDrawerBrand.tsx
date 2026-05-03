import { Box, IconButton, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { FAVICON_URL } from '../../constants/faviconUrl';
import {
  DRAWER_BRAND_ICON_BUTTON_SX,
  DRAWER_FAVICON_PX,
  NAV_TITLE_STRONG_SX,
} from './appShellConstants';

export function DrawerBrandFaviconImg() {
  return (
    <Box
      component="img"
      src={FAVICON_URL}
      alt=""
      aria-hidden
      sx={{
        width: DRAWER_FAVICON_PX,
        height: DRAWER_FAVICON_PX,
        display: 'block',
      }}
    />
  );
}

/**
 * Brand row: icon + title + optional trailing control in one flex row.
 * Title uses `flex: 1` + `minWidth: 0` so it truncates against the trailing slot. Avoid a stretched
 * empty band between name and control (that read as “padding growing” when the drawer widened).
 */
export function DrawerTitleRow({ title, endSlot }: { title: string; endSlot?: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
        minWidth: 0,
      }}
    >
      <IconButton
        component="span"
        size="small"
        disableRipple
        tabIndex={-1}
        aria-hidden
        sx={{
          ...DRAWER_BRAND_ICON_BUTTON_SX,
          cursor: 'default',
          flexShrink: 0,
        }}
      >
        <DrawerBrandFaviconImg />
      </IconButton>
      <Typography
        variant="subtitle1"
        color="text.primary"
        sx={{ ...NAV_TITLE_STRONG_SX, flex: 1, minWidth: 0 }}
        noWrap
      >
        {title}
      </Typography>
      {endSlot != null ? (
        <Box component="span" sx={{ display: 'flex', flexShrink: 0 }}>
          {endSlot}
        </Box>
      ) : null}
    </Box>
  );
}

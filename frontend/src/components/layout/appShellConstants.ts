import type { Theme } from '@mui/material/styles';

export const DRAWER_EXPANDED_PX = 240;
export const DRAWER_COLLAPSED_PX = 64;
/**
 * Outer list inset (expanded, collapsed, mobile). Nav buttons use `padding: 0` and no extra horizontal inset so the
 * icon column lines up when toggling collapsed ↔ expanded (same offset: list gutter + button border).
 */
export const DRAWER_NAV_LIST_OUTER_GUTTER_SPACING = 1;
/**
 * Drawer header row horizontal inset: left uses `spacing(2)` (16px); right uses `calc(spacing(2) − 2px)` when expanded
 * so the brand favicon alignment stays consistent when toggling width; right inset may be tighter when collapsed so the
 * control still fits in `DRAWER_COLLAPSED_PX`. Drawer `Toolbar` uses `disableGutters`.
 */
export const drawerToolbarInsetX = (theme: Theme) => `calc(${theme.spacing(2)} - 2px)`;
/** Favicon in drawer header: same size expanded, collapsed rail, and mobile. */
export const DRAWER_FAVICON_PX = 28;

/** Single row height for nav items in expanded drawer (collapsed uses the same for the square touch target). */
export const NAV_ITEM_MIN_HEIGHT_PX = 44;
/** Icon slot: centered in the row; collapsed mode uses a fixed square button this tall/wide. */
export const NAV_ICON_SLOT_PX = 40;
/** Match `fontSize="small"` on nav SvgIcons: lock size so dense rows + flex don’t shrink glyphs when labels appear. */
export const NAV_SVG_ICON_PX = 20;

/** Strong nav title: matches breadcrumb current-page segment (`subtitle1` + weight + line height). */
export const NAV_TITLE_STRONG_SX = {
  fontWeight: 600,
  lineHeight: 1.3,
} as const;

/** Same slot as collapsed rail: small IconButton + `p: 1` (not a plain Box; IconButton has fixed min size). */
export const DRAWER_BRAND_ICON_BUTTON_SX = { p: 1 } as const;

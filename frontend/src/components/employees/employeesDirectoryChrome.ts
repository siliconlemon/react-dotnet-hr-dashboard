/** Directory detail panel: full overlay, split view, or one-line bar. */
export type DetailPanelTier = 'expanded' | 'normal' | 'collapsed';

export type EmployeeDirectoryDetailTab = 'profile' | 'pto';

export const SPLIT_MIN = 0.2;
export const SPLIT_MAX = 0.78;
export const SPLIT_DEFAULT = 0.48;

export const DETAIL_COLLAPSED_PX = 48;

/** Matches split gutter: splitter `py: 0.75` + 1px line + `py: 0.75` ≈ 13px at default spacing. */
export const DETAIL_PANEL_COLLAPSED_TOP_GAP = 1.625;

export const detailPanelHeaderRowSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  flexShrink: 0,
  pl: 2.75,
  pr: 2.25,
  py: 1,
  borderBottom: 1,
  borderColor: 'divider' as const,
};

export const detailPanelTitleTypographySx = {
  fontWeight: 600,
  fontSize: '20px',
  lineHeight: 1.2,
  minWidth: 0,
  mt: -0.25,
};

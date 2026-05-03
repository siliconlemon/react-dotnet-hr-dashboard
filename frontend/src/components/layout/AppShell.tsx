import {
  BusinessOutlined,
  ChevronLeft,
  DashboardOutlined,
  EventNoteOutlined,
  Menu as MenuIcon,
  NavigateNext,
  PeopleOutlined,
} from '@mui/icons-material';
import { AccountToolbarMenu } from './AccountToolbarMenu';
import {
  AppBar,
  Box,
  Breadcrumbs,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMediaQuery } from '@mui/material';
import type { PaperProps } from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import type { NavKey } from '../../navigation/navKeys';
import { useLocale } from '../../i18n/useLocale';
import {
  DRAWER_BRAND_ICON_BUTTON_SX,
  DRAWER_COLLAPSED_PX,
  DRAWER_EXPANDED_PX,
  DRAWER_NAV_LIST_OUTER_GUTTER_SPACING,
  drawerToolbarInsetX,
  NAV_ICON_SLOT_PX,
  NAV_ITEM_MIN_HEIGHT_PX,
  NAV_SVG_ICON_PX,
} from './appShellConstants';
import { DrawerBrandFaviconImg, DrawerTitleRow } from './AppShellDrawerBrand';
import { DrawerLanguageSwitcher } from './DrawerLanguageSwitcher';
import { DrawerThemeSwitcher } from './DrawerThemeSwitcher';

export type { NavKey };

type AppShellProps = {
  children: React.ReactNode;
  activeNavKey: NavKey;
  onNavKeyChange: (key: NavKey) => void;
  /** Primary segment matches the drawer; optional further segments (e.g. top-level area tabs). */
  breadcrumbItems: readonly string[];
};

/**
 * Top AppBar plus collapsible navigation: mini rail when collapsed on desktop,
 * temporary drawer on small screens.
 */
export function AppShell({ children, activeNavKey, onNavKeyChange, breadcrumbItems }: AppShellProps) {
  const { strings } = useLocale();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  /**
   * Nav/header chrome stays “expanded” until the drawer `width` transition ends so labels clip with the rail.
   * When minimizing, nav labels and theme/locale trailing use the same opacity fade (half `enteringScreen`); on
   * expand (after width finishes), nav labels swipe in with translate/scale and footer trailing fades in.
   */
  const [iconRailMode, setIconRailMode] = useState(false);
  /** One-shot after expand: paint expanded chrome “hidden” then transition in (sync with footer trailing fade-in). */
  const [expandChromeRevealPending, setExpandChromeRevealPending] = useState(false);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  /** Icon-only drawer chrome: follows `collapsed` immediately when reduced motion; otherwise after width transition. */
  const drawerRailLayout = prefersReducedMotion ? collapsed : iconRailMode;

  const drawerWidth = collapsed ? DRAWER_COLLAPSED_PX : DRAWER_EXPANDED_PX;

  const collapseDesktopDrawer = () => {
    setExpandChromeRevealPending(false);
    setCollapsed(true);
  };

  const handleDesktopDrawerPaperTransitionEnd: NonNullable<PaperProps['onTransitionEnd']> = (e) => {
    if (prefersReducedMotion) return;
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== 'width') return;
    if (collapsed) {
      setExpandChromeRevealPending(false);
    }
    const wasRail = iconRailMode;
    setIconRailMode(collapsed);
    if (!collapsed && wasRail) {
      setExpandChromeRevealPending(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setExpandChromeRevealPending(false));
      });
    }
  };

  const drawerPaperTransition = theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  });

  const drawerFooterFadeMs = Math.round(theme.transitions.duration.enteringScreen / 2);
  const drawerFooterFadeTransition = prefersReducedMotion
    ? 'none'
    : theme.transitions.create('opacity', {
        easing: theme.transitions.easing.sharp,
        duration: drawerFooterFadeMs,
      });

  const navLabelRevealTransition = prefersReducedMotion
    ? 'none'
    : theme.transitions.create(['opacity', 'transform'], {
        easing: theme.transitions.easing.sharp,
        duration: drawerFooterFadeMs,
      });

  const appBarShift = theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  });

  const renderNavList = (options: { mobile: boolean }) => {
    const { mobile } = options;
    const iconOnly = !mobile && drawerRailLayout;
    const navLabelMinimizeFadeOut = !mobile && collapsed && !drawerRailLayout;
    const navLabelExpandReveal = !mobile && expandChromeRevealPending;

    const navItems: Array<{ key: NavKey; label: string; icon: React.ReactElement }> = [
      { key: 'dashboard', label: strings.nav.dashboard, icon: <DashboardOutlined fontSize="small" /> },
      { key: 'leave', label: strings.nav.leave, icon: <EventNoteOutlined fontSize="small" /> },
      { key: 'employees', label: strings.nav.employees, icon: <PeopleOutlined fontSize="small" /> },
      { key: 'departments', label: strings.nav.departments, icon: <BusinessOutlined fontSize="small" /> },
    ];

    return (
      <List
        component="nav"
        aria-label={strings.nav.listAriaLabel}
        sx={{
          pt: 1,
          px: mobile ? DRAWER_NAV_LIST_OUTER_GUTTER_SPACING : DRAWER_NAV_LIST_OUTER_GUTTER_SPACING,
          display: 'flex',
          flexDirection: 'column',
          alignItems: iconOnly ? 'flex-start' : 'stretch',
          gap: 1,
        }}
      >
        {navItems.map((item) => {
          const button = (
            <ListItemButton
              selected={item.key === activeNavKey}
              onClick={() => {
                onNavKeyChange(item.key);
                if (mobile) setMobileOpen(false);
              }}
              sx={{
                // Override MuiListItemButton dense defaults so expanded/collapsed share one horizontal icon column.
                padding: 0,
                borderRadius: `${theme.shape.borderRadius}px`,
                borderStyle: 'solid',
                borderWidth: 2,
                borderColor: 'divider',
                boxSizing: 'border-box',
                minHeight: NAV_ITEM_MIN_HEIGHT_PX,
                py: 0,
                justifyContent: iconOnly ? 'center' : 'flex-start',
                alignItems: 'center',
                fontWeight: 600,
                letterSpacing: '0.04em',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  color: 'primary.main',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                },
                ...(iconOnly && {
                  height: NAV_ITEM_MIN_HEIGHT_PX,
                  width: NAV_ITEM_MIN_HEIGHT_PX,
                  minWidth: NAV_ITEM_MIN_HEIGHT_PX,
                  maxWidth: NAV_ITEM_MIN_HEIGHT_PX,
                  maxHeight: NAV_ITEM_MIN_HEIGHT_PX,
                  alignSelf: 'flex-start',
                  flexShrink: 0,
                }),
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: NAV_ICON_SLOT_PX,
                  width: NAV_ICON_SLOT_PX,
                  height: NAV_ICON_SLOT_PX,
                  mr: iconOnly ? 0 : 0.75,
                  ml: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  flexShrink: 0,
                  color: 'inherit',
                  '& .MuiSvgIcon-root': {
                    fontSize: NAV_SVG_ICON_PX,
                    width: NAV_SVG_ICON_PX,
                    height: NAV_SVG_ICON_PX,
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!iconOnly && (
                <Box
                  sx={{
                    flex: '1 1 auto',
                    minWidth: 0,
                    ...(!mobile && {
                      opacity: navLabelMinimizeFadeOut || navLabelExpandReveal ? 0 : 1,
                      transform: navLabelExpandReveal
                        ? 'translateX(-8px) scale(0.98)'
                        : 'translateX(0) scale(1)',
                      transition: prefersReducedMotion
                        ? 'none'
                        : navLabelMinimizeFadeOut
                          ? drawerFooterFadeTransition
                          : navLabelRevealTransition,
                      transformOrigin: 'left center',
                    }),
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        variant: 'body2',
                        noWrap: true,
                        sx: { fontWeight: 600, letterSpacing: '0.04em' },
                      },
                    }}
                    sx={{ flex: '1 1 auto', minWidth: 0 }}
                  />
                </Box>
              )}
            </ListItemButton>
          );
          return (
            <Tooltip
              key={item.key}
              title={iconOnly ? item.label : ''}
              placement="right"
              arrow
              disableHoverListener={!iconOnly}
              disableFocusListener={!iconOnly}
              disableTouchListener={!iconOnly}
            >
              {button}
            </Tooltip>
          );
        })}
      </List>
    );
  };

  const desktopDrawer = (
    <Drawer
      variant="permanent"
      open
      slotProps={{
        paper: {
          onTransitionEnd: handleDesktopDrawerPaperTransitionEnd,
        },
      }}
      sx={{
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
          transition: drawerPaperTransition,
          overflowX: 'hidden',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          pb: 2,
          // Flush with app bar on the right; round TL + both bottom corners.
          borderTopLeftRadius: theme.shape.borderRadius,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: theme.shape.borderRadius,
          borderBottomRightRadius: theme.shape.borderRadius,
        },
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: 48,
          pl: 1,
          pr: drawerRailLayout ? 0.5 : drawerToolbarInsetX,
          justifyContent: drawerRailLayout ? 'flex-start' : 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {drawerRailLayout ? (
          <IconButton
            onClick={() => setCollapsed(false)}
            aria-label={strings.shell.expandSidebar}
            size="small"
            sx={DRAWER_BRAND_ICON_BUTTON_SX}
          >
            <DrawerBrandFaviconImg />
          </IconButton>
        ) : (
          <DrawerTitleRow
            title={strings.shell.brandFull}
            endSlot={
              <IconButton
                onClick={collapseDesktopDrawer}
                aria-label={strings.shell.collapseSidebar}
                size="small"
              >
                <ChevronLeft fontSize="small" />
              </IconButton>
            }
          />
        )}
      </Toolbar>
      <Divider sx={{ flexShrink: 0 }} />
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {renderNavList({ mobile: false })}
      </Box>
      <Box sx={{ px: DRAWER_NAV_LIST_OUTER_GUTTER_SPACING, flexShrink: 0, position: 'relative' }}>
        {!drawerRailLayout ? (
          <>
            <DrawerThemeSwitcher
              collapsed={false}
              mobile={false}
              trailingFade={{
                active: collapsed || expandChromeRevealPending,
                transition: drawerFooterFadeTransition,
              }}
            />
            <DrawerLanguageSwitcher
              collapsed={false}
              mobile={false}
              trailingFade={{
                active: collapsed || expandChromeRevealPending,
                transition: drawerFooterFadeTransition,
              }}
            />
          </>
        ) : (
          <>
            <DrawerThemeSwitcher collapsed mobile={false} />
            <DrawerLanguageSwitcher collapsed mobile={false} />
          </>
        )}
      </Box>
    </Drawer>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        width: '100%',
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          transition: appBarShift,
          overflow: 'hidden',
          // Beside the drawer on md+: flush left; round the outer (right) edge.
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderTopRightRadius: { md: theme.shape.borderRadius },
          borderBottomRightRadius: { md: theme.shape.borderRadius },
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            pl: { xs: 2, sm: 3 },
            pr: '10px',
          }}
        >
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 1, display: { md: 'none' } }}
            aria-label={strings.shell.openMenu}
          >
            <MenuIcon />
          </IconButton>
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" sx={{ color: 'text.disabled' }} />}
            aria-label={strings.shell.breadcrumb}
            sx={{ flex: 1, minWidth: 0 }}
          >
            {breadcrumbItems.map((label, index) => {
              const isLast = index === breadcrumbItems.length - 1;
              return (
                <Typography
                  key={`${index}-${label}`}
                  variant="subtitle1"
                  component={isLast ? 'h1' : 'span'}
                  color={isLast ? 'text.primary' : 'text.secondary'}
                  aria-current={isLast ? 'page' : undefined}
                  sx={{
                    fontWeight: 600,
                    lineHeight: 1.3,
                    ...(!isLast && { fontSize: '0.875rem' }),
                  }}
                  noWrap
                >
                  {label}
                </Typography>
              );
            })}
          </Breadcrumbs>
          <AccountToolbarMenu />
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
          transition: { md: drawerPaperTransition },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_EXPANDED_PX,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              pb: 2,
            },
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              minHeight: 48,
              px: (theme) => `calc(${theme.spacing(2)} - 2px)`,
              flexShrink: 0,
            }}
          >
            <DrawerTitleRow title={strings.nav.drawerTitle} />
          </Toolbar>
          <Divider sx={{ flexShrink: 0 }} />
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {renderNavList({ mobile: true })}
          </Box>
          <Box sx={{ px: DRAWER_NAV_LIST_OUTER_GUTTER_SPACING, flexShrink: 0 }}>
            <DrawerThemeSwitcher collapsed={false} mobile />
            <DrawerLanguageSwitcher collapsed={false} mobile />
          </Box>
        </Drawer>

        {desktopDrawer}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: 0,
          px: 2,
          pt: 2,
          pb: 2,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          transition: { md: drawerPaperTransition },
          bgcolor: 'background.default',
          boxSizing: 'border-box',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'transparent',
            /**
             * View roots often used `margin` for spacing; in a flex column fill layout that shrinks
             * the usable height and causes overflow/clipping. Shell padding handles chrome inset;
             * views should use internal padding/gap instead.
             */
            '& > *': {
              margin: '0 !important',
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

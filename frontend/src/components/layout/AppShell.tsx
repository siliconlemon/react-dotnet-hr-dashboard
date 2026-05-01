import {
  BusinessOutlined,
  ChevronLeft,
  DashboardOutlined,
  EventNoteOutlined,
  Menu as MenuIcon,
  NavigateNext,
  PeopleOutlined,
} from '@mui/icons-material';
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
import { useTheme, type Theme } from '@mui/material/styles';
import { Fragment, useState, type ReactNode } from 'react';
import { FAVICON_DARK_URL, FAVICON_URL } from '../../constants/faviconUrl';
import { strings } from '../../i18n';
import { DrawerLanguageSwitcher } from './DrawerLanguageSwitcher';
import { DrawerThemeSwitcher } from './DrawerThemeSwitcher';

const DRAWER_EXPANDED_PX = 240;
const DRAWER_COLLAPSED_PX = 64;
/**
 * Outer list inset (expanded, collapsed, mobile): pairs with inner nav item horizontal padding so the icon stays
 * 12px from the drawer edge (`spacing(1)` + `spacing(0.5)`) in every mode — no horizontal re-centering when collapsed.
 */
const DRAWER_NAV_LIST_OUTER_GUTTER_SPACING = 1;
/**
 * Horizontal padding inside each expanded nav `ListItemButton`: same as inside the collapsed 48×48 row
 * around the 40px icon slot — `(48 − 40) / 2` = 4px (`theme.spacing(0.5)`).
 */
const DRAWER_NAV_ITEM_INNER_PADDING_X_SPACING = 0.5;
/**
 * Drawer header row horizontal inset: `calc(spacing(2) − 2px)` on the left in both expanded and collapsed desktop
 * drawers so the brand favicon does not shift when toggling width; right inset may be tighter when collapsed so the
 * control still fits in `DRAWER_COLLAPSED_PX`. Drawer `Toolbar` uses `disableGutters`.
 */
const drawerToolbarInsetX = (theme: Theme) => `calc(${theme.spacing(2)} - 2px)`;
/** Favicon in drawer header: same size expanded, collapsed rail, and mobile. */
const DRAWER_FAVICON_PX = 28;

/** Single row height for nav items in expanded and collapsed desktop drawer. */
const NAV_ITEM_MIN_HEIGHT_PX = 48;
/** Square icon slot so collapsed rail matches expanded vertical rhythm. */
const NAV_ICON_SLOT_PX = 40;
/** Match `fontSize="small"` on nav SvgIcons — lock size so dense rows + flex don’t shrink glyphs when labels appear. */
const NAV_SVG_ICON_PX = 20;

/** Strong nav title: matches breadcrumb current-page segment (`subtitle1` + weight + line height). */
const NAV_TITLE_STRONG_SX = {
  fontWeight: 600,
  lineHeight: 1.3,
} as const;

/** Same slot as collapsed rail: small IconButton + `p: 0.5` (not a plain Box — IconButton has fixed min size). */
const DRAWER_BRAND_ICON_BUTTON_SX = { p: 0.5 } as const;

function DrawerBrandFaviconImg() {
  const theme = useTheme();
  const src = theme.palette.mode === 'dark' ? FAVICON_DARK_URL : FAVICON_URL;
  return (
    <Box
      component="img"
      src={src}
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
 * Title uses `flex: 1` + `minWidth: 0` so it truncates against the trailing slot — never a stretched
 * empty band between name and control (that read as “padding growing” when the drawer widened).
 */
function DrawerTitleRow({ title, endSlot }: { title: string; endSlot?: ReactNode }) {
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

export type NavKey = 'dashboard' | 'employees' | 'departments' | 'leave';

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
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const drawerWidth = collapsed ? DRAWER_COLLAPSED_PX : DRAWER_EXPANDED_PX;

  const drawerPaperTransition = theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  });

  const appBarShift = theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  });

  const renderNavList = (options: { mobile: boolean }) => {
    const { mobile } = options;
    const iconOnly = !mobile && collapsed;

    const navItems: Array<{ key: NavKey; label: string; icon: React.ReactElement }> = [
      { key: 'dashboard', label: strings.nav.dashboard, icon: <DashboardOutlined fontSize="small" /> },
      { key: 'employees', label: strings.nav.employees, icon: <PeopleOutlined fontSize="small" /> },
      { key: 'departments', label: strings.nav.departments, icon: <BusinessOutlined fontSize="small" /> },
      { key: 'leave', label: strings.nav.leave, icon: <EventNoteOutlined fontSize="small" /> },
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
          alignItems: 'stretch',
          gap: 0.75,
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
                borderRadius: `${theme.shape.borderRadius}px`,
                borderStyle: 'solid',
                borderWidth: 2,
                borderColor: 'divider',
                boxSizing: 'border-box',
                minHeight: NAV_ITEM_MIN_HEIGHT_PX,
                py: 0,
                justifyContent: 'flex-start',
                px: DRAWER_NAV_ITEM_INNER_PADDING_X_SPACING,
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
              )}
            </ListItemButton>
          );
          if (iconOnly) {
            return (
              <Tooltip key={item.key} title={item.label} placement="right" arrow>
                {button}
              </Tooltip>
            );
          }
          return (
            <Fragment key={item.key}>{button}</Fragment>
          );
        })}
      </List>
    );
  };

  const desktopDrawer = (
    <Drawer
      variant="permanent"
      open
      sx={{
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
          transition: drawerPaperTransition,
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          pb: 3,
        },
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: 48,
          pl: drawerToolbarInsetX,
          pr: collapsed ? 0.5 : drawerToolbarInsetX,
          justifyContent: collapsed ? 'flex-start' : 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {collapsed ? (
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
                onClick={() => setCollapsed(true)}
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
      <Box sx={{ px: DRAWER_NAV_LIST_OUTER_GUTTER_SPACING, flexShrink: 0 }}>
        <DrawerThemeSwitcher collapsed={collapsed} mobile={false} />
        <DrawerLanguageSwitcher collapsed={collapsed} mobile={false} />
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
        }}
      >
        <Toolbar>
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
                  sx={
                    isLast
                      ? NAV_TITLE_STRONG_SX
                      : {
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          lineHeight: 1.3,
                        }
                  }
                  noWrap
                >
                  {label}
                </Typography>
              );
            })}
          </Breadcrumbs>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
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
              pb: 3,
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
          pt: 1,
          pb: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
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
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

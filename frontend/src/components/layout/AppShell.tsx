import {
  BusinessOutlined,
  ChevronLeft,
  ChevronRight,
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
import { useTheme } from '@mui/material/styles';
import { Fragment, useState } from 'react';
import { strings } from '../../i18n';

const DRAWER_EXPANDED_PX = 240;
const DRAWER_COLLAPSED_PX = 64;

/** Single row height for nav items in expanded and collapsed desktop drawer. */
const NAV_ITEM_MIN_HEIGHT_PX = 48;
/** Square icon slot so collapsed rail matches expanded vertical rhythm. */
const NAV_ICON_SLOT_PX = 40;

export type NavKey = 'dashboard' | 'employees' | 'departments' | 'leave';

const NAV_ITEMS: Array<{ key: NavKey; label: string; icon: React.ReactElement }> = [
  { key: 'dashboard', label: strings.nav.dashboard, icon: <DashboardOutlined fontSize="small" /> },
  { key: 'employees', label: strings.nav.employees, icon: <PeopleOutlined fontSize="small" /> },
  { key: 'departments', label: strings.nav.departments, icon: <BusinessOutlined fontSize="small" /> },
  { key: 'leave', label: strings.nav.leave, icon: <EventNoteOutlined fontSize="small" /> },
];

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

    return (
      <List
        component="nav"
        aria-label={strings.nav.listAriaLabel}
        sx={{
          pt: 1,
          px: mobile ? 0.5 : iconOnly ? 0 : 0.75,
          display: 'flex',
          flexDirection: 'column',
          alignItems: iconOnly ? 'center' : 'stretch',
          gap: 0.75,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const button = (
            <ListItemButton
              selected={item.key === activeNavKey}
              onClick={() => {
                onNavKeyChange(item.key);
                if (mobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 1,
                minHeight: NAV_ITEM_MIN_HEIGHT_PX,
                py: 0,
                justifyContent: iconOnly ? 'center' : 'flex-start',
                px: iconOnly ? 0 : 0.75,
                alignItems: 'center',
                ...(iconOnly && {
                  width: NAV_ITEM_MIN_HEIGHT_PX,
                  height: NAV_ITEM_MIN_HEIGHT_PX,
                  minWidth: NAV_ITEM_MIN_HEIGHT_PX,
                  maxWidth: NAV_ITEM_MIN_HEIGHT_PX,
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
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!iconOnly && (
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { variant: 'body2', noWrap: true } }}
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
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Toolbar
        sx={{
          minHeight: collapsed ? 72 : 48,
          px: collapsed ? 0.5 : 1.5,
          flexDirection: collapsed ? 'column' : 'row',
          justifyContent: collapsed ? 'center' : 'space-between',
          alignItems: 'center',
          gap: collapsed ? 0.5 : 0,
        }}
      >
        {collapsed ? (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
              {strings.shell.brandShort}
            </Typography>
            <IconButton
              onClick={() => setCollapsed(false)}
              aria-label={strings.shell.expandSidebar}
              size="small"
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </>
        ) : (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.4 }} noWrap>
              {strings.shell.brandFull}
            </Typography>
            <IconButton
              onClick={() => setCollapsed(true)}
              aria-label={strings.shell.collapseSidebar}
              size="small"
            >
              <ChevronLeft fontSize="small" />
            </IconButton>
          </>
        )}
      </Toolbar>
      <Divider />
      {renderNavList({ mobile: false })}
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
                  sx={{
                    fontWeight: isLast ? 600 : 500,
                    fontSize: isLast ? undefined : '0.875rem',
                    lineHeight: 1.3,
                  }}
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
            },
          }}
        >
          <Toolbar sx={{ minHeight: 48 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.4 }}>
              {strings.nav.drawerTitle}
            </Typography>
          </Toolbar>
          <Divider />
          {renderNavList({ mobile: true })}
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

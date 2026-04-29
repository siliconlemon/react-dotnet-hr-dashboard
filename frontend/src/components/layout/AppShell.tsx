import {
  BusinessOutlined,
  ChevronLeft,
  ChevronRight,
  DashboardOutlined,
  Menu as MenuIcon,
  PeopleOutlined,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
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

const NAV_ITEMS: Array<{ key: string; label: string; icon: React.ReactElement }> = [
  { key: 'dashboard', label: strings.nav.dashboard, icon: <DashboardOutlined fontSize="small" /> },
  { key: 'employees', label: strings.nav.employees, icon: <PeopleOutlined fontSize="small" /> },
  { key: 'departments', label: strings.nav.departments, icon: <BusinessOutlined fontSize="small" /> },
];

type AppShellProps = {
  children: React.ReactNode;
};

/**
 * Top AppBar plus collapsible navigation: mini rail when collapsed on desktop,
 * temporary drawer on small screens.
 */
export function AppShell({ children }: AppShellProps) {
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
      <List sx={{ pt: 1, px: mobile ? 1 : 0.5 }} component="nav" aria-label={strings.nav.listAriaLabel}>
        {NAV_ITEMS.map((item) => {
          const button = (
            <ListItemButton
              selected={item.key === 'dashboard'}
              onClick={mobile ? () => setMobileOpen(false) : undefined}
              sx={{
                borderRadius: 1,
                justifyContent: iconOnly ? 'center' : 'flex-start',
                px: iconOnly ? 1 : 1.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: iconOnly ? 0 : 1.5,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!iconOnly && <ListItemText primary={item.label} />}
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
            <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
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
          <Typography variant="subtitle1" component="h1" sx={{ fontWeight: 600 }} noWrap>
            {strings.app.shellTitle}
          </Typography>
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
          p: 2,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

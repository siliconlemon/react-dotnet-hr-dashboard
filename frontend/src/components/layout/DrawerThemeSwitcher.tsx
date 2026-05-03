import {
  Brightness6Outlined,
  DarkModeOutlined,
  LightModeOutlined,
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  type PaletteMode,
} from '@mui/material';
import type { MouseEvent } from 'react';
import { useState } from 'react';
import { strings } from '../../i18n';
import { useColorMode } from '../../theme/useColorMode';

const NAV_ICON_SLOT_PX = 40;
const NAV_SVG_ICON_PX = 20;

type DrawerThemeSwitcherProps = {
  collapsed: boolean;
  mobile: boolean;
};

export function DrawerThemeSwitcher({ collapsed, mobile }: DrawerThemeSwitcherProps) {
  const { mode, setMode } = useColorMode();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(menuAnchor);
  const compact = collapsed && !mobile;

  const handleToggle = (_: MouseEvent<HTMLElement>, next: PaletteMode | null) => {
    if (next != null) setMode(next);
  };

  const openMenu = (e: MouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget);
  const closeMenu = () => setMenuAnchor(null);

  const pickFromMenu = (next: PaletteMode) => {
    setMode(next);
    closeMenu();
  };

  const toggleGroup = (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={mode}
      onChange={handleToggle}
      aria-label={strings.shell.themeSwitcherAria}
      sx={{
        flex: 1,
        width: '100%',
        minWidth: 0,
        height: 32,
        display: 'flex',
        '& .MuiToggleButton-root': {
          flex: 1,
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.04em',
          px: 1,
          py: 0.5,
          borderColor: 'divider',
          '&.Mui-selected': {
            bgcolor: 'action.selected',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'action.selected',
            },
          },
        },
      }}
    >
      <ToggleButton value="light" aria-label={strings.shell.themeLight}>
        <LightModeOutlined sx={{ fontSize: NAV_SVG_ICON_PX }} />
      </ToggleButton>
      <ToggleButton value="dark" aria-label={strings.shell.themeDark}>
        <DarkModeOutlined sx={{ fontSize: NAV_SVG_ICON_PX }} />
      </ToggleButton>
    </ToggleButtonGroup>
  );

  return (
    <Box
      sx={{
        p: 0.375,
        flexShrink: 0,
      }}
    >
      {compact ? (
        <>
          <Tooltip title={strings.shell.themeMenuTooltip} placement="right" arrow>
            <IconButton
              color="inherit"
              size="small"
              onClick={openMenu}
              aria-label={strings.shell.themeSwitcherAria}
              aria-haspopup="menu"
              aria-expanded={menuOpen ? 'true' : undefined}
              sx={{
                width: NAV_ICON_SLOT_PX,
                height: NAV_ICON_SLOT_PX,
                borderRadius: 1,
                color: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.secondary,
                '&:hover': {
                  bgcolor: 'action.hover',
                  color: 'primary.main',
                },
              }}
            >
              <Brightness6Outlined sx={{ fontSize: NAV_SVG_ICON_PX }} />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={menuAnchor}
            open={menuOpen}
            onClose={closeMenu}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            slotProps={{
              paper: {
                elevation: 3,
                sx: { minWidth: 200, mt: -0.5 },
              },
            }}
          >
            <MenuItem
              selected={mode === 'light'}
              onClick={() => pickFromMenu('light')}
              dense
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <LightModeOutlined
                  fontSize="small"
                  sx={{
                    color: (theme) =>
                      mode === 'light'
                        ? 'primary.main'
                        : theme.palette.mode === 'dark'
                          ? theme.palette.common.white
                          : theme.palette.text.secondary,
                  }}
                />
              </ListItemIcon>
              <ListItemText primary={strings.shell.themeLight} />
            </MenuItem>
            <MenuItem
              selected={mode === 'dark'}
              onClick={() => pickFromMenu('dark')}
              dense
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <DarkModeOutlined
                  fontSize="small"
                  sx={{
                    color: (theme) =>
                      mode === 'dark'
                        ? 'primary.main'
                        : theme.palette.mode === 'dark'
                          ? theme.palette.common.white
                          : theme.palette.text.secondary,
                  }}
                />
              </ListItemIcon>
              <ListItemText primary={strings.shell.themeDark} />
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            width: '100%',
            minWidth: 0,
            pr: 1,
          }}
        >
          <Box
            sx={{
              minWidth: NAV_ICON_SLOT_PX,
              width: NAV_ICON_SLOT_PX,
              height: NAV_ICON_SLOT_PX,
              mr: 0.75,
              ml: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,
              '& .MuiSvgIcon-root': {
                fontSize: NAV_SVG_ICON_PX,
                width: NAV_SVG_ICON_PX,
                height: NAV_SVG_ICON_PX,
              },
            }}
            aria-hidden
          >
            <Brightness6Outlined
              sx={{
                color: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.secondary,
              }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>{toggleGroup}</Box>
        </Box>
      )}
    </Box>
  );
}

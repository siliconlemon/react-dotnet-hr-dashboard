import { Translate } from '@mui/icons-material';
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
} from '@mui/material';
import type { MouseEvent } from 'react';
import { useState } from 'react';
import { strings, type Locale } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';

const NAV_ICON_SLOT_PX = 40;
const NAV_SVG_ICON_PX = 20;

type DrawerLanguageSwitcherProps = {
  /** Desktop drawer collapsed to icon rail — compact trigger + menu. */
  collapsed: boolean;
  /** Mobile temporary drawer — always show expanded control. */
  mobile: boolean;
};

export function DrawerLanguageSwitcher({ collapsed, mobile }: DrawerLanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(menuAnchor);
  const compact = collapsed && !mobile;

  const handleToggle = (_: MouseEvent<HTMLElement>, next: Locale | null) => {
    if (next != null) setLocale(next);
  };

  const openMenu = (e: MouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget);
  const closeMenu = () => setMenuAnchor(null);

  const pickFromMenu = (next: Locale) => {
    setLocale(next);
    closeMenu();
  };

  const toggleGroup = (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={locale}
      onChange={handleToggle}
      aria-label={strings.shell.languageSwitcherAria}
      sx={{
        flex: 1,
        width: '100%',
        minWidth: 0,
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
      <ToggleButton value="en">EN</ToggleButton>
      <ToggleButton value="cs">CS</ToggleButton>
    </ToggleButtonGroup>
  );

  return (
    <Box
      sx={{
        py: 1,
        pl: 0.5,
        pr: 1,
        flexShrink: 0,
      }}
    >
      {compact ? (
        <>
          <Tooltip title={strings.shell.languageMenuTooltip} placement="right" arrow>
            <IconButton
              color="inherit"
              size="small"
              onClick={openMenu}
              aria-label={strings.shell.languageSwitcherAria}
              aria-haspopup="menu"
              aria-expanded={menuOpen ? 'true' : undefined}
              sx={{
                width: NAV_ICON_SLOT_PX,
                height: NAV_ICON_SLOT_PX,
                borderRadius: 1,
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover',
                  color: 'primary.main',
                },
              }}
            >
              <Translate sx={{ fontSize: NAV_SVG_ICON_PX }} />
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
              selected={locale === 'en'}
              onClick={() => pickFromMenu('en')}
              dense
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Translate
                  fontSize="small"
                  sx={{ color: locale === 'en' ? 'primary.main' : 'text.secondary' }}
                />
              </ListItemIcon>
              <ListItemText primary={strings.shell.languageEnglish} secondary="EN" />
            </MenuItem>
            <MenuItem
              selected={locale === 'cs'}
              onClick={() => pickFromMenu('cs')}
              dense
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Translate
                  fontSize="small"
                  sx={{ color: locale === 'cs' ? 'primary.main' : 'text.secondary' }}
                />
              </ListItemIcon>
              <ListItemText primary={strings.shell.languageCzech} secondary="CS" />
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            minWidth: 0,
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
            <Translate sx={{ color: 'text.secondary' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>{toggleGroup}</Box>
        </Box>
      )}
    </Box>
  );
}

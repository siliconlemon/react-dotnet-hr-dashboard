import { ExpandLess, ExpandMore, Translate } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import type { MouseEvent } from 'react';
import { useState } from 'react';
import { messagesByLocale, strings, type Locale } from '../../i18n';
import { useLocale } from '../../i18n/useLocale';

const NAV_ICON_SLOT_PX = 40;
const NAV_SVG_ICON_PX = 20;
/** Matches MUI `ToggleButton` size="small" row height from the previous toggle group. */
const LANGUAGE_SELECT_ROW_HEIGHT_PX = 32;

/** Display order in language menus. Add new locales here and in {@link messagesByLocale}. */
const LOCALES = Object.keys(messagesByLocale) as Locale[];

function localePrimaryLabel(id: Locale): string {
  const labels: Record<Locale, string> = {
    en: strings.shell.languageEnglish,
    cs: strings.shell.languageCzech,
  };
  return labels[id];
}

import type { DrawerTrailingFade } from './DrawerThemeSwitcher';

type DrawerLanguageSwitcherProps = {
  /** Desktop drawer collapsed to icon rail: compact trigger + menu. */
  collapsed: boolean;
  /** Mobile temporary drawer: always show expanded control. */
  mobile: boolean;
  /** Expanded desktop row: fade only the language control while the drawer rail collapses. */
  trailingFade?: DrawerTrailingFade;
};

export function DrawerLanguageSwitcher({ collapsed, mobile, trailingFade }: DrawerLanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(menuAnchor);
  const compact = collapsed && !mobile;

  const openMenu = (e: MouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget);
  const closeMenu = () => setMenuAnchor(null);

  const pickFromMenu = (next: Locale) => {
    setLocale(next);
    closeMenu();
  };

  const menuItems = LOCALES.map((loc) => (
    <MenuItem key={loc} selected={locale === loc} onClick={() => pickFromMenu(loc)}>
      <ListItemIcon sx={{ minWidth: 36 }}>
        <Translate
          fontSize="small"
          sx={{
            color: (theme) =>
              locale === loc
                ? 'primary.main'
                : theme.palette.mode === 'dark'
                  ? theme.palette.common.white
                  : theme.palette.text.secondary,
          }}
        />
      </ListItemIcon>
      <ListItemText primary={localePrimaryLabel(loc)} secondary={loc.toUpperCase()} />
    </MenuItem>
  ));

  return (
    <Box
      sx={{
        // Match `DrawerThemeSwitcher` outer padding (`p: 0.375`) so rail mode doesn’t grow vs expanded.
        py: 0.375,
        pl: 0.5,
        pr: 1,
        flexShrink: 0,
      }}
    >
      {compact ? (
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
              color: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.secondary,
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'primary.main',
              },
            }}
          >
            <Translate sx={{ fontSize: NAV_SVG_ICON_PX }} />
          </IconButton>
        </Tooltip>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            width: '100%',
            minWidth: 0,
            pr: 0.5,
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
            <Translate
              sx={{
                color: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.secondary,
              }}
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              ...(trailingFade != null && {
                opacity: trailingFade.active ? 0 : 1,
                transition: trailingFade.transition,
                pointerEvents: trailingFade.active ? 'none' : 'auto',
              }),
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              size="small"
              color="inherit"
              onClick={openMenu}
              aria-label={strings.shell.languageSwitcherAria}
              aria-haspopup="menu"
              aria-expanded={menuOpen ? 'true' : undefined}
              endIcon={menuOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              sx={{
                boxSizing: 'border-box',
                height: LANGUAGE_SELECT_ROW_HEIGHT_PX,
                minHeight: LANGUAGE_SELECT_ROW_HEIGHT_PX,
                py: 0,
                px: 1,
                justifyContent: 'space-between',
                textTransform: 'none',
                fontWeight: 600,
                letterSpacing: '0.04em',
                lineHeight: 1,
                borderColor: 'divider',
                color: 'text.primary',
                '& .MuiButton-endIcon': {
                  my: 0,
                  '& svg': { fontSize: 18 },
                },
                '&:hover': {
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                },
              }}
            >
              {localePrimaryLabel(locale)}
            </Button>
          </Box>
        </Box>
      )}
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={closeMenu}
        anchorOrigin={
          compact
            ? { vertical: 'top', horizontal: 'right' }
            : { vertical: 'top', horizontal: 'left' }
        }
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              minWidth: 200,
              ...(compact ? { mt: -0.5 } : { mb: 0.5 }),
            },
          },
        }}
      >
        {menuItems}
      </Menu>
    </Box>
  );
}

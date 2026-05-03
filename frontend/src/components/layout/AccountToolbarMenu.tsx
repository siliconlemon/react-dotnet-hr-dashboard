import Logout from '@mui/icons-material/Logout';
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { strings } from '../../i18n';
import { useAuth } from '../../auth/AuthContext';
import { initialsFromAccount } from '../../utils/accountDisplay';

/**
 * App bar account control: avatar trigger with sign-out. Uses MUI patterns (Avatar + Menu).
 */
export function AccountToolbarMenu() {
  const { user, logout } = useAuth();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);

  const label = user?.displayName?.trim() || user?.email || '';

  const initials = useMemo(
    () => (user ? initialsFromAccount(user.displayName, user.email) : ''),
    [user],
  );

  const handleClose = useCallback(() => setAnchor(null), []);

  if (!user) {
    return null;
  }

  return (
    <>
      <Tooltip title={strings.auth.accountMenuTooltip}>
        <IconButton
          color="inherit"
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label={strings.auth.accountMenuAria}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          size="small"
          sx={{ ml: 1, flexShrink: 0 }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: '0.8125rem',
              fontWeight: 600,
              bgcolor: 'primary.dark',
              color: 'primary.contrastText',
            }}
          >
            {initials || '?'}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { minWidth: 220, mt: 1 },
          },
          list: {
            sx: { pt: 0, pb: 0 },
          },
        }}
      >
        <Typography variant="body2" sx={{ px: 2, py: 1.5, color: 'text.secondary' }}>
          {strings.auth.signedInAs}
        </Typography>
        <Typography variant="subtitle2" sx={{ px: 2, pb: 0, wordBreak: 'break-word' }}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, pb: 1.5, display: 'block' }}>
          {user.email}
        </Typography>
        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            logout();
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={strings.auth.logout}
            primaryTypographyProps={{
              sx: {
                fontSize: '13px',
                mt: '4px',
                mb: '4px',
              },
            }}
          />
        </MenuItem>
      </Menu>
    </>
  );
}

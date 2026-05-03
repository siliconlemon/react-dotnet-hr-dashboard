import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { FAVICON_URL } from '../../constants/faviconUrl';
import { strings } from '../../i18n';
import { initialsFromAccount } from '../../utils/accountDisplay';

const LOGIN_BRAND_ICON_PX = 40;

/** Matches seeded demo account (`AppUserSeed` / API). */
const DEMO_DISPLAY_NAME = 'Demo';
const DEMO_EMAIL = 'demo@smatchhr.local';

/**
 * Full-screen sign-in for the SPA. Email/password fields are intentionally disabled;
 * signing in uses the tray below (same visual language as the app bar account control).
 */
export function LoginView() {
  const { loginDemo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formHintDismissed, setFormHintDismissed] = useState(false);

  const demoInitials = useMemo(
    () => initialsFromAccount(DEMO_DISPLAY_NAME, DEMO_EMAIL),
    [],
  );

  const handleDemo = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await loginDemo();
    } catch {
      setError(strings.auth.demoError);
    } finally {
      setLoading(false);
    }
  }, [loginDemo]);

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        boxSizing: 'border-box',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? `linear-gradient(165deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.dark}22 100%)`
            : `linear-gradient(165deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.light}18 100%)`,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: 'divider',
        }}
      >
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              pb: 0.25,
            }}
          >
            <Box
              component="img"
              src={FAVICON_URL}
              alt=""
              sx={{
                width: LOGIN_BRAND_ICON_PX,
                height: LOGIN_BRAND_ICON_PX,
                display: 'block',
                flexShrink: 0,
              }}
            />
            <Typography
              variant="subtitle1"
              component="span"
              color="text.primary"
              sx={{ fontWeight: 600, lineHeight: 1.3, fontSize: '24pt' }}
            >
              {strings.shell.brandFull}
            </Typography>
          </Box>

          <Box>
            <Typography component="h1" variant="h1" color="text.primary" sx={{ mb: 0.75 }}>
              {strings.auth.loginTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.43 }}>
              {strings.auth.loginSubtitle}
            </Typography>
          </Box>

          {!formHintDismissed ? (
            <Alert
              severity="info"
              sx={{ alignItems: 'flex-start' }}
              onClose={() => setFormHintDismissed(true)}
            >
              {strings.auth.formBlockedHint}
            </Alert>
          ) : null}

          <Stack spacing={1.5}>
            <TextField
              label={strings.auth.emailLabel}
              type="email"
              autoComplete="username"
              fullWidth
              disabled
              placeholder={strings.auth.emailPlaceholder}
            />
            <TextField
              label={strings.auth.passwordLabel}
              type="password"
              autoComplete="current-password"
              fullWidth
              disabled
              placeholder={strings.auth.passwordPlaceholder}
            />
          </Stack>

          <Button type="button" variant="contained" color="primary" size="large" fullWidth disabled>
            {strings.auth.submitLogin}
          </Button>

          {error ? (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          ) : null}
        </Stack>
      </Paper>

      <Box sx={{ width: '100%', maxWidth: 420, mt: 2 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 1, px: 0.25, fontWeight: 600, letterSpacing: '0.04em' }}
        >
          {strings.auth.demoTrayTitle}
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            borderWidth: 2,
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <ListItemButton
            component="button"
            onClick={() => void handleDemo()}
            disabled={loading}
            aria-label={strings.auth.demoRowAriaLabel}
            sx={{
              width: '100%',
              py: 1.25,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              boxSizing: 'border-box',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ListItemAvatar sx={{ minWidth: 48, flexShrink: 0 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  bgcolor: 'primary.dark',
                  color: 'primary.contrastText',
                }}
              >
                {demoInitials}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={DEMO_DISPLAY_NAME}
              secondary={DEMO_EMAIL}
              sx={{ flex: '1 1 auto', minWidth: 0, mr: 1 }}
              slotProps={{
                primary: { variant: 'subtitle2', sx: { fontWeight: 600 } },
                secondary: {
                  variant: 'body2',
                  sx: { color: 'text.secondary' },
                },
              }}
            />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                ml: 'auto',
              }}
            >
              {loading ? (
                <CircularProgress size={22} aria-label={strings.auth.demoLoading} />
              ) : (
                <KeyboardArrowRight sx={{ color: 'text.secondary' }} aria-hidden />
              )}
            </Box>
          </ListItemButton>
        </Paper>
      </Box>
    </Box>
  );
}

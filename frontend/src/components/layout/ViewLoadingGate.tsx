import { Box, CircularProgress, Fade } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { ReactNode } from 'react';
import {
  VIEW_CONTENT_FADE_MS,
  VIEW_LOADER_FADE_MS,
  VIEW_MIN_LOADING_MS,
} from '../../constants/viewTransition';
import { useMinimumPendingDuration } from '../../hooks/useMinimumPendingDuration';

type ViewLoadingGateProps = {
  /** Raw loading flag from the view (e.g. fetch in flight). */
  rawPending: boolean;
  /** Minimum overlay duration in ms; use `0` to disable (e.g. frequent grid refetches). */
  minLoadingMs?: number;
  children: ReactNode;
};

/**
 * Full-area loading overlay with minimum display time, then a short fade-in on children.
 */
export function ViewLoadingGate({
  rawPending,
  minLoadingMs = VIEW_MIN_LOADING_MS,
  children,
}: ViewLoadingGateProps) {
  const theme = useTheme();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const pending = useMinimumPendingDuration(rawPending, minLoadingMs);
  const fadeMs = reduceMotion ? 0 : VIEW_CONTENT_FADE_MS;
  const loaderFadeMs = reduceMotion ? 0 : VIEW_LOADER_FADE_MS;

  return (
    <Box
      sx={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          opacity: pending ? 0 : 1,
          transition: theme.transitions.create('opacity', { duration: fadeMs }),
          pointerEvents: pending ? 'none' : 'auto',
        }}
      >
        {children}
      </Box>
      <Fade
        in={pending}
        timeout={loaderFadeMs}
        unmountOnExit
        appear={!reduceMotion}
        mountOnEnter
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            pointerEvents: 'none',
            borderRadius: 1,
            bgcolor: (t) => alpha(t.palette.background.default, 0.65),
          }}
        >
          <CircularProgress aria-label="Loading" />
        </Box>
      </Fade>
    </Box>
  );
}

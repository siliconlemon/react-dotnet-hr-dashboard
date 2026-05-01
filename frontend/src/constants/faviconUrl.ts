/**
 * Public favicon lives at `public/favicon.svg` (served as `/favicon.svg`). Vite does not
 * hash public files, so bump `FAVICON_CACHE_KEY` whenever you replace the SVG so browsers
 * fetch the new file instead of a stale cached copy.
 */
export const FAVICON_CACHE_KEY = '20260501';

export const FAVICON_URL = `/favicon.svg?v=${FAVICON_CACHE_KEY}`;

/** Drawer brand asset on dark surfaces (`public/favicon-dark.svg`). */
export const FAVICON_DARK_URL = `/favicon-dark.svg?v=${FAVICON_CACHE_KEY}`;

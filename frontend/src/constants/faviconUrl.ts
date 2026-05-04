/**
 * Public favicon lives at `public/favicon.svg` (served as `/favicon.svg`). Vite does not
 * hash public files, so bump `FAVICON_CACHE_KEY` whenever you replace the SVG so browsers
 * fetch the new file instead of a stale cached copy.
 *
 * Keep the `?v=` query in `index.html`’s `<link rel="icon" href="...">` in sync with this key.
 */
export const FAVICON_CACHE_KEY = '20260503b';

export const FAVICON_URL = `/favicon.svg?v=${FAVICON_CACHE_KEY}`;

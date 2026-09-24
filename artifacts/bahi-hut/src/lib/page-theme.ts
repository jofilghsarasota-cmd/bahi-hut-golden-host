export type PageTheme = 'sun' | 'lounge';

// The bar and its nights are lounge; the resort side of the business is sun.
const LOUNGE_ROUTES = new Set(['/', '/bahi-hut', '/events', '/private-events']);

// wouter matches routes case-insensitively and ignores a trailing slash, so
// compare paths the same way. `path` is already relative to the deploy base.
export function normalizePath(path: string) {
  return path.toLowerCase().replace(/\/+$/, '') || '/';
}

export function themeForPath(path: string): PageTheme {
  return LOUNGE_ROUTES.has(normalizePath(path)) ? 'lounge' : 'sun';
}

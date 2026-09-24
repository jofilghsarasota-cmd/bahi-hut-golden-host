export type PageTheme = 'sun' | 'lounge';

// The bar and its nights are lounge; the resort side of the business is sun.
const LOUNGE_ROUTES = new Set(['/', '/bahi-hut', '/events', '/private-events']);

// `path` is wouter's location, already relative to the deploy base.
export function themeForPath(path: string): PageTheme {
  const clean = path.replace(/\/+$/, '') || '/';
  return LOUNGE_ROUTES.has(clean) ? 'lounge' : 'sun';
}

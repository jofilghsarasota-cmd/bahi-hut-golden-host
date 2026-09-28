export type PageTheme = 'sun' | 'lounge';

// The whole site now runs on the after-dark lounge palette; `sun` is kept
// as a theme the tokens still support, not a page anyone is on.
// wouter matches routes case-insensitively and ignores a trailing slash, so
// compare paths the same way. `path` is already relative to the deploy base.
export function normalizePath(path: string) {
  return path.toLowerCase().replace(/\/+$/, '') || '/';
}

export function themeForPath(_path: string): PageTheme {
  return 'lounge';
}

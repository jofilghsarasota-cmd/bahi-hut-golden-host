import { describe, expect, it } from 'vitest';
import { normalizePath, themeForPath } from './page-theme';

// wouter matches routes case-insensitively, so /Events renders the events page.
describe('normalizePath', () => {
  it.each([
    ['/Events', '/events'],
    ['/events/', '/events'],
    ['/Bahi-Hut//', '/bahi-hut'],
    ['', '/'],
    ['/', '/'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizePath(input)).toBe(expected);
  });
});

describe('themeForPath', () => {
  it.each(['/', '/bahi-hut', '/events', '/private-events', '/resort', '/shop', '/local-guide', '/nope'])(
    '%s is lounge',
    (path) => {
      expect(themeForPath(path)).toBe('lounge');
    },
  );

  it('ignores case, like the router', () => {
    expect(themeForPath('/Events')).toBe('lounge');
    expect(themeForPath('/BAHI-HUT')).toBe('lounge');
  });

  it('ignores trailing slashes', () => {
    expect(themeForPath('/events/')).toBe('lounge');
    expect(themeForPath('/shop//')).toBe('lounge');
  });
});

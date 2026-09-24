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
  it.each(['/', '/bahi-hut', '/events', '/private-events'])('%s is lounge', (path) => {
    expect(themeForPath(path)).toBe('lounge');
  });

  it.each(['/resort', '/shop', '/local-guide'])('%s is sun', (path) => {
    expect(themeForPath(path)).toBe('sun');
  });

  it('ignores case, like the router', () => {
    expect(themeForPath('/Events')).toBe('lounge');
    expect(themeForPath('/BAHI-HUT')).toBe('lounge');
  });

  it('ignores trailing slashes', () => {
    expect(themeForPath('/events/')).toBe('lounge');
    expect(themeForPath('/shop//')).toBe('sun');
  });

  it('defaults unknown routes (the 404 page) to sun', () => {
    expect(themeForPath('/nope')).toBe('sun');
    expect(themeForPath('')).toBe('lounge'); // empty means the root
  });
});

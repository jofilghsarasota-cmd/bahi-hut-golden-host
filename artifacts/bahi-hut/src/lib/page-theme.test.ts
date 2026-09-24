import { describe, expect, it } from 'vitest';
import { themeForPath } from './page-theme';

describe('themeForPath', () => {
  it.each(['/', '/bahi-hut', '/events', '/private-events'])('%s is lounge', (path) => {
    expect(themeForPath(path)).toBe('lounge');
  });

  it.each(['/resort', '/shop', '/local-guide'])('%s is sun', (path) => {
    expect(themeForPath(path)).toBe('sun');
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

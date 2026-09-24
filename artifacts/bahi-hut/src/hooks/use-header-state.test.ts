import { describe, expect, it } from 'vitest';
import { isUnderHeader } from './use-header-state';

describe('isUnderHeader', () => {
  const header = 64;

  it('is true with the hero at the top of the page', () => {
    expect(isUnderHeader({ top: 0, bottom: 900 }, header)).toBe(true);
  });

  it('is true mid-hero (reload or restored scroll)', () => {
    expect(isUnderHeader({ top: -2400, bottom: 500 }, header)).toBe(true);
  });

  it('is false once the hero bottom passes under the header', () => {
    expect(isUnderHeader({ top: -3000, bottom: 64 }, header)).toBe(false);
    expect(isUnderHeader({ top: -3000, bottom: -10 }, header)).toBe(false);
  });

  it('is false while the hero is still below the header', () => {
    expect(isUnderHeader({ top: 120, bottom: 1000 }, header)).toBe(false);
  });
});

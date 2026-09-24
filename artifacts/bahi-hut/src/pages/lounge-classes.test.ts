import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { themeForPath } from '@/lib/page-theme';

const PAGES: Record<string, string> = {
  '/': 'home.tsx',
  '/bahi-hut': 'bahi-hut.tsx',
  '/events': 'events.tsx',
  '/private-events': 'private-events.tsx',
  '/resort': 'resort.tsx',
  '/shop': 'shop.tsx',
  '/local-guide': 'local-guide.tsx',
};
// Arrow functions are neutralised so a tag match isn't cut short at `=>`.
const read = (file: string) => readFileSync(new URL(`./${file}`, import.meta.url), 'utf8').replace(/=>/g, '=_');
const loungePages = Object.entries(PAGES).filter(([route]) => themeForPath(route) === 'lounge');

describe.each(loungePages)('lounge page %s', (_route, file) => {
  const source = read(file);

  // Mid-teal text disappears on koa.
  it('does not use secondary as a text color', () => {
    expect(source).not.toMatch(/\btext-secondary(?![-\w])/);
  });

  // Koa text on a translucent accent over koa is dark on dark.
  it('does not use translucent accent surfaces', () => {
    // Variant-prefixed ones (hover:bg-accent/90 on a solid button) are fine.
    expect(source).not.toMatch(/(?<![\w:-])bg-accent\/\d+/);
  });
});

describe.each(Object.values(PAGES))('%s', (file) => {
  const source = read(file);

  it('loads no third-party textures', () => {
    expect(source).not.toContain('transparenttextures.com');
  });

  it('passes no pill or size overrides to Button', () => {
    const buttons = source.match(/<Button\b[^>]*>/g) ?? [];
    for (const tag of buttons) {
      expect(tag).not.toMatch(/rounded-(full|xl)|px-8 py-6|bg-white\/10/);
    }
  });
});

describe.each(['shop.tsx', 'events.tsx'])('%s filter row', (file) => {
  // Pill buttons are wider now; four of them overflow a 390px phone unless the row wraps.
  it('wraps on narrow screens', () => {
    const row = read(file).match(/<div className="([^"]*)">\s*(?:<span[^>]*>[^<]*<\/span>\s*)?(?:<Button|\{categories|\{allTags)/)?.[1] ?? '';
    expect(row.split(' ')).toContain('flex-wrap');
  });
});

describe('private events', () => {
  // Cards now have visible borders, so a negative-margin stagger shows as overlap.
  it('does not pull bordered cards into each other', () => {
    expect(read('private-events.tsx')).not.toMatch(/<Card className="[^"]*(?<![\w-])-m[ty]-/);
  });
});

describe('home', () => {
  // In lounge, primary-foreground is dark koa, so it can't stand in for white over video.
  it('only uses primary-foreground on a solid primary surface', () => {
    const classLists = read('home.tsx').match(/className="[^"]*"/g) ?? [];
    const offenders = classLists.filter(
      (c) => c.includes('text-primary-foreground') && !/(?<![\w:-])bg-primary(?![\w/-])/.test(c),
    );
    expect(offenders).toEqual([]);
  });
});

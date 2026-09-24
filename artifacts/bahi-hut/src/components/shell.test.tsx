import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { Router } from 'wouter';
import { describe, expect, it } from 'vitest';
import { Shell } from './shell';

const render = (path: string) =>
  renderToStaticMarkup(
    <Router ssrPath={path}>
      <Shell>page</Shell>
    </Router>,
  ).replace(/^(<link[^>]*>)+/, ''); // React 19 hoists image preloads first

describe('Shell', () => {
  // The header is translucent; whatever sits behind it at the top of the page
  // is the shell wrapper, so the wrapper must paint the page theme's surface.
  // It must not open a theme scope itself: the lounge footer sits inside it,
  // and a sun ancestor switches off lounge `dark:` styles and heading weights.
  it.each([
    ['/events', 'bg-koa'],
    ['/shop', 'bg-sand'],
  ])('paints the wrapper behind the header in the page theme (%s)', (path, surface) => {
    const wrapper = render(path).match(/^<div[^>]*>/)?.[0] ?? '';
    expect(wrapper).not.toContain('data-theme');
    expect(wrapper).toMatch(new RegExp(`class="[^"]*(?<!\\S)${surface}(?!\\S)`));
  });

  it('marks the current page in the nav, whatever the URL case', () => {
    const html = render('/Events/');
    expect(html).toMatch(/aria-current="page"[^>]*>Events</);
    expect(html).toContain('data-theme="lounge"');
  });

  it('closes the mobile sheet from every link, even the current page', () => {
    // Radix renders the sheet only when open, so check the source: every
    // mobile link and CTA sits inside a SheetClose.
    const source = readFileSync(new URL('./shell.tsx', import.meta.url), 'utf8');
    const sheet = source.slice(source.indexOf('<SheetContent'), source.indexOf('</SheetContent>'));
    const links = sheet.match(/<(Link|a)\b/g) ?? [];
    const closes = sheet.match(/<SheetClose asChild\b/g) ?? [];
    expect(links.length).toBe(3); // the mapped Link + two CTAs
    expect(closes.length).toBe(links.length);
  });

  // shadcn's trigger turns into a bamboo pill when focused open; ours reads as a
  // nav link and shows focus with a ring instead.
  it('keeps the More trigger a link, with a focus ring', () => {
    const trigger = render('/events').match(/<button[^>]*>More/)?.[0] ?? '';
    expect(trigger).not.toMatch(/(?<!\S)(focus:|data-\[state=open\]:(focus:|hover:)?)?bg-accent(?!\S)/);
    expect(trigger).toContain('focus-visible:ring-2');
  });
});

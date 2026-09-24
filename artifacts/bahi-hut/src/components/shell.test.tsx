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
  // is the shell wrapper, so the wrapper must be in the page's theme too.
  it.each([
    ['/events', 'lounge'],
    ['/shop', 'sun'],
  ])('paints the wrapper behind the header in the page theme (%s)', (path, theme) => {
    expect(render(path)).toMatch(new RegExp(`^<div data-theme="${theme}"`));
  });

  // shadcn's trigger turns into a bamboo pill when focused open; ours reads as a
  // nav link and shows focus with a ring instead.
  it('keeps the More trigger a link, with a focus ring', () => {
    const trigger = render('/events').match(/<button[^>]*>More/)?.[0] ?? '';
    expect(trigger).not.toMatch(/(?<!\S)(focus:|data-\[state=open\]:(focus:|hover:)?)?bg-accent(?!\S)/);
    expect(trigger).toContain('focus-visible:ring-2');
  });
});

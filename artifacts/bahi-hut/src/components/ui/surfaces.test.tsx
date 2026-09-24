import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Card } from './card';
import { Input } from './input';
import { Textarea } from './textarea';

const classOf = (html: string) => (html.match(/class="([^"]*)"/)?.[1] ?? '').split(' ');

describe('Card', () => {
  it('uses the themed card surface and shadow', () => {
    const classes = classOf(renderToStaticMarkup(<Card />));
    expect(classes).toEqual(expect.arrayContaining(['rounded-2xl', 'border-card-border', 'bg-card', 'shadow-(--card-shadow)']));
    expect(classes).not.toContain('hover:-translate-y-1');
  });

  it('lifts on hover only when interactive', () => {
    const classes = classOf(renderToStaticMarkup(<Card interactive />));
    expect(classes).toEqual(expect.arrayContaining(['hover:-translate-y-1', 'hover:shadow-(--glow)', 'motion-reduce:hover:translate-y-0']));
  });

  // A leaked string prop would render as an attribute (booleans are dropped with a one-time warning).
  it('does not pass the interactive prop through to the DOM', () => {
    const leaked = { interactive: 'leaked' } as unknown as { interactive: boolean };
    expect(renderToStaticMarkup(<Card {...leaked} />)).not.toContain('leaked');
  });
});

describe('form fields', () => {
  it('Input is a 44px rounded field with a 2px focus ring', () => {
    expect(classOf(renderToStaticMarkup(<Input />))).toEqual(expect.arrayContaining(['h-11', 'rounded-xl', 'focus-visible:ring-2']));
  });

  it('Textarea matches the field styling', () => {
    expect(classOf(renderToStaticMarkup(<Textarea />))).toEqual(expect.arrayContaining(['rounded-xl', 'focus-visible:ring-2']));
  });
});

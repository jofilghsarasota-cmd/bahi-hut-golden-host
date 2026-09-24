import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';
import { badgeVariants } from './badge';

// Button applies cn() over buttonVariants, so test the merged result.
const button = (opts: Parameters<typeof buttonVariants>[0]) => cn(buttonVariants(opts)).split(' ');

describe('buttonVariants', () => {
  it('is a pill with real hover and focus states', () => {
    const classes = button({});
    expect(classes).toContain('rounded-full');
    expect(classes).toContain('hover:-translate-y-0.5');
    expect(classes).toContain('focus-visible:ring-2');
    expect(classes).toContain('motion-reduce:hover:translate-y-0');
  });

  it('no longer references undefined Replit utilities', () => {
    const all = cn(buttonVariants({}));
    expect(all).not.toMatch(/elevate|button-outline|primary-border/);
  });

  it('glows with the theme glow on the default variant', () => {
    expect(button({})).toContain('shadow-(--glow)');
  });

  it('has a glass variant for image and video bands', () => {
    expect(button({ variant: 'glass' })).toEqual(
      expect.arrayContaining(['bg-white/10', 'text-white', 'backdrop-blur-sm', 'hover:bg-white']),
    );
  });

  it('keeps ghost and link flat on hover', () => {
    for (const variant of ['ghost', 'link'] as const) {
      const classes = button({ variant });
      expect(classes).toContain('hover:translate-y-0');
      expect(classes).not.toContain('hover:-translate-y-0.5');
    }
  });

  it('has the hero-sized lg', () => {
    expect(button({ size: 'lg' })).toEqual(expect.arrayContaining(['h-14', 'px-8', 'text-lg']));
  });
});

describe('badgeVariants', () => {
  it('is an uppercase pill', () => {
    expect(badgeVariants({}).split(' ')).toEqual(expect.arrayContaining(['rounded-full', 'uppercase']));
  });

  it('has accent and muted variants', () => {
    expect(badgeVariants({ variant: 'accent' })).toContain('bg-accent');
    expect(badgeVariants({ variant: 'muted' })).toContain('bg-muted');
  });

  it('no longer references undefined Replit utilities', () => {
    expect(badgeVariants({})).not.toMatch(/elevate|badge-outline/);
  });
});

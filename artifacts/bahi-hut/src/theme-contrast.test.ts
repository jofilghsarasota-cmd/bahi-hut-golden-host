import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Hsl = [number, number, number];

const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8');

// Reads the HSL-triplet tokens between /* THEME:<name> */ and /* END THEME */.
function themeTokens(name: 'sun' | 'lounge'): Record<string, Hsl> {
  const start = css.indexOf(`/* THEME:${name} */`);
  const end = css.indexOf('/* END THEME */', start);
  if (start < 0 || end < 0) throw new Error(`theme block "${name}" not found in index.css`);
  const tokens: Record<string, Hsl> = {};
  const pattern = /--([\w-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*;/g;
  for (const m of css.slice(start, end).matchAll(pattern)) {
    tokens[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return tokens;
}

function toRgb([h, s, l]: Hsl): [number, number, number] {
  const sat = s / 100;
  const light = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

function luminance(color: Hsl) {
  const [r, g, b] = toRgb(color).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Hsl, b: Hsl) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [text token, surface token]
const PAIRS: [string, string][] = [
  ['foreground', 'background'],
  ['card-foreground', 'card'],
  ['popover-foreground', 'popover'],
  ['muted-foreground', 'background'],
  ['muted-foreground', 'card'],
  ['muted-foreground', 'muted'],
  ['primary-foreground', 'primary'],
  ['secondary-foreground', 'secondary'],
  ['accent-foreground', 'accent'],
  ['destructive-foreground', 'destructive'],
  ['primary', 'background'], // links and eyebrows
  ['primary', 'card'],
];

describe('contrast helper', () => {
  it('rates black on white at 21:1', () => {
    expect(contrast([0, 0, 0], [0, 0, 100])).toBeCloseTo(21, 1);
  });
});

describe.each(['sun', 'lounge'] as const)('%s theme', (name) => {
  const tokens = themeTokens(name);

  it.each(PAIRS)('%s on %s meets WCAG AA (4.5:1)', (text, surface) => {
    expect(tokens[text], `--${text} missing`).toBeDefined();
    expect(tokens[surface], `--${surface} missing`).toBeDefined();
    expect(contrast(tokens[text], tokens[surface])).toBeGreaterThanOrEqual(4.5);
  });
});

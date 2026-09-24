# Bahi Hut Visual System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the Bahi Hut site one visual system — sun and lounge themes, a type scale, branded shadcn components and a redesigned shell — that every page picks up without per-page styling.

**Architecture:** Semantic HSL tokens are defined twice in `src/index.css`, for `:root, [data-theme='sun']` and `[data-theme='lounge']`; any element carrying `data-theme` flips everything inside it. Tailwind's `dark:` variant is re-pointed at the lounge scope. The shell maps the current route to a theme and sets `data-theme` on the header and `<main>`; the footer is always lounge. Components (Button, Badge, Card, Input, Textarea, Select) carry the brand so pages stop overriding them.

**Tech Stack:** React 19, Vite 7, Tailwind CSS v4 (`@theme inline`, `@utility`, `@custom-variant`), shadcn/ui (new-york) on Radix, wouter, class-variance-authority, tailwind-merge, Vitest (added in Task 1).

**Spec:** `docs/superpowers/specs/2026-09-24-visual-system-design.md`

All paths below are relative to `artifacts/bahi-hut/` unless they start with `docs/`.

## Global Constraints

- WCAG AA: every text/background token pairing in both themes ≥ 4.5:1 (enforced by `src/theme-contrast.test.ts`).
- Fonts: Fraunces (headings) and DM Sans (body) only; no third font.
- Brand palette: koa, sand, torch, lagoon, bamboo. No hibiscus.
- Sun primary (torch) `14 74% 43%`; lounge primary `21 86% 58%`. (Sun torch darkened from the spec's `#c9481f` so torch text on sand also passes 4.5:1 — computed 4.77.)
- Route themes: lounge for `/`, `/bahi-hut`, `/events`, `/private-events`; sun for `/resort`, `/shop`, `/local-guide` and unknown routes. Footer always lounge.
- The hero and scroll story (`scroll-scrub-hero.tsx`, `walk-in-sequence.tsx`, `flaming-bowl.tsx` and their CSS) are not restyled. Only allowed touch: a `data-header-overlay` attribute on the hero's root elements (Task 6).
- No page layout/section restructuring. Page edits are class-string swaps, `<Badge>` swaps, and replacing external texture URLs with `.grain`.
- `prefers-reduced-motion: reduce` disables button/card lift and header transitions.
- The workspace enforces `minimumReleaseAge: 1440` in `pnpm-workspace.yaml`; do not change it.
- `vite.config.ts` throws without `PORT` and `BASE_PATH`; every dev/build command sets them (e.g. `PORT=5173 BASE_PATH=/`).

### Deviation from spec, flagged for the user

The spec gives Private Events a `data-theme="sun"` pool-deck section. The page has no standalone pool-deck section (the pool deck is mentioned inside the "Capacity Details" card), and creating one is layout work, which is out of scope. This plan keeps Private Events fully lounge. The nested-sun mechanism is still built (dark variant and weight rules opt out inside `[data-theme='sun']`), so a pool-deck section can adopt it when that page is redesigned.

## Review Focus

1. **Token colors used as text on the other theme's background.** Classes like `text-secondary` or `text-accent-foreground` on `bg-accent/30` read fine on sand and become unreadable on koa. A reasonable person expects every label on lounge pages to be legible. → Task 8 adds `src/pages/lounge-classes.test.ts`, which scans lounge page sources for these patterns.
2. **Hero text that borrowed `primary-foreground` as "white".** In lounge, `primary-foreground` is dark koa, so the "Open now" pill over the video turns dark on dark. → The same Task 8 test fails on `text-primary-foreground` outside a `<Button>` in `home.tsx`; Task 8 fixes `OpenStatus`.
3. **Header over the hero when the page is not at the top.** For example, a reload mid-scroll, navigating to `/` from another page, resizing, or scrolling past the hero. The header must be transparent only while the hero is behind it. → Task 6 tests `isUnderHeader` with at-top, mid-hero, past-hero and short-element cases.
4. **Routes that aren't in the map.** Trailing slashes, unknown paths (the 404 page) and deployed base paths should get a sensible theme. → Task 5 tests `themeForPath` with `/events/`, `/nope` and `/`.
5. **Keyboard and screen-reader use of the new navigation.** Opening "More" and the mobile Sheet by keyboard, Esc closing, focus returning to the trigger, and the sheet closing on navigation. → Radix provides these; Task 9 includes an explicit keyboard pass, since no unit test can drive Radix focus management in a node environment.

---

### Task 0: Baseline (do not skip)

`src/index.css`, `src/pages/home.tsx` and `src/components/shell.tsx` contain uncommitted hero and scroll-story work that is not part of this plan. Tasks below edit those files, so commits would mix the two.

- [ ] **Step 1: Ask the user** whether to commit the current uncommitted work as a baseline first, and on which branch. Recommended: create branch `feat/visual-system` and commit the existing WIP as `WIP: hero scroll story and walk-in sequence`. Do not proceed without an answer.
- [ ] **Step 2:** Apply whatever the user chose, then run `git status --short` and confirm the three files are clean before Task 1.

---

### Task 1: Theme tokens, brand palette, grain, and test harness

**Files:**
- Modify: `package.json` (add `vitest`, `test` script)
- Create: `vitest.config.ts`
- Create: `src/theme-contrast.test.ts`
- Modify: `src/index.css` (from line 6, `@custom-variant dark`, through the end of the first `@layer base { … }` block, which ends just before `.scroll-scrub-viewport {`)

**Interfaces:**
- Produces: CSS tokens `--background --foreground --border --input --ring --card --card-foreground --card-border --popover --popover-foreground --popover-border --primary --primary-foreground --secondary --secondary-foreground --accent --accent-foreground --muted --muted-foreground --destructive --destructive-foreground` (HSL triplets), plus `--glow` and `--card-shadow` (box-shadow values) for both themes. Tailwind colors `koa sand torch lagoon bamboo`. The `.grain` class. Theme blocks are delimited by `/* THEME:sun */`, `/* THEME:lounge */` and `/* END THEME */` comments, which the contrast test depends on.
- Produces: `pnpm --filter @workspace/bahi-hut test` runs Vitest.

- [ ] **Step 1: Add Vitest**

Run: `pnpm --filter @workspace/bahi-hut add -D vitest@^3.2.4`

Then add the script in `package.json` `"scripts"`:

```json
"test": "vitest run"
```

Create `vitest.config.ts` (separate from `vite.config.ts`, which requires `PORT` and `BASE_PATH`):

```ts
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(import.meta.dirname, '..', '..', 'attached_assets'),
    },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
});
```

- [ ] **Step 2: Write the failing contrast test**

Create `src/theme-contrast.test.ts`:

```ts
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
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm --filter @workspace/bahi-hut test`
Expected: the helper test passes; the theme suites FAIL with `theme block "sun" not found in index.css`.

- [ ] **Step 4: Replace the token section of `src/index.css`**

Keep line 1 (font import) and lines 2–4 (`@import 'tailwindcss'`, `tw-animate-css`, typography plugin) as they are. Replace everything from `@custom-variant dark (&:is(.dark *));` through the closing `}` of the first `@layer base { … }` block with:

```css
/* `dark:` means "inside a lounge section" (and not re-opted into sun). */
@custom-variant dark (&:where([data-theme='lounge'], [data-theme='lounge'] *):not(:where([data-theme='sun'], [data-theme='sun'] *)));

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));

  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-card-border: hsl(var(--card-border));

  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-popover-border: hsl(var(--popover-border));

  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));

  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));

  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));

  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));

  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));

  --color-sidebar: hsl(var(--sidebar));
  --color-sidebar-foreground: hsl(var(--sidebar-foreground));
  --color-sidebar-border: hsl(var(--sidebar-border));
  --color-sidebar-primary: hsl(var(--sidebar-primary));
  --color-sidebar-primary-foreground: hsl(var(--sidebar-primary-foreground));
  --color-sidebar-accent: hsl(var(--sidebar-accent));
  --color-sidebar-accent-foreground: hsl(var(--sidebar-accent-foreground));
  --color-sidebar-ring: hsl(var(--sidebar-ring));

  /* Brand palette. Torch follows the theme's primary; the rest are fixed. */
  --color-koa: hsl(20 38% 7%);
  --color-sand: hsl(40 45% 95%);
  --color-torch: hsl(var(--primary));
  --color-lagoon: hsl(177 56% 27%);
  --color-bamboo: hsl(41 70% 61%);

  --font-sans: var(--app-font-sans);
  --font-serif: var(--app-font-serif);
  --font-mono: var(--app-font-mono);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --app-font-sans: 'DM Sans', sans-serif;
  --app-font-serif: 'Fraunces', serif;
  --app-font-mono: monospace;
  --radius: 0.75rem;

  /* Sidebar (unused by the site, kept for the shadcn component). */
  --sidebar: 177 56% 27%;
  --sidebar-foreground: 0 0% 100%;
  --sidebar-border: 177 56% 22%;
  --sidebar-primary: 14 74% 43%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 177 56% 22%;
  --sidebar-accent-foreground: 0 0% 100%;
  --sidebar-ring: 14 74% 43%;
}

/* SUN: daytime resort. Sand, koa text, torch, lagoon, bamboo. */
/* THEME:sun */
:root,
[data-theme='sun'] {
  --background: 40 45% 95%;
  --foreground: 20 35% 12%;
  --border: 36 25% 82%;
  --input: 36 25% 78%;
  --ring: 14 74% 43%;

  --card: 40 50% 98%;
  --card-foreground: 20 35% 12%;
  --card-border: 36 25% 86%;

  --popover: 40 50% 98%;
  --popover-foreground: 20 35% 12%;
  --popover-border: 36 25% 82%;

  --primary: 14 74% 43%;
  --primary-foreground: 0 0% 100%;
  --secondary: 177 56% 27%;
  --secondary-foreground: 0 0% 100%;
  --accent: 41 70% 61%;
  --accent-foreground: 20 35% 12%;
  --muted: 38 35% 88%;
  --muted-foreground: 25 20% 36%;
  --destructive: 0 72% 45%;
  --destructive-foreground: 0 0% 100%;

  --glow: 0 10px 28px -12px hsl(20 40% 20% / 0.45);
  --card-shadow: 0 1px 2px hsl(20 40% 20% / 0.06), 0 14px 34px -18px hsl(20 40% 20% / 0.22);
  color-scheme: light;
}
/* END THEME */

/* LOUNGE: after dark. Koa wood, cream text, lit torch, amber. */
/* THEME:lounge */
[data-theme='lounge'] {
  --background: 20 38% 7%;
  --foreground: 38 45% 92%;
  --border: 20 20% 20%;
  --input: 20 20% 26%;
  --ring: 38 80% 60%;

  --card: 20 30% 11%;
  --card-foreground: 38 45% 92%;
  --card-border: 20 22% 18%;

  --popover: 20 30% 11%;
  --popover-foreground: 38 45% 92%;
  --popover-border: 20 20% 20%;

  --primary: 21 86% 58%;
  --primary-foreground: 20 38% 7%;
  --secondary: 177 50% 24%;
  --secondary-foreground: 38 45% 92%;
  --accent: 38 80% 60%;
  --accent-foreground: 20 38% 7%;
  --muted: 20 22% 16%;
  --muted-foreground: 35 22% 70%;
  --destructive: 0 70% 58%;
  --destructive-foreground: 20 38% 7%;

  --glow: 0 0 0 1px hsl(21 86% 58% / 0.35), 0 10px 40px -10px hsl(28 95% 55% / 0.55);
  --card-shadow: inset 0 1px 0 hsl(38 80% 60% / 0.12);
  color-scheme: dark;
}
/* END THEME */

@layer base {
  * {
    @apply border-border;
  }
  /* A themed element paints its own surface, so sections can switch mid-page. */
  [data-theme] {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
  body {
    @apply font-sans antialiased bg-background text-foreground;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-serif;
  }
}

/* Film grain for any positioned surface: a static take on the hero's
   .story-grain. The element needs position relative/absolute. */
@layer components {
  .grain::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.08;
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  }
}
```

This deletes the old `:root` light block (including `--button-outline`, `--badge-outline`, `--opaque-button-border-intensity`, `--elevate-1`, `--elevate-2`), the `.dark` block, and the never-defined `--color-*-border: var(--*-border)` mappings for primary, secondary, muted, accent, destructive, sidebar-primary and sidebar-accent.

- [ ] **Step 5: Confirm nothing else relied on the removed variables**

Run (from `artifacts/bahi-hut`): `grep -rnE "elevate|button-outline|badge-outline|opaque-button|(primary|secondary|muted|accent|destructive)-border" src --include=*.tsx --include=*.ts --include=*.css`
Expected: matches only in `src/components/ui/button.tsx` and `src/components/ui/badge.tsx` (fixed in Task 3). `src/components/ui/chart.tsx` refers to `.dark` in its own `THEMES` map; it's unused by the site, so leave it.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `pnpm --filter @workspace/bahi-hut test`
Expected: PASS, all 25 tests (1 helper + 12 pairs × 2 themes).

- [ ] **Step 7: Typecheck and build**

Run: `pnpm --filter @workspace/bahi-hut typecheck`, then `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/bahi-hut build`
Expected: both succeed.

- [ ] **Step 8: Commit**

```bash
git add artifacts/bahi-hut/package.json artifacts/bahi-hut/vitest.config.ts artifacts/bahi-hut/src/theme-contrast.test.ts artifacts/bahi-hut/src/index.css pnpm-lock.yaml
git commit -m "Add sun and lounge theme tokens with contrast tests"
```

---

### Task 2: Typography

**Files:**
- Modify: `src/index.css` (line 1 font import; the `@layer base` block from Task 1; new `@utility` rules and a lounge weight rule right after the `@layer components` grain block)

**Interfaces:**
- Consumes: the `[data-theme]` scopes from Task 1.
- Produces: utilities `type-display`, `eyebrow`, `lead`; base sizes for `h1`–`h3`. Later tasks use `eyebrow` (Task 7 footer, Task 6 sheet title).

- [ ] **Step 1: Load the Fraunces SOFT axis**

Replace line 1 of `src/index.css` with:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400..700;1,400..700&family=Fraunces:ital,opsz,wght,SOFT@0,9..144,100..900,0..100;1,9..144,100..900,0..100&display=swap');
```

- [ ] **Step 2: Replace the `@layer base` block from Task 1** with:

```css
@layer base {
  * {
    @apply border-border;
  }
  /* A themed element paints its own surface, so sections can switch mid-page. */
  [data-theme] {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
  body {
    @apply font-sans antialiased bg-background text-foreground;
    line-height: 1.65;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-serif;
    text-wrap: balance;
  }
  /* Rounded, sign-painted serifs everywhere except the hero, which is tuned
     separately (see the scroll story below). */
  :where(h1, h2, h3, h4, h5, h6):not(.story *, .walk *) {
    font-variation-settings: 'SOFT' 100;
  }
  h1 {
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 800;
    line-height: 1.02;
    letter-spacing: -0.02em;
  }
  h2 {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.01em;
  }
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.2;
  }
  /* Light text on dark reads heavier: lounge headings sit one step lighter. */
  [data-theme='lounge'] h1:not([data-theme='sun'] *) {
    font-weight: 700;
  }
  [data-theme='lounge'] :is(h2, h3):not([data-theme='sun'] *) {
    font-weight: 600;
  }
}
```

The sizes live in `@layer base`, so any explicit `text-*` or `font-*` class on a heading still wins. No page is forced to change.

- [ ] **Step 3: Add the utilities and the lounge weight step for explicit weights**

Insert directly after the `@layer components { .grain::after … }` block:

```css
@utility type-display {
  font-family: var(--app-font-serif);
  font-size: clamp(3rem, 8vw, 6.5rem);
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.025em;
  font-variation-settings: 'opsz' 144, 'SOFT' 100;
  text-wrap: balance;
}

@utility eyebrow {
  font-family: var(--app-font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: hsl(var(--primary));
}

@utility lead {
  font-size: 1.25rem;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}

/* Pages set heading weights with utilities (font-black, font-bold), which
   beat @layer base. Unlayered, this steps them down one notch in lounge. */
[data-theme='lounge'] :is(h1, h2, h3, h4, h5, h6, .type-display):not(.story *, .walk *, [data-theme='sun'] *) {
  &.font-black,
  &.type-display {
    font-weight: 800;
  }
  &.font-extrabold {
    font-weight: 700;
  }
  &.font-bold {
    font-weight: 600;
  }
}
```

- [ ] **Step 4: Build and inspect the generated CSS**

Run: `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/bahi-hut build`
Expected: succeeds. Then run `grep -o "SOFT" dist/public/assets/*.css | head -3` and `grep -oE "\.eyebrow|\.type-display|\.lead" dist/public/assets/*.css | sort -u`.
Expected: `SOFT` appears. The utility classes appear only if something uses them; if the grep is empty at this point, that's fine, because Tailwind only emits used utilities. They show up after Task 7.

- [ ] **Step 5: Run the tests** (tokens unchanged, so this is a guard)

Run: `pnpm --filter @workspace/bahi-hut test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add artifacts/bahi-hut/src/index.css
git commit -m "Add type scale, Fraunces SOFT axis and lounge heading weights"
```

---

### Task 3: Button and Badge

**Files:**
- Modify: `src/components/ui/button.tsx` (the `buttonVariants` definition, lines 6–41)
- Modify: `src/components/ui/badge.tsx` (the `badgeVariants` definition, lines 5–28)
- Test: `src/components/ui/variants.test.ts`

**Interfaces:**
- Consumes: tokens and `--glow` from Task 1.
- Produces: `Button` variants `default | destructive | outline | secondary | ghost | link | glass`, sizes `default | sm | lg | icon`. `Badge` variants `default | secondary | accent | outline | muted`. Tasks 6–8 use `variant="glass"`, `size="lg"`, `<Badge variant="accent">` and `<Badge variant="muted">`.

- [ ] **Step 1: Write the failing test**

Create `src/components/ui/variants.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @workspace/bahi-hut test src/components/ui/variants.test.ts`
Expected: FAIL. `rounded-full` is not present, `elevate` still matches, and the glass, accent and muted variants resolve to base classes only.

- [ ] **Step 3: Replace `buttonVariants` in `src/components/ui/button.tsx`**

```ts
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-wide transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-(--glow) hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-current/30 bg-transparent hover:border-current/60 hover:bg-foreground/5',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90',
        ghost: 'hover:translate-y-0 hover:bg-muted',
        link: 'rounded-none text-primary underline-offset-4 hover:translate-y-0 hover:underline',
        // Translucent white over photos and video.
        glass: 'border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-secondary hover:shadow-lg',
      },
      size: {
        default: 'h-10 px-5 text-sm',
        sm: 'h-8 px-3.5 text-xs',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
```

- [ ] **Step 4: Replace `badgeVariants` in `src/components/ui/badge.tsx`**

```ts
const badgeVariants = cva(
  'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        accent: 'border-transparent bg-accent text-accent-foreground',
        outline: 'border-current/30 text-foreground',
        muted: 'border-transparent bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm --filter @workspace/bahi-hut test`
Expected: PASS (contrast and variants suites).

- [ ] **Step 6: Typecheck**

Run: `pnpm --filter @workspace/bahi-hut typecheck`
Expected: PASS. No page uses a removed variant; all existing variants were kept.

- [ ] **Step 7: Commit**

```bash
git add artifacts/bahi-hut/src/components/ui/button.tsx artifacts/bahi-hut/src/components/ui/badge.tsx artifacts/bahi-hut/src/components/ui/variants.test.ts
git commit -m "Brand Button and Badge: pill shapes, real states, glass, accent and muted variants"
```

---

### Task 4: Card, Input, Textarea, Select

**Files:**
- Modify: `src/components/ui/card.tsx` (the `Card` component, lines 4–17)
- Modify: `src/components/ui/input.tsx` (class string, line 10)
- Modify: `src/components/ui/textarea.tsx` (class string, line 11)
- Modify: `src/components/ui/select.tsx` (`SelectTrigger` class string, line 21)
- Test: `src/components/ui/surfaces.test.tsx`

**Interfaces:**
- Consumes: `--card-shadow` and `--glow` from Task 1.
- Produces: `Card` accepts `interactive?: boolean`. Task 8 uses `<Card>` with no overrides on Private Events.

- [ ] **Step 1: Write the failing test**

Create `src/components/ui/surfaces.test.tsx`:

```tsx
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

  it('does not leak the interactive prop to the DOM', () => {
    expect(renderToStaticMarkup(<Card interactive />)).not.toContain('interactive');
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @workspace/bahi-hut test src/components/ui/surfaces.test.tsx`
Expected: FAIL (`rounded-xl` vs `rounded-2xl`, `h-9` vs `h-11`, and `interactive` is rendered as a DOM attribute).

- [ ] **Step 3: Replace `Card` in `src/components/ui/card.tsx`**

```tsx
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }
>(({ className, interactive = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-card-border bg-card text-card-foreground shadow-(--card-shadow)',
      interactive &&
        'transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-(--glow) motion-reduce:transition-none motion-reduce:hover:translate-y-0',
      className,
    )}
    {...props}
  />
));
```

- [ ] **Step 4: Update the field class strings**

`src/components/ui/input.tsx`, the first argument to `cn(`:

```ts
'flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-black/25',
```

`src/components/ui/textarea.tsx`, the first argument to `cn(`:

```ts
'flex min-h-24 w-full rounded-xl border border-input bg-background px-4 py-3 text-base shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-black/25',
```

`src/components/ui/select.tsx`, the `SelectTrigger` class string (line 21):

```ts
'flex h-11 w-full items-center justify-between whitespace-nowrap rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-xs ring-offset-background data-[placeholder]:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-black/25 [&>span]:line-clamp-1',
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm --filter @workspace/bahi-hut test`
Expected: PASS.

- [ ] **Step 6: Typecheck**

Run: `pnpm --filter @workspace/bahi-hut typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add artifacts/bahi-hut/src/components/ui/card.tsx artifacts/bahi-hut/src/components/ui/input.tsx artifacts/bahi-hut/src/components/ui/textarea.tsx artifacts/bahi-hut/src/components/ui/select.tsx artifacts/bahi-hut/src/components/ui/surfaces.test.tsx
git commit -m "Brand Card and form fields; add interactive cards"
```

---

### Task 5: Route-to-theme map

**Files:**
- Create: `src/lib/page-theme.ts`
- Test: `src/lib/page-theme.test.ts`
- Modify: `src/components/shell.tsx` (header, `<main>`, `<footer>` opening tags)

**Interfaces:**
- Produces: `export type PageTheme = 'sun' | 'lounge'` and `export function themeForPath(path: string): PageTheme`. Task 6 imports both.

- [ ] **Step 1: Write the failing test**

Create `src/lib/page-theme.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @workspace/bahi-hut test src/lib/page-theme.test.ts`
Expected: FAIL with "Failed to resolve import './page-theme'".

- [ ] **Step 3: Implement**

Create `src/lib/page-theme.ts`:

```ts
export type PageTheme = 'sun' | 'lounge';

// The bar and its nights are lounge; the resort side of the business is sun.
const LOUNGE_ROUTES = new Set(['/', '/bahi-hut', '/events', '/private-events']);

// `path` is wouter's location, already relative to the deploy base.
export function themeForPath(path: string): PageTheme {
  const clean = path.replace(/\/+$/, '') || '/';
  return LOUNGE_ROUTES.has(clean) ? 'lounge' : 'sun';
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @workspace/bahi-hut test src/lib/page-theme.test.ts`
Expected: PASS.

- [ ] **Step 5: Apply themes in the current shell** (Task 6 rewrites it; this lets Tasks 5–8 be checked in the browser independently)

In `src/components/shell.tsx`:
- Add `import { themeForPath } from '@/lib/page-theme';` and, after `const [location] = useLocation();`, add `const theme = themeForPath(location);`.
- `<header className="sticky top-0 …">` becomes `<header data-theme={theme} className="sticky top-0 …">` (class unchanged).
- `<main className="flex-1">` becomes `<main data-theme={theme} className="flex-1">`.
- `<footer className="bg-secondary …">` becomes `<footer data-theme="lounge" className="bg-secondary …">`.

- [ ] **Step 6: Typecheck and test**

Run: `pnpm --filter @workspace/bahi-hut typecheck && pnpm --filter @workspace/bahi-hut test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add artifacts/bahi-hut/src/lib/page-theme.ts artifacts/bahi-hut/src/lib/page-theme.test.ts artifacts/bahi-hut/src/components/shell.tsx
git commit -m "Map routes to sun and lounge themes"
```

---

### Task 6: Header and navigation

**Files:**
- Create: `src/hooks/use-header-state.ts`
- Test: `src/hooks/use-header-state.test.ts`
- Modify: `src/components/scroll-scrub-hero.tsx` (add `data-header-overlay` to the two root elements: the reduced-motion `<section>` returned around line 325–327 and the wrapper `<div ref={wrapperRef} …>` at line 350)
- Modify: `src/components/shell.tsx` (full rewrite below; the footer moves out in Task 7, so this task keeps the existing `<footer>` JSX exactly as it is after Task 5)

**Interfaces:**
- Consumes: `themeForPath`, `PageTheme` (Task 5); `Button` `ghost | outline` and size `icon | lg` (Task 3); the `eyebrow` utility (Task 2).
- Produces: `export function isUnderHeader(rect: { top: number; bottom: number }, headerHeight: number): boolean` and `export function useHeaderState(overlayEnabled: boolean): { overlaid: boolean; scrolled: boolean }`.

- [ ] **Step 1: Write the failing test**

Create `src/hooks/use-header-state.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @workspace/bahi-hut test src/hooks/use-header-state.test.ts`
Expected: FAIL with "Failed to resolve import './use-header-state'".

- [ ] **Step 3: Implement the hook**

Create `src/hooks/use-header-state.ts`:

```ts
import { useEffect, useState } from 'react';

// Header heights in px (h-16, and h-14 once scrolled).
const HEADER_HEIGHT = 64;
const SCROLLED_AFTER = 8;

// True while the element spans the header's strip at the top of the viewport.
export function isUnderHeader(rect: { top: number; bottom: number }, headerHeight: number) {
  return rect.top <= 0 && rect.bottom > headerHeight;
}

// `overlaid`: a [data-header-overlay] element (the home hero) is behind the
// header, so the header goes transparent. `scrolled`: the page has left the top.
export function useHeaderState(overlayEnabled: boolean) {
  const [state, setState] = useState({ overlaid: overlayEnabled, scrolled: false });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = overlayEnabled ? document.querySelector<HTMLElement>('[data-header-overlay]') : null;
      const overlaid = el ? isUnderHeader(el.getBoundingClientRect(), HEADER_HEIGHT) : false;
      const scrolled = window.scrollY > SCROLLED_AFTER;
      setState((prev) => (prev.overlaid === overlaid && prev.scrolled === scrolled ? prev : { overlaid, scrolled }));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [overlayEnabled]);

  return state;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @workspace/bahi-hut test src/hooks/use-header-state.test.ts`
Expected: PASS.

- [ ] **Step 5: Mark the hero**

In `src/components/scroll-scrub-hero.tsx`, add the attribute `data-header-overlay` (no value) to:
- the root element returned in the reduced-motion branch (the `return (` at about line 325: its outermost element), and
- `<div ref={wrapperRef} className="relative" style={{ height: `${WRAPPER_VH}vh` }}>` at line 350, which becomes `<div ref={wrapperRef} data-header-overlay className="relative" style={{ height: `${WRAPPER_VH}vh` }}>`.

Make no other change to this file.

- [ ] **Step 6: Rewrite `src/components/shell.tsx`**

Replace everything from the top of the file through the closing `</header>` with the following. Keep the existing `{/* Main Content */}`, `<main …>` and `<footer …>` JSX that follows, and replace the `<main>` line with the one shown here.

```tsx
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, Palmtree, MapPin, Calendar, ShoppingBag, GlassWater, BedDouble, Info, Map, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useHeaderState } from '@/hooks/use-header-state';
import { themeForPath } from '@/lib/page-theme';
import { cn } from '@/lib/utils';
import logoImg from '@assets/generated_images/logo/BAHI_HUT_LOGO.jpg';

const BOOKING_URL =
  'https://booking.hotelkeyapp.com/v2/index.html#/booking/search?pc=1055&property_id=dcb4a0ce-88b0-45b0-a4c8-e01bb6a6ad07&url=https%3A%2F%2Fwww.bahihut.com%2Fghresort';

const primaryLinks = [
  { href: '/bahi-hut', label: 'The Bar', icon: GlassWater },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/resort', label: 'Resort', icon: BedDouble },
  { href: '/shop', label: 'Shop', icon: ShoppingBag },
];
const moreLinks = [
  { href: '/private-events', label: 'Private Events', icon: Info },
  { href: '/local-guide', label: 'Local Guide', icon: Map },
];
const mobileLinks = [{ href: '/', label: 'Home', icon: Palmtree }, ...primaryLinks, ...moreLinks];

// Desktop link: a torch underline that draws in on hover and stays on the
// current page.
function navLinkClass(active: boolean, overlaid: boolean) {
  return cn(
    'relative inline-flex h-9 items-center px-3 text-sm font-semibold tracking-wide transition-colors',
    'after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-primary after:transition-transform after:duration-300 motion-reduce:after:transition-none',
    active ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100',
    overlaid ? 'text-white/85 hover:text-white' : active ? 'text-foreground' : 'text-foreground/70 hover:text-foreground',
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const theme = themeForPath(location);
  const isHome = location === '/';
  const { overlaid, scrolled } = useHeaderState(isHome);
  const moreActive = moreLinks.some((link) => link.href === location);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background selection:bg-primary/20 selection:text-foreground">
      {/* Fixed over the home hero (transparent until it scrolls past), sticky elsewhere. */}
      <header
        data-theme={theme}
        className={cn(
          'top-0 z-50 w-full border-b transition-[background-color,border-color,color] duration-300 motion-reduce:transition-none',
          isHome ? 'fixed inset-x-0' : 'sticky',
          overlaid
            ? 'border-transparent bg-transparent text-white'
            : 'border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70',
        )}
      >
        <div
          className={cn(
            'container mx-auto flex items-center justify-between px-4 transition-[height] duration-300 motion-reduce:transition-none lg:px-8',
            scrolled ? 'h-14' : 'h-16',
          )}
        >
          <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
            <img
              src={logoImg}
              alt="Bahi Hut Cocktail Lounge"
              className={cn(
                'rounded-full object-contain transition-[width,height] duration-300 motion-reduce:transition-none',
                scrolled ? 'h-10 w-10' : 'h-12 w-12',
              )}
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-6 lg:flex">
            <NavigationMenu>
              <NavigationMenuList className="gap-1 space-x-0">
                {primaryLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink asChild active={location === link.href}>
                      <Link href={link.href} className={navLinkClass(location === link.href, overlaid)}>
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      navLinkClass(moreActive, overlaid),
                      'bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:hover:bg-transparent',
                      overlaid && 'hover:text-white focus:text-white data-[state=open]:text-white',
                    )}
                  >
                    More
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-60 gap-1 p-2">
                      {moreLinks.map((link) => (
                        <li key={link.href}>
                          <NavigationMenuLink asChild active={location === link.href}>
                            <Link
                              href={link.href}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted focus:bg-muted focus:outline-none',
                                location === link.href ? 'text-primary' : 'text-popover-foreground',
                              )}
                            >
                              <link.icon className="h-4 w-4 text-primary" />
                              {link.label}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <Button asChild>
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                Book a Room
              </a>
            </Button>
          </div>

          {/* Mobile Nav: Radix Dialog gives focus trap, Esc and scroll lock. */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className={cn('lg:hidden [&_svg]:size-6', overlaid && 'text-white hover:bg-white/10')}
              >
                <Menu />
              </Button>
            </SheetTrigger>
            {/* The sheet portals to <body>, so it carries its own theme. */}
            <SheetContent data-theme="lounge" side="right" className="grain flex w-[85vw] flex-col gap-0 p-0 sm:max-w-sm">
              <SheetHeader className="px-6 pb-4 pt-6 text-left">
                <SheetTitle className="eyebrow">Bahi Hut · Since 1954</SheetTitle>
                <SheetDescription className="sr-only">Site navigation</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4">
                {mobileLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-4 rounded-xl px-3 py-3 font-serif text-2xl font-semibold transition-colors',
                      location === link.href ? 'bg-primary/15 text-primary' : 'text-foreground/85 hover:bg-muted',
                    )}
                  >
                    <link.icon className="h-5 w-5 shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="grid gap-3 border-t border-border p-6">
                <Button asChild size="lg" className="w-full">
                  <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                    Book a Room
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full">
                  <a href="tel:9413555141">
                    <Phone /> (941) 355-5141
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main data-theme={theme} className="flex-1">
        {children}
      </main>
```

Also remove the now-unused `X` import (it isn't in the import line above), and remove `MapPin` from the import line if Task 7 has already moved the footer out. While the footer is still in this file, `MapPin` stays because the footer uses it.

- [ ] **Step 7: Typecheck and test**

Run: `pnpm --filter @workspace/bahi-hut typecheck && pnpm --filter @workspace/bahi-hut test`
Expected: PASS.

- [ ] **Step 8: Check in the browser**

Run: `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/bahi-hut dev` and open `http://localhost:5173/`. Check:
- On `/` at the top, the header is transparent with white links over the video. Scrolling through the hero keeps it transparent; past the hero it turns solid koa. Reloading while mid-hero shows it transparent immediately.
- On `/shop`, the header is sand and sticky, with no gap above the page.
- "More" opens a popover with Private Events and Local Guide, and Tab/Enter/Esc work.
- At 390px wide, the menu button opens a right-side lounge sheet; Esc closes it and returns focus to the button; tapping a link navigates and closes the sheet.

- [ ] **Step 9: Commit**

```bash
git add artifacts/bahi-hut/src/hooks/use-header-state.ts artifacts/bahi-hut/src/hooks/use-header-state.test.ts artifacts/bahi-hut/src/components/scroll-scrub-hero.tsx artifacts/bahi-hut/src/components/shell.tsx
git commit -m "Redesign header: themed, transparent over the hero, NavigationMenu and mobile Sheet"
```

---

### Task 7: Footer

**Files:**
- Create: `src/components/site-footer.tsx`
- Modify: `src/components/shell.tsx` (replace the `<footer>…</footer>` block with `<SiteFooter />`; drop the `MapPin` import)

**Interfaces:**
- Consumes: the `eyebrow` utility (Task 2) and `.grain` (Task 1).
- Produces: `export function SiteFooter(): JSX.Element`.

- [ ] **Step 1: Create `src/components/site-footer.tsx`**

```tsx
import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { MapPin, Phone } from 'lucide-react';
import logoImg from '@assets/generated_images/logo/BAHI_HUT_LOGO.jpg';

const exploreLinks = [
  { href: '/bahi-hut', label: 'The Bar' },
  { href: '/resort', label: 'Golden Host Resort' },
  { href: '/events', label: 'Events & Live Music' },
  { href: '/private-events', label: 'Private Events' },
  { href: '/shop', label: 'Shop Merch' },
  { href: '/local-guide', label: 'Local Guide' },
];

const hours = [
  { label: 'Happy Hour', value: 'Mon–Thu 1pm–6pm' },
  { label: 'Resort Check-in', value: '3:00 PM' },
  { label: 'Resort Check-out', value: '11:00 AM' },
];

const sisterLinks = [
  { href: 'https://ghresort.square.site/#items', label: 'Food Ordering' },
  { href: 'https://www.tikifever.com', label: 'Tiki Fever' },
];

const linkClass = 'text-muted-foreground transition-colors hover:text-foreground';

function FooterColumn({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h3 className="mb-6 text-xl font-bold">{title}</h3>
      {children}
    </div>
  );
}

// Every page ends after dark.
export function SiteFooter() {
  return (
    <footer data-theme="lounge" className="grain relative overflow-hidden pb-10 pt-20">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="mb-14 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-6 inline-flex items-center">
              <img src={logoImg} alt="Bahi Hut Cocktail Lounge" className="h-24 w-24 rounded-full object-contain" />
            </Link>
            <p className="mb-2 font-serif text-xl italic text-foreground">Since 1954.</p>
            <p className="mb-6 max-w-sm text-muted-foreground">
              Sarasota's oldest tiki bar and midcentury modern resort. Serving legendary Mai Tais since 1954.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a href="tel:9413555141" className={`${linkClass} flex items-center gap-2 tabular-nums`}>
                <Phone className="h-4 w-4 shrink-0 text-primary" /> (941) 355-5141
              </a>
              <a
                href="https://maps.google.com/?q=4675+N+Tamiami+Trail+Sarasota+FL+34234"
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} flex items-center gap-2`}
              >
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                4675 N Tamiami Trail, Sarasota FL 34234
              </a>
            </div>
          </div>

          <FooterColumn eyebrow="Around the hut" title="Explore">
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn eyebrow="Plan your visit" title="Hours">
            <ul className="space-y-3">
              {hours.map((row) => (
                <li key={row.label} className="flex justify-between gap-4 border-b border-border pb-2">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="tabular-nums text-foreground">{row.value}</span>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn eyebrow="Friends of the hut" title="Sister Links">
            <ul className="space-y-3">
              {sisterLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </FooterColumn>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Bahi Hut & Golden Host Resort. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://www.bahihut.com/privacypolicy" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">
              Privacy Policy
            </a>
            <span className="italic">Note: Some imagery is conceptual illustration.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Use it in the shell**

In `src/components/shell.tsx`, replace the whole `{/* Footer */}` comment and `<footer …>…</footer>` element with `<SiteFooter />`, add `import { SiteFooter } from '@/components/site-footer';`, and remove `MapPin` from the lucide import.

- [ ] **Step 3: Typecheck, test and build**

Run: `pnpm --filter @workspace/bahi-hut typecheck && pnpm --filter @workspace/bahi-hut test && PORT=5173 BASE_PATH=/ pnpm --filter @workspace/bahi-hut build`
Expected: PASS. Now `grep -oE "\.eyebrow" artifacts/bahi-hut/dist/public/assets/*.css | head -1` prints `.eyebrow`.

- [ ] **Step 4: Check in the browser**

On `/shop` (a sun page), the footer is koa with cream text, a thin torch line on top, eyebrows above each heading, Local Guide under Explore, and aligned hours digits.

- [ ] **Step 5: Commit**

```bash
git add artifacts/bahi-hut/src/components/site-footer.tsx artifacts/bahi-hut/src/components/shell.tsx
git commit -m "Move footer to a lounge-themed SiteFooter; add Local Guide link"
```

---

### Task 8: Migrate pages to the variants

**Files:**
- Test: `src/pages/lounge-classes.test.ts`
- Modify: `src/pages/home.tsx`, `src/pages/bahi-hut.tsx`, `src/pages/events.tsx`, `src/pages/private-events.tsx`, `src/pages/resort.tsx`, `src/pages/shop.tsx`, `src/pages/local-guide.tsx`

**Interfaces:**
- Consumes: `Button` `glass` and `lg` (Task 3), `Badge` `accent | muted` (Task 3), `Card` (Task 4), `.grain` (Task 1), `themeForPath` (Task 5).

- [ ] **Step 1: Write the failing test**

Create `src/pages/lounge-classes.test.ts`:

```ts
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
const read = (file: string) => readFileSync(new URL(`./${file}`, import.meta.url), 'utf8');
const loungePages = Object.entries(PAGES).filter(([route]) => themeForPath(route) === 'lounge');

describe.each(loungePages)('lounge page %s', (_route, file) => {
  const source = read(file);

  // Mid-teal text disappears on koa.
  it('does not use secondary as a text color', () => {
    expect(source).not.toMatch(/\btext-secondary(?![-\w])/);
  });

  // Koa text on a translucent accent over koa is dark on dark.
  it('does not use translucent accent surfaces', () => {
    expect(source).not.toMatch(/\bbg-accent\/\d+/);
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

describe('home', () => {
  // In lounge, primary-foreground is dark koa, so it can't stand in for white over video.
  it('only uses primary-foreground inside Buttons', () => {
    const outsideButtons = read('home.tsx').replace(/<Button\b[^>]*>/g, '');
    expect(outsideButtons).not.toContain('text-primary-foreground');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @workspace/bahi-hut test src/pages/lounge-classes.test.ts`
Expected: FAIL on: bahi-hut `text-secondary`; events `bg-accent/30`; transparenttextures in home, bahi-hut and local-guide; Button overrides in most pages; home `text-primary-foreground`.

- [ ] **Step 3: `src/pages/home.tsx`**

- Line 46 (`OpenStatus`): change `text-primary-foreground` to `text-white`.
- Line 61: `<Button size="lg" className="text-lg px-8 py-6 rounded-full w-full sm:w-auto shadow-xl" asChild>` becomes `<Button size="lg" className="w-full sm:w-auto" asChild>`
- Line 64: `<Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full w-full sm:w-auto bg-white/10 text-white border-white/30 hover:bg-white hover:text-secondary backdrop-blur-sm" asChild>` becomes `<Button size="lg" variant="glass" className="w-full sm:w-auto" asChild>`
- Line 143: becomes `<Button size="lg" className="w-full sm:w-auto" asChild>`
- Line 148: becomes `<Button size="lg" variant="glass" className="w-full sm:w-auto" asChild>`
- Line 222: `<Button variant="link" className="text-primary font-bold text-lg p-0 h-auto group" asChild>` becomes `<Button variant="link" className="h-auto p-0 text-lg font-bold group" asChild>`
- Line 255: `className="w-full rounded-xl"` becomes `className="w-full"`
- Line 275: `className="w-full rounded-xl"` becomes `className="w-full"`
- Line 296: `className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"` becomes `className="w-full bg-accent text-accent-foreground hover:bg-accent/90"`
- Lines 283–284: delete the `<div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>` line, and add `grain` to the parent's className (`aspect-video bg-primary … relative overflow-hidden` becomes `grain aspect-video bg-primary … relative overflow-hidden`).
- Lines 314 and 319: `<Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white hover:text-secondary rounded-full px-8" asChild>` becomes `<Button size="lg" variant="glass" asChild>`

- [ ] **Step 4: `src/pages/bahi-hut.tsx`**

- Line 11: delete the transparenttextures `<div>`; add `grain` to the `<section className="bg-secondary pt-24 pb-32 … relative overflow-hidden">` className.
- Line 63: `className="w-full rounded-xl"` becomes `className="w-full"`
- Line 77: `className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"` becomes `className="w-full"`
- Every `text-secondary` used as a text color (not `text-secondary-foreground`) becomes `text-primary`. Find them with `grep -nE "text-secondary([^-]|$)" src/pages/bahi-hut.tsx`; one is the "Take the Hut Home" `<h4>` at about line 109.

- [ ] **Step 5: `src/pages/events.tsx`**

- Add `import { Badge } from '@/components/ui/badge';`.
- Lines 76–91: remove `className="rounded-full"` from both filter `<Button>`s.
- Lines 107–112: replace the day `<span className="font-bold text-accent-foreground bg-accent/30 px-3 py-1 rounded-full text-sm w-fit">{event.day}</span>` with `<Badge variant="accent" className="w-fit">{event.day}</Badge>`, and add `tabular-nums` to the time span's className (`text-primary font-bold text-sm tracking-wide tabular-nums`).

- [ ] **Step 6: `src/pages/private-events.tsx`**

- Line 29: `<Button size="lg" className="rounded-full px-8" asChild>` becomes `<Button size="lg" asChild>`
- Line 34: `<Button variant="outline" size="lg" className="rounded-full px-8" asChild>` becomes `<Button variant="outline" size="lg" asChild>`
- The four event-type cards: `<Card className="bg-card border-none shadow-lg">` becomes `<Card>`, `<Card className="bg-card border-none shadow-lg mt-8">` becomes `<Card className="mt-8">`, and `<Card className="bg-card border-none shadow-lg -mt-8">` becomes `<Card className="-mt-8">`.

- [ ] **Step 7: `src/pages/resort.tsx`**

- Line 76: becomes `<Button size="lg" className="w-full sm:w-auto" asChild>`
- Line 94: `<Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors" asChild>` becomes `<Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>`

- [ ] **Step 8: `src/pages/shop.tsx`**

- Add `import { Badge } from '@/components/ui/badge';`.
- Line 91: `className="capitalize rounded-full"` becomes `className="capitalize"`
- Lines 109–111: replace the "Out of Stock" `<span className="bg-secondary …">Out of Stock</span>` with `<Badge variant="muted">Out of Stock</Badge>`.
- Lines 115–119: replace the Sale `<div className="absolute top-4 right-4 bg-primary …">Sale</div>` with `<Badge className="absolute right-4 top-4 z-10 shadow-sm">Sale</Badge>`.
- Price spans: add `tabular-nums` to `font-bold text-lg text-primary` and to `text-sm text-muted-foreground line-through`.
- Line 150: `className="w-full rounded-xl gap-2"` becomes `className="w-full"`
- Line 172: `className="rounded-full bg-background"` becomes `className="bg-background"`

- [ ] **Step 9: `src/pages/local-guide.tsx`**

- Line 8: delete the transparenttextures `<div>`; add `grain` to the parent `<section className="bg-secondary pt-24 pb-24 text-center px-4 relative">`.
- Line 71: `<Button size="lg" className="rounded-full shrink-0" asChild>` becomes `<Button size="lg" className="shrink-0" asChild>`

- [ ] **Step 10: Run the tests to verify they pass**

Run: `pnpm --filter @workspace/bahi-hut test`
Expected: PASS (all suites).

- [ ] **Step 11: Typecheck and build**

Run: `pnpm --filter @workspace/bahi-hut typecheck && PORT=5173 BASE_PATH=/ pnpm --filter @workspace/bahi-hut build`
Expected: PASS.

- [ ] **Step 12: Commit**

```bash
git add artifacts/bahi-hut/src/pages
git commit -m "Move pages onto Button, Badge and Card variants; replace external textures with grain"
```

---

### Task 9: Verification pass

**Files:** none (fix-forward commits only if a check fails)

- [ ] **Step 1: Automated checks**

Run: `pnpm --filter @workspace/bahi-hut test && pnpm --filter @workspace/bahi-hut typecheck && PORT=5173 BASE_PATH=/ pnpm --filter @workspace/bahi-hut build`
Expected: all pass. Record the test count.

- [ ] **Step 2: Screenshots of every route** (use the `run` skill to launch `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/bahi-hut dev` and capture)

At 1440×900 and 390×844, capture: `/` (top, mid-hero, after hero, footer), `/bahi-hut`, `/events`, `/private-events`, `/resort`, `/shop`, `/local-guide`, `/nope` (404), plus the mobile Sheet open and the desktop "More" menu open. For each, confirm the theme matches the Global Constraints map, no text is unreadable, and no horizontal scroll appears at 390px.

- [ ] **Step 3: Hero regression**

Compare the home scroll story against the Task 0 baseline commit (`git stash` is not needed; check out the baseline in a worktree if a side-by-side is required). Allowed differences: the header is now transparent over it, and torch accents (cue line, rail marks, primary buttons) use the lounge torch `21 86% 58%` instead of the old coral. Anything else is a regression; fix it with the minimum change.

- [ ] **Step 4: Keyboard pass (Review Focus 5)**

With the keyboard only: Tab through the desktop header, open "More" with Enter, move with arrows, close with Esc. At 390px, open the Sheet, Tab stays inside it, Esc closes it and focus returns to the menu button, and choosing a link navigates and closes it.

- [ ] **Step 5: Reduced motion**

In DevTools Rendering, set "Emulate CSS prefers-reduced-motion: reduce". Hovering buttons and interactive cards causes no lift, and the header and logo resize without animating.

- [ ] **Step 6: Report**

Tell the user the results of steps 1–5 with the screenshots, name anything that failed and how it was fixed, and remind them of the Private Events deviation (fully lounge; nested sun ready for a future pool-deck section).

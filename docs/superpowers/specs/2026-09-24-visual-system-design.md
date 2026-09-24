# Bahi Hut Visual System — Design Spec

Date: 2026-09-24
App: `artifacts/bahi-hut`
Status: Approved in brainstorming, pending written-spec review

## Goal

Make the whole site read as one designed brand — a 1954 Sarasota tiki bar and
midcentury resort — instead of a striking home hero followed by generic
template pages. The system lives in tokens and component variants so every
page picks it up without per-page styling.

### Scope

In scope:
- Theme tokens for two modes (sun and lounge) and a brand palette.
- Typography scale as shared utilities.
- Bahi Hut variants for Button, Card, Badge, Input/Textarea/Select.
- Redesigned header, navigation and footer (the shell).
- Replacing per-page Button/Badge class overrides with the new variants
  (class-string changes only).

Out of scope:
- Page layout/section restructuring (later, one page at a time).
- The home hero and scroll story (`scroll-scrub-hero.tsx`,
  `walk-in-sequence.tsx`, their CSS in `index.css`) — untouched except where
  they read tokens that keep their meaning.
- New forms or features.

### Success criteria

- Every page renders in its assigned theme; sections can override it.
- No page passes hover/rounding/size overrides to `<Button>` for looks the
  variants already provide.
- Buttons have working hover, active and focus-visible states.
- Text/background pairings in both themes meet WCAG AA (4.5:1 for body text,
  including button labels).
- Typecheck and production build pass; every page checked at desktop and phone
  widths.

## 1. Palette and theme tokens

### Mechanism (approach A: scoped themes)

One set of semantic tokens (`--background`, `--foreground`, `--card`,
`--primary`, `--secondary`, `--accent`, `--muted`, `--border`, `--input`,
`--ring`, …) defined for:

- `:root, [data-theme="sun"]` — default.
- `[data-theme="lounge"]` — redefines the same tokens.

Any element with `data-theme` flips everything inside it, shadcn components
included. Tokens stay in the existing HSL-triplet format consumed by the
`@theme inline` block.

Tailwind's dark variant is re-pointed to the lounge theme:

```css
@custom-variant dark (&:is([data-theme="lounge"], [data-theme="lounge"] *):not([data-theme="sun"] *));
```

so the `dark:` utilities already inside shadcn components apply in lounge
sections, and a sun section nested inside lounge opts back out. The unused
`.dark` block is deleted.

### Brand palette

Named colors exposed as Tailwind colors (`bg-koa`, `text-torch`, …) for
non-semantic use:

| Name   | Role               | Approx.                                  |
|--------|--------------------|------------------------------------------|
| koa    | deep wood brown    | `#1c120d`                                |
| sand   | warm cream         | `#f7f1e6`                                |
| torch  | coral-orange flame | `#c9481f` (sun) / `#f07a3a` (lounge)     |
| lagoon | midcentury teal    | `#1f6e6a`                                |
| bamboo | gold               | `#e0b457`                                |

No hibiscus/pink — sale uses torch.

### Sun theme (default)

- background sand; foreground koa; card slightly lighter than sand.
- primary torch `#c9481f` with white foreground (darkened from the current
  `15 75% 55%` coral, which fails AA with white).
- secondary lagoon with white foreground; accent bamboo with koa foreground.
- muted: deeper sand; muted-foreground: warm brown-grey meeting 4.5:1 on
  background.
- border/input: warm sand-grey hairline. ring: torch.

### Lounge theme

- background near-black koa; card a lighter wood step; foreground cream.
- primary bright torch `#f07a3a` with koa foreground (lit look, high contrast).
- secondary lagoon surface with cream foreground; accent amber-bamboo with koa
  foreground.
- muted: wood step; muted-foreground: cream at reduced lightness meeting 4.5:1.
- border/input: low-contrast wood line. ring: amber.
- Extra tokens: `--glow` (warm amber box-shadow for primary buttons and
  interactive cards).

Final HSL values are tuned during implementation against the contrast checks
in section 5; the table colors are the targets.

### Shared effects

- `.grain` utility: the film-grain overlay already used by the hero
  (`.story-grain`) generalized for any section, low opacity.
- The Local Guide hero's external `transparenttextures.com` background is
  replaced by `.grain`.

### Page theme map

| Route             | Theme  | Notes                                           |
|-------------------|--------|-------------------------------------------------|
| `/` (after hero)  | lounge | continues the hero                              |
| `/bahi-hut`       | lounge |                                                 |
| `/events`         | lounge |                                                 |
| `/private-events` | lounge | pool-deck section gets `data-theme="sun"`       |
| `/resort`         | sun    |                                                 |
| `/shop`           | sun    |                                                 |
| `/local-guide`    | sun    |                                                 |
| not-found         | sun    |                                                 |
| Footer            | lounge | always                                          |

Existing `bg-secondary` hero bands on sun pages become lagoon + `.grain`
through tokens alone.

## 2. Typography

- Fonts: Fraunces (headings) and DM Sans (body), no third font.
- Fraunces Google Fonts URL adds the `SOFT` axis; headings use
  `font-variation-settings: 'SOFT' 100` (with `opsz` as appropriate). Body text
  unaffected.
- Utilities defined in `index.css` with `@utility`:

| Class          | Use            | Spec                                                        |
|----------------|----------------|-------------------------------------------------------------|
| `text-display` | page heroes    | Fraunces 900, line-height ~0.95, `clamp(3rem, 8vw, 6.5rem)`, opsz 144 |
| `h1` (base)    | section titles | Fraunces 800, `clamp(2.5rem, 6vw, 4.5rem)`                  |
| `h2` (base)    | subsections    | Fraunces 700, `clamp(2rem, 4vw, 3rem)`                      |
| `h3` (base)    | card titles    | Fraunces 700, 1.5rem                                        |
| `eyebrow`      | label above headings | DM Sans 600, 0.75rem, uppercase, tracking 0.2em, primary color |
| `lead`         | intro paragraph | DM Sans 1.25rem, muted-foreground                          |
| body           | paragraphs     | DM Sans 1rem, line-height 1.65; `prose`-width containers ~65ch |

Base heading styles apply sizes via `@layer base`, so existing explicit
`text-*` classes on headings keep winning (no forced page rewrites).

- Lounge: headings drop one weight step (e.g. 900→800, 800→700) via the
  lounge scope.
- `tabular-nums` on prices, times and hours (shop grid, events schedule,
  footer hours).

## 3. Components

### Cleanup

- Remove references to undefined `hover-elevate` / `active-elevate-2`
  utilities and undefined `--*-border` variables (`--primary-border`,
  `--secondary-border`, …) from `button.tsx`, `badge.tsx` and the
  `@theme inline` block. Remove unused `--elevate-*`, `--button-outline`,
  `--badge-outline` once nothing reads them.

### Button (`src/components/ui/button.tsx`)

- Base: `rounded-full`, `font-semibold`, slight tracking, transitions on
  color/background/shadow/transform, focus-visible ring (2px, ring color,
  offset), disabled styles.
- Hover: `-translate-y-0.5` + shadow; active: translate back, reduced shadow.
  `motion-reduce:` disables translation.
- Variants:
  - `default` — primary; in lounge adds `--glow`.
  - `secondary` — secondary.
  - `outline` — `border-current`-style border that follows text color; hover
    fills lightly.
  - `ghost` — transparent, hover muted background.
  - `link` — primary text, underline on hover, no lift.
  - `glass` (new) — `bg-white/10 text-white border-white/30 backdrop-blur-sm`,
    hover to solid white with secondary text. Replaces the hand-written
    override used on image/video bands.
- Sizes: `sm`, `default`, `lg` (equivalent to the current
  `text-lg px-8 py-6`), `icon`.

### Card (`src/components/ui/card.tsx`)

- `rounded-2xl`, hairline `border`, sun: soft warm shadow; lounge: lighter wood
  surface, faint amber top highlight (inset), no heavy shadow.
- `interactive` option (prop or `data-interactive` styling) for clickable
  cards: lift + border color shift on hover, motion-reduce respected.

### Badge (`src/components/ui/badge.tsx`)

- Pill, uppercase, tracked, 11px, semibold.
- Variants: `default` (primary), `secondary`, `accent`, `outline`, `muted`.
- Shop "Sale" tag and event tags use `<Badge>`.

### Input / Textarea / Select trigger

- Height 44px (`h-11`), `rounded-xl`, visible border, ring-colored focus ring.
- Lounge: darker inset surface, cream placeholder via tokens/`dark:`.

### Page class-string updates

Each page's `<Button>` / sale-tag usage switches to variants/sizes, removing
overrides like `rounded-full px-8`,
`bg-white/10 text-white border-white/30 hover:bg-white hover:text-secondary`,
`text-lg px-8 py-6`. Layout classes (`w-full`, `sm:w-auto`, spacing) stay.

## 4. Shell (`src/components/shell.tsx`)

### Theme assignment

- A route→theme map in the shell (`usePageTheme` or equivalent) sets
  `data-theme` on `<main>` and on the header. Pages declare nothing.
- Sections may override with their own `data-theme`.

### Header

- Height 64px (from 80px), logo 48px; compacts slightly after scroll.
- Takes the page theme's background with `backdrop-blur` and a hairline
  bottom border.
- Home: transparent with cream text over the hero; becomes a solid lounge bar
  once the hero is scrolled past (scroll-position threshold / observer).
- Desktop: shadcn `NavigationMenu` with The Bar · Events · Resort · Shop and a
  "More" menu holding Private Events and Local Guide. Active route shown with a
  primary underline. "Book a Room" stays as the primary pill button.
- Mobile: shadcn `Sheet` from the right replacing the current dropdown — focus
  trap, Esc to close, body scroll lock, closes on route change. Lounge
  background, large Fraunces links with icons, Book a Room and phone CTAs at
  the bottom.

### Footer

- Always `data-theme="lounge"`, keeps the four-column content.
- `eyebrow` above column headings, `tabular-nums` hours, thin primary divider
  replacing `border-t-4 border-primary`, "Since 1954" line in Fraunces italic,
  `.grain` at low opacity.
- Adds the missing Local Guide link to Explore.

## 5. Verification

- `tsc --noEmit` and the production build pass.
- Run the app and screenshot every route at desktop (~1440px) and phone
  (~390px) widths; include the mobile Sheet open and the home header over the
  hero and after scrolling.
- Contrast check (computed) for: foreground/background, muted-foreground/
  background, primary-foreground/primary, secondary-foreground/secondary in both
  themes — all ≥ 4.5:1.
- With `prefers-reduced-motion: reduce`, button/card lift and header
  transitions are disabled.
- Hero/scroll story visually unchanged.

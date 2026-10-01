# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A presentation-first destination website for Sarasota's Bahi Hut tiki bar and
the Golden Host Resort. Booking, ordering, shopping and event inquiries link
out to the existing official services — this app does not implement its own
reservation, checkout or inquiry backends. Don't add fake success states for
those flows; link to the real services instead.

## Commands

Requires Node.js 24 and pnpm 10 (npm/yarn are blocked by a preinstall check).

```sh
pnpm install
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/bahi-hut run dev
```

`vite.config.ts` requires both `PORT` and `BASE_PATH` env vars and throws if
either is missing. In Git Bash, prefix with `MSYS_NO_PATHCONV=1` to stop path
mangling.

| Command | What it does |
| --- | --- |
| `pnpm --filter @workspace/bahi-hut run dev` | Run the website |
| `pnpm --filter @workspace/bahi-hut run test` | Run the website's Vitest suite |
| `pnpm --filter @workspace/bahi-hut run typecheck` | Typecheck the website only |
| `pnpm --filter @workspace/bahi-hut run build` | Production build to `artifacts/bahi-hut/dist/public` |
| `pnpm --filter @workspace/api-server run dev` | Run the shared Express API server (under `/api`) |
| `pnpm run typecheck` | Typecheck the whole workspace |
| `pnpm run build` | Typecheck and build every package |

Run a single Vitest file: `pnpm --filter @workspace/bahi-hut exec vitest run src/path/to/file.test.ts`.

After changing `lib/api-spec/openapi.yaml`, regenerate clients with
`pnpm --filter @workspace/api-spec run codegen`.

## Monorepo layout

pnpm workspace (`pnpm-workspace.yaml`): packages live under `artifacts/*` and
`lib/*`.

```
artifacts/
  bahi-hut/          React 19 + Vite 7 website — the main app
  api-server/         Express 5 API server (esbuild bundle), served under /api
  mockup-sandbox/      component preview sandbox
lib/
  api-spec/            OpenAPI spec — source of truth for API contracts
  api-client-react/    generated React Query hooks (from api-spec via orval)
  api-zod/             generated Zod schemas (from api-spec)
  db/                  Drizzle ORM / PostgreSQL package
attached_assets/generated_images/   concept imagery and video used by the site
docs/superpowers/      design specs and implementation plans
```

Only `artifacts/*` and `scripts` are typechecked by `pnpm run typecheck`
(the top-level `typecheck:libs` step uses `tsc --build` across `lib/*`
first). Generated imagery under `attached_assets/` is concept imagery, not
verified property photography — don't present it as real.

## bahi-hut app architecture

- `src/App.tsx` — route shell. Wouter `Switch`/`Route` wrapped in `Shell`,
  with a `ScrollToTop` effect (uses View Transitions API when available) and
  a per-route `ErrorBoundary` keyed on location.
- `src/pages/` — one file per route: home, bahi-hut, resort, events,
  private-events, shop, local-guide, not-found.
- `src/components/shell.tsx` — header/nav/footer chrome shared across pages.
- `src/components/ui/` — shadcn/Radix primitives with Bahi Hut brand variants
  (pill shapes, glass, accent/muted styles) baked into Button, Badge, Card and
  form fields, so pages shouldn't need per-page class overrides for these.
- `src/lib/page-theme.ts` — maps each route to a theme (see below).
- `src/index.css` — theme tokens, type scale, hero/scroll-story CSS.
- Path aliases (`vite.config.ts`): `@` → `src/`, `@assets` → the top-level
  `attached_assets/` directory (shared across artifacts, not duplicated per
  app).

### Themes

Two themes applied via `data-theme` on the page, defined as CSS tokens in
`src/index.css`:

- **Lounge** — dark, evening tiki-bar mood: `/`, `/bahi-hut`, `/events`,
  `/private-events`.
- **Sun** — bright, daytime resort mood: `/resort`, `/shop`, `/local-guide`,
  and everything else.

Individual sections can override the page theme with their own `data-theme`.
`src/theme-contrast.test.ts` checks text/background pairings in both themes
for WCAG AA contrast — update it when adding new token pairings.

### Scroll-driven motion

The home page opens with a scroll-driven hero story and ends with a
scroll-driven aerial dive into "Find Your Escape" (`escape-dive.tsx`). Both
scrub videos are encoded with every frame a keyframe and share helpers in
`src/lib/scroll-scrub.ts`; both honor `prefers-reduced-motion`. Re-encode any
new scrub video the same way:
`ffmpeg -i in.mp4 -an -c:v libx264 -crf 27 -g 1 -movflags +faststart out.mp4`.

See `docs/superpowers/specs/2026-09-24-visual-system-design.md` for the full
visual design spec.

## Deployment

Pushes to `main` deploy the website to GitHub Pages via
`.github/workflows/deploy-pages.yml`, which builds with
`BASE_PATH=/<repo-name>/`.

## Stack

TypeScript 5.9 · React 19 · Vite 7 · Tailwind CSS 4 · shadcn/ui on Radix ·
Wouter · Framer Motion · Lucide · Vitest · Express 5 · Drizzle ORM ·
PostgreSQL · Zod · Orval

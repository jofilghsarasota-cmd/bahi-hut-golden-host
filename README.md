# Bahi Hut & Golden Host

A responsive destination website for Sarasota's historic Bahi Hut tiki bar
(serving Mai Tais since 1954) and the Golden Host Resort — covering the bar,
the resort, events, private venue rentals, merchandise and a local guide.

The site is presentation-first: booking, ordering, shopping and event
inquiries link out to the existing official services rather than mocking them.

## Quick start

Requires Node.js 24 and pnpm 10 (npm and yarn are blocked by a preinstall
check).

```sh
pnpm install
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/bahi-hut run dev
```

The Vite config requires both `PORT` and `BASE_PATH`; on Replit the managed
artifact workflow supplies them.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm --filter @workspace/bahi-hut run dev` | Run the website |
| `pnpm --filter @workspace/bahi-hut run test` | Run the website's Vitest suite |
| `pnpm --filter @workspace/bahi-hut run typecheck` | Typecheck the website only |
| `pnpm --filter @workspace/bahi-hut run build` | Production build to `artifacts/bahi-hut/dist/public` |
| `pnpm --filter @workspace/api-server run dev` | Run the shared Express API server (served under `/api`) |
| `pnpm run typecheck` | Typecheck the whole workspace |
| `pnpm run build` | Typecheck and build every package |

## Project layout

```
artifacts/
  bahi-hut/          React 19 + Vite 7 website (the main app)
    src/pages/       home, bahi-hut, resort, events, private-events, shop, local-guide
    src/components/  shell (header), site-footer, scroll-scrub-hero, walk-in-sequence
    src/components/ui/  shadcn/Radix components with Bahi Hut variants
    src/lib/page-theme.ts  route → theme mapping
    src/index.css    theme tokens, type scale, hero/scroll-story CSS
  api-server/        Express 5 API server, bundled with esbuild
  mockup-sandbox/    component preview sandbox
lib/
  api-spec/          OpenAPI spec (source of truth for API contracts)
  api-client-react/  generated React Query hooks
  api-zod/           generated Zod schemas
  db/                Drizzle ORM / PostgreSQL package
attached_assets/generated_images/  concept imagery and video used by the site
docs/superpowers/    design specs and implementation plans
```

## Visual system

The site uses two themes, applied through `data-theme` on the page and
defined as CSS tokens in `src/index.css`:

- **Lounge** — dark, evening tiki-bar mood. Used on `/`, `/bahi-hut`,
  `/events` and `/private-events`.
- **Sun** — bright, daytime resort mood. Used on `/resort`, `/shop`,
  `/local-guide` and everything else.

Sections can override the page theme by setting their own `data-theme`.
Button, Badge, Card and form fields carry brand variants (pill shapes, glass,
accent and muted styles) so pages don't need per-page class overrides.
Text/background pairings in both themes are checked for WCAG AA contrast by
`src/theme-contrast.test.ts`.

The header is transparent over the hero and becomes solid on scroll, with a
NavigationMenu on desktop and a Sheet on mobile. The home page opens with a
scroll-driven hero story and ends with a scroll-driven aerial dive into
"Find Your Escape" (`escape-dive.tsx`). Both scrub videos encoded with every
frame a keyframe, share helpers in `src/lib/scroll-scrub.ts`, and honor
`prefers-reduced-motion`. Re-encode new scrub videos the same way, e.g.
`ffmpeg -i in.mp4 -an -c:v libx264 -crf 27 -g 1 -movflags +faststart out.mp4`.

See `docs/superpowers/specs/2026-09-24-visual-system-design.md` for the full
design spec.

## Stack

TypeScript 5.9 · React 19 · Vite 7 · Tailwind CSS 4 · shadcn/ui on Radix ·
Wouter · Framer Motion · Lucide · Vitest · Express 5 · Drizzle ORM ·
PostgreSQL · Zod · Orval

## Deployment

Pushes to `main` deploy the website to GitHub Pages through
`.github/workflows/deploy-pages.yml`, which builds with
`BASE_PATH=/<repo-name>/`.

## Notes

- Generated imagery is concept imagery, not verified property photography.
- Don't add fake reservation, checkout or event-submission success states;
  link to the official services.
- After changing `lib/api-spec/openapi.yaml`, run
  `pnpm --filter @workspace/api-spec run codegen`.
- `replit.md` holds agent-oriented project notes for Replit.

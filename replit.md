# Bahi Hut & Golden Host

A modern, responsive destination website connecting Sarasota's historic Bahi Hut tiki bar, Golden Host Resort, events, private venue rentals, merchandise, and local recommendations.

## Run & Operate

- `pnpm --filter @workspace/bahi-hut run dev` — run the website
- `pnpm --filter @workspace/api-server run dev` — run the shared API server
- `pnpm run typecheck` — run the full workspace typecheck
- `pnpm --filter @workspace/bahi-hut run typecheck` — typecheck the website only
- `pnpm --filter @workspace/bahi-hut run build` — create a production website build
- `pnpm run build` — typecheck and build all workspace packages

The website is served at the root preview path. The API server is available under `/api`.

## Stack

- pnpm workspaces
- Node.js 24
- TypeScript 5.9
- React 19 with Vite 7
- Tailwind CSS 4 and `tw-animate-css`
- Wouter for client-side routing
- Lucide React for interface icons
- Framer Motion is available for future motion work
- Express 5 shared API server
- PostgreSQL and Drizzle ORM are available through the shared database library
- Zod and Orval-generated API clients are available for backend-backed features
- esbuild for the API server bundle

## Where things live

- `artifacts/bahi-hut/` — the main React/Vite website
- `artifacts/bahi-hut/src/App.tsx` — route shell and application entry
- `artifacts/bahi-hut/src/pages/` — home, bar, resort, events, private events, shop, and local guide pages
- `artifacts/bahi-hut/src/components/shell.tsx` — shared navigation, mobile menu, and footer
- `artifacts/bahi-hut/src/index.css` — global theme tokens, typography, color palette, and motion helpers
- `artifacts/api-server/` — shared Express API server
- `lib/api-spec/openapi.yaml` — source of truth for API contracts
- `lib/api-client-react/` — generated React Query client hooks
- `lib/api-zod/` — generated Zod schemas
- `lib/db/` — shared Drizzle/PostgreSQL database package
- `attached_assets/generated_images/` — generated concept imagery used by the website

## Architecture decisions

- The website is presentation-first and currently does not replace hotel reservations, food ordering, merchandise checkout, or venue inquiry systems.
- Booking, ordering, shopping, and event inquiries link to the existing official services so visitors use real business workflows.
- The design combines midcentury Florida and tiki-bar character with modern responsive layouts, accessible contrast, and restrained motion.
- The landing-page hero uses bounded parallax motion and honors `prefers-reduced-motion`.
- Generated imagery is treated as concept imagery and is not presented as verified property photography.

## Product

- Introduces Bahi Hut as Sarasota's historic tiki bar, serving legendary Mai Tais since 1954.
- Promotes Golden Host Resort, including its 2022 renovation, 50-foot heated saltwater pool, rooms, and direct booking.
- Publishes recurring events such as Drag Queen Bingo, happy hour, karaoke, and live music.
- Explains private event options for weddings, birthdays, corporate events, festivals, and group stays.
- Shows official merchandise and sends visitors to the current store for purchase.
- Provides a local guide with nearby food, beaches, and Sarasota recommendations.

## User preferences

- Keep the redesign hip, modern, warm, and rooted in authentic Old Florida character.
- Preserve the distinction between the Bahi Hut bar, Golden Host Resort, events, venue rentals, and shop while making them feel like one destination.
- Favor working links to existing official services over mocked checkout, booking, or inquiry flows.

## Gotchas

- Do not add fake reservation, checkout, or event-submission success states; use the official outbound services instead.
- The website artifact workflow supplies `PORT` and `BASE_PATH`; use the managed workflow rather than starting Vite manually.
- After changing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen` before using regenerated API types.
- Use the shared proxy paths for service access; do not hardcode localhost URLs into browser code.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `react-vite` skill before modifying the website
- See the `artifacts` skill for artifact lifecycle and workflow rules

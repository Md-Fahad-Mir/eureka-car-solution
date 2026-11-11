# Eureka Car Solution: frontend

Premium multi-brand car marketplace for Bangladesh. This phase is frontend only, running on a mock data layer.
- Brief: `docs/EUREKA_FRONTEND_PROMPT.md`.
- Progress and decisions: `docs/IMPLEMENTATION_PLAN.md`. Tick tasks there as you finish them.
- Next.js 16 differs from older versions. Read `AGENTS.md` and the guides in `node_modules/next/dist/docs/` before using an unfamiliar API.

## Stack
Next.js 16 App Router (Turbopack, `cacheComponents`), React 19, TypeScript strict, Tailwind v4 (CSS-first `@theme` in `src/app/globals.css`), fonts **Montserrat (en) + Hind Siliguri (bn) only**, next-intl (`[locale]` = `en` | `bn`), Motion, lucide-react, Recharts, React Hook Form + Zod, Zustand (`persist`), Three.js/R3F/drei (homepage hero only, lazy), Vitest, Playwright.

## Commands
- `npm run dev`: dev server at http://localhost:3000
- `npm run typecheck`, `npm run lint`, `npm test` (Vitest), `npm run test:e2e` (Playwright), `npm run build`
- `npm run check`: typecheck + lint + test + build. Run it before every commit at the end of a phase.

## Folder rules
- `src/app/[locale]/…`: routes. Server Components by default. Add `'use client'` only for interactive islands.
- `src/components/{ui,layout,vehicle,calculators,forms,whatsapp,home,three,account,media}`: one component per concept, no duplicates.
- `src/config/`: brand, contact, WhatsApp number, finance and cost sample values. All tunables live here.
- `src/data/mock/`: mock data. **Only `src/lib/api/*` may import it**, or `stores/demoRecords` (ESLint enforces this).
- `src/lib/api/`: async service layer. Mock mode when `NEXT_PUBLIC_DATA_MODE=mock`. 300–700 ms latency, `DEMO-` references, a phone ending `0000` returns a field error. One `// TODO(api):` per function.
- `src/lib/{calc,format,validation}`: pure logic with `*.test.ts` next to it. Formatting in components goes through `useFormat()` / `getFormat()`.
- Mock test hooks: a phone ending `0000` gets a server error, search `mock:error` fails the listing, demo OTP `123456`.
- `src/stores/`: Zustand stores (compare, favourites, demo records/session) only.
- `src/types/`: domain models.

## i18n rule
- No hard-coded UI strings in components. Copy goes in `messages/en.json` and `messages/bn.json` by feature namespace.
- Content data uses `LocalizedText { en, bn }`.
- Bangla uses Bangla digits (via `lib/format`), no letter-spacing and no uppercase transforms. Write natural Bangla, not literal translation.

## Cache Components gotchas
- `usePathname()` must sit in a small `<Suspense>` leaf (see `components/layout/RouteAware.tsx`). `useSearchParams()` always needs `<Suspense>`.
- No `new Date()` / `Math.random()` in server-rendered code: use `"use cache"` + `cacheLife`, or do it client-side.

## 3D hero
- `src/components/three/*` (three.js / R3F) is homepage-only and loaded via `next/dynamic` from `components/home/Hero3D.tsx`. Never import it elsewhere.
- Car model: `public/models/hero-car.glb` (CC BY 4.0, credit in `config/hero.ts`, shown under the hero). Rebuild with `npm run prepare:hero-car`.

## Honesty rules
- Never imply a real booking, approval, payment or server save. Every confirmation shows `<DemoNotice>` with the reference.
- WhatsApp CTAs say "Chat on WhatsApp" and open `wa.me` links in a new tab.
- Testimonials, partners and stats are `isSample: true` with fictional names. No real bank names, logos or manufacturer images.

## Naming
- Components: `PascalCase.tsx`. Hooks: `useThing.ts`. Other modules: `camelCase.ts`. Routes: kebab-case.
- Money is integer BDT. Round only when formatting.
- Commit at the end of each phase: `feat(phase-N): …`.

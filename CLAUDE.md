# Eureka Car Solution: frontend

Premium multi-brand car marketplace for Bangladesh. This phase is frontend only, running on a mock data layer.
- Brief: `docs/EUREKA_FRONTEND_PROMPT.md`.
- Progress and decisions: `docs/IMPLEMENTATION_PLAN.md`. Tick tasks there as you finish them.
- Next.js 16 differs from older versions. Read `AGENTS.md` and the guides in `node_modules/next/dist/docs/` before using an unfamiliar API.

## Stack
Next.js 16 App Router (Turbopack, `cacheComponents`), React 19, TypeScript strict, Tailwind v4 (CSS-first `@theme` in `src/app/globals.css`), fonts **Montserrat (en) + Hind Siliguri (bn) only**, next-intl (`[locale]` = `en` | `bn`), lucide-react, Recharts, React Hook Form + Zod, Zustand (`persist`), Three.js/R3F/drei (homepage hero only, lazy), Vitest, Playwright.

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

## Motion
- Reveal on scroll with `data-reveal` (`rise` default, `fade`, `scale`, `mask`, `wipe`, `draw`) and `style={stagger(i, delayMs)}` from `lib/motion`. Put it on wrappers, not on elements with their own hover transitions. Tokens: `--ease-cinema`, `--dur-*`, `--shadow-soft/lift`, `--gold`, `section-gap`.
- No animation libraries. Numbers that roll or count up use `ui/AnimatedNumber`. Everything must stay visible without JS and with reduced motion.

## Responsive
- Every page must work from 320 px to 2560 px in both languages, with no horizontal page scroll. Wide tables go in `ui/ScrollArea`.
- Any horizontal scroller that holds `sr-only` text must be `relative`, or that text widens the page.
- Short screens (phones in landscape) use the `short:` variant (height < 32rem) to trim secondary chrome.
- Touch targets are at least 24 px, or spaced per WCAG 2.5.8.

## i18n rule
- No hard-coded UI strings in components. Copy goes in `messages/en.json` and `messages/bn.json` by feature namespace.
- Content data uses `LocalizedText { en, bn }`.
- Bangla uses Bangla digits (via `lib/format`), no letter-spacing and no uppercase transforms. Write natural Bangla, not literal translation.

## Cache Components gotchas
- `usePathname()` must sit in a small `<Suspense>` leaf (see `components/layout/RouteAware.tsx`). `useSearchParams()` always needs `<Suspense>`.
- No `new Date()` / `Math.random()` in server-rendered code: use `"use cache"` + `cacheLife`, or do it client-side.

## 3D hero
- The 3D story runs at any width (phones included) when the screen is ≥ 32rem tall. The `immersive` variant in `globals.css`, the hero scroll-length rule and the check in `Hero3D` must agree. Landscape phones, reduced motion and low-capability devices get the poster. Portrait framing: `narrowZoom`, the intro fit and `lift` in `heroWorld.ts`.
- `src/components/three/*` (three.js / R3F) is homepage-only and loaded via `next/dynamic` from `components/home/Hero3D.tsx`. Never import it elsewhere.
- Car model: `public/models/hero-car.glb` (CC BY 4.0). Everything model-specific (credit, paint, feature anchors) is `heroModel` in `config/hero.ts`.
- `three/choreography.ts` is the pure, tested maths (path, wheel spin = distance / radius, steer from curvature, suspension, intro and keyframes); `heroWorld.ts` is the scene; `glbRig.ts` turns any car glTF into a rig. Never show a stand-in as a specific real vehicle.

## Honesty rules
- Never imply a real booking, approval, payment or server save. Every confirmation shows `<DemoNotice>` with the reference.
- WhatsApp CTAs say "Chat on WhatsApp" and open `wa.me` links in a new tab.
- Testimonials, partners and stats are `isSample: true` with fictional names. No real bank names, logos or manufacturer images.

## Naming
- Components: `PascalCase.tsx`. Hooks: `useThing.ts`. Other modules: `camelCase.ts`. Routes: kebab-case.
- Money is integer BDT. Round only when formatting.
- Commit at the end of each phase: `feat(phase-N): …`.

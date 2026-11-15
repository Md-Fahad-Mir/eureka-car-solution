# Eureka Car Solution: frontend

A premium, bilingual (English and Bangla) multi-brand vehicle marketplace for Bangladesh: EVs, hybrids, plug-in hybrids, petrol and diesel cars, commercial vehicles and tractors, new, Japanese reconditioned and used.

The customer journey runs Discover → Learn → Calculate → Compare → Test drive → Finance → Purchase → Service, with WhatsApp as a first-class channel throughout.

> **This is a frontend running on mock data.** Nothing is sent to a server. Every booking, inquiry, application or message is stored in the visitor's own browser, gets a `DEMO-` reference, and is confirmed with an honest "Demo mode" notice. The service layer (`src/lib/api/*`) is shaped so it can be swapped for a real API without touching the UI.

## Quick start

Requirements: Node.js 20.9 or newer (developed on Node 26) and npm.

```bash
npm install
cp .env.example .env.local   # optional: the defaults work
npm run dev                  # http://localhost:3000
```

English is at `/en`, Bangla at `/bn`. `/` redirects to the visitor's preferred language.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run typecheck` | Generates Next route types, then `tsc --noEmit` |
| `npm run lint` | ESLint (incl. accessibility rules and the mock-data import guard) |
| `npm test` | Unit tests (Vitest): calculators, formatting, validation, WhatsApp links, API mocks, content integrity, translation parity |
| `npm run test:e2e` | Playwright smoke tests and accessibility checks. Builds and starts the app on port 3100 (or reuses a server already running there). First run: `npx playwright install chromium` |
| `npm run check` | Typecheck + lint + unit tests + build |
| `npm run prepare:hero-car` | Rebuilds the homepage 3D car from a source model (see "Hero 3D model") |

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_DATA_MODE` | `mock` | Data source for `src/lib/api/*`. `mock` uses `src/data/mock` with 300–700 ms simulated latency. |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical URLs, hreflang, Open Graph, sitemap, robots and JSON-LD. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `8801000000000` (placeholder) | The one WhatsApp Business number every "Chat on WhatsApp" link uses. E.164 digits only, no `+`. |

## Project tour

```
src/
  app/[locale]/…         Routes (Server Components by default)
  app/sitemap.ts         Sitemap (indexable pages × en/bn with hreflang, all vehicles, EV guides)
  app/robots.ts          Robots (account, sign-in, confirmations and lookups disallowed)
  components/
    ui/                  Design-system primitives (Button, Dialog/Sheet, Stepper, Timeline, ScrollArea…)
    layout/              Header, mega-menus, mobile nav, footer, language switcher, legal pages
    home/                Homepage sections and the 3D hero shell (Hero3D, HeroPoster)
    three/               three.js / React Three Fiber hero world (homepage only, lazy-loaded)
    vehicle/  media/     Marketplace, vehicle detail, compare, generated vehicle placeholders
    calculators/ finance/ savings/   EMI, running cost, savings, financing
    booking/ forms/      Test drive and service steppers, inquiry/contact forms, confirmations
    showroom/ ev/ account/ whatsapp/
  config/                Every tunable: site/contacts, nav, finance, costs, EV charging, hero
  data/mock/             Mock data (only src/lib/api/* may import it; ESLint enforces this)
  lib/api/               Async service layer, one `// TODO(api):` per function
  lib/calc|format|validation|search   Pure logic with *.test.ts next to it
  stores/                Zustand stores (compare, favourites, demo records, demo session)
  types/                 Domain models
messages/en.json, bn.json   All UI copy, by feature namespace
docs/                    Brief and the implementation plan (decisions and build log)
e2e/                     Playwright tests
scripts/                 Asset pipeline for the hero model
```

### Languages

- UI copy lives only in `messages/*.json`, with matching keys (a unit test checks parity and ICU placeholders). Content data uses `{ en, bn }`.
- Bangla uses Bangla digits through `src/lib/format`, no letter-spacing, no uppercase transforms, and is written as natural Bangla.
- Fonts: Montserrat (English) and Hind Siliguri (Bangla) via `next/font`, switched by `lang`.

### Demo behaviour and test hooks

- A phone number ending in `0000` is rejected by the mock "server", to exercise error mapping.
- Searching the marketplace for `mock:error` makes the listing fail, to show the error state.
- Demo sign-in: "Continue as demo customer", or any email with the code `123456` (shown on screen).
- Sample references: finance application `DEMO-FA-2417`, service booking `DEMO-SB-2981`.
- Testimonials, partner institutions and stats are fictional and labelled as samples.

## Adding real vehicle photos

Each vehicle has `images: Media[]` in `src/data/mock/vehicles.ts` (later: your API).

1. Put the files under `public/media/vehicles/<slug>/` (for example `front.jpg`, `side.jpg`, `interior.jpg`), or use a CDN.
2. Set `src` on each `Media` item, with a bilingual `alt`, an `aspect` and an optional `view`.
3. For a remote CDN, add its host to `images.remotePatterns` in `next.config.ts`.

Images go through `next/image` (AVIF/WebP, responsive sizes). Any image without `src` falls back to the generated SVG placeholder in the vehicle's paint colour. Only use photos you have the rights to: never hotlink or scrape manufacturer images.

## Hero 3D model

The homepage hero loads `public/models/hero-car.glb` with React Three Fiber, on desktop only. It isn't used:
- below 768 px;
- with reduced motion;
- without WebGL;
- on low-memory devices.

In those cases a static poster is shown instead. three.js is shipped only to the homepage.

**Current model:** "Car Concept" from the Khronos glTF Sample Assets, by Eric Chadwick, © 2024 Darmstadt Graphics Group GmbH, licensed CC BY 4.0. Logos were removed and the geometry compressed. The required credit is shown under the hero and is configured in `src/config/hero.ts`.

**To use a different car:**
1. Download a model you're licensed to use on a public website (glTF or GLB) into `reference/models/<name>/`. That folder is git-ignored.
2. Run `npm run prepare:hero-car -- reference/models/<name>/scene.gltf --inspect` to list its parts and materials. Adjust the `DROP` patterns in `scripts/prepare-hero-car.mjs` so manufacturer badges and plates are removed.
3. Run `npm run prepare:hero-car -- reference/models/<name>/scene.gltf`. This writes `public/models/hero-car.glb`: simplified, WebP textures, meshopt-compressed.
4. Update `credit`, `lengthM` and `paintMaterialPattern` in `src/config/hero.ts`.

The Toyota Land Cruiser 300 GR Sport swap is prepared on the branch `feat/hero-land-cruiser` (4x4 drivetrain in the x-ray chapter, copy, credit, pipeline) and is waiting for the model file.

## Connecting a real API

All data access goes through `src/lib/api/*`. Components never import mock data, and ESLint blocks it.

1. Implement each function marked `// TODO(api):` with `fetch`, keeping its signature and return type. Field-level server errors map to forms by throwing `ApiFieldError(field, messageKey)`; request failures throw `ApiError`.
2. Set `NEXT_PUBLIC_DATA_MODE` to anything other than `mock`, and branch on `isMockMode` in `src/lib/api/client.ts` while migrating.
3. When everything is live, delete `src/data/mock/` and `src/stores/demoRecords.ts`, and replace the demo session in `src/lib/api/account.ts` with real authentication.

## Quality

- **Accessibility:** WCAG 2.2 AA is the target.
  - Automated axe checks run in the e2e suite.
  - Keyboard support: a skip link, focus traps in dialogs and drawers, and focus moved to step headings and errored fields.
  - Results, form status and other live updates are announced through `aria-live`.
  - Status is never shown by colour alone, and Bangla carries `lang="bn"`.
- **SEO:**
  - Each page has localised metadata with canonical and hreflang links and Open Graph.
  - JSON-LD: vehicles (Car + Offer), showrooms (AutoDealer), EV guides (Article + FAQPage) and breadcrumbs.
  - `sitemap.xml` and `robots.txt` are generated.
- **Motion:**
  - One CSS-driven system: `data-reveal` on an element (rise, fade, scale, mask, wipe, draw) plus `stagger()` from `src/lib/motion.ts`; a single IntersectionObserver reveals elements as they arrive.
  - Scroll-linked depth uses CSS scroll-driven animations where the browser supports them, and stays static elsewhere.
  - Nothing is hidden without JavaScript, and with reduced motion everything is shown still (the hero becomes the poster).
- **Performance:**
  - Server Components by default, with Cache Components and partial prerendering.
  - Charts and the 3D hero are loaded lazily.
  - The homepage's largest content is its headline, not the 3D canvas.

## Replace before launch

- [ ] **Contacts:**
  - the WhatsApp number (`NEXT_PUBLIC_WHATSAPP_NUMBER` or `src/config/site.ts`);
  - phone numbers and emails in `src/config/site.ts`;
  - showroom addresses, phones, emails, hours and map coordinates in `src/data/mock/showrooms.ts`.
- [ ] **Site URL:** `NEXT_PUBLIC_SITE_URL`, for canonicals, sitemap and JSON-LD.
- [ ] **Vehicles:** data, prices and photos, with image rights.
- [ ] **Running costs:** fuel and electricity prices and maintenance estimates in `src/config/costs.ts`, and the charging assumptions in `src/config/ev.ts`.
- [ ] **Finance:**
  - interest and profit rates, tenures and down-payment rules in `src/config/finance.ts`;
  - partner institutions: only real, signed partners, with permission to use their names;
  - required documents per applicant type.
- [ ] **Service:** packages, prices and intervals in `src/data/mock/services.ts`, and the pickup-fee wording.
- [ ] **On-road costs:** fees, registration and on-road cost estimates in `src/config/finance.ts` (`onRoadConfig`).
- [ ] **Testimonials:** only real customers, with permission. Remove the sample ones.
- [ ] **Referrals:** the referral programme terms and rewards, or remove the section.
- [ ] **Legal:** privacy notice and terms (`messages/*.json` → `legal`), reviewed by a lawyer.
- [ ] **EV guides:** reviewed against current Bangladesh regulations and charging availability.
- [ ] **3D model:** confirm the hero model's licence covers public web use, and keep the credit.
- [ ] **Accounts:** replace the demo session and mock records with a real API and authentication.

# Eureka Car Solution: Frontend Build Brief for Claude Code

> **How to use this file**
> 1. Save this file in your project as `docs/EUREKA_FRONTEND_PROMPT.md`.
> 2. If you have `eureka-reference.html` (the 3D scroll demo), put it in `reference/eureka-reference.html`.
> 3. Open the project in VS Code, start Claude Code, and send:
>    *"Read `docs/EUREKA_FRONTEND_PROMPT.md` fully and follow it. Start with Phase 0."*
> 4. If a session ends mid-build, start a new one with:
>    *"Read `docs/EUREKA_FRONTEND_PROMPT.md` and `docs/IMPLEMENTATION_PLAN.md`, then continue from the next unchecked task."*

---

## 1. Your role and the goal

You are a senior frontend architect and product designer building the complete frontend of **Eureka Car Solution**, a premium multi-brand automotive marketplace for Bangladesh, designed so it can later expand internationally.

Customers will discover, compare, finance, buy and service every kind of vehicle on it:
- EV, petrol, diesel, hybrid and plug-in hybrid.
- Brand-new, reconditioned and used.
- Passenger, commercial and tractor/utility vehicles.

This phase is **frontend only**. A backend, a WhatsApp Business API integration and real payments come later. Every screen must work meaningfully on mock data today, and switch to real APIs later without rewriting UI.

The site follows one customer journey, and every major page should lead naturally to the next step:

**Discover → Learn about fuel technologies → Calculate savings → Compare → Test drive → Finance/EMI → Purchase → After-sales service.**

## 2. Non-negotiable rules

1. **Nothing decorative pretends to work.** Every button, link, filter, tab, calculator and form must do something real in the UI. If a feature needs a backend, build the full frontend interaction against the mock service layer (section 6).
2. **Be honest about mock behaviour.** Never imply that a booking was made, a loan approved, a payment taken or data saved to a server.
   - In mock mode, show a clear but tasteful notice on every confirmation, for example: *"Demo mode: this request was not sent to Eureka. Reference DEMO-TD-0042."*
   - WhatsApp buttons say "Chat on WhatsApp", never "Message sent".
3. **No fake endorsements.**
   - Testimonials, financing partners and statistics are placeholder content. Mark them `isSample: true` in data.
   - Use clearly fictional names for banks and partners, such as "Partner Bank A" or "Meridian Finance".
   - Never use a real bank's name or logo, or present a real person's quote.
4. **No hotlinked or scraped manufacturer images.** Use the placeholder media system (section 9.4).
5. **Don't damage existing work.**
   - Inspect the repo first.
   - Reuse what exists.
   - Never delete or overwrite meaningful code without saying why.
6. **No placeholder pages, no "coming soon", no lorem ipsum, no dead links.** If a page is in scope, build it fully.
7. **Finish the whole scope.** Don't stop after the homepage. Work through every phase in section 15.
8. **Avoid over-engineering.**
   - No duplicate components.
   - No speculative abstractions.
   - No files that nothing uses.

## 3. Phase 0: inspect, then plan (do this first)

1. Inspect the repository: `package.json`, framework and versions, folder layout, existing components, styles, configs and git status. Summarise what exists in 5–10 lines.
2. If the repo is empty, scaffold a Next.js App Router project with TypeScript, Tailwind CSS, ESLint and the `src/` directory. If a project exists, adapt it to this brief instead of replacing it.
3. Write `docs/IMPLEMENTATION_PLAN.md`:
   - Phases and tasks as `- [ ]` checkboxes.
   - Key decisions.
   - Any conflicts between the existing code and this brief.

   Keep it updated: tick tasks as you finish them. It's your memory across sessions.
4. Create a short `CLAUDE.md` at the repo root (under 60 lines) with:
   - The project conventions: stack, folder rules, i18n rule, mock-service rule, naming.
   - The commands to run.
5. Show me a concise plan summary, then proceed. Stop and ask only if the existing code fundamentally conflicts with this brief.

Use git. Commit at the end of each phase with a clear message.

## 4. Tech stack

Use the **latest stable, mutually compatible versions** available. Don't pin old versions, and don't mix incompatible majors.

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router), React, TypeScript (`strict: true`) |
| Styling | Tailwind CSS. Use the version's native config style, e.g. CSS-first `@theme` in Tailwind v4. Design tokens are CSS variables. |
| Animation | Motion (Framer Motion) |
| 3D | Three.js + React Three Fiber + drei, **homepage hero only**, lazy-loaded |
| Icons | lucide-react |
| Charts | Recharts |
| Forms | React Hook Form + Zod (`@hookform/resolvers`) |
| i18n | next-intl, using a `[locale]` route segment |
| Client state | Zustand with `persist`, for compare list, favourites and demo records only |
| Utilities | `clsx` + `tailwind-merge` (`cn()` helper) |
| Testing | Vitest (unit, for all money/maths logic) + Playwright (smoke tests of key flows) |

**Server vs client components:**
- Default to Server Components.
- Mark components as Client Components only when they need interactivity (filters UI, calculators, forms, 3D, carousels).

## 5. Folder structure

Adapt this to the existing repo if needed, but keep the separation of concerns:

```
src/
  app/
    [locale]/
      layout.tsx            # header, footer, floating WhatsApp, providers
      page.tsx              # homepage
      vehicles/page.tsx     # marketplace
      vehicles/[slug]/page.tsx
      compare/page.tsx
      ev/page.tsx  ev/[topic]/page.tsx
      savings-calculator/page.tsx
      finance/page.tsx  finance/apply/page.tsx  finance/status/page.tsx
      test-drive/page.tsx  test-drive/confirmation/page.tsx
      inquiry/page.tsx  inquiry/confirmation/page.tsx
      service/page.tsx  service/book/page.tsx  service/track/page.tsx
      fleet/page.tsx
      showrooms/page.tsx    # contact and showrooms
      account/(dashboard)/… # see section 10.L
      sign-in/page.tsx      # demo sign-in
      privacy/page.tsx  terms/page.tsx
      not-found.tsx  error.tsx  loading.tsx
    sitemap.ts  robots.ts
  components/
    ui/          # primitives: Button, Input, Select, Tabs, Dialog, Sheet, Badge, Card, Skeleton, Toast…
    layout/      # Header, MegaMenu, MobileNav, Footer, LanguageSwitcher, Breadcrumbs
    vehicle/     # VehicleCard, VehicleGrid, FilterPanel, Gallery, SpecTable, PriceBreakdown…
    calculators/ # EmiCalculator, RunningCostCalculator, SavingsCharts
    forms/       # FormField wrappers, PhoneInput, DatePicker, SlotPicker, Stepper
    whatsapp/    # WhatsAppButton, FloatingWhatsApp
    home/        # homepage sections + hero
    three/       # R3F hero (lazy)
    account/     # dashboard widgets
  config/        # site.ts (brand, WhatsApp number, contact), finance.ts, costs.ts, nav.ts
  data/mock/     # vehicles.ts, brands.ts, showrooms.ts, services.ts, partners.ts, customer.ts, testimonials.ts
  lib/
    api/         # service layer: vehicles.ts, bookings.ts, finance.ts, service.ts, inquiries.ts, account.ts
    calc/        # emi.ts, runningCost.ts (+ *.test.ts)
    format/      # currency.ts, number.ts, date.ts (locale-aware)
    whatsapp.ts  # link builder + message templates
    validation/  # zod schemas (phone, forms)
    seo.ts       # metadata + JSON-LD helpers
  stores/        # compare.ts, favorites.ts, demoRecords.ts (zustand)
  i18n/          # next-intl routing/request config
  types/         # domain models (section 6)
messages/  en.json  bn.json
public/  media/  models/
```

## 6. Data layer: types, mock data, service layer

### 6.1 Domain types (`src/types`)

Define strict TypeScript types. A minimum set:

- `LocalizedText = { en: string; bn: string }`. Use it for every human-readable content field in mock data.
- `FuelType = 'ev' | 'petrol' | 'diesel' | 'hybrid' | 'phev'`
- `Condition = 'new' | 'reconditioned' | 'used'`
- `VehicleCategory = 'car' | 'suv' | 'mpv' | 'pickup' | 'commercial' | 'tractor' | 'utility'`
- `Vehicle`, with these fields:
  - Identity: `id`, `slug`, `brandId`, `model`, `variant`, `year`, `condition`, `category`, `bodyType`, `fuelType`, `transmission`, `drivetrain`, `seats`, `colors[]`.
  - Price: `price: { amount: number; currency: 'BDT'; negotiable?: boolean }`.
  - Usage: `mileageKm`, plus `auctionGrade?` (for Japanese reconditioned cars, e.g. "4.5").
  - Powertrain: `engine?: { displacementCc, powerHp, torqueNm }` and `motor?: { powerKw, torqueNm }`.
  - Battery: `battery?: { capacityKwh, rangeKm, dcFastChargeKw?, warrantyYears? }`.
  - Efficiency: `efficiency: { kmPerLitre?: number; kWhPer100km?: number }`.
  - Content: `features: LocalizedText[]`, `safety: LocalizedText[]`, `specs` (grouped key/value), `images: Media[]`.
  - Availability: `availability: 'in_stock' | 'incoming' | 'reserved' | 'sold'`, `showroomIds[]`, `isFeatured`, `isNewArrival`, `createdAt`.
- `Brand`, `Showroom` (address, `geo: { lat, lng }`, phone, hours, services offered), `ServicePackage`, `FinancePartner` (`type: 'conventional' | 'islamic'`, illustrative rate range, `isSample`), `Testimonial` (`isSample`), `CustomerProfile`.
- Records: `TestDriveBooking`, `PurchaseInquiry`, `FinanceApplication` (with status timeline), `ServiceBooking` (with status timeline), `EmiSchedule`, `Notification`, `Referral`.

### 6.2 Mock data (`src/data/mock`)

Make the data realistic, varied and consistent:
- **About 30 vehicles** across 10–12 real-world brands. Cover every fuel type, condition and category, including at least 2 commercial vehicles and 2 tractors. Include a realistic spread of BDT prices, years, mileages and auction grades for reconditioned cars.
- **4–5 showrooms**, for example Dhaka (Tejgaon, Gulshan), Chattogram and Sylhet. Use plausible but clearly illustrative addresses and phone numbers.
- **6 service packages**, including an EV battery health check.
- **6 financing partners**: 4 conventional and 2 Islamic, all fictional and `isSample`.
- **A demo customer** with 2 owned vehicles, bookings, an active finance application, an EMI schedule, service history, favourites, referrals and notifications.
- **6 testimonials**, all `isSample`.
- All vehicle prices, rates and specs are illustrative. Vehicle model names may be real, but don't claim they are official prices.

### 6.3 Service layer (`src/lib/api`)

UI components **never import mock data directly**. They call async functions such as:

- `getVehicles(filters)` → `{ items, total, facets }`
- `getVehicleBySlug()`
- `getSimilarVehicles()`
- `createTestDriveBooking()`, `submitInquiry()`, `submitFinanceApplication()`, `getFinanceApplicationStatus()`, `createServiceBooking()`, `trackServiceBooking()`, `getCustomerDashboard()`, …

Each function:
- Reads from mock data when `NEXT_PUBLIC_DATA_MODE=mock` (the default). It simulates 300–700 ms of latency, and can simulate an error for testing (e.g. a phone ending in `0000` returns a validation error from the "server").
- Has a typed signature that a real `fetch` implementation can replace later. Leave a single clearly marked `// TODO(api):` per function, not scattered throughout.
- Returns created records with a `DEMO-` prefixed reference.

**Demo records:** stored in a Zustand store persisted to `localStorage`. This lets a submitted test drive appear in the dashboard during the session. Label it in the UI as "Saved in this browser only (demo)".

### 6.4 Formatting (`src/lib/format`)

- **Currency:** BDT with **lakh/crore grouping**, e.g. `৳45,00,000`, using `Intl.NumberFormat('en-IN')` for English. Use Bangla digits for `bn` (`bn-BD`).
- **Compact form:** "৳45 lakh" / "৳1.2 crore", localised.
- **Dates and times:** localised, in the Asia/Dhaka time zone.
- **Units:** km, L, kWh. Show fuel economy as km/L, which is what customers in Bangladesh expect.

## 7. Internationalisation (English + Bangla)

- Use next-intl with `/en/...` and `/bn/...` routes. English is the default, and the root redirects by preference/cookie.
- **No hard-coded UI strings in components.** All UI copy goes in `messages/en.json` and `messages/bn.json`, organised by feature namespace. Content data uses `LocalizedText`.
- Write natural, fluent Bangla, not word-for-word machine translation. Keep commonly used English terms where Bangladeshi customers use them (EMI, EV, test drive, SUV), alongside Bangla where natural.
- Put the language switcher in the main nav. It keeps the current page and query string.
- **Bangla typography:**
  - Load **Noto Serif Bengali** (display) and **Hind Siliguri** (body) via `next/font` for `bn`.
  - Increase the Bangla line-height slightly (about 1.7 for body).
  - Never letter-space Bangla text. Disable uppercase transforms and tracking utilities for `bn`.
- Use Bangla digits in `bn` for prices, dates and counts.
- Set `<html lang>` correctly. Add `hreflang` alternates in metadata.

## 8. Design system

The brand feels like a premium international automotive house: quiet, editorial, confident. Take inspiration from the quality of Porsche, BMW, Mercedes-Benz, Tesla, Lucid and Rivian, but **do not copy any of their layouts, assets or copy**.

### 8.1 Tokens (CSS variables + Tailwind theme)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#e4e7df` (stone sage) | Main light surface |
| `--bg-alt` | `#f6f4ef` (ivory) | Alternating light sections, cards |
| `--ink` | `#161a16` | Primary text |
| `--muted` | `#6c7268` | Secondary text |
| `--line` | `rgba(22,26,22,.12)` | Hairlines, borders |
| `--accent` | `#9c8150` (brass) | Accent: active states, key highlights, italic emphasis |
| `--accent-2` | `#c8b07c` | Gradients, hovers |
| `--dark` | `#0e0e10` (onyx) | Dark cinematic sections |
| `--on-dark` | `#f3efe7` | Text on dark |
| Status | success `#2f6b4f`, warning `#a8752a`, danger `#9b2c2c`, info `#2f5672` | Dashboard, forms |
| EV accent | a cool teal used only to tag EV content | Fuel-type chips |

### 8.2 Type, spacing and motion

- **Fonts:** Cormorant Garamond for display (300–500, with italics) and Inter for UI text (300–600), via `next/font`. Bangla fonts are in section 7.
- **Headings:** large, light weight, tight leading. One italic accent phrase per hero heading. Labels are small uppercase with wide letter-spacing (English only).
- **Layout:** generous whitespace and a 12-column grid, with a max width of about 1440px for content and full-bleed media. Use 1px hairlines rather than heavy shadows. Cards have a subtle border, an 18–24px radius and a restrained hover lift.
- **Rhythm:** alternate light (sage/ivory) and dark (onyx) sections on the homepage and key landing pages.
- **Motion:** subtle reveals (fade/translate 12–24px), staggered lists and smooth page transitions. Respect `prefers-reduced-motion` everywhere. Internal pages prioritise speed and clarity over effects.

### 8.3 Components

Build a small, consistent primitive set in `components/ui`:
- Button: primary (ink), accent, outline, ghost, WhatsApp variants; sizes; loading state.
- Inputs, Select, Combobox, Slider, Checkbox/Radio cards, Tabs, Accordion, Dialog, Sheet/Drawer.
- Toast, Tooltip, Badge/Chip, Skeleton, EmptyState, ErrorState, Stepper, Pagination, Breadcrumbs.

Every component needs visible focus states and must work by keyboard.

## 9. Global layout and cross-cutting features

### 9.1 Header

- Logo (monogram + "EUREKA / CAR SOLUTION").
- **Mega-menu** for Vehicles (by fuel type, condition and category) and Services.
- Links: EV Centre, Finance, Fleet, Showrooms.
- Language switcher, compare tray count, favourites, account.
- "Book a test drive" CTA.
- Sticky, with a compact state on scroll. A full-screen mobile nav sheet.

### 9.2 Footer

Sitemap columns, showrooms, hours, WhatsApp/phone/email, newsletter signup (mock submit with honest confirmation), legal links and a language switch.

### 9.3 WhatsApp-first experience (core feature)

- `config/site.ts` holds a single `whatsappNumber` placeholder (e.g. `8801XXXXXXXXX`, E.164 digits only), with a comment saying to replace it before launch.
- `lib/whatsapp.ts`:
  - `buildWhatsAppLink(message: string)` returns `https://wa.me/<number>?text=<encodeURIComponent(message)>`.
  - Typed templates, localised in en/bn:
    - `vehicleInquiry(vehicle)` → "Hello, I am interested in [Vehicle]. Please provide more details." Includes the vehicle name, year, condition and reference/URL.
    - `emiInquiry(vehicle)` → "Hello, I want to purchase [Vehicle] through EMI. Please share the financing options."
    - `testDrive(vehicle)` → "Hello, I would like to book a test drive for [Vehicle]."
    - `service(vehicle?)` → "Hello, I need servicing information for my vehicle." Optional vehicle and registration number.
    - `corporate()` → "Hello, I am interested in your corporate fleet solutions."
    - `general()`.
- `<WhatsAppButton context=… />` is reusable. Place it on:
  - Vehicle cards (icon) and detail pages (full).
  - Calculators: carry the computed EMI/savings into the message.
  - Forms and confirmation pages: carry the reference number.
  - Service, fleet and showroom pages.
- A floating WhatsApp button appears on all pages. It opens a small panel of context-aware quick options. Hide it while forms have focus on mobile.
- Links open in a new tab with `rel="noopener noreferrer"`. **Never** describe these links as automation or as a sent message.

### 9.4 Media

- `components/media/VehicleImage` takes a `Media` object: `{ src?: string; alt: LocalizedText; aspect }`.
- When `src` is missing, it renders an elegant generated placeholder: a stylised SVG silhouette per body type on a tinted gradient, with the brand initial. All mock vehicles use these until real photos are added under `public/media/vehicles/<slug>/`.
- Use `next/image` for all real images, with correct `sizes`, AVIF/WebP and blur placeholders.

### 9.5 Compare and favourites

- **Compare:**
  - Add/remove from cards and detail pages, with a maximum of 4 vehicles.
  - A persistent compare tray (bottom sheet) with thumbnails and a "Compare now" button.
  - State is persisted. The `/compare?ids=a,b,c` URL is shareable.
- **Favourites:** a heart toggle on cards and detail pages, with a list in the account dashboard.

## 10. Pages and acceptance criteria

### A. Homepage `/`

**Section order:**
1. **3D cinematic hero** (section 11).
2. Quick search bar: condition, fuel type, brand, budget → Marketplace with filters applied.
3. Browse by fuel type (EV / Petrol / Diesel / Hybrid / PHEV) and by category (incl. Commercial and Tractors).
4. Featured vehicles and new arrivals (carousel/grid).
5. Popular brands (logo-less text tiles; no trademarked logos in mock).
6. EV education teaser with 3 key facts → EV Centre.
7. Savings calculator teaser: a mini interactive slider with a live estimate.
8. Compare teaser.
9. EMI highlight: a mini EMI calculator.
10. Test drive CTA band.
11. After-sales highlights.
12. Corporate and fleet band.
13. Testimonials (sample).
14. Showroom strip.
15. Newsletter, then the footer.

**Accept when:** every block links to a working destination, the mini calculators compute, and the page is fully responsive.

### B. Marketplace `/vehicles`

- **Filters:**
  - Brand, model (dependent on brand), price range (BDT slider + inputs), fuel type, condition (new/reconditioned/used), year range, transmission, body type, category, mileage range, availability.
  - Seats, plus EV range when EV is selected.
- **Sort:** featured, price ↑/↓, year, mileage, newest.
- **Search:** free text across brand, model and variant.
- **Views:** grid/list toggle and pagination (or "Load more").
- **URL is the source of truth:** all filter, sort, search and view state lives in `searchParams` (shareable, SEO-friendly, back-button safe).
- **Mobile:** filters in a drawer, with an applied-filter count and removable chips.
- **Facet counts** next to filter options.
- **States:** an empty state with a "clear filters" action, loading skeletons and an error state.
- **Vehicle card:** image, brand/model/variant, year, condition badge, fuel chip, key specs (mileage, transmission, range or km/L), price (lakh format), EMI-from estimate, then favourite, compare and WhatsApp actions.

### C. Vehicle details `/vehicles/[slug]`

- **Gallery:** thumbnails, swipe and keyboard support, and a fullscreen lightbox.
- **Header:** title, badges (condition, fuel, availability), price, EMI-from, and the primary CTAs: Book test drive, Enquire to buy, WhatsApp, Compare, Save.
- **Overview and key specs:** brand/model, year, fuel, engine or motor, battery (EV/PHEV only), mileage, transmission, condition and auction grade (reconditioned).
- **Full spec table:** grouped and collapsible.
- **Features and safety lists.**
- **Price breakdown:** vehicle price, registration and fees (illustrative), and an on-road estimate, with the estimate clearly labelled.
- **Embedded EMI calculator**, prefilled with this vehicle's price.
- **Embedded running-cost calculator**, prefilled with this vehicle's efficiency.
- **Similar vehicles** (same category/price band) and the showrooms holding this vehicle.
- **Purchase inquiry form** (section I), inline or in a drawer, prefilled with the vehicle.
- **SEO:** `generateMetadata` plus `Car`/`Vehicle` JSON-LD with `Offer`.
- **Missing slug:** a proper not-found page.

### D. EV Education Centre `/ev`, `/ev/[topic]`

**Topics:**
- What is an EV?
- How EVs work.
- EV vs petrol vs diesel vs hybrid vs PHEV (a comparison table).
- Battery technology.
- Charging (home, AC and DC, plus a charging-time explainer).
- EV maintenance.
- Benefits and limitations (an honest, balanced view).
- An EV ownership guide for Bangladesh: home charging setup, planning longer trips, and practical considerations.

**Page features:** a readable article layout, a table of contents, diagrams built as simple SVG/HTML, CTAs to the savings calculator and the EV listings, and FAQs (with JSON-LD).

**Accuracy:** factual and cautious. Avoid specific legal, tax or subsidy claims. Where local conditions vary, say "check current local regulations/prices".

### E. Savings calculator `/savings-calculator`

- **Compare** EV, petrol, diesel and hybrid side by side, pre-populated with representative sample vehicles. Users can also pick specific vehicles from inventory.
- **Inputs:**
  - Distance: per day, month or year (toggle).
  - Fuel prices per litre (petrol/octane, diesel) and the electricity price per kWh.
  - Efficiency: km/L, or kWh/100km.
  - Annual maintenance estimates.
  - Ownership period: 1–10 years.
- **Outputs:**
  - Cost per km.
  - Monthly and annual running costs.
  - Total over the ownership period.
  - Savings versus the most expensive option.
  - The break-even point, if the purchase prices are included.
- **Charts (Recharts):** a stacked bar chart of the annual cost breakdown, and a cumulative line chart over the years.
- **Defaults:** all default values live in `config/costs.ts`, marked as **sample values to update before launch**. Show a visible "Estimates only — update prices to current rates" note, and a "Reset to sample values" button.
- Implement the maths in `lib/calc/runningCost.ts` with unit tests.

### F. Vehicle comparison `/compare`

- Compare **2–4 vehicles** side by side. Add vehicles via search inside the page, and remove them.
- **Sections:** price, EMI estimate (shared assumptions), specs, efficiency, running cost per year (shared assumptions), features, safety.
- **"Highlight differences"** toggle: hide identical rows, and highlight the best value per row where "best" is meaningful.
- Sticky vehicle headers. On mobile, a horizontal scroll with a pinned first column.
- Each column has CTAs: test drive, WhatsApp, details.

### G. EMI and financing `/finance`, `/finance/apply`, `/finance/status`

- **EMI calculator:**
  - Inputs: vehicle price (or pick a vehicle), down payment (amount or %), tenure (12–84 months), annual rate.
  - Outputs: monthly EMI, total interest/profit and total payable.
  - A principal-vs-interest donut chart, and a full amortisation schedule (collapsible, with year-by-year totals).
  - Reducing-balance formula: `EMI = P·r·(1+r)^n / ((1+r)^n − 1)`, where `r` = annual rate / 12 / 100. Handle `r = 0`. Round for display only.
  - Implement in `lib/calc/emi.ts` with tests.
- **Islamic financing:**
  - A toggle switches the terminology: "profit rate", "rental/instalment", and Ijarah / Hire Purchase under Shirkatul Melk (HPSM) explained simply.
  - An illustrative calculation, with a note that actual Islamic finance structures differ by institution.
- **Partners:** fictional, sample partner cards with illustrative rate ranges and max tenure.
- **Eligibility and documents:**
  - Eligibility guidance (salaried/business/professional) shown as a clear checklist.
  - A required-documents checklist that the user can tick, saved locally.
- **Application form (`/finance/apply`):**
  - A multi-step stepper: vehicle → personal → employment/income → documents (file inputs: UI only, never uploaded) → review → submit.
  - Submission goes through the mock service, returns a `DEMO-FA-xxxx` reference, and shows an honest demo notice.
- **Status page (`/finance/status`):** enter a reference or open it from the dashboard. Shows a status timeline (Submitted → Under review → Documents verified → Decision), with demo data.

### H. Test drive booking `/test-drive`

- **Steps:** vehicle → showroom (filtered to showrooms that have it) → date (no past dates; closed days disabled per showroom hours) → available time slot (mock availability, some slots unavailable) → customer details → review.
- **Confirmation page:** booking summary, an "Add to calendar" (.ics download), showroom map UI and directions link, a WhatsApp confirmation CTA (with the reference), and the demo notice.
- **Deep links:** `/test-drive?vehicle=<slug>` preselects the vehicle.

### I. Purchase inquiry `/inquiry`

- **Fields:** customer details, vehicle (preselected via query), payment preference (full payment / EMI / Islamic finance / trade-in later), financing preference, contact preference (call / WhatsApp / email + preferred time), message.
- **Confirmation:** summary, reference, WhatsApp CTA and demo notice. **No payment processing.**

### J. After-sales and service `/service`, `/service/book`, `/service/track`

- **Landing:** service packages with illustrative prices (including the EV battery health check), what's included, maintenance-interval guidance by fuel type, and pickup/drop-off info.
- **Booking:** vehicle (from "My vehicles" or entered manually: brand/model/year/reg no.) → package(s) → showroom/service centre → date and slot → pickup/drop-off option with address → details → review → confirmation (reference, WhatsApp CTA, demo notice).
- **Tracking:** enter a reference, then see a status timeline (Booked → Received → In service → Quality check → Ready → Delivered).
- **Service history:** shown in the dashboard.

### K. Corporate and fleet `/fleet`

- **Content:** value propositions, fleet management offering, commercial vehicles (link to the filtered marketplace), business financing, and an illustrative bulk-purchase process.
- **Corporate inquiry form:** company, industry, fleet size, vehicle types, timeline, financing interest, contact.
- **Confirmation:** demo notice and WhatsApp CTA.

### L. Customer account dashboard `/account/...`

- **Demo sign-in (`/sign-in`):** a "Continue as demo customer" button plus a mock email/OTP UI. Label it clearly as a demo. Use a simple client-side demo session; it is not real auth.
- **Dashboard sections:**
  - Overview: next booking, active applications, EMI due, notifications.
  - Profile (editable, saved locally).
  - My vehicles.
  - Test-drive bookings.
  - Purchase inquiries.
  - Financing applications (with status).
  - EMI schedule (paid/upcoming, next due date, progress).
  - Service bookings.
  - Service history.
  - Saved vehicles.
  - Referral programme (referral code, copy/share, WhatsApp share, list of referrals with status).
  - Notifications (mark read).
- Records submitted during the session (section 6.3) appear here alongside the seeded demo data.
- **Layout:** a sidebar on desktop, with a tab bar or menu on mobile.

### N. Contact and showrooms `/showrooms`

- **Showroom cards:** address, phone, email, business hours with an open/closed-now indicator (Asia/Dhaka), services available, map UI, and a "Get directions" link.
- **Contact form:** mock submit with an honest confirmation, plus WhatsApp contact.
- **Maps:** no API key required. Use a styled static map card and a `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>` link. Keep the map component swappable for an embedded provider later.
- **SEO:** `AutoDealer` / `LocalBusiness` JSON-LD per showroom.

### Also required

- `privacy` and `terms` pages, with sensible placeholder legal text marked for legal review.
- A branded 404 page, a global error boundary, and route `loading.tsx` skeletons.

## 11. Homepage 3D hero

- If `reference/eureka-reference.html` exists, it is the visual and motion reference. Port its approach into React Three Fiber:
  - The procedural "Eureka One" car.
  - The studio environment and mirror floor.
  - The light-bar welcome sequence.
  - Scroll-linked camera keyframes.
  - The paint change.
  - The exploded view.
- **Condense it to about 4 chapters across roughly 350–450vh,** then hand over to the normal homepage sections. The marketplace homepage must not feel like an endless scroll.
- **Support a real model:** if `public/models/hero-car.glb` exists, load it (Draco/Meshopt enabled via drei) instead of the procedural car.
- **Performance and usability come first:**
  - Load the 3D code via `next/dynamic` with `ssr: false`, after the hero text and a static poster image have rendered. The LCP must be the headline or the poster, not the canvas.
  - Use the static poster hero instead of WebGL when: the viewport is narrower than 768px, `prefers-reduced-motion` is on, WebGL is unavailable, or `navigator.deviceMemory < 4`.
  - Cap DPR at 1.5–2. Use drei `PerformanceMonitor` to degrade quality. Pause rendering when the hero is off-screen.
  - The hero must still contain the headline, search shortcut and main CTAs in normal HTML, accessible without the 3D.

## 12. Forms (shared rules)

- Use React Hook Form + Zod, with schemas in `lib/validation`. Localise error messages (en/bn).
- **Bangladesh mobile validation:** accept `01XXXXXXXXX` (11 digits, operator prefix 3–9) or `+8801XXXXXXXXX`. Normalise to E.164.
- **Behaviour:**
  - Inline errors, with focus moved to the first error on submit.
  - A disabled + loading state while submitting.
  - Success and error toasts plus confirmation pages.
  - The submission's server error message is mapped onto the relevant field.
- Show a consent checkbox for contact via WhatsApp/phone where the user is asking to be contacted. Never pre-tick it.
- Steppers keep their state when going back. Show a progress indicator.

## 13. SEO, accessibility and performance

- **SEO:**
  - `generateMetadata` on every page (localised titles/descriptions), Open Graph, and canonical URLs.
  - `hreflang` alternates for en/bn.
  - `sitemap.ts` including all vehicle pages, and `robots.ts`.
  - Semantic HTML with a sensible heading order.
  - JSON-LD where noted.
- **Accessibility (WCAG 2.2 AA):**
  - Contrast (check brass-on-sage and text on dark sections).
  - Full keyboard navigation, focus traps in dialogs/drawers, and a skip link.
  - Proper labels and `aria-live` for calculator results and form status.
  - Alt text, and no information conveyed by colour alone.
- **Performance:**
  - Server Components by default, with code-split client islands.
  - Don't ship Three.js to non-home routes.
  - Optimise images and fonts (`next/font`, `display: swap`). Avoid layout shift.
  - Targets: LCP < 2.5s, CLS < 0.1, INP < 200ms on mid-range mobile.

## 14. Testing and verification

- **Vitest:**
  - `emi.ts`: known values, zero rate, rounding, amortisation sums equal the principal.
  - `runningCost.ts`.
  - Currency/lakh formatting, en and bn digits.
  - The WhatsApp link builder (encoding, number format).
  - Phone validation.
- **Playwright smoke tests:**
  1. Marketplace: filter by EV + price, open a vehicle, and check the WhatsApp link contains the vehicle name.
  2. Add 3 vehicles to compare and see the comparison table.
  3. EMI calculator: entering known inputs produces the expected EMI.
  4. Test-drive booking end to end, reaching a confirmation with a DEMO reference.
  5. Switching to Bangla shows Bangla UI and Bangla digits on prices.
- **At the end of every phase:**
  - Run typecheck (`tsc --noEmit`), lint, unit tests and `next build`, and fix all errors.
  - Run the dev server and click through the phase's flows.
  - Check mobile (375px), tablet (768px) and desktop (1440px) widths.
  - Update `IMPLEMENTATION_PLAN.md` and commit.

## 15. Phases (complete all of them)

| Phase | Scope | Done when |
|---|---|---|
| 0 | Inspect repo, plan, `CLAUDE.md` | Plan file exists; summary shown |
| 1 | Foundation: Next/Tailwind setup, tokens, fonts (incl. Bangla), next-intl routing, header/mega-menu/mobile nav, footer, floating WhatsApp, UI primitives | Both locales render the shell; build passes |
| 2 | Data layer: types, mock data, service layer, formatters, calculators + Vitest, Zustand stores | Tests pass; services typed |
| 3 | Marketplace, vehicle details, compare, favourites | URL-driven filters work; details complete |
| 4 | Savings calculator, EMI & financing (calculator, Islamic toggle, partners, eligibility, apply stepper, status) | Maths verified; charts render |
| 5 | Test drive, purchase inquiry, service (landing/book/track), fleet, showrooms/contact | Every form submits to mock with honest confirmation |
| 6 | EV Education Centre | All topics written in en + bn |
| 7 | Demo sign-in + full account dashboard | Session records appear in dashboard |
| 8 | Homepage sections + 3D hero with fallbacks | Hero degrades correctly; LCP not the canvas |
| 9 | Polish: responsive pass, a11y audit, SEO, performance, Playwright smoke tests, README | All checks green; DoD below met |

## 16. Definition of done

- [ ] Every route in section 10 exists, works and is responsive at 375 / 768 / 1440px.
- [ ] English and Bangla are complete. No hard-coded UI strings. Bangla typography and digits are correct.
- [ ] No dead buttons or links. Every form validates, submits to the mock layer, and shows honest success/error states.
- [ ] WhatsApp CTAs are everywhere specified, with context-aware localised messages and one configurable number.
- [ ] The mock data layer is fully isolated: swapping in real APIs requires changing only `src/lib/api/*`.
- [ ] Calculators are unit-tested. Estimates are clearly labelled, and sample values live in `config/`.
- [ ] Typecheck, lint, unit tests, Playwright smoke tests and production build all pass.
- [ ] The README covers: setup, scripts, env vars (`NEXT_PUBLIC_DATA_MODE`, WhatsApp number), folder guide, how to add real vehicle photos and a hero `.glb`, how to connect a real API, and a **"Replace before launch"** checklist.

### "Replace before launch" checklist (include in the README)

- [ ] WhatsApp number, phone numbers, emails and showroom addresses.
- [ ] Vehicle data, prices and photos (with image rights).
- [ ] Fuel/electricity prices and maintenance estimates in `config/costs.ts`.
- [ ] Interest/profit rates and partner institutions (only real, signed partners).
- [ ] Testimonials (only real customers, with permission).
- [ ] Legal pages reviewed by a lawyer.
- [ ] Fees, registration and on-road cost estimates.

When everything is complete, give me:
1. A short summary of what was built.
2. Anything you couldn't complete, and why.
3. The exact commands to run the project and the tests.

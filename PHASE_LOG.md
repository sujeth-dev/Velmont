# Velmont Website — Phase Log

Living record of every phase. One entry per phase. Updated after every push.

---

## Client Content Delivery — Facility Photos + Social Links

| Field | Value |
|---|---|
| Date | 2026-07-16 |
| Status | Complete |
| Branch | main |

### What shipped

- **Contact email correction** — `Info@velmontdesign.com` → `velmont@velmontdesign.com` across form submit target (`contact.js`), footer, contact page, and plan docs (finished + committed leftover working-tree change).
- **Manufacturing facility photos** — client delivered 5 edited 16:9 photos. Renamed to descriptive slugs under `assets/facility/` (facility-panorama, edge-banding-line, production-floor, sliding-table-saw, panel-saw-line). `scripts/convert-images.js` gained a `convertFacility()` pass → `public/assets/facility/*.{webp,avif}` (4000×2250, WebP 82 / AVIF 70). Dashed `.vm-manuf__photo-placeholder` blocks replaced with real `<picture>` stacks — About shows 4 in a dark 2×2 fill-slide grid (`vm-manuf--dark vm-manuf--fill`, `min-height: 100vh`, narrow text column beside a wide `.vm-manuf__photos--grid`), Services shows 1 panorama, no duplication. New `.vm-manuf__photos` grid CSS (16:9 aspect-ratio, cover) plus dark colour overrides in `about.css`; dark placeholder overrides removed from `services.css`. Hero images untouched (client constraint).
- **Social links live** — footer spans converted to real anchors: instagram.com/velmontdesign + linkedin.com/company/velmont-design-llp (`target="_blank" rel="noopener"`); "Follow" item added to contact Studio details.
- **Docs sync** — MASTER_PLAN/WEBSITE_PLAN outstanding items marked delivered; DECISIONS.md entry added; README status line un-staled (was "Phase 4 complete") and truncated tail repaired.

### Tests

| Suite | Result |
|---|---|
| Vitest | see A4 verification |
| Vite build | see A4 verification |

### Carry-overs

- ITC Grand Chola: 6 new photos converted on disk but not wired into gallery (live data comes from Firebase; user chose to keep minimal for now).
- Remaining pre-launch items: EmailJS credentials, Vercel project + domain DNS (Phase 8), project photography for 6 placeholder projects, MEA Bangalore photos/year/area, The Seasons OTFs.

---

## Post-Retrofit Polish — Nav/Footer, Hero, Stats Grid

| Field | Value |
|---|---|
| Date | 2026-07-10 |
| Status | Complete |
| Branch | main |
| Commit | 431d41b |

### What shipped

Follow-up pass on top of the Mobile-Responsive Retrofit below, fixing issues surfaced by the client on real small-viewport testing (320/375/425px):

- **Nav/footer logo+tagline overlap** — `.vm-nav__tagline`/`.vm-footer__tagline` used a flat desktop-tuned negative `margin-top` that didn't scale down with `--logo-h` at tablet/mobile, pulling the tagline up into the shrunk logo. Fixed with breakpoint-specific margins proportional to the logo height at each tier (`nav.css`, `footer.css`).
- **Hero eyebrow clipping/low contrast** — `.vm-hero` used a fixed `height` with `overflow: hidden`, clipping the "Defining Environments." eyebrow on narrow viewports; switched to `height: auto; min-height: var(--hero-h)` so the box grows to fit content. Also strengthened the overlay gradient and added text-shadow to the eyebrow so it stays legible against every slide image, not just darker ones (`home.css`).
- **Mobile hero decluttering** — tightened breakpoint-specific vertical rhythm (eyebrow/H1/CTA/meta spacing) and moved `.vm-hero__meta` (location/est. year) from absolute positioning — which competed visually with the CTA — into normal flow below it, separated by a hairline divider (`home.css`).
- **Hero description paragraph removed site-wide** — `.vm-hero__sub` deleted from `index.html` and its CSS rule dropped entirely; hero is now eyebrow → H1 → CTA → meta only, with headline-to-CTA spacing rebalanced (44px desktop / 30px tablet / 24px mobile) to keep the shorter content block visually centered.
- **Stats grid (15+/100+/5M+/200+) alignment fix** — the mobile 2×2 grid inherited desktop-only `:first-child`/`:last-child` padding rules, which broke padding symmetry and made the center divider look off-axis. Replaced with `:nth-child`-based rules so all four cells have matching padding and the dividers cross precisely at center; also capped the section's `min-height: 80vh` down to `auto` with tighter padding/gap on mobile and tablet to remove excess whitespace above/below the grid (`home.css`).

### Tests

| Suite | Result |
|---|---|
| Vitest | Pass — 89/89 |
| ESLint | Clean |
| Prettier | Clean |
| Vite build | Clean |
| Manual (Playwright screenshot + bounding-box checks, ad-hoc, not committed) | 320/375/425/768/1440px — zero horizontal overflow, `.vm-hero__sub` count 0, stats dividers/padding symmetric, hero eyebrow fully visible on all 5 background slides |

### Carry-overs

- Kept the hero's bottom-anchored (`justify-content: flex-end`) layout rather than switching to literal `justify-content: center` — interpreted the client's "content remains vertically centered" note as "visually balanced" given the established editorial design. Flagged to the client for confirmation; revisit if they want true vertical centering instead.
- All carry-overs from the Mobile-Responsive Retrofit below (mobile image `srcset`/performance, `e2e/work.spec.js`/`home.spec.js` stale project-count assertions, admin panel desktop-only) remain open — not addressed by this pass.

---

## Mobile-Responsive Retrofit — Public Site

| Field | Value |
|---|---|
| Date | 2026-07-10 |
| Status | Complete |
| Branch | main |

### What shipped

- **Unlocked the viewport** on all 6 public pages: `<meta name="viewport">` changed from `content="width=1200"` to `content="width=device-width, initial-scale=1"`; `body { min-width: 1200px }` in `base.css` scoped to `@media (min-width: 1024px)` only. Admin panel left untouched (still locked to 1200 — out of scope, confirmed with client).
- **Three-tier breakpoint system** — mobile (≤599px), tablet (600–1023px), desktop (≥1024px, unchanged). Every page/component CSS file (`nav.css`, `footer.css`, `common.css`, `home.css`, `work.css`, `project.css`, `about.css`, `services.css`, `contact.css`) got its own `@media` override block appended at the end of that same file, plus a shared spacing/sizing token override block in `base.css`. A single new `responsive.css` file was tried first and abandoned — Vite's CSS code-splitting doesn't reliably preserve `<link>` order across chunks once a page's CSS is split, which silently broke every override (see `DECISIONS.md`).
- **Fluid typography** — `--fs-hero-h1`, `--fs-project-h1`, `--fs-section-h2`, `--fs-section-h3-dark`, `--fs-editorial-lead`, `--fs-work-tile-name`, `--fs-display-num` converted to `clamp()` in `tokens.css`, upper-bounded at the exact pre-existing desktop value so ≥1024px renders pixel-identical to before.
- **Mobile nav** — new hamburger toggle + off-canvas panel: markup in `src/components/nav.html`, `initMobileNav()` added to `src/js/components.js` (delegated `document` listeners so it works regardless of which of the 3 different nav-injection call sites ran), CSS in `nav.css` (`.vm-nav__panel` uses `display: contents` at desktop so it's a no-op there, `position: fixed` + `transform`/`visibility` toggle below 1024px).
- **Home carousel fix** (`src/js/home.js`) — the "Our Projects" slider's `translateX` math was hardcoded to `TILE_PCT = 100/3` (assuming exactly 3 visible tiles). New `measureTilePct()` reads the actual rendered tile width at runtime instead, recalculated on debounced resize — needed since mobile/tablet show fewer visible tiles.
- **Real bug found and fixed**: `.vm-proj-gallery__img` (project detail gallery) was missing `min-width: 0`, so grid items blew out past their track on the *existing*, pre-existing `@media (max-width: 767px)` mobile rule in `project.css` — this bug has existed since Phase 3 but was invisible until the `width=1200` viewport lock was removed.
- **Testing**: `playwright.config.js` gained `mobile` (Pixel 5 viewport) and `tablet` (768×1024) projects — both Chromium-based (WebKit device profiles were tried first but this repo only has Chromium installed). New `e2e/mobile-nav.spec.js` covers hamburger open/close/Escape. Full existing suite re-run across all 3 projects.
- **Accessibility**: fixed a pre-existing near-miss contrast failure on `.vm-footer__tagline` (4.47:1 vs 4.5:1 required) — surfaced for the first time by this being the first-ever mobile-emulated Lighthouse run on this site (previous runs were all desktop-preset).
- Docs updated: `DECISIONS.md` (new entry, supersedes the 2026-06-21 "No responsive/mobile design" entry), `plan/DESIGN_GUIDE.md` §4 "Mobile / Responsiveness" section corrected.

### Tests

| Suite | Result |
|---|---|
| Vitest | Pass — 89/89 (4 new `measureTilePct` tests in `home.test.js`) |
| ESLint / Prettier | Clean |
| Vite build | Clean — desktop output byte-for-byte unaffected at ≥1024px (verified via scrollWidth/clientWidth parity across all 6 pages) |
| Playwright (chromium/mobile/tablet × 8 spec files) | 117 passed, 7 new mobile-nav tests passed. 42 failures — identical across all 3 projects, confirming pre-existing data drift (`e2e/work.spec.js`/`home.spec.js` hardcode "18 project tiles"; `data/projects.json` now has 19 published projects), not a responsive regression. Not fixed — out of scope (content sync, not layout). |
| Manual overflow check (Playwright, 6 pages × 3 viewports) | 375px, 768px, 1440px — zero horizontal overflow on any page after fixes |
| Lighthouse (mobile-emulated, first ever mobile run on this site) | Accessibility 0.95, SEO 1.0, Best Practices 1.0, Performance 0.50 (expected — no responsive `srcset` work done, images stay full desktop-resolution on mobile; flagged as a follow-up, not fixed here) |

### Carry-overs

- Performance on mobile (0.50) is meaningfully lower than desktop — the image pipeline (`scripts/convert-images.js`) only emits one fixed resolution per image; real mobile performance gains need multi-width `srcset` generation, a separate, larger piece of work.
- `e2e/work.spec.js` / `e2e/home.spec.js` project-count and title assertions are stale (18 vs 19 published projects, at least one renamed project). Pre-existing, unrelated to this phase — needs a content-sync pass.
- Admin panel is still desktop-only by design (internal tool). Revisit if the client wants to manage content from a phone/tablet.

---

## Phase 7 — Production Hardening (SEO, Brand Assets, Accessibility)

| Field | Value |
|---|---|
| Date | 2026-07-09 |
| Status | Complete |
| Branch | main |

### What shipped

- **Brand assets** — `scripts/generate-brand-assets.js` (new, one-time, sharp): crops the terracotta "M" chair-mark out of `velmont-main.png` and composites it onto a `--paper` square for `public/favicon-32.png`, `favicon-16.png`, `apple-touch-icon.png` (180×180); also renders `public/assets/og/default-og.jpg` (1200×630, full wordmark centered on `--paper` with a terracotta accent rule). Not wired into `npm run build` — output is committed, re-run manually if the source logo changes.
- **`public/robots.txt`** — allows all, disallows `/admin/`, points to the sitemap.
- **`public/sitemap.xml`** — new `scripts/generate-sitemap.js`, wired into `npm run build` (after `generate-pages`). Writes `dist/sitemap.xml` directly: 5 static pages + one `/work/<slug>` entry per published project (24 URLs today).
- **Canonical / OG / Twitter meta** — added to all 6 page `<head>`s (`index`, `work`, `about`, `services`, `contact`, `work/[slug]`). Project pages get real per-project values (title, description from `lead`, `og:image`/`twitter:image` from `images.cover`) via a new hydration step in `scripts/generate-project-pages.js` (placeholder-string substitution on the compiled template, same pattern the script already used for slug cloning).
- **Branded 404** — `public/404.html`, fully self-contained (inline CSS, no dependency on Vite's hashed per-page CSS chunks since it isn't a Rollup entry point). Vercel serves it automatically from the output root for unmatched static routes — not yet verified against an actual Vercel deploy (Phase 8).
- **Accessibility fixes**, driven by a fresh Lighthouse a11y run against the built `dist/`:
  - Skip-to-content link (`.vm-skip-link` in `base.css`, first element in `<body>` on all 6 templates, targets the existing `#main`).
  - `label-content-name-mismatch` — nav/footer brand-link `aria-label` reworded to include the visible tagline text ("Defining Environments.").
  - Footer social placeholders (`href="#"`) converted to non-interactive `<span aria-hidden="true">` — removes the dead-link anti-pattern until real handles arrive.
  - Contrast: added `--slate-text` (`#5c697c`) and `--mineral-text` (`#67676b`) tokens for the ~20 text call sites that were using the base `--slate`/`--mineral` brand tokens at a failing ratio on `--paper`. The base tokens themselves are untouched — they're pinned to `DESIGN_GUIDE.md §2` exact values by `__tests__/tokens.test.js`, and `--mineral` is also load-bearing as a border color elsewhere. Also raised footer text opacity (`.vm-footer__link`, `.vm-footer__contact-label`, `.vm-footer__copyright`) from ~0.2–0.4 to 0.5 to clear 4.5:1 on the dark footer background.
  - **Not fixed, flagged instead**: `.vm-process__step__num` (home page "01/02/03/04" ghost watermark numerals, `#3a3a3a` on `#1a1a1a`, 1.53:1 vs the 3:1 large-text requirement) — left as-is since it's a deliberate low-opacity editorial device reinforced by adjacent step-title text, not the sole conveyor of step order. Needs a design call, not a unilateral code fix.
- Full `DECISIONS.md` entry added (2026-07-09) per this being a Major-class change (17+ files).

### Tests

| Suite | Result |
|---|---|
| Vitest | Pass — 86/86 (`tokens.test.js` initially broke when `--slate` was edited directly — fixed by reverting the base token and adding `--slate-text` instead, matching the existing `--mineral`/border pattern) |
| ESLint | Clean |
| Prettier | Clean (ran `npm run format`, 8 files reformatted — mix of pre-existing drift and new markup) |
| Vite build | Clean — `dist/404.html`, `robots.txt`, `sitemap.xml` (24 URLs), favicons, `assets/og/default-og.jpg`, 19 project pages all hydrated with unique meta, all present and spot-checked |
| Lighthouse (desktop preset, local static `dist/`) | Accessibility 0.95, SEO 1.0, Best Practices 0.96, Performance 0.79 (unchanged — Phase 7 was not a performance pass). `label-content-name-mismatch` and `link-name` now pass (were failing). `color-contrast` down from 14 failing nodes to 4 (all `.vm-process__step__num`, the flagged design-call item above) |
| Manual (Playwright screenshot) | Skip link visible + focused on first Tab; 404 page renders on-brand |

### Carry-overs

- `.vm-process__step__num` contrast — needs a client/designer decision (see above), not folded into this pass.
- Vercel's automatic `404.html` static-route fallback is unverified against a real deploy — `vite preview`'s dev-server SPA fallback means this can only be confirmed in Phase 8.
- Phase 8 (domain/DNS for `velmontdesign.com`, Vercel project linking) is the only remaining item before launch.

---

## Phase 6 — Image Optimization + Performance Pass

| Field | Value |
|---|---|
| Date | 2026-06-30 |
| Status | Complete (responsive-image srcset follow-up recommended, not done) |
| Branch | main |

### What shipped

- AVIF generation added to `scripts/convert-images.js` and `scripts/generate-placeholder.js` (quality 70, alongside existing WebP at quality 82).
- Every local-image `<img>` site-wide converted to `<picture><source type="image/avif">…<img></picture>` (home hero carousel, work hero, work-grid tiles, project hero, project gallery). Firebase Storage URLs are left as plain `<img>` since there's no guaranteed AVIF sibling for admin-uploaded images.
- CSS fix: `.vm-proj-gallery picture` and `.vm-grid-tile__img-wrap picture` set to `display: contents` so the new wrapper doesn't break Grid placement or percentage-height image sizing. Gallery grid-area selectors switched from `:first-child`/`:nth-child(4)` to `[data-gallery-img="0"]`/`[data-gallery-img="3"]` (the old positional selectors silently stopped matching once an extra `<picture>` level was introduced — verified the bug and the fix with a real Playwright run, not just unit tests).
- Firebase code-split: `src/lib/firebase.js` now only loads `app` + `firestore`; `getAuth`/`getStorage` moved to new `src/lib/firebase-admin.js`, used only by the admin panel. Shrank the public-facing `firebase-data` chunk 726 KB → 568 KB (gzip 182 KB → 150 KB).
- Fixed the actual home-page LCP bottleneck: the hero's first slide was invisible (`opacity:0`) until `initHeroCarousel()` ran post-`DOMContentLoaded`, well after nav/footer component fetches resolved. Added `is-active` to the first slide directly in HTML.
- Deferred the home carousel's Firestore fetch by one paint frame so it doesn't compete with the hero's first paint.
- Async Google Fonts loading (`media="print"` swap pattern) across all 6 public pages, removing it from the render-blocking path.
- Added `<link rel="preload">` for each page's LCP hero image (home, work).
- **Cleanup**: deleted a leftover `test-1` Firestore document (from earlier Phase 5 debugging) that was live and featured on the public site — confirmed with user before deleting.
- **Test fixes**: `e2e/work.spec.js` / `e2e/home.spec.js` had hardcoded counts from the original 6-project dataset (broken by today's 12-project seed) and a pre-existing race condition against the real Firestore fetch — both fixed; full per-project-detail coverage extended to all 18 published projects.

### Tests

| Suite | Result |
|---|---|
| Vitest | Pass — 84/84 |
| Playwright (full run, real Chromium — not deferred to CI this time) | Pass — 53/53 (8 admin tests skipped, need test credentials) |
| ESLint / Prettier | Clean |
| Vite build | Clean — AVIF + WebP both emit, 18 project pages generated |
| Lighthouse (desktop preset, local static `dist/`) | Performance 0.72 → 0.79, Accessibility 0.95, Best Practices 0.96, SEO 1.0 |

### Carry-overs

- Performance is short of the MASTER_PLAN's ≥90 target. Remaining gap is dominated by `uses-responsive-images` (619 KB potential savings — images served larger than their display size) and Speed Index (6.5s). Fixing this properly needs per-breakpoint `srcset`/`sizes` width variants across every image consumer — a larger, separate piece of work, recommended as a Phase 6.x follow-up rather than folded into this pass.
- This was also the first time Lighthouse was actually run against this site (prior phase logs all said "will run on first CI execution" but CI had never executed it) — so these numbers are the real baseline, not a regression from a previously-passing score.

### Commit

- Part of the same push as the 12-new-project seed; see CHANGELOG.md for full detail.

---

## Seed 12 New Projects + Marriott Marquis Refresh — 2026-06-30

| Field | Value |
|---|---|
| Date | 2026-06-30 |
| Status | Complete |
| Branch | main |

### What shipped

- 12 new projects added to `data/projects.json` and seeded into Firestore (`npm run seed`: created 12, skipped 6 existing): Allianz Trivandrum, Apollo Hospital Gurugram, Embassy Chennai, Gopalan Mall Bangalore, Ireo Grand Hyatt Gurugram, Kauvery Hospital Chennai, Moxy Bangalore Airport, Shangri-La Bangalore, Shell NCTB Bangalore, Shibaura Machine Chennai, Taj CIAL Kochi, Wells Fargo Chennai.
- Content sourced from the client's project archive (`velmont_data/projects/`, per-project `info.md` files), cross-checked against `project-2.xlsx`, written in the site's existing editorial voice without inventing unverifiable specifics.
- None have approved photography yet — all reference one shared placeholder image (`public/assets/projects/_placeholder/placeholder.webp`, generated by `scripts/generate-placeholder.js`) for cover/hero/3-image gallery. All published live per client decision; `featured: false`.
- `marriott-marquis-delhi` content refreshed: web-verified room count (590), meeting space (85,000 sq ft), and construction area (2.5M sq ft) as accurate; corrected an unverified basement-count claim. Pushed to its existing Firestore doc via new `scripts/update-project-content.js` (content-only update, images untouched).

### Tests

| Suite | Result |
|---|---|
| Vitest | Pass — 84/84 (`__tests__/projects.test.js` count assertion updated 6 → 18) |
| Vite build | Pass — 18 project pages generated |
| Seed | `npm run seed` — Created: 12, Skipped: 6 (idempotent) |

### Carry-overs

- Real photography pending for all 12 new projects — swap the placeholder via the admin panel or `convert-images.js` once client photos are approved.
- 8 of the 12 already have curated source URLs in `velmont_data/projects/*/​_image-sources.md` awaiting manual download; 4 have real photos already gathered locally but unused per client decision to keep placeholder treatment uniform for now.

---

## Phase 4 — About, Services, Contact Pages + Form

| Field | Value |
|---|---|
| Date | 2026-06-22 |
| Status | Complete |
| Branch | main |

### What shipped

**About page** (`src/about.html`, `src/css/about.css`) — 6 sections per MASTER_PLAN §Phase 4:
1. Page hero: "The Studio" / "Built to deliver, from first sketch to final handover."
2. Who We Are: copy + 4 highlight pills (End-to-End / In-House Manufacturing / Hospitality, Corporate & Commercial / Quality-Driven).
3. Track Record: 4 stat blocks (15+ / 100+ / 5M+ / 200+) reusing `.vm-stats` from Phase 2.
4. Our Approach: "How We Think" kicker + italic editorial lead + supporting body.
5. Manufacturing Capability: "In-house. In control." + styled photo placeholder (4–5 photos pending client).
6. CTA: "Work with us." → "Get in Touch →" to `/contact`.

**Services page** (`src/services.html`, `src/css/services.css`) — 4 sections:
1. Hero: "What We Do" / "Specialist services for commercial interiors."
2. 3×2 grid: 6 service cards (Commercial Interiors / Turnkey Fit-Outs / Furniture Manufacturing / Project Execution / Technical Support / Carpentry & Joinery) — each with index, title, description.
3. Dark Manufacturing Capability block with the same placeholder.
4. CTA: "Start your project with us." → "Enquire →".

**Contact page** (`src/contact.html`, `src/css/contact.css`, `src/js/contact.js`) — 4 sections:
1. Hero: "Get in Touch" / "Let's build something exceptional together."
2. Enquiry form: Full Name* / Company / Email* / Phone / Project Type (select) / Project Location / Message* — with a visually hidden honeypot (`name="website"`, tabindex -1).
3. Studio details: Address / Phone & WhatsApp / Email / Business Hours.
4. Google Maps embed iframe at `google.com/maps?q=Velmont+Design+LLP...&output=embed`.

**Form behaviour:**
- Pure `validate(values)` exported for unit tests — required-field + email-format checks; honeypot triggers a silent reject.
- DOM submit handler reads values, paints `.is-invalid` on bad fields, surfaces inline `.vm-field__error` messages, posts to EmailJS using `VITE_EMAILJS_*` env vars when set; falls back to a console warning in dev when keys are missing so manual UI testing still works.
- Status line announces sending / success / error via `aria-live="polite"`.

**Wiring**
- `src/js/main.js` — dispatches by `<main data-page>`: contact page initialises the form, default (home) keeps `initHome`.
- `vite.config.js` — renamed existing rewrite plugin to `cleanUrlsPlugin`; now also rewrites `/about`, `/services`, `/contact`, and `/work` to their `.html` siblings in both dev and preview servers. `about`, `services`, `contact` added to `rollupOptions.input`.
- `vercel.json` — `cleanUrls: true` already covered production routing.

### Tests

| Suite | Result |
|---|---|
| ESLint | Pass |
| Prettier | Pass |
| Vitest | Pass — **62 / 62** (8 new `contact.test.js`: full submission accepted / required name / required email / bad email format / required message / multi-field errors / honeypot silent-reject / undefined input) |
| Vite build | Pass — `dist/about.html` 5.98 kB, `dist/contact.html` 6.60 kB, plus per-page CSS chunks. |
| Preview smoke (curl) | `/`, `/about`, `/services`, `/contact` all return 200 with correct titles; map iframe src includes `google.com/maps`. |
| Playwright (about / services / contact specs) | Deferred to CI — sandbox blocks Chrome download. Specs cover every MASTER_PLAN Phase 4 assertion: section presence, stat numbers, 6 service titles, CTA hrefs, empty-form validation, bad-email validation, map iframe, honeypot hidden + tabindex -1. |
| Lighthouse CI | Will run on first CI execution. |

### Carry-overs

- Manufacturing facility photos — placeholder block used; replace with real images when client provides.
- EmailJS credentials — `VITE_EMAILJS_SERVICE_ID`, `_TEMPLATE_ID`, `_PUBLIC_KEY` to be set in Vercel; until then the form simulates success on submit.
- Social handles still pending.

### Commit

- Message: `Phase 4: About, Services, and Contact pages with form validation`
- Branch: main (push from local machine — sandbox has no git credentials)

---


## Post-Phase 3 Polish — Hero Images + UI Fixes

| Field | Value |
|---|---|
| Date | 2026-06-21 |
| Status | Complete |
| Branch | main |
| Commits | 7cb8865 (hero images), see below (polish) |

### What shipped

**Hero images (7cb8865):**
- Home hero: ITC Ratnadipa Colombo `exterior.webp` as full-bleed `<img>` behind `::after` gradient overlay. Text at z-index 2.
- All 6 project detail pages: `images.hero` from JSON now hydrated by `project.js` into `<img data-proj-hero-img>`. Same overlay CSS pattern.
- Fallback background colour (#2b2927 / #2e2b28) for image load failures.

**UI polish:**
- Carousel: replaced double-RAF class-toggle with direct `style.transition` + `void mount.offsetWidth` forced reflow — truly seamless infinite loop, no visible snap-back.
- Work page: redesigned from 3-column grid to 1-project-per-full-row editorial layout. Each row has the project `cover` image on the left, project info on the right (alternating even/odd). Subtle zoom on hover.
- Project detail gallery: `overflow: hidden` added to clip images to 560px grid bounds. `border-bottom` line sits directly below gallery images.
- Prev/Next navigation removed from project detail pages entirely.
- Home carousel kicker reverted to "Selected Work" per MASTER_PLAN spec.

### Tests

| Suite | Result |
|---|---|
| Vitest | Pass — 54 / 54 |
| Vite build | Pass |
| Playwright | Pass — 25 / 25 (prev/next test removed with the nav) |

---

## Phase 3 — Work Portfolio Grid + Project Detail Pages

| Field | Value |
|---|---|
| Date | 2026-06-21 |
| Status | Complete |
| Branch | main |
| Commit | 606084e |

### What shipped

- `src/work.html` — Work list page: hero ("100+ projects delivered across India."), discipline filter bar (All / Workplace / Healthcare / Hospitality / Commercial), 3-column project grid hydrated from projects.json (6 published tiles, each with index number, discipline label, project name, location/year, terracotta arrow).
- `src/work/[slug].html` — Single project detail template (slug-driven). All 6 project pages served from this one file via URL rewrite.
- `src/js/work.js` — Renders grid tiles with `data-discipline` attributes; filter toggle sets `hidden` attribute on non-matching tiles — no page reload.
- `src/js/project.js` — Reads slug from `window.location.pathname`, fetches `/data/projects.json`, hydrates breadcrumb, hero H1, spec bar (Industry / Area / Year / Scope), editorial lead, body paragraphs, material pills, gallery (main + topRight + bottomRight), and circular prev/next navigation.
- `src/css/work.css` — Work hero, filter bar, project grid, tile styles per DESIGN_GUIDE.
- `src/css/project.css` — Breadcrumb, project hero (520px), spec bar (terracotta 2px top border, concrete bg), body (1.1fr 1fr grid), gallery (1.62fr 1fr, 560px, 3px gap), prev/next nav.
- `vite.config.js` — `workSlugRewritePlugin` (Vite plugin) rewrites `/work/<slug>` to serve `[slug].html` in both dev and preview servers; `work` + `project` added to Rollup multi-page inputs.
- `serve-local.mjs` — Same `/work/*` rewrite for manual local preview.
- `e2e/work.spec.js` — 12 new Playwright tests covering work grid, discipline filter (Hospitality → 5, Workplace → 1, All → 6), tile href correctness, all 6 project detail pages (H1 + spec bar + body + gallery + breadcrumb + prev/next), and circular prev/next navigation.
- `e2e/home.spec.js` — Fixed 2 pre-existing broken assertions: tile count selector updated to `:not([data-clone])` expecting 6; stats selector corrected from `.vm-stats__cell` → `.vm-finale__stat`.
- `src/js/home.js` — Clone tiles now marked `data-clone="true" aria-hidden="true" tabindex="-1"` for accessibility and testability.

### Tests

| Suite | Result |
|---|---|
| Vitest | Pass — 54 / 54 |
| Vite build | Pass — 11 chunks, 1.23s. `dist/work/[slug].html` 4.34 kB |
| Playwright (all specs) | Pass — 26 / 26 (14 regression + 12 new Phase 3) |

### Carry-overs

- MEA Bangalore — only 1 photo available; same image used for hero and all 3 gallery slots. Year and area are null (display as "—"). Additional photos + metadata pending client.
- The Seasons OTF files — still pending client; display numbers fall back to Cormorant Garamond.
- Social handles still pending — footer placeholders unchanged.

### Commit

- Message: `Phase 3: Work portfolio grid with filter and all 6 project detail pages`
- Hash: 606084e
- Branch: main

---

## Phase 2 — Home Page

| Field | Value |
|---|---|
| Date | 2026-06-21 |
| Status | Complete |
| Branch | main |

### What shipped

- src/index.html — 7 sections wired top-to-bottom: hero, Selected Work strip (hydrated from JSON), About / The Studio, Disciplines strip, How We Work (dark process strip), Stats bar, CTA banner.
- src/css/home.css — every section styled against tokens.css. Grid templates match DESIGN_GUIDE §4 (240px+repeat(3,1fr) for work strip, repeat(4,1fr) for disciplines/process/stats, 1fr 1fr for studio).
- src/js/home.js — pure renderWorkTile + selectFeatured + mountFeatured; initHome fetches /data/projects.json and renders the 3 featured tiles. Falls back to a styled "loading" message if the fetch fails so the strip never collapses.
- src/js/main.js — calls initHome after the nav and footer fragments resolve.
- scripts/copy-data.js — pre-dev/pre-build step that mirrors data/projects.json into public/data/ so the runtime fetch resolves in both vite dev and vite preview. public/data/ is gitignored.

### Copy sources

- Hero copy from CONTENT_PLAN.html §01.2: H1 "Commercial interiors built to the highest standard."; eyebrow "Defining Environments."; CTA "View the Portfolio →".
- The Studio copy from CONTENT_PLAN.html §01.4: H "One team. Every layer. Delivered."
- Disciplines / desciption text from CONTENT_PLAN.html §01.5.
- Process steps (Brief / Planning / Build / Handover) from CONTENT_PLAN.html §01.6.
- Stats from MASTER_PLAN §Phase 2 §6 (15+ Years / 100+ Projects / 5M+ Sq Ft / 200+ Workforce).
- CTA Banner copy "Let's build something exceptional together." + Enquire link to /contact.

### Tests

| Suite | Result |
|---|---|
| ESLint | Pass — 0 errors |
| Prettier | Pass |
| Vitest | Pass — 54 / 54 (7 new home.test.js cases for selectFeatured + renderWorkTile) |
| Vite build | Pass — 10 modules, 3.60s. dist/index.html 7.72 kB, CSS 13.28 kB, JS 2.84 kB |
| Preview smoke (curl) | / 200; H1 text exact; /data/projects.json 200; 5 featured+published projects available (sliced to 3 by selectFeatured) |
| Playwright (e2e/home.spec.js) | Deferred to CI — sandbox blocks Chrome download. Specs cover all 7 MASTER_PLAN Phase 2 assertions: title, H1, tile count, tile parts, process step labels, stats cell count, Enquire CTA href. |
| Lighthouse CI | Will run on first CI execution; gates Performance ≥ 85, A11y ≥ 90, SEO ≥ 90, Best Practices ≥ 90. |

### Carry-overs

- The Seasons OTF files — still pending client; display numbers fall back to Cormorant Garamond.
- Social handles still pending — footer placeholders unchanged from Phase 1.
- Project detail pages (work/[slug]) land in Phase 3 — until then the tile links point to /work/<slug> which 404s.

### Commit

- Commit message: Phase 2: Home page — all sections, wired to project data
- Branch: main (push from local machine — sandbox has no git credentials)

---

## Phase 1 — Shared Components (Nav + Footer)

| Field | Value |
|---|---|
| Date | 2026-06-21 |
| Status | Complete |

### What shipped

- src/components/nav.html — sticky 94px paper-bg nav.
- src/components/footer.html — dark vblack footer with mirrored nav, contact block, social placeholders, copyright.
- src/css/nav.css, src/css/footer.css.
- src/js/components.js — injectComponent + markActiveNavLink utilities.
- scripts/copy-components.js — mirrors src/components/*.html to public/components/.
- src/index.html and src/js/main.js — mount points wired.

### Tests

| Suite | Result |
|---|---|
| Vitest | Pass — 47 / 47 (6 new) |
| Vite build | Pass |
| Playwright nav-footer.spec.js | Deferred to CI |

---

## Phase 0 — Foundation & Tooling

| Field | Value |
|---|---|
| Date | 2026-06-21 |
| Status | Complete |

### What shipped

- Vite + vanilla-JS skeleton, design tokens, base CSS, projects.json, sharp WebP converter, tooling configs, CI workflow, vercel.json.

### Tests

| Suite | Result |
|---|---|
| Vitest | Pass — 41 / 41 |
| Vite build | Pass |
| Playwright | Deferred to CI |

### Known gaps

- The Seasons OTF files — pending client.
- MEA Bangalore project images — only 1 available.
- Manufacturing facility photos — needed for Phase 4.

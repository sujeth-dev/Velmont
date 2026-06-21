# Velmont Website — Master Build Plan

## Context

All planning, design, and content is locked. The repo has 47 project images, 12 logo variants, 3 plan documents (DESIGN_GUIDE.md, WEBSITE_PLAN.md, CONTENT_PLAN.html), and detailed project data (PROJECT_DATA.md). No source code exists yet. This plan breaks the full build into 9 sequential phases. Each phase ends with: tests pass → commit → push → documentation updated → phase log entry written. Two approval gates require explicit sign-off before proceeding. An automated Claude Code loop runs each phase end-to-end.

---

## Confirmed Stack

| Layer | Choice |
|---|---|
| Frontend | Vanilla HTML/CSS/JS |
| Build tool | Vite |
| Data | JSON file (local) → Firebase Firestore (after Phase 5) |
| Admin auth | Firebase Auth |
| Image storage | Firebase Storage (bucket upload, not link) |
| Local images | WebP/AVIF in `/public/assets/` |
| Hosting | Vercel |
| Unit tests | Vitest |
| E2E tests | Playwright |
| Performance | Lighthouse CI |
| Code quality | ESLint + Prettier |
| CI/CD | GitHub Actions |

---

## Image Strategy (Hybrid)

- **Local project photos & logos**: Stored in `/public/assets/projects/[slug]/` and `/public/assets/logos/` as WebP (converted from source JPG via Vite image plugin or pre-build script). Used with standard `<img loading="lazy">` — no blur placeholder, no LQIP.
- **Admin-uploaded images**: Firebase Storage bucket upload only (no external URL input in admin). Admin panel uses a file picker → uploads to `gs://velmont/projects/[slug]/[filename]`, stores Storage URL in Firestore.
- **Serving**: All local assets served from Vercel CDN edge. Firebase Storage URLs have public read rules.
- **No blur/placeholder effects on any image.**

---

## Automated Loop Design

Each phase is driven by running `/loop` in Claude Code:
```
/loop "develop, test, commit and push Phase [N] of Velmont website per the master plan"
```

Per-phase loop behavior:
1. Implement all dev tasks for the phase
2. Run all tests (unit → E2E → Lighthouse where applicable)
3. Fix any failures before committing
4. Commit with phase-tagged message: `Phase N: [description]`
5. Push to `main`
6. Update `PHASE_LOG.md` with phase status, test results, and timestamp
7. **At approval gates**: Stop, send a push notification, wait for explicit user "proceed" before starting next phase loop

---

## Related Documents

- `plan/CHANGE_GUIDE.md` — **Change management guide (read this before making any post-build change)**. Classification system, dependency map, playbooks for every change type, sync checklist, commit protocol, branch strategy.
- `DECISIONS.md` — Architecture decision log. Every major/breaking decision is recorded here before code is written.

## Support Documents (created during Phase 9)

- `docs/ADMIN_GUIDE.md` — Admin panel user walkthrough
- `docs/IMAGE_GUIDE.md` — Hybrid image strategy, conversion process, naming conventions
- `docs/DEPLOYMENT_GUIDE.md` — Vercel deploy, environment variables, domain setup
- `docs/TESTING_GUIDE.md` — How to run tests locally, what each test covers
- `PHASE_LOG.md` — Living log updated after every push (phase, date, status, test summary)
- `CHANGELOG.md` — Human-readable change history per push

---

## Phase Breakdown

---

### Phase 0 — Foundation & Tooling

**Goal:** Working Vite project, all tooling configured, design tokens in CSS, fonts set up, image assets converted to WebP, GitHub Actions CI skeleton.

**Dev tasks:**
- `npm create vite@latest` — vanilla JS template
- `package.json`: add Vite, ESLint, Prettier, Vitest, Playwright, @lhci/cli
- Folder structure per WEBSITE_PLAN.md §3: `src/`, `public/assets/`, `src/css/`, `src/js/`, `src/pages/`, `src/components/`, `data/`, `e2e/`, `__tests__/`, `docs/`
- `src/css/tokens.css` — all 8 CSS variables from DESIGN_GUIDE.md, type scale, spacing tokens
- `src/css/base.css` — reset, body, min-width: 1200px, font imports
- Google Fonts `<link>` in base HTML template for Manrope, Inter, Cormorant Garamond
- Local font `@font-face` blocks for The Seasons (OTF files in `/public/assets/fonts/`) — **NOTE: The Seasons OTF files must be provided by client before Phase 1 build**. If not available, placeholder `@font-face` block is written and Phase 1 proceeds with fallback.
- Convert all `/assets/projects/**/*.jpg` to WebP using `sharp` pre-build script → output to `/public/assets/projects/`
- Copy logos to `/public/assets/logos/`
- `data/projects.json` — all 6 projects structured from PROJECT_DATA.md with fields: slug, title, discipline, location, year, area, scope, lead, body (array), materials (array), images {cover, hero, gallery: [main, topRight, bottomRight]}, featured (bool), published (bool)
- `vite.config.js` — dev server, build output to `dist/`
- `.eslintrc.json` + `.prettierrc`
- `vitest.config.js`
- `playwright.config.js` — baseURL: http://localhost:5173
- `.github/workflows/ci.yml` — on push to main: lint → unit tests → Vite build → Playwright E2E → Lighthouse CI → if all pass: Vercel preview deploy
- `vercel.json` — SPA rewrites, security headers (X-Frame-Options, X-Content-Type, CSP)
- `.env.example` — Firebase config keys, Vercel config
- `PHASE_LOG.md` — initialize with Phase 0 entry template
- `README.md` — rewrite with project overview, setup instructions, dev commands

**Tests:**
- Vitest: `tokens.css` exports expected CSS variable names (snapshot test of parsed CSS)
- Vitest: `projects.json` validates schema — all 6 projects have required fields
- Playwright: `vite preview` serves index.html with 200 status
- GitHub Actions CI runs and passes (lint, build, tests)

**Commit message:** `Phase 0: Vite project init, design tokens, tooling, CI pipeline`
**Push:** `main`
**Docs:** `PHASE_LOG.md` Phase 0 entry — date, status: complete, tests: pass

---

### Phase 1 — Shared Components (Nav + Footer)

**Goal:** Pixel-perfect nav and footer matching DESIGN_GUIDE.md specs, shared across all pages via JS include.

**Dev tasks:**
- `src/components/nav.html` — full nav HTML: logo (velmont-main.png, height 82px, translateY -8px), tagline "Defining Environments." (9.5px Inter 500 0.30em tracking), links [Work, Services, About, Contact] (13.5px Inter 500 0.04em tracking, gap 44px), CTA "Enquire" (12px Inter 500, 1px terracotta border, 11px 28px padding)
- `src/components/footer.html` — vblack bg, velmont-white.png logo, nav links (12px 0.10em), contact info, social placeholder, copyright "© 2026 Velmont Design Studio. All rights reserved."
- `src/js/components.js` — `injectComponent(selector, path)` utility: fetch HTML fragment, inject into DOM
- `src/css/nav.css` — height 94px, padding 0 80px, sticky top 0 z-index 20, border-bottom 1px mineral, paper bg
- `src/css/footer.css` — vblack bg, border-top 1px rgba(187,188,195,0.14), padding 44px 80px, flex space-between
- Active link state: 2px terracotta underline, vblack color
- Base `src/index.html` shell — injects nav + footer, links CSS tokens + base

**Tests:**
- Playwright: nav renders with logo image visible (non-zero dimensions)
- Playwright: all 4 nav links present with correct text
- Playwright: "Enquire" CTA has correct border color (terracotta `#FF4015`)
- Playwright: footer renders with white logo visible
- Playwright: footer copyright text present
- Vitest: `injectComponent` handles fetch failure gracefully (returns null, logs warning)

**Commit message:** `Phase 1: Nav and footer shared components`
**Push:** `main`
**Docs:** `PHASE_LOG.md` Phase 1 entry

---

### Phase 2 — Home Page

**Goal:** Full home page built to CONTENT_PLAN.html specifications, wired to projects.json for Selected Work strip.

**Dev tasks:**
- `src/index.html` — 7 sections:
  1. **Hero** — 700px height, dark gradient bg per DESIGN_GUIDE.md, eyebrow "Defining Environments.", H1 "Commercial interiors built to the highest standard." (Manrope 600 88px -0.03em white), sub-headline (Inter 400 16px rgba white 0.66), CTA "View the Portfolio →", meta bottom-right: Bengaluru / Est. 2018
  2. **Selected Work Strip** — "SELECTED WORK — 100+ Projects" kicker, 240px + repeat(3,1fr) grid, 3 featured projects loaded from projects.json where featured=true. Each tile: discipline label, project name (Cormorant Garamond 28px), location + year, terracotta arrow. Tile footer: year left, arrow right, 1px mineral border-top.
  3. **About Velmont** — kicker "The Studio", H "One team. Every layer. Delivered." (Manrope 600 48px), body copy (Inter 14-15px, max-width 460px), CTA "Our Process →"
  4. **Disciplines Strip** — 240px + repeat(4,1fr) grid, 4 disciplines: Workplace (48,000 ft² avg.) / Healthcare (Clinical & Wellness) / Hospitality (Hotels & Resorts) / Commercial (MNC Fit-out)
  5. **How We Work** — dark section (vblack bg), kicker "HOW WE WORK", H "Turnkey, from brief to handover.", 4 process steps in repeat(4,1fr): 01 Brief / 02 Planning / 03 Build / 04 Handover — step numbers in The Seasons 42px, titles Manrope 600 16px, descriptions Inter white 0.72 opacity
  6. **Stats Bar** — 4 numbers: 15+ Years / 100+ Projects / 5M+ Sq Ft / 200+ Workforce — display numbers in The Seasons 52px 0.06em
  7. **CTA Banner** — dark or light, H "Let's build something exceptional.", CTA "Enquire →"
- `src/js/home.js` — fetches `/data/projects.json`, renders 3 featured tiles into work strip
- `src/css/home.css` — all section styles

**Tests:**
- Playwright: page title is "Velmont Design Studio"
- Playwright: hero H1 text matches expected string
- Playwright: work strip renders exactly 3 project tiles
- Playwright: each work tile has project name text, discipline label, and arrow
- Playwright: process section has 4 steps with correct text (Brief, Planning, Build, Handover)
- Playwright: stats bar has 4 stat blocks
- Playwright: CTA "Enquire →" link is present and navigates to contact page (href="/contact")
- Lighthouse CI: Performance ≥ 85, Accessibility ≥ 90, SEO ≥ 90, Best Practices ≥ 90

**Commit message:** `Phase 2: Home page — all sections, wired to project data`
**Push:** `main`
**Docs:** `PHASE_LOG.md` Phase 2 entry with Lighthouse scores

---

### Phase 3 — Work Page + Project Detail Pages

**Goal:** Portfolio grid with filter, individual project pages generated from projects.json.

**Dev tasks:**
- `src/work.html` — work list page:
  - Hero: eyebrow "Select Projects", H "100+ projects delivered across India."
  - Filter bar: All (active) / Workplace / Healthcare / Hospitality / Commercial — Inter 600 11px uppercase, active gets terracotta underline
  - Project grid: 240px + repeat(3,1fr) — all 6 projects (published=true), filterable by discipline via JS class toggle, no page reload
  - Each tile: index number (The Seasons 52px), discipline label, project name (Cormorant Garamond 28px), location + year, terracotta arrow pointing to project slug URL
- `src/work/[slug].html` — single project detail template (one file, slug-driven):
  - 1. Breadcrumb: Work / [Discipline] / [Project Name] — Inter 500 11.5px uppercase, 80px padding, 1px mineral border-bottom
  - 2. Project Hero: 520px height, paper-toned gradient bg, discipline + location eyebrow, H1 project name (Manrope 700 68px)
  - 3. Spec Bar: concrete bg, 2px terracotta border-top, 1px mineral border-bottom, 4 columns: Industry / Area / Year / Scope — values Manrope 500 18px, labels Inter 600 10px 0.28em uppercase slate
  - 4. Project Body: 1.1fr 1fr 80px gap — left: italic editorial lead (Cormorant Garamond 400 28px), right: 2-3 body paragraphs (Inter 14.5px) + material pills (11.5px Inter 500 500 1px mineral 999px radius)
  - 5. Image Gallery: 1.62fr 1fr grid, grid-template-rows 1fr 1fr, 560px height, 3px gap — main image spans 2 rows
  - 6. Prev/Next navigation: 1fr 1fr grid, border-top 1px mineral, right item border-left 1px mineral
- `src/js/work.js` — fetches projects.json, renders work grid, filter toggle
- `src/js/project.js` — reads slug from URL (`?slug=` or path), fetches projects.json, hydrates all project detail sections
- `src/css/work.css`, `src/css/project.css`

**Tests:**
- Playwright: work page loads, shows 6 project tiles
- Playwright: clicking "Hospitality" filter shows only hospitality projects
- Playwright: clicking "Workplace" filter shows only MEA project
- Playwright: clicking "All" shows all 6 tiles again
- Playwright: each project tile click navigates to correct project detail URL
- Playwright (per project × 6): project detail page renders H1, spec bar (4 columns), body text, 3 gallery images, breadcrumb, prev/next nav
- Playwright: prev/next navigation links work correctly (circular)
- Lighthouse CI on work page and one project page: Performance ≥ 85, SEO ≥ 90

**Commit message:** `Phase 3: Work portfolio grid with filter and all 6 project detail pages`
**Push:** `main`
**Docs:** `PHASE_LOG.md` Phase 3 entry

---

### Phase 4 — About, Services, Contact Pages + Form

**Goal:** All remaining static pages built. Contact form wired and tested.

**Dev tasks:**
- `src/about.html` — 6 sections:
  1. Hero: eyebrow "The Studio", H "Built to deliver, from first sketch to final handover."
  2. Who We Are: "About Velmont" kicker, main copy from CONTENT_PLAN.html §04.2, highlight pills: End-to-End / In-House Manufacturing / Hospitality, Corporate & Commercial / Quality-Driven
  3. Track Record: 4 stat blocks (15+ Years / 100+ Projects / 5M+ Sq Ft / 200+ Workforce) — The Seasons display numbers
  4. Our Approach: "How We Think" kicker, italic lead from CONTENT_PLAN.html §04.4, body copy
  5. Manufacturing Capability: "In-house. In control." H, copy from §04.5, **image placeholder block** (facility photos to be provided by client — styled placeholder with label)
  6. CTA: "Work with us." H, "Get in Touch →" CTA linking to contact page
- `src/services.html` — 4 sections:
  1. Hero: eyebrow "What We Do", H "Specialist services for commercial interiors.", sub from CONTENT_PLAN §03.1
  2. Services 3×2 grid: 6 service cards from §03.2 — each card: service name (Manrope 600), description (Inter 14px)
  3. Manufacturing capability block (image placeholder same as About)
  4. CTA: "Start your project with us." → "Enquire →"
- `src/contact.html` — 4 sections:
  1. Hero: eyebrow "Get in Touch", H "Let's build something exceptional together.", sub from §05.1
  2. Enquiry form: Full Name* / Company / Email* / Phone / Project Type (dropdown: Hospitality / Workplace / Healthcare / Commercial / Other) / Project Location / Message* — client-side validation (required fields, email format)
  3. Contact details block: Address / Phone & WhatsApp / Email / Hours
  4. Google Maps embed (iframe from WEBSITE_PLAN.md §4.5 URL)
- Form submission: EmailJS — sends to Info@velmontdesign.com, shows success/error message inline (no redirect, no alert)
- `src/css/about.css`, `src/css/services.css`, `src/css/contact.css`
- `src/js/contact.js` — form validation + EmailJS submit

**Tests:**
- Playwright: About page renders all 6 sections, stat blocks show correct numbers
- Playwright: Services page renders 6 service cards with correct titles
- Playwright: Contact form shows validation errors when required fields are empty on submit
- Playwright: Contact form validates email format
- Playwright: Google Maps iframe is present in contact page
- Vitest: form validation function — tests for empty name, invalid email, empty message → returns correct error strings
- Lighthouse CI on all 3 pages: Performance ≥ 85, Accessibility ≥ 90, SEO ≥ 90

**Commit message:** `Phase 4: About, Services, and Contact pages with form validation`
**Push:** `main`
**Docs:** `PHASE_LOG.md` Phase 4 entry. Note: Manufacturing facility photos are placeholder pending client delivery.

---

### Phase 5 — Firebase + Admin Panel

**Goal:** Firebase Firestore as project data source, Firebase Auth for admin, full CRUD admin panel, Firebase Storage bucket upload for project images.

**Dev tasks:**
- `src/lib/firebase.js` — Firebase app init, Firestore, Auth, Storage exports (keys from `.env`)
- Seed Firestore with all 6 projects from `data/projects.json` via one-time seed script `scripts/seed-firestore.js`
- Update `src/js/work.js`, `src/js/project.js`, `src/js/home.js` to fetch from Firestore instead of local JSON (with local JSON as fallback if Firestore unavailable)
- `src/admin/login.html` — email + password form, Firebase Auth sign-in, redirect to dashboard on success, error message on failure
- `src/admin/dashboard.html` — list all projects (title, discipline, year, status badge, Edit/Delete actions), "Add Project" button, logout
- `src/admin/project-form.html` — shared form for Add and Edit:
  - Fields: Title / Discipline (dropdown) / Location / Year / Area / Scope / Lead (textarea) / Body paragraphs (3 textareas) / Materials (comma-separated input, renders as pills preview) / Published (toggle) / Featured (toggle)
  - Images: Cover / Hero / Gallery Main / Gallery Top-Right / Gallery Bottom-Right — each is a file picker → on select: upload to Firebase Storage `gs://velmont/projects/[slug]/[filename]`, store returned download URL in form state
  - On submit: write document to Firestore `projects` collection
- `src/admin/project-edit.html` — pre-fetches Firestore doc by ID, pre-fills form, on submit: updates document
- Delete flow: dashboard Delete button → confirmation modal → `deleteDoc` + `deleteObject` (Storage) → list refresh
- `src/css/admin.css` — clean functional admin style (not using full brand system, just usable)
- Firestore security rules: public read on `projects` where published=true; authenticated write only
- Storage security rules: authenticated upload only, public read

**Tests:**
- Playwright (authenticated): admin login with test credentials → dashboard loads
- Playwright: dashboard shows correct count of projects
- Playwright: Add Project form — fill all fields, upload cover image, submit → new project appears in dashboard list
- Playwright: Edit Project — change title, submit → title updates in dashboard
- Playwright: Delete Project — confirm modal → project removed from dashboard
- Playwright: Published toggle — when set to draft, project no longer appears on public work page
- Playwright: Featured toggle — when set false, project no longer appears in home work strip
- Vitest: Firestore rules unit tests (using Firebase emulator) — unauthenticated write is rejected, public read of published project succeeds

**⚠️ APPROVAL GATE — Phase 5 Complete**
> Loop stops here. Push notification sent: "Phase 5 admin panel is complete. Please review the admin dashboard at localhost:5173/admin/login — test adding, editing, and deleting a project. Reply 'proceed' to continue to Phase 6."

**Commit message:** `Phase 5: Firebase Firestore, Auth, Storage, and admin panel CRUD`
**Push:** `main`
**Docs:** `PHASE_LOG.md` Phase 5 entry. Note approval gate triggered.

---

### Phase 6 — Image Optimization + Performance Pass

**Goal:** All local assets in WebP/AVIF. Images are sized and served correctly. Lighthouse CI targets hit across all pages.

**Dev tasks:**
- Pre-build script `scripts/convert-images.js` using `sharp`:
  - Input: `assets/projects/**/*.jpg`, `assets/logos/*.{png,jpg}`
  - Output: `public/assets/**/*.webp` (WebP, quality 82) + `public/assets/**/*.avif` (AVIF, quality 70)
  - Run as `npm run optimize-images`, also run before `npm run build`
- Update all `<img>` tags in HTML pages to use `<picture>` with AVIF → WebP → JPEG fallback. Width and height attributes set. `loading="lazy"` on below-fold images. No blur placeholder. No LQIP.
- Cover images on work grid: set explicit width × height matching tile dimensions
- Gallery images on project pages: explicit dimensions matching 1.62fr grid (calculate px from 1200px body)
- `vite.config.js`: add `rollupOptions.output.assetFileNames` for cache-busting hashed filenames
- Preload hero image on home and each project page via `<link rel="preload">`
- Remove unused CSS — audit and trim dead rules
- Minification: Vite default for JS + CSS in production build
- Run `npm run build` and verify all asset paths resolve in `dist/`

**Tests:**
- Lighthouse CI (production build via `vite preview`):
  - Home page: Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 95, Best Practices ≥ 90
  - Work page: Performance ≥ 90
  - A project detail page: Performance ≥ 90
  - About, Services, Contact: Performance ≥ 85
- Playwright: all images on home page have non-zero naturalWidth (images actually loaded)
- Playwright: no image has `src` pointing to `.jpg` extension (all WebP/AVIF)
- Vitest: `convert-images.js` script produces output files in correct directory structure

**Commit message:** `Phase 6: WebP/AVIF image optimization, performance pass, Lighthouse 90+`
**Push:** `main`
**Docs:** `PHASE_LOG.md` Phase 6 entry with full Lighthouse score table for all pages.

---

### Phase 7 — Production Hardening + SEO + Accessibility

**Goal:** Site is production-ready: security headers, error pages, full SEO meta, accessibility audit passed, complete regression test suite.

**Dev tasks:**
- `src/404.html` — branded 404 page: "Page not found." heading, back to home link, nav + footer
- `vercel.json`: custom 404 route → `src/404.html`
- Security headers in `vercel.json` headers block:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Content-Security-Policy: default-src 'self'; img-src 'self' firebasestorage.googleapis.com; connect-src 'self' *.firebase.com *.emailjs.com; frame-src 'self' maps.google.com`
- OG / SEO meta tags per page (add to each HTML `<head>`):
  - `<title>`, `<meta name="description">`, `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">` (cover image), `<meta property="og:url">`, `<link rel="canonical">`
  - Home OG image: hero screenshot (static PNG in /public/og/)
  - Work page, About, Services, Contact: individual descriptions
- `public/sitemap.xml` — all public pages + all published project slugs
- `public/robots.txt` — allow all, sitemap reference, disallow `/admin/`
- Accessibility audit:
  - All images have meaningful `alt` text
  - All form inputs have `<label>` elements
  - Color contrast check: all text meets WCAG AA (terracotta on white, slate on paper, etc.)
  - Focus visible on all interactive elements (nav links, CTA buttons, filter buttons)
  - `aria-label` on icon-only buttons
- Form spam: Honeypot hidden field on contact form (if bot fills it, discard submission)
- Firebase `.firebaserc` + `firebase.json` for Storage rules deploy

**Tests (full regression):**
- Playwright: navigate to every page (home, work, all 6 project slugs, about, services, contact, 404) — all return 200/expected content
- Playwright: 404 page shows for `/nonexistent-path`
- Playwright: `/admin/` redirects to login if unauthenticated
- Playwright: contact form honeypot field is `display:none` and has `tabindex="-1"`
- Playwright: work filter toggles work after page navigation (regression test)
- Playwright: nav links highlight correctly on each page
- Playwright: all `<img>` tags have non-empty `alt` attributes
- Vitest: sitemap.xml contains all 6 project slugs
- Lighthouse CI full run across all pages — all scores retained from Phase 6

**Commit message:** `Phase 7: 404 page, security headers, SEO meta, sitemap, accessibility`
**Push:** `main`
**Docs:** `PHASE_LOG.md` Phase 7 entry with accessibility checklist results.

---

### Phase 8 — Production Deploy

**Goal:** Live on velmontdesign.com (or staging URL). Environment variables set in Vercel. Smoke tests on live URL.

**Dev tasks:**
- Create Vercel project linked to `main` branch (via Vercel CLI or dashboard)
- Set environment variables in Vercel dashboard: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`
- Configure custom domain in Vercel: velmontdesign.com (or staging: velmont-staging.vercel.app)
- Verify Vercel deployment webhook on push to `main`
- Update GitHub Actions `ci.yml` production step: trigger Vercel deploy only after all CI checks pass

**Smoke tests (run against live URL after deploy):**
- Playwright (configured with `baseURL: https://velmontdesign.com`):
  - Home page loads, H1 visible
  - Work page loads, project tiles render
  - One project detail page loads correctly
  - Contact page renders form
  - Admin login page accessible at `/admin/login`
  - No console errors on any page
- Lighthouse CI against live URL: scores must match Phase 7 results (± 3 points)
- Security headers check: `curl -I https://velmontdesign.com` — verify X-Frame-Options, X-Content-Type-Options present

**⚠️ APPROVAL GATE — Phase 8 Deploy**
> Loop stops before setting up production domain. Push notification sent: "Site is staged and all smoke tests pass. Ready to connect velmontdesign.com domain. Please confirm domain registrar DNS access and reply 'go live' to proceed with final domain configuration."

**Commit message:** `Phase 8: Production deploy configuration, smoke tests, environment setup`
**Push:** `main`
**Docs:** `PHASE_LOG.md` Phase 8 entry with live URL and smoke test results.

---

### Phase 9 — Documentation & Change Management

**Goal:** Complete documentation suite so any future change has a reference. CHANGELOG and phase log are complete.

**Docs to create:**
- `docs/CHANGE_GUIDE.md`:
  - How to update hero copy (file, line, what to change)
  - How to update a project's copy or images (admin panel walkthrough)
  - How to add a new project (admin panel + Firestore steps)
  - How to change a CSS color token (tokens.css)
  - How to add a new page
  - What to do if a test fails after a change
  - Commit and push checklist
- `docs/ADMIN_GUIDE.md`: Admin login, adding a project step-by-step with screenshots descriptions, editing, deleting, image upload flow, published vs draft
- `docs/IMAGE_GUIDE.md`: Hybrid approach explained, when to use local vs Firebase, naming conventions, WebP conversion command, dimensions reference per image slot
- `docs/DEPLOYMENT_GUIDE.md`: Vercel setup, env vars list and where to get each, custom domain DNS steps, how CI/CD triggers deploy, rollback procedure
- `docs/TESTING_GUIDE.md`: How to run `npm test` (Vitest), `npm run e2e` (Playwright), `npm run lighthouse`, what each test covers, how to add a new test
- `CHANGELOG.md`: All 9 phases listed with dates, changes, and push hashes
- `PHASE_LOG.md`: Final entry — project complete
- `README.md`: Final version — project overview, quick start, links to all docs, tech stack, contact

**Tests:**
- Vitest: all doc files exist in `docs/` directory
- Playwright: README internal links resolve (no 404 on anchor links)

**Commit message:** `Phase 9: Complete documentation, change management guide, changelog`
**Push:** `main`
**Docs:** `PHASE_LOG.md` Phase 9 — project complete. Final Lighthouse scores. Live URL confirmed.

---

## CI/CD Pipeline Summary (GitHub Actions)

```yaml
# .github/workflows/ci.yml — runs on every push to main
jobs:
  quality:
    - eslint src/
    - prettier --check src/
  unit-tests:
    - vitest run
  build:
    - vite build
  e2e:
    - vite preview &
    - playwright test
  lighthouse:
    - lhci autorun
  deploy-preview:
    - vercel deploy --prebuilt (runs only if all above pass)
  deploy-production:
    - vercel --prod (manual approval gate in GitHub Actions environment)
```

---

## Approval Gates Summary

| Gate | Phase | Trigger | What to Review | How to Proceed |
|---|---|---|---|---|
| Admin Panel Review | End of Phase 5 | Push notification | Login at /admin, test CRUD + image upload | Reply "proceed" in loop |
| Production Go-Live | Phase 8 | Push notification | Confirm DNS access, review staged site | Reply "go live" in loop |

---

## Outstanding Items (Before/During Build)

| Item | Needed For | Owner |
|---|---|---|
| The Seasons font OTF files (5 files) | Phase 0 / Phase 1 | Client |
| Manufacturing facility photos (4-5 images) | Phase 4 (About, Services) | Client |
| MEA Bangalore: additional project photos + year/area | Phase 3 | Client |
| Social media handles | Phase 4 (Footer) | Client |
| EmailJS account + template ID | Phase 4 | Developer setup |
| Firebase project (API keys) | Phase 5 | Developer setup |
| Domain registrar access (velmontdesign.com) | Phase 8 | Client |

> Items not received by their required phase: a styled placeholder is built, noted in PHASE_LOG.md, and content is slotted in when provided without replanning.

---

## How to Run a Phase

```bash
# In Claude Code terminal:
/loop "develop, test, commit and push Phase 0 of Velmont website per the master plan at plan/MASTER_PLAN.md. Stop and notify me if an approval gate is reached or if any test fails that you cannot fix."
```

Increment the phase number for each subsequent phase after approval.

# Changelog

All notable changes per push. Most recent first.

## Seed 12 New Projects + Marriott Marquis Refresh — 2026-06-30

- `data/projects.json` — added 12 new projects sourced from the client's project archive (`velmont_data/projects/`), cross-checked against `project-2.xlsx`: Allianz Trivandrum, Apollo Hospital Gurugram, Embassy Chennai, Gopalan Mall Bangalore, Ireo Grand Hyatt Gurugram, Kauvery Hospital Chennai, Moxy Bangalore Airport, Shangri-La Bangalore, Shell NCTB Bangalore, Shibaura Machine Chennai, Taj CIAL Kochi (distinct from the existing `taj-malabar-kochi`), and Wells Fargo Chennai. All published live; `featured: false` (doesn't disturb the curated home-page strip).
- `public/assets/projects/_placeholder/placeholder.webp` (new) + `scripts/generate-placeholder.js` (new) — none of the 12 new projects have approved photography yet, so all reference one shared branded placeholder image (paper background, terracotta accent line, "Photography Pending" label) for cover/hero/gallery. Swap in real photos per-project later via the admin panel or `convert-images.js` once available — no schema changes needed.
- `data/projects.json` — refreshed `marriott-marquis-delhi` body copy: corrected an unverified "6 basements and 7 upper floors" claim (that figure belonged to a neighboring building on the same campus) to the verified "7.70-acre site rising seven storeys." Room count (590), meeting space (85,000 sq ft), and construction area (2.5M sq ft) were web-verified as accurate and left unchanged.
- `scripts/update-project-content.js` (new) — one-off content-refresh script: pushes `lead`/`body`/`materials`/`title`/`area`/`scope` from `data/projects.json` to an already-seeded Firestore doc by slug, without touching its images. Used to push the Marriott Marquis Delhi refresh.
- `__tests__/projects.test.js` — updated project-count assertion from 6 to 18.
- `npm run seed` — created 12, skipped 6 (idempotent, confirmed).
- Vitest 84/84 · Build clean · 18 project pages generated.

## Bug Fixes — 2026-06-25

- `src/js/admin.js` — fixed publish/featured checkboxes always saving as `false`. Root cause: two-column form layout places the checkboxes in `<aside>` (outside `<form>`); `form.querySelector('#published')` returned `null`. Fixed by switching to `document.getElementById` in `readFormValues` and adding a `?? document.querySelector` fallback in `setVal` so the edit form pre-fills published state correctly.
- `vercel.json` — added `/work/:slug` → `/work/[slug]` rewrite so Vercel serves the project detail template for Firestore-only projects (e.g. `test-1`) that have no static per-slug HTML file.

## Admin Panel Redesign + Storage Browser — 2026-06-23

- `src/css/admin.css` — full rewrite: new design system (terracotta accent #FF4015, dark header, card-based layout, Inter font). New components: stats bar, thumbnail rows, inline publish toggle, two-column form layout, image slot cards, storage picker modal (`adm-sp-*`).
- `src/admin/login.html` — split-panel layout: dark brand side with "V." Cormorant Garamond logo, white form panel.
- `src/admin/dashboard.html` — stats bar (Total / Published / Drafts), table with thumbnail column and inline publish toggle per row.
- `src/admin/project-form.html` / `project-edit.html` — two-column layout (form body + sticky aside panel), image slots replaced with card components (Browse Storage / Upload buttons), storage picker modal included.
- `src/js/admin-storage.js` (new) — Firebase Storage browser: `openStoragePicker()` opens modal, lists `projects/` folders, navigates into folders, shows image thumbnails, handles select / upload / delete per image.
- `src/js/admin.js` — updated `renderProjectRow()` to include thumbnails + inline publish toggle; `initAdminDashboard()` now renders stats bar; `initProjectForm/Edit()` use new `wireImageSlots()` (browse + upload + clear per slot) and `readImageSlots()` helpers; old `uploadFormImages()` replaced.
- Vitest 84/84 · Prettier clean · Lint clean · Build clean.

## Phase 5 Post-commit Fixes — 2026-06-23

- `scripts/seed-firestore.js` — rewritten to use Firebase client SDK with email/password auth; no service account required. Reads credentials from `.env` (`VITE_FIREBASE_ADMIN_EMAIL` / `VITE_FIREBASE_ADMIN_PASSWORD`).
- `scripts/upload-project-images.js` (new) — uploads all images for `itc-ratnadipa-colombo` to Firebase Storage and updates its Firestore doc with Storage download URLs; also creates `test-1` project end-to-end. Run via `npm run upload-images`.
- `package.json` — added `upload-images` script.
- `vite.config.js` — fixed dev server project detail routing: dev mode now rewrites `/work/<slug>` → `/work/[slug].html` (the template); preview mode keeps per-slug HTML files. Previously all `/work/<slug>` navigations fell back to the home page in dev mode.
- `src/lib/firebase-data.js` — removed `orderBy('year', 'desc')` from `getPublishedProjects()` and `getAllProjects()` queries; this was causing a Firestore "missing composite index" error which silently fell back to local JSON, hiding Firestore-only projects (e.g. test-1). Sorting is now left to Firestore's natural document-ID order (matches seed order).

## Phase 5 — Firebase + Admin Panel — 2026-06-23

- `src/lib/firebase.js` — Firebase app init, exports `db` (Firestore), `auth`, `storage` from `VITE_FIREBASE_*` env vars.
- `src/lib/firebase-data.js` — `getPublishedProjects()`, `getAllProjects()`, `getProjectBySlug()`, `createProject()`, `updateProject()`, `deleteProject()`.
- `src/js/home.js`, `work.js`, `project.js` — `loadProjects()` now tries Firestore first (when `VITE_FIREBASE_PROJECT_ID` is set), falls back to `data/projects.json`.
- `src/admin/login.html`, `dashboard.html`, `project-form.html`, `project-edit.html` — admin panel pages; no public nav/footer, standalone `admin.css` only.
- `src/js/admin.js` — Firebase Auth login/logout, auth guard (`requireAuth()` with `auth.authStateReady()` + 8s fallback), dashboard CRUD, image upload to Storage, delete with modal confirmation.
- `src/js/admin-utils.js` — Pure utility functions (`validateProjectForm`, `parseMaterials`, `slugify`) extracted for Vitest testability.
- `src/css/admin.css` — Standalone functional admin stylesheet; `adm-` class prefix, no brand token system (intentional per quality gate §7).
- `firestore.rules` — Public read for `published == true`; authenticated write only.
- `storage.rules` — Public read; authenticated write only for `projects/` path.
- `firebase.json`, `firestore.indexes.json`, `.firebaserc` — Firebase project config and emulator setup.
- `scripts/seed-firestore.js` — One-time seed script using `firebase-admin`; reads `data/projects.json`, writes to Firestore; idempotent (skips existing slugs).
- `vite.config.js` — Added admin pages to `rollupOptions.input`; extended `cleanUrlsPlugin` for `/admin/*` routes; **fixed `envDir: __dirname`** so `VITE_*` env vars from project-root `.env` are correctly loaded (was defaulting to `src/` root, leaving all Firebase/EmailJS credentials undefined).
- `__tests__/admin.test.js` — 22 new Vitest tests: Firestore rules pattern checks, storage rules checks, `validateProjectForm` 9 cases, `parseMaterials` 4 cases, `slugify` 3 cases. Total: 84/84.
- `e2e/admin.spec.js` — Playwright: 4 unauthenticated tests (login form, dashboard redirect, project-form redirect, wrong-credentials error) always run; 8 authenticated CRUD tests skip unless `VITE_ADMIN_TEST_EMAIL` / `VITE_ADMIN_TEST_PASSWORD` are set.
- `package.json` — `seed` script added; `firebase-admin` in devDependencies.
- Vitest 84/84 · Prettier clean · Lint clean · Vite build clean · E2E unauthenticated 4/4 passing.

## Content Polish — 2026-06-23

### Hero animation + em dash cleanup
- `src/css/base.css`: `@keyframes vm-hero-appear` — opacity 0→1, scale 1.06→1, 1.8s ease. Applied to all static hero bg images site-wide.
- `src/css/about.css`, `work.css`, `project.css`: `.vm-page-hero__bg`, `.vm-work-hero__bg`, `.vm-proj-hero__bg` — animation added.
- Em dashes removed from body copy across `index.html`, `about.html`, `services.html`, `contact.html` — replaced with commas or sentence breaks (10 instances).
- `data/projects.json`: All 20 em dashes in project lead and body text replaced — colons where introducing a list of details, commas elsewhere. 1 intentional em dash kept in `"Ministry of External Affairs — Bangalore"` title field (name/location separator).
- Vitest 62/62 · Prettier clean · Vite build clean.

## Phase 4 Photo Heroes — 2026-06-23

- About, Services, and Contact page heroes converted from text-only (paper background) to full-height photo heroes matching the Work page standard.
- `src/css/about.css`: `.vm-page-hero` → 78vh photo container (position: relative, flex, justify-content: flex-end); `::after` bottom-weighted gradient overlay; `.vm-page-hero__bg` absolute cover rule; eyebrow and H1 updated to white/warm light text with z-index layering.
- `src/css/common.css`: `.vm-page-hero__sub` updated to `rgba(209,200,188,0.78)` and `z-index: 2` so sub-headline is visible over the overlay.
- About hero image: `marriott-marquis-delhi/interior-4.webp`.
- Services hero image: `taj-exotica-andaman/villa-2.webp`.
- Contact hero image: `taj-exotica-andaman/room-3.webp`.
- Vitest 62/62 · Prettier clean · Vite build clean.

## Phase 4 Polish — 2026-06-22

### Design audit fixes (About, Services, Contact)
- `src/css/common.css` (new) — shared layout components extracted from `home.css`: `.vm-section`, `.vm-kicker`, `.vm-link`, `.vm-stats` grid, `.vm-cta` band, `.vm-page-hero__sub`. All secondary pages now import `common.css` instead of `home.css`.
- Fixed critical: `.vm-stats` / `.vm-stats__cell` had zero CSS — stats on About rendered as unstyled vertical list. Now a 4-column border grid.
- Fixed critical: `.vm-cta` and all sub-classes had zero CSS — CTA band on About and Services was completely unstyled.
- Fixed critical: `contact.html` missing import for `.vm-page-hero__sub` — hero sub-headline rendered as raw body text. Rule moved to `common.css`.
- Fixed: `.vm-service:hover { background: #fff }` — violates DESIGN_GUIDE §2. Changed to `#faf8f4`.
- Fixed: About H1 `64px` → `var(--fs-project-h1)` (68px token).
- Fixed: About body font sizes hardcoded `16px`/`15px` → `var(--fs-hero-sub)` / `var(--fs-body)`.
- Fixed: Contact form label `letter-spacing: 0.22em` → `0.28em`.
- Fixed: Contact success `color: #2d7a3a` → `var(--success)`. Token added.
- Fixed: `<select>` native browser chrome removed — `appearance: none` + SVG chevron matches underline input style.
- Fixed: Manufacturing placeholder text removed from About and Services — clean empty dashed box only.
- `tokens.css`: added `--success`, `--fs-service-num`, `--concrete-tint`.
- Vitest 62/62 · Prettier clean · Vite build clean.

## Phase 4 — 2026-06-22

- About page (src/about.html, src/css/about.css) — 6 sections per MASTER_PLAN §Phase 4.
- Services page (src/services.html, src/css/services.css) — hero, 6-card service grid, dark manufacturing block, CTA.
- Contact page (src/contact.html, src/css/contact.css, src/js/contact.js) — hero, enquiry form with EmailJS submit, studio details, Google Maps embed.
- Pure validate() exported for unit tests; honeypot field for spam.
- src/js/main.js dispatches by data-page attribute.
- vite.config.js: cleanUrlsPlugin rewrites /about, /services, /contact, /work in dev + preview; about/services/contact added to rollupOptions.input.
- Vitest now 62/62 (8 new contact tests).
- Playwright specs added under e2e/about.spec.js, e2e/services.spec.js, e2e/contact.spec.js.


## Phase 3 Polish (cont.) — 2026-06-22 (session ~20:00+ IST)

### Gallery lightbox viewer
- Clicking any gallery thumbnail opens a full-screen lightbox (`vm-lightbox`).
- Left/right arrow buttons (‹ ›) cycle through all gallery images; Escape key and backdrop click close.
- 1-image projects (MEA Bangalore) hide navigation arrows automatically.
- `src/work/[slug].html`: lightbox overlay div added after `.vm-proj-gallery`.
- `src/css/project.css`: `.vm-lightbox` and related rules.
- `src/js/project.js`: `initLightbox()` function; called at end of gallery hydration.

### Gallery row heights increased
- All data-count row heights bumped: count=5 260px→320px, count=4 230px→280px, count=3 280px→340px, count=1/2 520px→620px.
- `cursor: pointer` added to `.vm-proj-gallery__img`.

### Hero overlays lightened + heroes taller
- Project hero: `75vh` → `85vh`; overlay bottom `0.62` → `0.42`.
- Work hero: `65vh` → `78vh`; overlay bottom `0.62` → `0.42`.
- Upper 60% of hero images now fully clean/unshaded.

### Copy + test fixes
- `Selected Work` → `Our Projects` everywhere (index.html, main.js, e2e test).
- `Select Projects` → `Our Projects` on work page hero eyebrow.
- `__tests__/projects.test.js`: gallery assertion updated to array shape.
- Build scripts: Windows invocation guard removed from copy-data, copy-components, convert-images.
- Prettier auto-format applied to 7 files.

## Phase 3 Polish — 2026-06-22 (session ~14:00–20:00 IST)

### Home hero carousel
- Replaced single static background image with a 5-image crossfade carousel (5 s interval, 1.5 s opacity transition).
- Images: ITC Ratnadipa exterior, bar lounge, Taj Malabar restaurant, bar, Marriott Marquis Delhi interior.
- `src/index.html`: `.vm-hero__slides` wrapper with 5 `.vm-hero__slide` `<img>` elements.
- `src/css/home.css`: `.vm-hero__slides` / `.vm-hero__slide` / `.vm-hero__slide.is-active` rules; removed `.vm-hero__bg`.
- `src/js/home.js`: `initHeroCarousel()` added, called at start of `initHome()`.

### Work page hero
- Added full-height photo hero to `/work` above filter tabs.
- Image: `jw-marriott-bengaluru/banquet.webp` (grand ballroom — unique, not used as any project hero).
- Hero: 65 vh, dark overlay, centred text.
- `src/work.html`, `src/css/work.css`.

### Project gallery — adaptive 1–5 images
- `data/projects.json`: `gallery` field changed from 3-key object to array; all 5-image projects updated with `gallery[0]` = hero image for full consistency.
- `src/work/[slug].html`: 5 uniform `<img data-gallery-img="N">` slots replacing named data-attributes.
- `src/css/project.css`: data-count–driven grid with explicit pixel row heights (260 px per row for count=5); removed `overflow:hidden` and fixed `height` to prevent 3rd-row clipping.
- `src/js/project.js`: loop-based gallery hydration; sets `gallery.dataset.count` for CSS; unused slots set to `display:none`.
- `e2e/work.spec.js`: gallery assertion updated to `[data-gallery-img="0"]` src check.

### Work page grid — image consistency
- `src/js/work.js`: tile image source changed from `images.cover` → `images.hero` so work-list thumbnail matches the project detail hero exactly.
- `data/projects.json`: `gallery[0]` synced to `images.hero` for all projects.

### Project & work hero sizing
- Project hero: `height: 75vh` (min 560 px, max 820 px) — significantly less crop.
- Work hero: `height: 65vh` (min 480 px, max 720 px).
- Both overlays lightened: gradient only darkens bottom 40 %, leaving upper image clean and vibrant.
- `object-position: center center` on both heroes.

### Build scripts — Windows invocation fix
- `scripts/copy-data.js`, `scripts/copy-components.js`, `scripts/convert-images.js`: removed broken `import.meta.url === 'file://' + process.argv[1]` invocation guard (path format mismatch on Windows meant `main()` was never called by `npm run build`). Scripts now call `main()` unconditionally.

## Phase 2 — 2026-06-21

- Home page built — 7 sections: hero, Selected Work strip, About, Disciplines, How We Work, Stats, CTA banner.
- src/index.html, src/css/home.css, src/js/home.js wired.
- src/js/main.js now calls initHome after nav and footer are injected.
- Added scripts/copy-data.js — runs pre-dev and pre-build to expose data/projects.json at /data/projects.json.
- Vitest now 54/54 (7 new home tests for selectFeatured and renderWorkTile).
- Playwright home.spec.js added under e2e/.

## Phase 1 — 2026-06-21

- Added shared nav and footer (src/components/*, src/css/nav.css, src/css/footer.css).
- Added injectComponent and markActiveNavLink utilities; scripts/copy-components.js mirrors fragments.
- Added jsdom; Vitest 47/47 (6 new).

## Phase 0 — 2026-06-21

- Vite + vanilla-JS skeleton, tokens.css, base.css, projects.json, sharp WebP converter, tooling, CI, vercel.json.

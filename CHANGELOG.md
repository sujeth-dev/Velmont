# Changelog

All notable changes per push. Most recent first.

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

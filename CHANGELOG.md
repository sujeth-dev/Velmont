# Changelog

All notable changes per push. Most recent first.

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

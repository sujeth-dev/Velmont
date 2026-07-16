# Architecture Decision Log

Significant decisions that shaped the project. Add a new entry here **before** writing code for any Major or Breaking change. See `plan/CHANGE_GUIDE.md §10` for the entry template.

---

## 2026-07-16 — Decouple image conversion from the build (faster deploys)

**What:** The build no longer converts images. `npm run build` now runs a fast, stat-only `verify-images` guard instead of `optimize-images`, and ships the WebP/AVIF files committed under `public/assets` directly (Vite copies `public/` into `dist/`). Conversion (`scripts/convert-images.js`) is a manual step, made incremental (skips images whose `.webp`+`.avif` already exist; `-- --force` / `FORCE_IMAGES=1` re-encodes all). Full workflow documented in `plan/IMAGE_WORKFLOW.md`.
**Why:** Re-encoding all 66 source images to WebP **and** AVIF on every `npm run build` (which Vercel runs per deploy) was pure wasted CPU — the AVIF pass dominated build time — and produced non-deterministic AVIF bytes (spurious git churn), even though the outputs were already committed. Referencing the committed outputs directly removes image work from the deploy entirely; local build dropped to ~13s.
**Alternatives considered:** (a) Keep conversion in the build but make it incremental — safer against a forgotten output, but still runs a redundant pass every deploy and can't use mtime reliably after a fresh `git clone` (all files share checkout mtime). (b) Drop conversion with no guard — fastest, but a new source image committed without its output would silently ship broken. Chosen approach = (b) plus a stat-only `verify-images` gate that fails the build early and names the offending files, getting the speed of decoupling without the footgun. The incremental skip in `convert-images.js` was also kept so the manual `optimize-images` run is cheap.
**Impact:** Adding photos is now a documented manual step (`plan/IMAGE_WORKFLOW.md`): add source → `npm run optimize-images` → commit source **and** `public/assets` outputs together. Replacing a source in place requires `-- --force` or deleting its outputs first. `convert-images.js` `main()` is now guarded to run only when invoked directly, so `verify-images.js` can import its enumeration helpers. Firebase/admin image path (`upload-project-images.js`, `firebase-data.js`) is unaffected — separate pipeline.
**Rollback plan:** Put `npm run optimize-images` back into the `build` script (replacing `verify-images`).
**Status:** Done

---

## 2026-06-21 — Vanilla HTML/CSS/JS over Next.js

**What:** Build the site with Vanilla HTML/CSS/JS + Vite instead of Next.js.
**Why:** Original client plan specified vanilla stack. Simplicity, no framework overhead, easy hand-off to any developer without framework knowledge.
**Alternatives considered:** Next.js 15 (App Router) — better built-in image optimization and TypeScript support, but introduces framework dependency and complexity not needed for a static brochure site.
**Impact:** Testing via Vitest + Playwright (not Jest + React Testing Library). Image optimization handled by a separate `sharp` conversion script + `<picture>` tags rather than `next/image`. No server-side rendering.
**Rollback plan:** N/A — this is the starting decision.
**Status:** Done

---

## 2026-06-21 — Hybrid image strategy: local WebP/AVIF + Firebase Storage

**What:** Local project images (committed to repo) are converted to WebP/AVIF and served via Vercel CDN. Admin-uploaded images go to Firebase Storage bucket.
**Why:** Launch images are known and finite — committing them gives fast CDN serving with no external dependency. Future admin uploads need a persistent store that survives deploys, so Firebase Storage is the right home for those.
**Alternatives considered:** Cloudinary CDN for all images — adds cost and an external dependency for images that are already in the repo. Pure local-only — would require a new deploy every time the client adds a project image via admin.
**Impact:** `scripts/convert-images.js` runs before build. All `<img>` tags use `<picture>` with AVIF → WebP → JPEG fallback. Firebase Storage URLs used only for admin-uploaded content.
**Constraints:** No blur placeholder or LQIP on any image — use standard `loading="lazy"` only.
**Rollback plan:** Remove `<picture>` tags and revert to plain `<img src="*.jpg">` if conversion pipeline causes issues.
**Status:** Done

---

## 2026-06-21 — No responsive/mobile design

**What:** Site is desktop-only, min-width: 1200px. No mobile breakpoints will be implemented in the initial build.
**Why:** The approved reference design has zero mobile breakpoints. Adding responsive design requires additional design decisions (typography scaling, grid collapse, touch interactions) that are outside the current approved scope.
**Alternatives considered:** Build responsive from the start — would require new design decisions not yet approved by client.
**Impact:** `body { min-width: 1200px }` in `src/css/base.css`. Lighthouse mobile scores will be lower than desktop scores — this is acceptable and expected. Lighthouse CI thresholds are set for desktop only.
**Rollback plan:** Remove `min-width` and add `@media` queries — this is a Major change class and requires a feature branch when/if it happens.
**Status:** Superseded — see 2026-07-10 "Mobile-responsive retrofit" below.

---

## 2026-07-10 — Mobile-responsive retrofit (public site)

**What:** Made the 6 public pages (home, work, project detail, about, services, contact) fully responsive at three tiers — mobile (≤599px), tablet (600–1023px), desktop (≥1024px, unchanged). Removed the `width=1200` viewport lock and `body { min-width: 1200px }` floor (now scoped to `@media (min-width: 1024px)` only) on those 6 pages. Built a hamburger/off-canvas mobile nav (new markup in `nav.html`, new `initMobileNav()` in `components.js`, new toggle/panel CSS in `nav.css`). Converted the main headline type-scale tokens (`--fs-hero-h1`, `--fs-project-h1`, `--fs-section-h2`, `--fs-section-h3-dark`, `--fs-editorial-lead`, `--fs-work-tile-name`, `--fs-display-num`) in `tokens.css` to `clamp()` so they scale fluidly instead of jumping at breakpoints — desktop's clamp upper bound equals the pre-existing literal value, so ≥1024px renders pixel-identical to before. Added a per-breakpoint spacing/sizing token override block (`--pad-side`, `--nav-h`, `--hero-h`, etc.) to `base.css`. Every other page/component CSS file (`nav.css`, `footer.css`, `common.css`, `home.css`, `work.css`, `project.css`, `about.css`, `services.css`, `contact.css`) got its own `@media` override block appended at the end of that same file. Fixed a real (pre-existing, previously-latent) grid-blowout bug in the project gallery (`.vm-proj-gallery__img` was missing `min-width: 0`, so gallery images overflowed once the viewport was actually unlocked — the bug existed since Phase 3 but was masked by the `width=1200` lock). Fixed the home page's "Our Projects" carousel (`src/js/home.js`) to measure tile width at runtime instead of a hardcoded `100/3` constant, since different breakpoints show a different number of visible tiles. Admin panel intentionally excluded — stays desktop-only (internal tool, own separate CSS system, confirmed with user).
**Why:** Client requested the public site be usable on phones/tablets. No mobile mockups exist, so the mobile/tablet layouts (nav collapse pattern, grid stacking order, type scale) are an engineering judgment call preserving the existing desktop brand look, not a pixel-for-pixel spec implementation.
**Alternatives considered:** A single new `src/css/responsive.css` file loaded last on every page — tried first, but Vite's CSS code-splitting does not reliably preserve `<link>` document order once a page's CSS is split into multiple build chunks (confirmed empirically: the chunk containing `responsive.css` was sometimes injected *before* a page's own main CSS chunk, silently no-op'ing every override). Appending each page's overrides to the end of that page's own already-loaded CSS file guarantees correct cascade order regardless of chunking, since a single source file's rule order is never split across chunks.
**Impact:** `<meta name="viewport">` changed from `content="width=1200"` to `content="width=device-width, initial-scale=1"` on all 6 public page templates (admin pages unchanged, still locked to 1200). New Playwright projects `mobile` (Pixel 5 viewport, Chromium) and `tablet` (768×1024, Chromium) added to `playwright.config.js` — WebKit-based device profiles (`devices['iPhone 13']` etc.) were tried first but this project only has the Chromium browser installed (see `npm run e2e:install`), so mobile/tablet emulation uses Chromium at the same viewport sizes instead. New `e2e/mobile-nav.spec.js` covers the hamburger open/close/Escape behavior. Full existing e2e suite re-run against all 3 projects — the only failures are a pre-existing data/test drift unrelated to this change (`e2e/work.spec.js`/`home.spec.js` hardcode "18 project tiles" and a few stale project titles; `data/projects.json` now has 19 published projects since the in-progress ITC Grand Chola Chennai addition) — flagged, not fixed, as it's a content-sync issue outside this change's scope. Also fixed one pre-existing near-miss contrast failure (`.vm-footer__tagline`, 4.47:1 vs the 4.5:1 required) surfaced for the first time by this being the first-ever mobile-emulated Lighthouse run on this site.
**Rollback plan:** Every responsive rule lives inside a `max-width` media query or a `clamp()` upper-bounded at the old literal value — removing the appended `@media` blocks and reverting `tokens.css`/`base.css`/the 6 viewport meta tags restores the exact prior desktop-only behavior file-by-file.
**Status:** Done

---

## 2026-06-22 — Gallery data structure: object → array, gallery[0] = hero

**What:** `images.gallery` in `data/projects.json` changed from a 3-key named object (`{main, topRight, bottomRight}`) to a variable-length array (1–5 items). `gallery[0]` is always the same image as `images.hero`.
**Why:** Named keys limited the gallery to exactly 3 images and caused a coupling problem — the array approach scales to any count and enforces the consistency rule that the main gallery image must match the project hero. Work-list tile also changed to use `images.hero` (not `images.cover`) for the same reason.
**Alternatives considered:** Keep 3-key object and add 2 new keys (`bottomLeft`, `extra`) — works but doesn't scale and doesn't enforce the hero-match rule.
**Impact:** `src/js/project.js` hydration uses a `forEach` loop with `data-gallery-img="N"` attribute; CSS uses `data-count` attribute set by JS to drive layout. MEA Bangalore has only 1 image and renders as a single full-width panel.
**Status:** Done

---

## 2026-07-09 — Phase 7 production hardening: SEO, brand assets, contrast tokens

**What:** Added favicons + a generated default OG image (`scripts/generate-brand-assets.js`, one-time, output committed), `public/robots.txt`, a build-time `sitemap.xml` generator (`scripts/generate-sitemap.js`, wired into `npm run build`), canonical/OG/Twitter meta on all 6 page templates (with per-project hydration added to `scripts/generate-project-pages.js`), a branded self-contained `public/404.html`, a skip-to-content link, and three token/CSS-level contrast fixes: `--slate` darkened from `#68778d` to `#5c697c`, a new `--mineral-text` token (`#67676b`) split off from the border-only `--mineral` token for its ~4 text call sites, and the footer's white-on-black text opacities raised (`.vm-footer__link`, `.vm-footer__contact-label`, `.vm-footer__copyright`) to clear WCAG AA on the dark footer background. Also reworded the brand-link `aria-label` on nav/footer to include the visible tagline, and converted the two pending footer social links from dead `href="#"` anchors to non-interactive `<span aria-hidden="true">`.
**Why:** Canonical domain `https://velmontdesign.com` (bare apex, confirmed with client) was going live with zero SEO/social/crawler infrastructure and a blank default 404. A prior Lighthouse run also flagged real WCAG failures (contrast, label-in-name) that needed fixing before launch.
**Alternatives considered:** A shared head-partial/include system for the meta block — rejected as unnecessary abstraction since each page's head is already maintained independently and only 6 files needed the block. Darkening `--mineral` globally instead of splitting a new `--mineral-text` token — rejected because `--mineral` is used as a border color at ~20 call sites and darkening it there would visibly change the site's border language.
**Impact:** `--slate` is now visibly slightly darker everywhere it's used as text (nav links, kickers, meta labels, site-wide). `.vm-process__step__num` (the large ghost "01/02/03/04" watermark numerals on the home process section, `#3a3a3a` on `#1a1a1a`, 1.53:1) still fails WCAG large-text contrast (needs 3:1) — left as-is because it's a deliberate low-opacity editorial watermark reinforced by adjacent step-title text, not the sole conveyor of the step order; flagged for the client/designer to decide rather than unilaterally changed.
**Rollback plan:** Each piece is independent and revertible file-by-file; no schema or architecture change.
**Status:** Done

---

## 2026-06-22 — Home hero: single image → 5-image crossfade carousel

**What:** The home hero background changed from a single `<img>` to a crossfade carousel of 5 images cycling every 5 seconds (opacity transition 1.5 s).
**Why:** Client request — show bar, restaurant, exterior, and luxury interior images in rotation to represent the breadth of hospitality work.
**Alternatives considered:** Slide-based carousel — rejected in favour of crossfade as more editorial/luxury.
**Impact:** First image loads `eager`/`fetchpriority="high"`; remaining 4 load `lazy`. The `::after` gradient overlay stays at z-index 1, always above the slides at z-index 0.
**Status:** Done

---

## 2026-06-21 — Firebase as full backend (Firestore + Auth + Storage)

**What:** Firebase handles all three backend concerns: Firestore for data, Firebase Auth for admin login, Firebase Storage for image uploads.
**Why:** Serverless, free tier covers launch scale, admin panel requires no backend server, tight integration between all three services, no separate deployment needed.
**Alternatives considered:** Supabase — similar serverless approach but less mature Storage integration. Node + SQLite — requires a server deployment alongside Vercel, adds ops complexity.
**Impact:** All backend SDK code lives in `src/lib/firebase.js`. Firestore security rules must be deployed separately via `firebase.json`. Admin panel is client-side only (no server).
**Rollback plan:** If Firebase is migrated, all fetch calls in `src/js/*.js` and the admin panel must be rewritten. This is a Breaking change.
**Status:** Done

---

## 2026-06-21 — EmailJS for contact form (no backend)

**What:** Contact form submissions are sent via EmailJS client SDK directly to velmont@velmontdesign.com (originally Info@velmontdesign.com; corrected 2026-07-16).
**Why:** No backend server, no API routes — pure client-side solution that works with the vanilla stack and Vercel static hosting. Free tier covers expected enquiry volume.
**Alternatives considered:** Formspree — similar free tier, slightly less control over email template. Vercel Serverless Functions — adds a server layer that is unnecessary for a single contact form.
**Impact:** `VITE_EMAILJS_*` environment variables required in Vercel. Honeypot field added to form for spam protection (Phase 7).
**Rollback plan:** Replace `src/js/contact.js` EmailJS calls with a Vercel Function endpoint. Moderate change class.
**Status:** Done

---

## 2026-07-16 — Client content delivered: facility photos + social links

**What:** Client delivered 5 edited 16:9 manufacturing facility photos and the studio's social profiles (instagram.com/velmontdesign, linkedin.com/company/velmont-design-llp). Photos placed with no duplication across pages: 4 on About (production-floor, edge-banding-line, sliding-table-saw, panel-saw-line) in a dark 2×2 "fill-slide" grid styled like the Services manufacturing block, and 1 on Services (facility-panorama), replacing the dashed `.vm-manuf__photo-placeholder` blocks. Footer social spans converted back to real anchors (`target="_blank" rel="noopener"`); a "Follow" item added to the contact page Studio details list. `scripts/convert-images.js` gained a `convertFacility()` pass (`assets/facility/` → `public/assets/facility/`, same WebP 82 / AVIF 70 / 4000px pipeline).
**Why:** These were the two remaining client-content placeholders on built pages (per MASTER_PLAN Outstanding Items). Split rather than duplicated so About and Services each show distinct photography; Services (the manufacturing-focused page) gets the wider set including the panorama.
**Impact:** `.vm-manuf__photo-placeholder` CSS retired from `about.css`/`services.css`, replaced by a `.vm-manuf__photos` grid (16:9 `aspect-ratio`, `object-fit: cover`). About's manufacturing section became a dark `vm-section--dark vm-manuf--dark vm-manuf--fill` block: `min-height: 100vh`, a narrow text column (`minmax(300px, 380px)`) beside a `.vm-manuf__photos--grid` (2×2), so the four photos claim the slide width and the section reads as one screen. Dark `.vm-manuf__h`/`.vm-manuf__copy` colour overrides added to `about.css` (About does not load `services.css`). Hero images untouched (explicit user constraint). Source JPGs committed under `assets/facility/`.
**Rollback plan:** Restore the placeholder divs + CSS from git history; photos remain on disk.
**Status:** Done

---

<!-- Add new entries above this line, newest first -->

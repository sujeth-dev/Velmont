# Velmont Website — Phase Log

Living record of every phase. One entry per phase. Updated after every push.

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

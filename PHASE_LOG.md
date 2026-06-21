# Velmont Website — Phase Log

Living record of every phase. One entry per phase. Updated after every push.

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

# Velmont Website — Phase Log

Living record of every phase. One entry per phase. Updated after every push.

---

## Phase 1 — Shared Components (Nav + Footer)

| Field | Value |
|---|---|
| Date | 2026-06-21 |
| Status | Complete |
| Branch | main |

### What shipped

- `src/components/nav.html` — sticky 94px paper-bg nav with logo, tagline, 4 links, terracotta-bordered Enquire CTA.
- `src/components/footer.html` — dark vblack footer with white logo, mirrored nav, contact block, social placeholders, copyright.
- `src/css/nav.css`, `src/css/footer.css` — typography and spacing pulled from tokens; active-link state is 2px terracotta underline + vblack text.
- `src/js/components.js` — injectComponent(selector, path) never throws; returns null and console.warns on missing mount, non-OK response, or fetch failure. Also exports markActiveNavLink(pathname).
- `scripts/copy-components.js` — pre-dev/pre-build step that mirrors src/components/*.html to public/components/*.html so the runtime fetch resolves. public/components/ is gitignored.
- src/index.html and src/js/main.js — mount #nav-mount and #footer-mount and call markActiveNavLink on load.

### Tests

| Suite | Result |
|---|---|
| ESLint | Pass |
| Prettier | Pass |
| Vitest | Pass — 47 / 47 (6 new component tests) |
| Vite build | Pass — 8 modules, 3.90s |
| Preview smoke (curl) | / returns 200; /components/nav.html and /components/footer.html serve the fragments |
| Playwright nav-footer.spec.js | Deferred to CI — sandbox blocks Chrome download |

### Notes

- Social handles still pending from client; placeholders carry aria-label "(handle pending)".
- Active-link data attributes go live as those pages land in Phases 3 and 4.

### Commit

- Commit message: Phase 1: Nav and footer shared components
- Branch: main (push from local machine — sandbox has no git credentials)

---

## Phase 0 — Foundation & Tooling

| Field | Value |
|---|---|
| Date | 2026-06-21 |
| Status | Complete |
| Branch | main |

### What shipped

- Vanilla-JS Vite project skeleton.
- src/css/tokens.css — all 8 colour tokens, 4 font stacks, type scale, spacing, height tokens.
- src/css/base.css — reset, body, focus styles, Google Fonts link, local @font-face for The Seasons.
- data/projects.json — all 6 launch projects from PROJECT_DATA.md.
- scripts/convert-images.js — sharp WebP converter; resolves canonical slug to on-disk folder via SLUG_MAP; resizes >4000px sources. Wrote 35 project images and 2 logos to public/assets/.
- Tooling: vite.config.js, vitest.config.js, playwright.config.js, .eslintrc.json, .prettierrc, lighthouserc.json.
- .github/workflows/ci.yml — lint -> unit -> build -> e2e -> Lighthouse.
- vercel.json — security headers, SPA rewrites.
- .env.example.

### Tests

| Suite | Result |
|---|---|
| ESLint | Pass |
| Prettier | Pass |
| Vitest | Pass — 41 / 41 |
| Vite build | Pass |
| Vite preview | Pass — 200 |
| Playwright | Deferred to CI |

### Known gaps

- The Seasons OTF files — pending client.
- MEA Bangalore project images — only 1 available.
- Manufacturing facility photos — needed for Phase 4.

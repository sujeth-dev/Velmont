# Changelog

All notable changes per push. Most recent first.

## Phase 1 — 2026-06-21

- Added shared nav: src/components/nav.html, src/css/nav.css.
- Added shared footer: src/components/footer.html, src/css/footer.css.
- Added injectComponent and markActiveNavLink utilities in src/js/components.js; wired in src/js/main.js.
- Added scripts/copy-components.js — runs pre-dev and pre-build to expose src/components/*.html at /components/*.html.
- Added jsdom as a dev dependency for component unit tests; Vitest now 47/47 (6 new).
- Playwright nav/footer specs added under e2e/nav-footer.spec.js.

## Phase 0 — 2026-06-21

- Initialised Vite + vanilla-JS project skeleton.
- Added design tokens (src/css/tokens.css) and base styles (src/css/base.css) from DESIGN_GUIDE.
- Created data/projects.json with all 6 launch projects from PROJECT_DATA.md.
- Added scripts/convert-images.js — sharp pre-build to produce WebP project images and logos under /public/assets/.
- Configured ESLint, Prettier, Vitest, Playwright, Lighthouse CI.
- Added .github/workflows/ci.yml (lint -> unit -> build -> e2e -> Lighthouse).
- Added vercel.json (security headers + rewrites) and .env.example.

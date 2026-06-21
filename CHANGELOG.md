# Changelog

All notable changes per push. Most recent first.

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

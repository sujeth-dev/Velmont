# Changelog

All notable changes per push. Most recent first.

## Phase 0 — 2026-06-21

- Initialised Vite + vanilla-JS project skeleton.
- Added design tokens (`src/css/tokens.css`) and base styles (`src/css/base.css`) from DESIGN_GUIDE.
- Created `data/projects.json` with all 6 launch projects from PROJECT_DATA.md.
- Added `scripts/convert-images.js` — sharp pre-build to produce WebP project images and logos under `/public/assets/`.
- Configured ESLint, Prettier, Vitest, Playwright, Lighthouse CI.
- Added `.github/workflows/ci.yml` (lint → unit → build → e2e → Lighthouse).
- Added `vercel.json` (security headers + rewrites) and `.env.example`.
- Vitest suite passing 41/41; build green; preview returns 200.

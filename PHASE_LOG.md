# Velmont Website — Phase Log

Living record of every phase. One entry per phase. Updated after every push.

---

## Phase 0 — Foundation & Tooling

| Field | Value |
|---|---|
| Date | 2026-06-21 |
| Status | Complete |
| Branch | main |
| Loop | `develop, test, commit and push Phase 0` |

### What shipped

- Vanilla-JS Vite project skeleton: `src/`, `public/assets/`, `src/css/`, `src/js/`, `data/`, `e2e/`, `__tests__/`, `docs/`, `scripts/`.
- `src/css/tokens.css` — all 8 colour tokens (DESIGN_GUIDE §2), 4 font stacks, type scale, spacing, height tokens. No substitutions.
- `src/css/base.css` — reset, `body { background: var(--paper); min-width: 1200px }`, focus styles, Google Fonts link, local `@font-face` blocks for The Seasons.
- `data/projects.json` — all 6 launch projects from `assets/PROJECT_DATA.md` with full schema (slug, discipline, location, year, area, scope, lead, body, materials, images, featured, published).
- `scripts/convert-images.js` — sharp-based WebP converter; resolves canonical slug → on-disk folder via `SLUG_MAP`; resizes >4000px sources to fit WebP encoder limits. Wrote 35 project images and 2 logos to `/public/assets/`.
- Tooling configs: `vite.config.js`, `vitest.config.js`, `playwright.config.js`, `.eslintrc.json`, `.prettierrc`, `lighthouserc.json`.
- `.github/workflows/ci.yml` — pipeline: lint → unit → build → e2e → Lighthouse. Build artefact passed between jobs.
- `vercel.json` — security headers (X-Frame-Options, X-Content-Type, CSP, Referrer-Policy, Permissions-Policy), SPA rewrites for `/work/:slug`.
- `.env.example` — Firebase + EmailJS placeholders for Phases 4–5.
- `README.md` — Phase 0 onwards now reflects the live setup, not the planning-only state.

### Tests

| Suite | Result |
|---|---|
| ESLint (`npm run lint`) | Pass — 0 errors, 0 warnings |
| Prettier (`npm run format:check`) | Pass — all files |
| Vitest (`npm test`) | Pass — **41 / 41** across `tokens.test.js` (20) and `projects.test.js` (21) |
| Vite build (`npx vite build`) | Pass — 5 modules, 3.95s, no errors. Font warnings expected (The Seasons OTFs pending from client per MASTER_PLAN). |
| Vite preview (`npx vite preview`) | Pass — `curl -I` returns 200; `<title>` matches `Velmont Design Studio` |
| Playwright (`npm run e2e`) | **Deferred to CI** — local sandbox blocks Chrome binary download (`npx playwright install` fails in this environment). Specs (`e2e/smoke.spec.js`) are written and will run on GitHub Actions runners where browser download is allowed. The behaviour the specs verify (preview returns 200, title, paper-bg token) was confirmed via curl + Vitest. |

### Known gaps (carried to later phases per MASTER_PLAN.md)

- **The Seasons OTF font files** — not yet provided by client. `@font-face` placeholder blocks are in place; the stack falls back to Cormorant Garamond → Georgia. Resolves on client delivery.
- **MEA Bangalore project images** — only 1 source image; gallery slots reuse the same image in `projects.json`. Resolves when client supplies more photos.
- **Manufacturing facility photos** — not needed until Phase 4.

### Commit & push

- Commit: `Phase 0: Vite project init, design tokens, tooling, CI pipeline`
- Branch: `main`

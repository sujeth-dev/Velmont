# Velmont Design Studio — Website

B2B commercial interior contracting company website for Velmont Design LLP, Bengaluru.

**Status:** Phase 0 complete. Foundation, tooling, and CI in place.
**Live domain:** velmontdesign.com (not yet deployed)
**Stack:** Vanilla HTML/CSS/JS + Vite · Firebase · Vercel · Playwright · Vitest

---

## Quick start

```bash
npm install
npm run optimize-images   # produce WebP assets from /assets/projects
npm run dev               # http://localhost:5173
npm test                  # vitest
npm run e2e               # playwright (requires browsers installed)
npm run lint              # eslint
npm run format:check      # prettier
npm run build             # production build → dist/
```

## How to run the next phase

Each phase is run as an automated loop. Increment the phase number after sign-off:

```
/loop "develop, test, commit and push Phase 1 of Velmont website per the master plan at plan/MASTER_PLAN.md. Stop and notify me if an approval gate is reached or if any test fails."
```

---

## File Reference

Every file and folder in this repo, why it exists, and whether it is still needed.

### Root

| File | Purpose | Status |
|---|---|---|
| `README.md` | This file — project overview and file reference | Active |
| `DECISIONS.md` | Architecture decision log — every Major/Breaking decision recorded before code is written | Active |

### `plan/`

Planning documents. All are active references during build. Do not delete any of these.

| File | Purpose |
|---|---|
| `MASTER_PLAN.md` | **Primary build reference.** 9-phase plan with dev tasks, tests, commit messages, and approval gates per phase. Start here. |
| `CHANGE_GUIDE.md` | **Change management.** How to classify, apply, and track any future change. Includes dependency map, playbooks, sync checklist, commit protocol, branch strategy. Read before making any post-build change. |
| `DESIGN_GUIDE.md` | Brand and design source of truth — all CSS variables, type scale, component specs, grid patterns, spacing. Used during Phase 0–7 to implement the CSS system. Do not deviate without logging in `DECISIONS.md`. |
| `CONTENT_PLAN.html` | Approved page copy — every headline, body paragraph, section label, CTA, and status badge (Approved / Needs Review / Client to Provide) for all 5 pages. Open in a browser. Source of truth for all HTML content. |
| `WEBSITE_PLAN.md` | Original site architecture doc — page structure, content map, contact details, services list, tone direction, tech stack rationale. Build order section is superseded by `MASTER_PLAN.md`; the rest (copy, contact info, services) remains useful reference. |

### `assets/`

Source files — **not served directly**. These get processed (images converted to WebP/AVIF, logos copied) into `public/assets/` during Phase 0 and Phase 6.

#### `assets/PROJECT_DATA.md`

Verified facts, copy, and image mapping for all 6 featured projects. Source of truth for `data/projects.json`. Do not edit project copy without updating this file first.

#### `assets/logos/`

| File | Used in website | Notes |
|---|---|---|
| `velmont-main.png` | Yes — nav (light bg) | Keep |
| `velmont-white.png` | Yes — footer (dark bg) | Keep |
| `velmont-main.jpg` | No | **Redundant** — JPG duplicate of velmont-main.png. Plan: remove in Phase 0. |
| `velmont-white.jpg` | No | **Redundant** — JPG duplicate of velmont-white.png. Plan: remove in Phase 0. |
| `velmont-black.png` | No | Brand archive. Not used in website. Keep as brand file only. |
| `velmont-black.jpg` | No | **Redundant** — JPG duplicate of velmont-black.png. Plan: remove in Phase 0. |
| `velmont-orange.png` | No | Brand archive. Terracotta-variant logo, not used in website. Keep as brand file only. |
| `velmont-orange.jpg` | No | **Redundant** — JPG duplicate of velmont-orange.png. Plan: remove in Phase 0. |
| `velmont-taglined.jpg` | No | Brand archive. Tagline lockup variant, not used in website. Keep as brand file only. |
| `velmont-taglined-2.jpg` | No | Brand archive. Alternative tagline lockup, not used in website. Keep as brand file only. |

#### `assets/brand/`

| File | Used in website | Notes |
|---|---|---|
| `color-palette.png` | No | Visual brand reference only. Useful during CSS token setup. Not served to site visitors. Keep as reference. |

#### `assets/projects/[slug]/`

Source JPG photography for all 6 projects. Processed to WebP/AVIF in Phase 6. One project is incomplete:

| Folder | Images | Complete |
|---|---|---|
| `jw-marriott-bangalore/` | 5 | Yes |
| `taj-kochi/` | 7 | Yes |
| `itc-colombo/` | 8 | Yes |
| `marriott-marquis-delhi/` | 7 | Yes |
| `taj-andaman/` | 7 | Yes |
| `mea-bangalore/` | 1 | **No — additional photos + year/area needed from client** |

---

## Redundancy Removal Plan

Four logo JPG files are duplicates of their PNG equivalents and serve no purpose. Remove them during Phase 0 folder setup:

```
assets/logos/velmont-main.jpg
assets/logos/velmont-white.jpg
assets/logos/velmont-black.jpg
assets/logos/velmont-orange.jpg
```

No other files are redundant. `velmont-black.png`, `velmont-orange.png`, `velmont-taglined.jpg`, `velmont-taglined-2.jpg`, and `color-palette.png` are brand archive files — not used by the website but not safe to delete without client sign-off.
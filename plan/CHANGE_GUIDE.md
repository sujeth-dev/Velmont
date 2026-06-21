# Velmont Website — Change Management Guide

This guide governs every change made to the project after each phase is built. It answers three questions for any change: **What class is it? What else does it touch? How do I apply it safely?**

Read the relevant playbook → run the sync checklist → commit following the protocol.

---

## 1. Change Classification

Classify before touching any file. The class determines the branch strategy, tests required, and approval needed.

| Class | Definition | Examples | Branch | Approval needed |
|---|---|---|---|---|
| **Minor** | 1–2 files, no test change, no schema change | Copy edit, contact info, social links, copyright year | Commit to `main` directly | None |
| **Moderate** | 3–5 files, tests must update, no schema change | New project added, CSS token tweak, image swap, nav text change, new service card | Commit to `main` directly | None |
| **Major** | 6+ files OR schema change OR new dependency OR new page | New Firestore field, new page, new discipline, responsive breakpoints, new admin feature | Feature branch → merge to `main` after tests pass | Review before merge |
| **Breaking** | Changes running system state or external URLs | Domain change, auth provider swap, Firestore restructure, hosting migration, stack change | Feature branch + staging test | Explicit sign-off before merging |

**When in doubt, go one class higher.** The cost of a feature branch is low; the cost of breaking production is high.

---

## 2. The Five Rules

1. **One change, one commit.** Never bundle two unrelated changes. If you updated copy AND fixed a CSS bug, that is two commits.
2. **Tests pass before committing.** Always run `npm test` and `npm run e2e` before every commit. No exceptions.
3. **Update docs in the same commit.** If a change affects what's documented (PHASE_LOG, CHANGELOG, README, any doc in `/docs/`), update the doc in the same commit as the code.
4. **Run the sync checklist.** After any change, complete the relevant rows of the sync checklist in §6 before pushing.
5. **Log breaking decisions.** Any decision that changes the architecture, stack, or data model goes into `DECISIONS.md` before the code is written.

---

## 3. Dependency Map

**Read this as: "If I change X, I must also check Y."**

```
DESIGN_GUIDE.md (source of truth)
    └── src/css/tokens.css
            └── src/css/nav.css
            └── src/css/footer.css
            └── src/css/home.css
            └── src/css/work.css
            └── src/css/project.css
            └── src/css/about.css
            └── src/css/services.css
            └── src/css/contact.css
            └── src/css/admin.css (lighter usage)

CONTENT_PLAN.html (approved copy source)
    └── src/index.html (home — hero, sections, CTA text)
    └── src/about.html
    └── src/services.html
    └── src/contact.html
    └── src/components/nav.html (nav link names, CTA text)
    └── src/components/footer.html (copyright, contact details)

PROJECT_DATA.md (project facts source)
    └── data/projects.json
            └── src/js/home.js (featured=true → 3 tiles on home)
            └── src/js/work.js (all projects → grid + filter)
            └── src/js/project.js (slug → detail page hydration)
            └── Firestore `projects` collection (Phase 5+)
                    └── src/admin/project-form.html
                    └── src/admin/project-edit.html
                    └── src/admin/dashboard.html

assets/projects/[slug]/*.jpg (source images)
    └── scripts/convert-images.js (→ WebP + AVIF)
            └── public/assets/projects/[slug]/*.webp
            └── public/assets/projects/[slug]/*.avif
                    └── All <picture> tags in HTML pages

assets/logos/*.{png,jpg}
    └── public/assets/logos/ (copied + converted)
            └── src/components/nav.html (velmont-main.png)
            └── src/components/footer.html (velmont-white.png)
            └── public/og/*.png (OG social images)

.env (keys)
    └── src/lib/firebase.js (Firestore, Auth, Storage)
    └── src/js/contact.js (EmailJS)
    └── Vercel environment variables (must mirror .env)

src/components/nav.html + src/components/footer.html
    └── Every page HTML file (injected via src/js/components.js)
    └── e2e/nav.test.js + e2e/footer.test.js (text assertions)

public/sitemap.xml
    └── All published page paths (must list every URL on the site)
    └── All project slugs from projects.json

.github/workflows/ci.yml
    └── vite.config.js (build command)
    └── playwright.config.js (baseURL)
    └── lighthouserc.json (score thresholds)
    └── Vercel deploy hook (token in GitHub secrets)
```

---

## 4. Playbooks

Step-by-step instructions for the most common changes. Each playbook ends with the sync checklist rows that apply.

---

### 4.1 Update copy (hero, section headings, body text)

**Class: Minor**

1. Open the relevant HTML file (`src/index.html`, `src/about.html`, etc.)
2. Find the text (search for a fragment of the current copy)
3. Update the text
4. If the changed text appears in `CONTENT_PLAN.html`, add a comment or note at the top of that file marking it updated
5. If the copy is in the footer or nav component (`src/components/`), the change applies to **every page** automatically — verify one other page still looks correct
6. Check if the copy length change breaks any CSS layout (max-width constraints, grid proportions, text overflow)
7. Run sync checklist rows: **Copy**, **Tests**, **Docs**
8. Commit: `Update: hero copy — [describe what changed]`

---

### 4.2 Update or swap a project image

**Class: Minor** (same filename) | **Moderate** (new filename)

**Same filename (clean swap):**
1. Replace the source file in `assets/projects/[slug]/[filename].jpg`
2. Run `npm run optimize-images` — this re-converts to WebP/AVIF, overwriting the old output
3. Verify the image loads correctly on the project detail page and wherever the tile appears
4. Run sync checklist rows: **Images**, **Tests**
5. Commit: `Update: [project-slug] — replace [image-name]`

**New filename (rename or add):**
1. Place new source file in `assets/projects/[slug]/`
2. Update `data/projects.json` → update the image field to the new filename
3. If Firestore is live (Phase 5+): update the Firestore document via admin panel OR via `scripts/seed-firestore.js` re-seed
4. Update the `<picture>` tag in the relevant HTML (if images are hardcoded) OR verify `src/js/project.js` reads the filename from the data source
5. Run `npm run optimize-images`
6. Run sync checklist rows: **Images**, **Data**, **Tests**
7. Commit: `Update: [project-slug] — swap [old-name] for [new-name]`

---

### 4.3 Add a new project

**Class: Moderate** (before Phase 5) | **Minor** (after Phase 5, admin panel handles it)

**After Phase 5 — use admin panel:**
1. Log into `/admin/login`
2. Click "Add Project"
3. Fill all required fields: Title, Discipline (must be one of: Workplace / Healthcare / Hospitality / Commercial), Location, Year, Area, Scope, Lead, Body (3 paragraphs), Materials
4. Upload 5 images via file picker: Cover, Hero, Gallery Main, Gallery Top-Right, Gallery Bottom-Right
5. Toggle Published ON when ready
6. Toggle Featured ON if it should appear on the home work strip (only 3 featured projects show; if toggling on, toggle another off to maintain 3)
7. Verify on public work page: project appears in grid, filter works, project detail page renders correctly
8. Run sync checklist rows: **Data**, **Sitemap**, **Tests**
9. Add entry to `CHANGELOG.md`

**Before Phase 5 — manual:**
1. Place all source images in `assets/projects/[new-slug]/`
2. Run `npm run optimize-images`
3. Add project entry to `data/projects.json` — copy an existing entry and update all fields
4. Verify slug is URL-safe (lowercase, hyphens only, no spaces)
5. Test work page filter and project detail page
6. Run sync checklist rows: **Data**, **Images**, **Sitemap**, **Tests**
7. Commit: `Add: [project-slug] project`

---

### 4.4 Update contact info (address, phone, email, hours)

**Class: Minor — but touches 2 files**

Contact info appears in **two places**. Both must be updated together:
1. `src/contact.html` — contact details block
2. `src/components/footer.html` — footer contact info

Steps:
1. Search for the old value across the whole project (`grep -r "old phone number" src/`)
2. Update every occurrence
3. If Google Maps embed URL is changing: replace the iframe `src` in `src/contact.html`
4. Run sync checklist rows: **Copy**, **Tests**
5. Commit: `Update: contact details — [describe what changed]`

---

### 4.5 Change a CSS design token (color, spacing, type)

**Class: Moderate**

1. Open `src/css/tokens.css`
2. Update the CSS variable value
3. Open every page in the browser (home, work, a project page, about, services, contact) and verify the change looks correct everywhere — the variable propagates automatically via `var(--token-name)`
4. If the change affects color contrast (e.g., changing `--slate` or `--terracotta`): run Lighthouse CI and verify Accessibility score is still ≥ 90
5. If the change is a significant visual shift: cross-reference the original spec in `plan/DESIGN_GUIDE.md` and confirm the change is intentional and documented
6. If intentionally deviating from DESIGN_GUIDE.md: add an entry to `DECISIONS.md` explaining why
7. Run sync checklist rows: **CSS**, **Lighthouse**, **Docs**
8. Commit: `Update: [token-name] from [old-value] to [new-value]`

---

### 4.6 Add a new page

**Class: Major**

1. Create `src/[page-name].html` — use an existing page as template, keep nav + footer inject pattern
2. Create `src/css/[page-name].css`
3. Update `src/components/nav.html` — add nav link
4. Check if the new page requires a JS data fetch — if so, create `src/js/[page-name].js`
5. Add the page URL to `public/sitemap.xml`
6. Add the page path to `public/robots.txt` if it should be indexed (or add to disallow if not)
7. Add OG meta tags to the new page `<head>`
8. Create an E2E test file `e2e/[page-name].test.js` — minimum: page loads, key sections render, nav link is active on this page
9. Update `docs/CHANGE_GUIDE.md` if the new page introduces a new content pattern
10. Update `README.md` — add page to site architecture section
11. Run full test suite: `npm test && npm run e2e`
12. Run Lighthouse CI on the new page
13. Run sync checklist: **ALL rows**
14. Commit: `Add: [page-name] page`

---

### 4.7 Add a new Firestore field to projects

**Class: Major — touches 6+ files**

1. Log the decision in `DECISIONS.md` before writing any code: what field, why, what type, default value for existing documents
2. Update `data/projects.json` — add the new field to all 6 project entries with appropriate values
3. Update `scripts/seed-firestore.js` — ensure seed script writes the new field
4. Run migration for existing Firestore documents: write a one-time `scripts/migrate-[field-name].js` script that reads all existing documents and sets the new field to its default value, then run it once
5. Update admin panel:
   - `src/admin/project-form.html` — add input field
   - `src/admin/project-edit.html` — add input field with pre-filled value
6. Update public page render logic in the relevant `src/js/[page].js` file if the field should display on the public site
7. Update Firestore security rules if the new field has special read/write requirements
8. Update `__tests__/projects.test.js` — add the new field to the required fields schema validation
9. Run sync checklist: **ALL rows**
10. Commit: `Add: [field-name] field to project schema`

---

### 4.8 Rotate Firebase API keys

**Class: Breaking — must be done in one coordinated move**

1. Go to Firebase Console → Project Settings → Generate new web app config
2. Update `.env.local` with new key values
3. Go to Vercel dashboard → Settings → Environment Variables → update all `VITE_FIREBASE_*` values
4. Trigger a new Vercel deploy (push an empty commit or redeploy from dashboard)
5. Verify the live site still fetches Firestore data: visit work page, project detail page
6. Verify admin login still works
7. Delete the old API key from Firebase Console
8. Add entry to `DECISIONS.md` with the date and reason for rotation
9. Commit: `Security: rotate Firebase API keys` (do NOT include key values in the commit)

---

### 4.9 Handle a breaking structural change (domain, hosting, auth provider, stack)

**Class: Breaking**

These changes require a feature branch and staged rollout. No breaking change goes directly to `main`.

Protocol:
1. **Plan first.** Write the change scope in `DECISIONS.md` before touching a single file. Include: what changes, what stays the same, rollback plan.
2. **Create a feature branch:** `git checkout -b breaking/[description]`
3. Implement on the branch. Keep `main` untouched and deployable throughout.
4. Write or update tests before writing the implementation code.
5. Run full test suite on the branch: lint → unit → build → E2E → Lighthouse
6. Deploy the branch to a Vercel preview URL (not production)
7. Smoke test the preview URL manually: every page, admin panel, contact form
8. Get explicit sign-off (reply "merge approved") before merging to `main`
9. Merge: `git merge breaking/[description] --no-ff` (preserves branch history)
10. Push `main` — CI runs, Vercel deploys to production
11. Smoke test production immediately after deploy
12. Add full entry to `DECISIONS.md` and `CHANGELOG.md`
13. Commit on `main` after merge: `Breaking: [description] — [brief rationale]`

---

## 5. Directory Sync Checklist

Run the relevant rows after every change. "All rows" applies to Major and Breaking changes.

### Copy
- [ ] Updated HTML matches the approved copy in `plan/CONTENT_PLAN.html` (or deviation is intentional and noted in `DECISIONS.md`)
- [ ] If nav/footer text changed: text is consistent across all pages (components.js injects both — verify on 2 pages)
- [ ] If copy length changed significantly: no layout overflow or wrapping breakage at 1200px min-width

### CSS / Design
- [ ] Token change in `src/css/tokens.css` looks correct on: home, work, a project page, about, contact
- [ ] Deviation from `plan/DESIGN_GUIDE.md` is noted in `DECISIONS.md`
- [ ] No new hardcoded color hex values — always use CSS variables

### Images
- [ ] `npm run optimize-images` was run after any source image change
- [ ] WebP and AVIF outputs exist in `public/assets/` for every image referenced in HTML
- [ ] All `<img>` tags have `alt` text
- [ ] No `<img src>` points to `.jpg` (must point to `.webp` via `<picture>`)

### Data / Schema
- [ ] `data/projects.json` field structure matches Firestore document structure
- [ ] All 6 projects (+ any new ones) have every required field with correct types
- [ ] `data/projects.json` discipline values are one of: Workplace / Healthcare / Hospitality / Commercial
- [ ] Slugs are URL-safe (lowercase, hyphens, no spaces)
- [ ] `scripts/seed-firestore.js` updated if schema changed
- [ ] If Firestore is live: existing documents migrated — no document is missing the new field

### Sitemap & Routes
- [ ] `public/sitemap.xml` lists all published pages and all project slugs
- [ ] Every URL in `sitemap.xml` actually resolves in the browser (no 404)
- [ ] `public/robots.txt` disallows `/admin/` and references sitemap
- [ ] New page has a Playwright test in `e2e/`

### Tests
- [ ] `npm test` (Vitest unit tests) — all pass
- [ ] `npm run e2e` (Playwright) — all pass
- [ ] If copy text changed: Playwright assertions referencing that text are updated
- [ ] If new field added to schema: `__tests__/projects.test.js` validates the new field
- [ ] If new page added: `e2e/[page].test.js` exists and covers the page

### Lighthouse
- [ ] `npm run lighthouse` — scores at or above established thresholds:
  - Home: Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 95
  - Work: Performance ≥ 90
  - Project detail: Performance ≥ 90
  - All other pages: Performance ≥ 85, Accessibility ≥ 90, SEO ≥ 90
- [ ] New images have `loading="lazy"` (below fold) or `<link rel="preload">` (hero)
- [ ] No new inline `<style>` blocks added to HTML (use CSS files)

### Environment & Config
- [ ] `.env.example` updated if a new env variable was added
- [ ] Vercel dashboard env vars mirror `.env.example`
- [ ] `vercel.json` headers are still correct if routes changed

### Documentation
- [ ] `CHANGELOG.md` has an entry for this change (date, what changed, commit hash)
- [ ] `PHASE_LOG.md` updated if a phase task was completed or modified
- [ ] If change was significant (Major or Breaking): `DECISIONS.md` has a new entry
- [ ] If change affects a documented workflow: the relevant doc in `docs/` is updated

---

## 6. Commit and Push Protocol

### Commit message format

```
[Type]: [What changed] — [one-line rationale if not obvious]
```

| Type | When to use |
|---|---|
| `Add` | New file, page, feature, project, field |
| `Update` | Changed existing content, copy, image, value |
| `Fix` | Bug fix, broken link, incorrect value |
| `Refactor` | Code structure change with no behavior change |
| `Style` | CSS-only visual change |
| `Test` | Test added or updated (no production code change) |
| `Docs` | Documentation only |
| `Security` | Security-related change (key rotation, header update) |
| `Breaking` | Change that alters architecture, schema, or external state |

### Examples
```
Update: hero H1 copy — client approved revised positioning line
Add: taj-exotica-andaman cover image — swap to exterior shot
Fix: footer phone number — missing country code
Style: --terracotta value from #FF4015 to #F03A10
Breaking: migrate projects data source from JSON to Firestore
Security: rotate Firebase API keys — quarterly rotation
```

### Push checklist (run before every push)
```bash
npm test          # Vitest unit tests — must pass
npm run e2e       # Playwright E2E tests — must pass
npm run build     # Vite build — must succeed with no errors
```

If any command fails: fix it, do not push.

---

## 7. Branch Strategy

```
main                    — always deployable, always tested
│
├── breaking/[name]     — breaking or major structural changes
│   └── merge to main after: full test suite + staging review + sign-off
│
└── hotfix/[name]       — emergency production fix only
    └── merge to main after: targeted test + verify on staging
```

**Direct commits to `main`:** Allowed for Minor and Moderate changes only, after tests pass locally.

**Feature branches:** Required for Major and Breaking changes. Named `breaking/[description]` or `feature/[description]`.

**Hotfix branches:** Only for production emergencies (broken page, broken form, security issue). Named `hotfix/[description]`. Fast-tracked to production, documented in `CHANGELOG.md` immediately after.

---

## 8. Emergency Hotfix Procedure

For when something is broken on production and must be fixed immediately.

1. `git checkout -b hotfix/[description]`
2. Fix the issue — keep the change as narrow as possible
3. Run targeted tests for the affected area (not necessarily full suite if time-critical)
4. `git merge hotfix/[description]` into `main`
5. Push — CI runs, Vercel deploys
6. Verify fix on production within 5 minutes of deploy
7. Run full test suite after the crisis is resolved
8. Add entry to `CHANGELOG.md` and `DECISIONS.md` (reason, what broke, what fixed it)

---

## 9. Handling Client-Provided Content

When the client delivers outstanding items (facility photos, social handles, The Seasons fonts, etc.):

1. **Check the outstanding items table in `MASTER_PLAN.md`** — find which phase the item was needed for
2. **Classify the change** — delivering client photos is Moderate; delivering the font files is Moderate
3. **Follow the relevant playbook** — image swap (§4.2), font swap (update `@font-face` in `tokens.css`)
4. **Remove the placeholder** — delete the styled placeholder block in the HTML before adding real content
5. **Run the sync checklist** — Lighthouse must still pass after adding real images/fonts
6. **Update the outstanding items table** — mark the item as received and done
7. **Commit:** `Add: [item description] — client delivered [date]`

---

## 10. Decision Log

For Breaking and Major changes, add an entry to `DECISIONS.md` in the project root **before writing code**.

Template:
```markdown
## [Date] — [Decision title]

**What:** [One sentence describing the change]
**Why:** [The reason this change was needed]
**Alternatives considered:** [What else was evaluated and why it was rejected]
**Impact:** [What files, features, or external systems this affects]
**Rollback plan:** [How to undo this if it goes wrong]
**Status:** Proposed / In progress / Done
```

---

## 11. What NOT to do

- Do not edit `plan/DESIGN_GUIDE.md` unless the client has approved a design change — it is the source of truth
- Do not add hardcoded color hex values in CSS — always use `var(--token-name)` from `tokens.css`
- Do not commit `.env` or `.env.local` — only `.env.example`
- Do not change a project's slug after Phase 5 — Firebase Storage URLs and Firestore document IDs will break
- Do not delete a Firestore document directly — always use the admin panel delete flow which also cleans up Storage files
- Do not bypass CI checks with `--no-verify` — fix the failure instead
- Do not push to `main` if `npm run build` fails
- Do not change Firestore security rules without testing with the Firebase emulator first

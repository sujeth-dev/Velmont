# Image Workflow — how photos get onto the site

**One-line rule:** optimised images are **committed** to `public/assets/` and the
build ships them as-is. Conversion is a **manual step you run only when you add or
change a source image** — never on every build.

This keeps deploys fast (no AVIF re-encoding on Vercel) and the repo deterministic
(no image churn). Read this before adding client photos.

---

## The two folders

| Folder | What it holds | In git? |
|---|---|---|
| `assets/` | **Source** photos (full-size JPG/PNG the client delivered) | Yes |
| `public/assets/` | **Optimised** outputs (`.webp` + `.avif`) that the site actually loads | Yes |

`public/` is Vite's public dir (see `vite.config.js`), so everything in
`public/assets/` is copied verbatim into `dist/` at build time. The pages
reference these files directly via `<picture>` (AVIF → WebP → `<img>` fallback).

## How the scripts fit together

| Command | When | Cost |
|---|---|---|
| `npm run optimize-images` | You just added/changed a source image | Encodes only the **new/missing** ones (incremental); `-- --force` re-encodes all |
| `npm run verify-images` | Runs inside `npm run build` | Stat-only, ~instant; **fails the build** if any source lacks its committed output |
| `npm run build` | Every deploy (Vercel) | Verifies + copies committed images; **never encodes** |

`scripts/convert-images.js` = the encoder (sharp, WebP q82 / AVIF q70, max 4000px).
`scripts/verify-images.js` = the guard. Both share one source-of-truth enumeration
(`SLUG_MAP`, `listImages`) exported from `convert-images.js`.

---

## Adding new photos (the checklist)

1. **Drop the source files** into the right `assets/` folder:
   - Project photos → `assets/projects/<source-folder>/` (see `SLUG_MAP` in
     `scripts/convert-images.js` for the source-folder ↔ URL-slug mapping).
   - Facility photos → `assets/facility/`.
   - Give them descriptive kebab-case names (e.g. `edge-banding-line.jpg`), not
     `IMG_1234.jpg`.
2. **Optimise:** `npm run optimize-images`
   - It prints `N encoded, M reused`. Only your new files should be encoded.
3. **Reference them** in the page HTML with the standard `<picture>` block
   (AVIF `<source>` → WebP `<source>` → `<img>` webp fallback, explicit
   `width`/`height`, `loading="lazy"` `decoding="async"`, descriptive `alt`).
4. **Commit both** the source *and* the generated `public/assets/**` outputs in the
   same commit. This is the important step — the build ships what's committed.
5. `npm run build` locally to confirm `verify-images` passes.

### Replacing an image in place (same filename)
Because a present output means "skip", editing a source file in place will **not**
regenerate it. Either:
- `npm run optimize-images -- --force` (re-encodes everything), or
- delete that file's `.webp`/`.avif` in `public/assets/` first, then
  `npm run optimize-images` (re-encodes just that one).

### Removing an image
Delete the source **and** its `public/assets/**` outputs, and remove the
`<picture>` block that referenced it.

---

## Firebase note

This pipeline is for the **public marketing site** only. The admin panel's project
images go through Firebase (`scripts/upload-project-images.js` → Firebase Storage,
read via `src/lib/firebase-data.js`) — a completely separate path that these image
scripts do not touch. Changing the local image pipeline never affects Firebase sync.

---

## If a deploy fails with "Missing optimised outputs"

`verify-images` found a source image with no committed `.webp`/`.avif`. The error
lists exactly which ones. Fix locally:

```bash
npm run optimize-images     # generates the missing outputs
git add assets public/assets # commit source + outputs together
```

then redeploy.

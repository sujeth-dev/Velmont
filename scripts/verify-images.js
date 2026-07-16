#!/usr/bin/env node
/**
 * Velmont — Image output verification (fast, no encoding)
 *
 * The build ships the optimised WebP/AVIF files committed under /public/assets
 * directly; it no longer re-encodes them (see DECISIONS.md 2026-07-16). This
 * guard runs in `npm run build` to catch the one failure mode of that setup:
 * a new source image committed to /assets without its generated outputs.
 *
 * It only stats files — it never reads or encodes an image — so it is
 * effectively instant. If anything is missing it prints exactly which source
 * images need `npm run optimize-images`, and exits non-zero to fail the build.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  listImages,
  SLUG_MAP,
  SRC_PROJECTS,
  SRC_FACILITY,
  SRC_LOGOS,
  OUT_PROJECTS,
  OUT_FACILITY,
  OUT_LOGOS,
} from './convert-images.js';

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

/** Push a `{ src, missing[] }` record if either output is absent. */
async function checkPair(srcFile, outWebp, missing) {
  const outAvif = outWebp.replace(/\.webp$/, '.avif');
  const gaps = [];
  if (!(await exists(outWebp))) gaps.push(path.relative(process.cwd(), outWebp));
  if (!(await exists(outAvif))) gaps.push(path.relative(process.cwd(), outAvif));
  if (gaps.length) missing.push({ src: path.relative(process.cwd(), srcFile), gaps });
}

async function main() {
  const missing = [];

  // Projects
  for (const slug of Object.keys(SLUG_MAP)) {
    const srcDir = path.join(SRC_PROJECTS, SLUG_MAP[slug]);
    const outDir = path.join(OUT_PROJECTS, slug);
    for (const file of await listImages(srcDir)) {
      const base = path.basename(file, path.extname(file));
      await checkPair(path.join(srcDir, file), path.join(outDir, base + '.webp'), missing);
    }
  }

  // Facility
  for (const file of await listImages(SRC_FACILITY)) {
    const base = path.basename(file, path.extname(file));
    await checkPair(path.join(SRC_FACILITY, file), path.join(OUT_FACILITY, base + '.webp'), missing);
  }

  // Logos (only the two the site actually uses)
  for (const file of ['velmont-main.png', 'velmont-white.png']) {
    const srcFile = path.join(SRC_LOGOS, file);
    if (!(await exists(srcFile))) continue;
    const base = path.basename(file, path.extname(file));
    await checkPair(srcFile, path.join(OUT_LOGOS, base + '.webp'), missing);
  }

  if (missing.length) {
    console.error('[verify-images] Missing optimised outputs for ' + missing.length + ' source image(s):');
    for (const m of missing) {
      console.error('  ' + m.src + '  ->  missing ' + m.gaps.join(', '));
    }
    console.error('\nRun `npm run optimize-images` and commit the generated files under public/assets.');
    process.exit(1);
  }

  console.log('[verify-images] all source images have committed WebP + AVIF outputs.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

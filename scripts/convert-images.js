#!/usr/bin/env node
/**
 * Velmont — Image conversion script
 *
 * Reads source JPGs from /assets/projects/<sourceFolder>/, facility photos
 * from /assets/facility/, and logos from /assets/logos/, writes optimised
 * WebP into /public/assets/projects/<slug>/, /public/assets/facility/ and
 * /public/assets/logos/.
 *
 * Slugs in /public/assets/projects/ are the canonical URL slugs from
 * data/projects.json. Source folder names may differ — the SLUG_MAP below
 * resolves this.
 *
 * Phase 0: WebP only at quality 82. Phase 6 added AVIF at quality 70
 * (same source, written alongside the .webp as a sibling .avif file).
 */

import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SRC_PROJECTS = path.join(ROOT, 'assets', 'projects');
const SRC_LOGOS = path.join(ROOT, 'assets', 'logos');
const SRC_FACILITY = path.join(ROOT, 'assets', 'facility');
const OUT_PROJECTS = path.join(ROOT, 'public', 'assets', 'projects');
const OUT_LOGOS = path.join(ROOT, 'public', 'assets', 'logos');
const OUT_FACILITY = path.join(ROOT, 'public', 'assets', 'facility');

// canonical slug → source folder name on disk
const SLUG_MAP = {
  'jw-marriott-bengaluru': 'jw-marriott-bangalore',
  'taj-malabar-kochi': 'taj-kochi',
  'itc-ratnadipa-colombo': 'itc-colombo',
  'marriott-marquis-delhi': 'marriott-marquis-delhi',
  'mea-bangalore': 'mea-bangalore',
  'taj-exotica-andaman': 'taj-andaman',
  'allianz-trivandrum': 'allianz-trivandrum',
  'wells-fargo-chennai': 'wells-fargo-chennai',
  'kauvery-hospital-chennai': 'kauvery-hospital-chennai',
  'shell-nctb-bangalore': 'shell-nctb-bangalore',
  'shibaura-machine-chennai': 'shibaura-machine-chennai',
  'itc-grand-chola-chennai': 'itc-grand-chola-chennai',
  'moxy-bangalore-airport': 'moxy-bangalore-airport',
};

const WEBP_QUALITY = 82;
const AVIF_QUALITY = 70;
const MAX_LONG_EDGE = 4000;

// Optimised WebP/AVIF outputs are committed to /public/assets, so a normal
// build (local or on Vercel) can reuse them instead of re-encoding all 66
// source images — the AVIF pass in particular dominates build time. We skip
// any image whose .webp AND .avif both already exist. Pass --force (or set
// FORCE_IMAGES=1) to re-encode everything, e.g. after replacing a source file
// in place or changing the quality settings above.
const FORCE = process.argv.includes('--force') || process.env.FORCE_IMAGES === '1';

let convertedCount = 0;
let skippedCount = 0;

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function outputsExist(webpFile) {
  const avifFile = webpFile.replace(/\.webp$/, '.avif');
  try {
    await Promise.all([fs.access(webpFile), fs.access(avifFile)]);
    return true;
  } catch {
    return false;
  }
}

async function convertOne(srcFile, outFile) {
  if (!FORCE && (await outputsExist(outFile))) {
    skippedCount += 1;
    return;
  }
  await ensureDir(path.dirname(outFile));
  const resized = sharp(srcFile).resize({
    width: MAX_LONG_EDGE,
    height: MAX_LONG_EDGE,
    fit: 'inside',
    withoutEnlargement: true,
  });
  await resized.clone().webp({ quality: WEBP_QUALITY }).toFile(outFile);
  await resized
    .clone()
    .avif({ quality: AVIF_QUALITY })
    .toFile(outFile.replace(/\.webp$/, '.avif'));
  convertedCount += 1;
}

async function listImages(dir) {
  const exts = ['.jpg', '.jpeg', '.png'];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
  return entries
    .filter((e) => e.isFile() && exts.includes(path.extname(e.name).toLowerCase()))
    .map((e) => e.name);
}

async function convertProjects() {
  const results = [];
  for (const slug of Object.keys(SLUG_MAP)) {
    const srcFolder = SLUG_MAP[slug];
    const srcDir = path.join(SRC_PROJECTS, srcFolder);
    const outDir = path.join(OUT_PROJECTS, slug);
    const files = await listImages(srcDir);
    if (files.length === 0) {
      console.warn('[convert-images] no source images in ' + srcDir);
      continue;
    }
    for (const file of files) {
      const base = path.basename(file, path.extname(file));
      const srcFile = path.join(srcDir, file);
      const outFile = path.join(outDir, base + '.webp');
      await convertOne(srcFile, outFile);
      results.push({ slug, file: base + '.webp' });
    }
  }
  return results;
}

async function convertFacility() {
  const results = [];
  const files = await listImages(SRC_FACILITY);
  for (const file of files) {
    const base = path.basename(file, path.extname(file));
    await convertOne(path.join(SRC_FACILITY, file), path.join(OUT_FACILITY, base + '.webp'));
    results.push({ facility: base + '.webp' });
  }
  return results;
}

async function convertLogos() {
  const results = [];
  const wanted = ['velmont-main.png', 'velmont-white.png'];
  await ensureDir(OUT_LOGOS);
  for (const file of wanted) {
    const srcFile = path.join(SRC_LOGOS, file);
    try {
      await fs.access(srcFile);
    } catch {
      console.warn('[convert-images] missing logo ' + srcFile);
      continue;
    }
    const base = path.basename(file, path.extname(file));
    const outFile = path.join(OUT_LOGOS, base + '.webp');
    await convertOne(srcFile, outFile);
    await fs.copyFile(srcFile, path.join(OUT_LOGOS, file));
    results.push({ logo: base });
  }
  return results;
}

async function main() {
  console.log('[convert-images] starting');
  const projects = await convertProjects();
  const facility = await convertFacility();
  const logos = await convertLogos();
  const total = projects.length + facility.length + logos.length;
  console.log(
    '[convert-images] ' +
      total +
      ' images (' +
      projects.length +
      ' project, ' +
      facility.length +
      ' facility, ' +
      logos.length +
      ' logos) — ' +
      convertedCount +
      ' encoded, ' +
      skippedCount +
      ' reused' +
      (FORCE ? ' (--force)' : '') +
      '.',
  );
  if (!FORCE && convertedCount === 0) {
    console.log('[convert-images] all outputs up to date; nothing re-encoded.');
  }
}

// Only run when invoked directly (node scripts/convert-images.js), not when
// imported for its enumeration helpers (e.g. by scripts/verify-images.js).
const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export {
  convertProjects,
  convertFacility,
  convertLogos,
  listImages,
  SLUG_MAP,
  SRC_PROJECTS,
  SRC_FACILITY,
  SRC_LOGOS,
  OUT_PROJECTS,
  OUT_FACILITY,
  OUT_LOGOS,
};

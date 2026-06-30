#!/usr/bin/env node
/**
 * Velmont — Image conversion script
 *
 * Reads source JPGs from /assets/projects/<sourceFolder>/ and logos from
 * /assets/logos/, writes optimised WebP into /public/assets/projects/<slug>/
 * and /public/assets/logos/.
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
const OUT_PROJECTS = path.join(ROOT, 'public', 'assets', 'projects');
const OUT_LOGOS = path.join(ROOT, 'public', 'assets', 'logos');

// canonical slug → source folder name on disk
const SLUG_MAP = {
  'jw-marriott-bengaluru': 'jw-marriott-bangalore',
  'taj-malabar-kochi': 'taj-kochi',
  'itc-ratnadipa-colombo': 'itc-colombo',
  'marriott-marquis-delhi': 'marriott-marquis-delhi',
  'mea-bangalore': 'mea-bangalore',
  'taj-exotica-andaman': 'taj-andaman',
};

const WEBP_QUALITY = 82;
const AVIF_QUALITY = 70;
const MAX_LONG_EDGE = 4000;

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function convertOne(srcFile, outFile) {
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
  const logos = await convertLogos();
  console.log(
    '[convert-images] wrote',
    projects.length,
    'project images and',
    logos.length,
    'logos',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export { convertProjects, convertLogos, SLUG_MAP };

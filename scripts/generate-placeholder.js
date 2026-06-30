#!/usr/bin/env node
/**
 * Velmont — Placeholder image generator
 *
 * One-off script: rasterizes a simple branded SVG into a single shared WebP
 * placeholder used by newly seeded projects that don't have real photography
 * yet. Run once and commit the output — not part of the build pipeline, since
 * SVG text rendering depends on fonts available on the machine it runs on.
 *
 * Run: node scripts/generate-placeholder.js
 */

import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const OUT_DIR = path.join(ROOT, 'public', 'assets', 'projects', '_placeholder');
const OUT_FILE = path.join(OUT_DIR, 'placeholder.webp');
const OUT_FILE_AVIF = path.join(OUT_DIR, 'placeholder.avif');

const WIDTH = 1600;
const HEIGHT = 1067;

const PAPER = '#f4f0eb';
const TERRACOTTA = '#ff4015';
const SLATE = '#68778d';
const VBLACK = '#1a1a1a';

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${PAPER}" />
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="${TERRACOTTA}" />
  <text x="50%" y="48%" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" font-weight="700" letter-spacing="6" fill="${VBLACK}">VELMONT</text>
  <text x="50%" y="57%" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" letter-spacing="4" fill="${SLATE}">PHOTOGRAPHY PENDING</text>
</svg>
`;

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const rendered = sharp(Buffer.from(svg));
  await rendered.clone().webp({ quality: 82 }).toFile(OUT_FILE);
  await rendered.clone().avif({ quality: 70 }).toFile(OUT_FILE_AVIF);
  console.log('[generate-placeholder] wrote', OUT_FILE, 'and', OUT_FILE_AVIF);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

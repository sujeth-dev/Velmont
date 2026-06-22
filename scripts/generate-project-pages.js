#!/usr/bin/env node
/**
 * Velmont — Generate one HTML file per published project slug.
 *
 * Copies dist/work/[slug].html (the Vite-built template) to
 * dist/work/<actual-slug>.html for every published project in projects.json.
 *
 * Vercel's cleanUrls:true then serves each file at /work/<slug> with no
 * rewrite rule needed.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST_WORK = path.join(ROOT, 'dist', 'work');
const TEMPLATE = path.join(DIST_WORK, '[slug].html');
const DATA = path.join(ROOT, 'data', 'projects.json');

async function main() {
  const [templateHtml, raw] = await Promise.all([
    fs.readFile(TEMPLATE, 'utf8'),
    fs.readFile(DATA, 'utf8'),
  ]);

  const projects = JSON.parse(raw);
  const published = projects.filter((p) => p.published && p.slug);

  await Promise.all(
    published.map((p) => {
      const out = path.join(DIST_WORK, `${p.slug}.html`);
      return fs
        .writeFile(out, templateHtml, 'utf8')
        .then(() => console.log(`[generate-pages] ${p.slug}.html`));
    }),
  );

  console.log(`[generate-pages] ${published.length} project page(s) written`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

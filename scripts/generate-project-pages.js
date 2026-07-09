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
const SITE = 'https://velmontdesign.com';

const PLACEHOLDER_TITLE = 'Project — Velmont Design Studio';
const PLACEHOLDER_DESCRIPTION = 'Velmont Design Studio — project detail.';
const PLACEHOLDER_URL = `${SITE}/work/PROJECT_SLUG`;
const PLACEHOLDER_IMAGE = `${SITE}/assets/og/default-og.jpg`;

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function truncate(str, max) {
  if (str.length <= max) return str;
  return `${str.slice(0, max - 1).trimEnd()}…`;
}

function hydrateHead(templateHtml, project) {
  const title = `${project.title} — Velmont Design Studio`;
  const description = truncate(project.lead || PLACEHOLDER_DESCRIPTION, 155);
  const url = `${SITE}/work/${project.slug}`;
  const cover = project.images?.cover ? `${SITE}${project.images.cover}` : PLACEHOLDER_IMAGE;

  return templateHtml
    .split(PLACEHOLDER_TITLE)
    .join(escapeAttr(title))
    .split(PLACEHOLDER_DESCRIPTION)
    .join(escapeAttr(description))
    .split(PLACEHOLDER_URL)
    .join(url)
    .split(PLACEHOLDER_IMAGE)
    .join(cover);
}

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
      const html = hydrateHead(templateHtml, p);
      return fs
        .writeFile(out, html, 'utf8')
        .then(() => console.log(`[generate-pages] ${p.slug}.html`));
    }),
  );

  console.log(`[generate-pages] ${published.length} project page(s) written`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

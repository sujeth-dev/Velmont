#!/usr/bin/env node
/**
 * Velmont — Generate dist/sitemap.xml from the static page list and
 * every published project slug in data/projects.json.
 *
 * Runs as part of `npm run build`, after generate-pages (so per-slug
 * project pages already exist in dist/work/).
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data', 'projects.json');
const OUT = path.join(ROOT, 'dist', 'sitemap.xml');

const SITE = 'https://velmontdesign.com';

const STATIC_PAGES = [
  { loc: '/', priority: '1.0' },
  { loc: '/work', priority: '0.9' },
  { loc: '/about', priority: '0.7' },
  { loc: '/services', priority: '0.7' },
  { loc: '/contact', priority: '0.7' },
];

function urlEntry(loc, priority) {
  return `  <url>\n    <loc>${SITE}${loc}</loc>\n    <priority>${priority}</priority>\n  </url>`;
}

async function main() {
  const raw = await fs.readFile(DATA, 'utf8');
  const projects = JSON.parse(raw);
  const published = projects.filter((p) => p.published && p.slug);

  const entries = [
    ...STATIC_PAGES.map((p) => urlEntry(p.loc, p.priority)),
    ...published.map((p) => urlEntry(`/work/${p.slug}`, '0.8')),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, xml, 'utf8');
  console.log(`[generate-sitemap] wrote sitemap.xml with ${entries.length} URLs`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

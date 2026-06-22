#!/usr/bin/env node
/**
 * Velmont — Copy HTML component fragments from src/components/ to
 * public/components/ so they are served as static files at /components/*.html
 * for the runtime fetch in src/js/components.js.
 *
 * Source of truth lives in src/components/. The mirrored public/components/
 * directory is build output (gitignored).
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SRC = path.join(ROOT, 'src', 'components');
const OUT = path.join(ROOT, 'public', 'components');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  await ensureDir(OUT);
  let entries;
  try {
    entries = await fs.readdir(SRC, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn('[copy-components] no src/components/ — nothing to copy');
      return;
    }
    throw err;
  }
  const files = entries.filter((e) => e.isFile() && e.name.endsWith('.html'));
  for (const f of files) {
    await fs.copyFile(path.join(SRC, f.name), path.join(OUT, f.name));
  }
  console.log('[copy-components] wrote', files.length, 'fragments to public/components/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export { main as copyComponents };

#!/usr/bin/env node
/**
 * Velmont — Copy data/projects.json into public/data/ so the runtime fetch
 * at /data/projects.json resolves in both vite dev and vite preview builds.
 * Source of truth stays at data/projects.json. public/data/ is gitignored.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SRC = path.join(ROOT, 'data');
const OUT = path.join(ROOT, 'public', 'data');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  await ensureDir(OUT);
  let entries;
  try {
    entries = await fs.readdir(SRC, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return;
    throw err;
  }
  const files = entries.filter((e) => e.isFile() && e.name.endsWith('.json'));
  for (const f of files) {
    await fs.copyFile(path.join(SRC, f.name), path.join(OUT, f.name));
  }
  console.log('[copy-data] wrote', files.length, 'json file(s) to public/data/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export { main as copyData };

// Quick local preview server — merges src/ (root) and public/ (static assets)
// Phase 3: rewrites /work/<slug> to serve src/work/[slug].html
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, 'src');
const PUBLIC = path.join(__dirname, 'public');
const PORT = 5173;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.otf': 'font/otf',
};

function tryFile(...candidates) {
  for (const f of candidates) {
    if (fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  }
  return null;
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  // Rewrite /work/<slug> to the per-slug generated file
  const slugMatch = urlPath.match(/^\/work\/([a-z0-9-]+)\/?$/);
  if (slugMatch) {
    urlPath = `/work/${slugMatch[1]}.html`;
  }

  // Resolve: src/ first (for index.html, css/, js/), then public/ (for /components/, /assets/, /data/)
  const file = tryFile(
    path.join(SRC, urlPath),
    path.join(PUBLIC, urlPath),
  );

  if (!file) {
    res.writeHead(404); res.end('Not found: ' + urlPath); return;
  }

  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, () => console.log(`Velmont local preview → http://localhost:${PORT}`));

import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Rewrites for clean URLs in dev + preview.
// /work/<slug>         -> /work/<slug>.html  (project detail)
// /about | /services | /contact | /work
//                      -> /<page>.html       (multi-page entries)
function cleanUrlsPlugin() {
  const PAGES = ['about', 'services', 'contact', 'work'];
  function applyRewrite(middlewares) {
    middlewares.use((req, _res, next) => {
      // Project detail: /work/<slug>
      const slug = req.url.match(/^\/work\/([a-z0-9-]+)\/?(\?.*)?$/);
      if (slug) {
        req.url = `/work/${slug[1]}.html${slug[2] || ''}`;
        return next();
      }
      // Top-level pages
      const top = req.url.match(/^\/([a-z]+)\/?(\?.*)?$/);
      if (top && PAGES.includes(top[1])) {
        req.url = `/${top[1]}.html${top[2] || ''}`;
      }
      next();
    });
  }
  return {
    name: 'velmont-clean-urls',
    configureServer(server) {
      applyRewrite(server.middlewares);
    },
    configurePreviewServer(server) {
      applyRewrite(server.middlewares);
    },
  };
}

// Vite config for Velmont website.
// Multi-page: index (home), work list, project detail, about, services, contact.
export default defineConfig({
  root: 'src',
  publicDir: resolve(__dirname, 'public'),
  plugins: [cleanUrlsPlugin()],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        work: resolve(__dirname, 'src/work.html'),
        project: resolve(__dirname, 'src/work/[slug].html'),
        about: resolve(__dirname, 'src/about.html'),
        services: resolve(__dirname, 'src/services.html'),
        contact: resolve(__dirname, 'src/contact.html'),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
});

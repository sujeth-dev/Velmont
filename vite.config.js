import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Rewrites /work/<slug> to serve the single project detail template.
// Runs in both dev server and preview server so Playwright tests work locally.
// Must live inside a plugin object — not at the top level of defineConfig.
function workSlugRewritePlugin() {
  function applyRewrite(middlewares) {
    middlewares.use((req, _res, next) => {
      if (/^\/work\/[a-z0-9-]+\/?(\?.*)?$/.test(req.url)) {
        req.url = '/work/%5Bslug%5D.html';
      }
      next();
    });
  }
  return {
    name: 'work-slug-rewrite',
    configureServer(server) {
      applyRewrite(server.middlewares);
    },
    configurePreviewServer(server) {
      applyRewrite(server.middlewares);
    },
  };
}

// Vite config for Velmont website.
// Multi-page: index (home), work list, project detail.
export default defineConfig({
  root: 'src',
  publicDir: resolve(__dirname, 'public'),
  plugins: [workSlugRewritePlugin()],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        work: resolve(__dirname, 'src/work.html'),
        project: resolve(__dirname, 'src/work/[slug].html'),
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

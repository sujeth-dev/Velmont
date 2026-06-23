import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Rewrites for clean URLs in dev + preview.
// /work/<slug>         -> /work/<slug>.html  (project detail)
// /about | /services | /contact | /work
//                      -> /<page>.html       (multi-page entries)
function cleanUrlsPlugin() {
  const PAGES = ['about', 'services', 'contact', 'work'];
  const ADMIN_PAGES = ['login', 'dashboard', 'project-form', 'project-edit'];
  function applyRewrite(middlewares) {
    middlewares.use((req, _res, next) => {
      // Admin pages: /admin/<page>
      const admin = req.url.match(/^\/admin\/([a-z0-9-]+)\/?(\?.*)?$/);
      if (admin && ADMIN_PAGES.includes(admin[1])) {
        req.url = `/admin/${admin[1]}.html${admin[2] || ''}`;
        return next();
      }
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
// Multi-page: index (home), work list, project detail, about, services, contact,
// and admin panel (login, dashboard, project-form, project-edit).
export default defineConfig({
  root: 'src',
  // envDir defaults to root ('src'), but .env lives in the project root.
  // Explicitly point to the project root so VITE_* vars are loaded correctly.
  envDir: __dirname,
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
        adminLogin: resolve(__dirname, 'src/admin/login.html'),
        adminDashboard: resolve(__dirname, 'src/admin/dashboard.html'),
        adminProjectForm: resolve(__dirname, 'src/admin/project-form.html'),
        adminProjectEdit: resolve(__dirname, 'src/admin/project-edit.html'),
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

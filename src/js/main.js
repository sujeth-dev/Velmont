// Velmont — main entry point.
// Phase 1: inject shared nav + footer on every page.

import { injectComponent, markActiveNavLink } from './components.js';

async function init() {
  await Promise.all([
    injectComponent('#nav-mount', '/components/nav.html'),
    injectComponent('#footer-mount', '/components/footer.html'),
  ]);
  markActiveNavLink();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

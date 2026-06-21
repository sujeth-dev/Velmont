// Velmont — main entry point.
// Phase 1: inject shared nav + footer.
// Phase 2: hydrate the home page Selected Work strip.

import { injectComponent, markActiveNavLink } from './components.js';
import { initHome } from './home.js';

async function init() {
  await Promise.all([
    injectComponent('#nav-mount', '/components/nav.html'),
    injectComponent('#footer-mount', '/components/footer.html'),
  ]);
  markActiveNavLink();
  initHome();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

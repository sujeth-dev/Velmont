// Velmont — main entry point.
// Phase 1: inject shared nav + footer.
// Phase 2: hydrate the home page Our Projects strip.
// Phase 4: wire contact form when present.

import { injectComponent, markActiveNavLink } from './components.js';
import { initHome } from './home.js';
import { initContactForm } from './contact.js';

async function init() {
  await Promise.all([
    injectComponent('#nav-mount', '/components/nav.html'),
    injectComponent('#footer-mount', '/components/footer.html'),
  ]);
  markActiveNavLink();

  const page = document.querySelector('main')?.dataset.page;
  if (page === 'contact') {
    initContactForm();
  } else if (!page) {
    // Home (default — no data-page) keeps its existing init.
    initHome();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

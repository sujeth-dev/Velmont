/**
 * Velmont — Shared component injector.
 *
 * Fetches an HTML fragment and replaces the contents of the target element.
 * Used to share nav + footer markup across every page without a build step
 * per page.
 *
 * Designed to fail gracefully: if the fragment can't be fetched (404, network
 * error, non-OK status), it returns null and logs a warning. The page stays
 * usable even if a shell component fails to load.
 *
 * Phase 1 contract: never throw. Always resolve. Tested in __tests__/components.test.js.
 */

/**
 * @param {string} selector - CSS selector for the mount target.
 * @param {string} path - URL of the HTML fragment to fetch.
 * @returns {Promise<HTMLElement|null>}
 */
export async function injectComponent(selector, path) {
  const mount = document.querySelector(selector);
  if (!mount) {
    console.warn('[components] no mount element matches selector:', selector);
    return null;
  }

  try {
    const res = await fetch(path, { credentials: 'same-origin' });
    if (!res.ok) {
      console.warn('[components] fetch failed', path, res.status);
      return null;
    }
    const html = await res.text();
    mount.innerHTML = html;
    return mount;
  } catch (err) {
    console.warn('[components] fetch threw', path, err && err.message);
    return null;
  }
}

/**
 * Marks the active nav link based on the current pathname. Looks for
 * `[data-nav-link]` attributes injected by nav.html.
 *
 * @param {string} [pathname] - override; defaults to window.location.pathname
 */
export function markActiveNavLink(pathname) {
  const path = pathname || window.location.pathname;
  // Map URL prefixes to data-nav-link keys.
  const map = [
    { match: /^\/work/, key: 'work' },
    { match: /^\/services/, key: 'services' },
    { match: /^\/about/, key: 'about' },
    { match: /^\/contact/, key: 'contact' },
  ];
  const hit = map.find((m) => m.match.test(path));
  if (!hit) return;
  const link = document.querySelector(`[data-nav-link="${hit.key}"]`);
  if (link) {
    link.classList.add('is-active');
    link.setAttribute('aria-current', 'page');
  }
}

function closeNavPanel(nav, toggle) {
  nav.classList.remove('vm-nav--open');
  toggle.setAttribute('aria-expanded', 'false');
  document.documentElement.classList.remove('vm-nav-open-lock');
}

function openNavPanel(nav, toggle) {
  nav.classList.add('vm-nav--open');
  toggle.setAttribute('aria-expanded', 'true');
  document.documentElement.classList.add('vm-nav-open-lock');
}

/**
 * Wires the mobile hamburger menu (nav.html's `.vm-nav__toggle` button).
 * Uses delegated events on `document` rather than binding directly to the
 * injected nav element, since `injectComponent` resolves the nav markup
 * asynchronously and this can safely be called before or after that
 * resolves. Kept here (in the module every page already imports) rather
 * than as its own file, so it shares this module's existing JS chunk
 * instead of creating a second one that would reorder page CSS.
 */
export function initMobileNav() {
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('.vm-nav__toggle');
    if (toggle) {
      const nav = toggle.closest('.vm-nav');
      if (!nav) return;
      if (nav.classList.contains('vm-nav--open')) closeNavPanel(nav, toggle);
      else openNavPanel(nav, toggle);
      return;
    }

    // Clicking a link inside the open panel (or the brand logo) closes it.
    const link = e.target.closest('.vm-nav__panel a, .vm-nav__brand');
    if (link) {
      const nav = link.closest('.vm-nav');
      const navToggle = nav && nav.querySelector('.vm-nav__toggle');
      if (nav && navToggle && nav.classList.contains('vm-nav--open')) {
        closeNavPanel(nav, navToggle);
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openNav = document.querySelector('.vm-nav--open');
    if (!openNav) return;
    const toggle = openNav.querySelector('.vm-nav__toggle');
    if (toggle) closeNavPanel(openNav, toggle);
  });
}

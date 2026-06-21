/**
 * Velmont — injectComponent unit tests (Phase 1).
 * Validates the contract called out in MASTER_PLAN §Phase 1:
 *   "Vitest: injectComponent handles fetch failure gracefully
 *    (returns null, logs warning)"
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

let dom;
let warnSpy;

beforeEach(() => {
  dom = new JSDOM('<!doctype html><html><body><div id="m"></div></body></html>', {
    url: 'http://localhost/',
  });
  globalThis.document = dom.window.document;
  globalThis.window = dom.window;
  globalThis.HTMLElement = dom.window.HTMLElement;
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
  delete globalThis.fetch;
  delete globalThis.document;
  delete globalThis.window;
  delete globalThis.HTMLElement;
});

async function load() {
  // Import fresh so the module sees the new global document.
  vi.resetModules();
  return import('../src/js/components.js');
}

describe('injectComponent', () => {
  it('injects fetched HTML into the matched mount and returns the element', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('<nav data-hello="yes">Hi</nav>'),
    });
    const { injectComponent } = await load();
    const result = await injectComponent('#m', '/components/nav.html');
    expect(result).not.toBeNull();
    expect(document.querySelector('#m nav[data-hello="yes"]')).not.toBeNull();
  });

  it('returns null and warns when the mount selector matches nothing', async () => {
    const { injectComponent } = await load();
    const result = await injectComponent('#does-not-exist', '/components/nav.html');
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns null and warns on a non-OK response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve(''),
    });
    const { injectComponent } = await load();
    const result = await injectComponent('#m', '/components/missing.html');
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    // mount must remain empty so the page stays usable
    expect(document.querySelector('#m').innerHTML).toBe('');
  });

  it('returns null and warns when fetch rejects', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network down'));
    const { injectComponent } = await load();
    const result = await injectComponent('#m', '/components/nav.html');
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });
});

describe('markActiveNavLink', () => {
  it('adds is-active + aria-current to the matching link', async () => {
    document.body.innerHTML =
      '<a data-nav-link="work">Work</a><a data-nav-link="about">About</a>';
    const { markActiveNavLink } = await load();
    markActiveNavLink('/work');
    const work = document.querySelector('[data-nav-link="work"]');
    const about = document.querySelector('[data-nav-link="about"]');
    expect(work.classList.contains('is-active')).toBe(true);
    expect(work.getAttribute('aria-current')).toBe('page');
    expect(about.classList.contains('is-active')).toBe(false);
  });

  it('is a no-op for unknown paths', async () => {
    document.body.innerHTML = '<a data-nav-link="work">Work</a>';
    const { markActiveNavLink } = await load();
    markActiveNavLink('/some/other/path');
    const link = document.querySelector('[data-nav-link="work"]');
    expect(link.classList.contains('is-active')).toBe(false);
  });
});

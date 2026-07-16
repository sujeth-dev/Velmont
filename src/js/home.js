// Velmont — Home page.
// Fetches /data/projects.json and renders the Our Projects auto-scroll carousel.
// Tiles are duplicated so the CSS marquee animation loops seamlessly.

/**
 * Pure renderer — produces the HTML for a single work tile. Exported so
 * Vitest can unit-test the markup contract without touching the DOM.
 *
 * @param {object} p - project record from data/projects.json
 * @returns {string}
 */
export function renderWorkTile(p) {
  const slug = String(p.slug || '').replace(/[^a-z0-9-]/gi, '');
  const discipline = String(p.discipline || '');
  const title = String(p.title || '');
  const location = String(p.location || '');
  const year = p.year != null ? String(p.year) : '';
  return [
    '<a class="vm-work__tile" href="/work/' + slug + '" data-tile="' + slug + '">',
    '<p class="vm-work__tile__discipline">' + discipline + '</p>',
    '<div>',
    '<p class="vm-work__tile__name">' + title + '</p>',
    '<p class="vm-work__tile__location">' + location + '</p>',
    '</div>',
    '<div class="vm-work__tile__foot">',
    '<span class="vm-work__tile__year">' + year + '</span>',
    '<span class="vm-work__tile__arrow" aria-hidden="true">→</span>',
    '</div>',
    '</a>',
  ].join('');
}

/**
 * Returns all published projects for the carousel.
 * @param {object[]} projects
 * @returns {object[]}
 */
export function selectPublished(projects) {
  return projects.filter((p) => p.published).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

/**
 * Kept for backward-compat with existing Vitest suite.
 * @param {object[]} projects
 * @returns {object[]}
 */
export function selectFeatured(projects) {
  return projects.filter((p) => p.featured && p.published).slice(0, 3);
}

/**
 * Measures one tile's rendered width as a percentage of its slider
 * viewport's width. Replaces a hardcoded "100/3" constant so the slide
 * transform math stays correct at any tile width the CSS sets per
 * breakpoint (desktop shows 3 tiles, mobile/tablet show fewer).
 * @param {HTMLElement} mount - the sliding `.vm-work__slides` track
 * @returns {number} percentage (0-100)
 */
export function measureTilePct(mount) {
  const FALLBACK = 100 / 3;
  const tile = mount && mount.querySelector('.vm-work__tile');
  const viewport = mount && mount.parentElement;
  if (!tile || !viewport) return FALLBACK;
  const tileWidth = tile.getBoundingClientRect().width;
  const viewportWidth = viewport.getBoundingClientRect().width;
  if (!tileWidth || !viewportWidth) return FALLBACK;
  return (tileWidth / viewportWidth) * 100;
}

/**
 * Mount sliding-window carousel.
 * Renders all published tiles, then appends clones of the first 3 so the
 * loop can snap back to index 0 without a visible jump.
 * @param {HTMLElement} mount
 * @param {object[]} projects
 */
export function mountFeatured(mount, projects) {
  if (!mount) return 0;
  const tiles = selectPublished(projects);
  if (!tiles.length) return 0;
  const tileHtml = tiles.map(renderWorkTile).join('');
  // Clone first 3 tiles at the end for seamless wraparound; marked as non-interactive
  const cloneHtml = tiles
    .slice(0, 3)
    .map((p) =>
      renderWorkTile(p).replace(
        '<a class="vm-work__tile"',
        '<a class="vm-work__tile" data-clone="true" aria-hidden="true" tabindex="-1"',
      ),
    )
    .join('');
  mount.innerHTML = tileHtml + cloneHtml;
  return tiles.length;
}

async function loadProjects() {
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    try {
      const { getPublishedProjects } = await import('../lib/firebase-data.js');
      return await getPublishedProjects();
    } catch (err) {
      console.warn('[home] Firestore unavailable, falling back to JSON:', err && err.message);
    }
  }
  try {
    const res = await fetch('/data/projects.json', { credentials: 'same-origin' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[home] projects.json fetch failed', err && err.message);
    return null;
  }
}

/**
 * Build one logo item. Renders an <img> pointing at the client logo; if the
 * file is missing it swaps to a clean text wordmark so the strip works before
 * real logos are supplied.
 * @param {{name:string,file:string}} c
 * @param {boolean} clone - mark duplicated set as aria-hidden
 * @returns {HTMLElement}
 */
export function renderClientItem(c, clone) {
  const item = document.createElement('div');
  item.className = 'vm-clients__item';
  if (clone) item.setAttribute('aria-hidden', 'true');

  const name = String(c.name || '');
  const file = String(c.file || '').replace(/[^a-z0-9._-]/gi, '');

  const wordmark = () => {
    const span = document.createElement('span');
    span.className = 'vm-clients__wordmark';
    span.textContent = name;
    item.replaceChildren(span);
  };

  if (!file) {
    wordmark();
    return item;
  }
  const img = document.createElement('img');
  img.className = 'vm-clients__logo';
  img.src = '/assets/logos/clients/' + file;
  img.alt = name;
  // Eager, not lazy: the marquee moves logos with a CSS transform, which does
  // NOT trigger lazy-load. Deferred logos would otherwise decode mid-scroll and
  // stutter on a cold cache (first visit). The full logo set is small.
  img.loading = 'eager';
  img.decoding = 'async';
  img.addEventListener('error', wordmark, { once: true });
  item.appendChild(img);
  return item;
}

/**
 * Mount the "Trusted by" logo marquee. Renders the client set twice so the
 * pure-CSS marquee (translateX -50%) loops seamlessly.
 * @param {HTMLElement} track
 * @param {{name:string,file:string}[]} clients
 */
export function mountClients(track, clients) {
  if (!track || !Array.isArray(clients) || !clients.length) return 0;
  const frag = document.createDocumentFragment();
  clients.forEach((c) => frag.appendChild(renderClientItem(c, false)));
  clients.forEach((c) => frag.appendChild(renderClientItem(c, true)));
  track.replaceChildren(frag);
  return clients.length;
}

async function loadClients() {
  try {
    const res = await fetch('/assets/logos/clients/clients.json', { credentials: 'same-origin' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function initClients() {
  const track = document.querySelector('[data-clients]');
  if (!track) return;
  const clients = await loadClients();
  if (!clients) {
    const section = track.closest('.vm-clients');
    if (section) section.hidden = true;
    return;
  }
  mountClients(track, clients);
}

function initHeroCarousel() {
  const slides = document.querySelectorAll('.vm-hero__slide');
  if (!slides.length) return;
  let cur = 0;
  slides[cur].classList.add('is-active');
  setInterval(() => {
    slides[cur].classList.remove('is-active');
    cur = (cur + 1) % slides.length;
    slides[cur].classList.add('is-active');
  }, 5000);
}

export async function initHome() {
  initHeroCarousel();
  initClients();

  const mount = document.querySelector('[data-tiles]');
  if (!mount) return;

  // Yield for one paint before the Firestore fetch — keeps the hero's LCP
  // image off the same task as the (large) firebase-data chunk evaluation.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const projects = await loadProjects();
  if (!projects) {
    mount.innerHTML = '<p style="padding: 40px; color: var(--slate);">Projects loading…</p>';
    return;
  }

  const n = mountFeatured(mount, projects);
  if (!n) return;

  // Tile width as a % of the viewport — measured, not hardcoded, since
  // responsive.css shows a different tile count per breakpoint (3 on
  // desktop, ~2 on tablet, ~1 on mobile).
  let tilePct = measureTilePct(mount);
  let index = 0;
  let timer;

  // Manage transition directly via style — more reliable than class toggling
  function goTo(i, animate) {
    mount.style.transition = animate ? 'transform 0.85s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
    mount.style.transform = `translateX(-${i * tilePct}%)`;
  }

  function advance() {
    index++;
    goTo(index, true);

    // When we reach the cloned section, snap back to origin invisibly
    if (index === n) {
      mount.addEventListener(
        'transitionend',
        () => {
          index = 0;
          goTo(0, false);
          // Force a synchronous reflow so the browser commits the instant-snap
          // before the next animation frame, making the wrap truly seamless
          void mount.offsetWidth;
        },
        { once: true },
      );
    }
  }

  // Set initial position without transition, then start the interval
  goTo(0, false);
  timer = setInterval(advance, 4500);

  // Pause on hover
  const slider = mount.closest('.vm-work__slider');
  if (slider) {
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', () => {
      timer = setInterval(advance, 4500);
    });
  }

  // Re-measure on resize/orientation change (e.g. rotating a phone, or a
  // breakpoint change) — the current slide is kept, just re-positioned at
  // the newly-correct percentage, with no transition so it doesn't jump.
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      tilePct = measureTilePct(mount);
      goTo(index, false);
    }, 150);
  });
}

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
  return projects.filter((p) => p.published);
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
  try {
    const res = await fetch('/data/projects.json', { credentials: 'same-origin' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[home] projects.json fetch failed', err && err.message);
    return null;
  }
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

  const mount = document.querySelector('[data-tiles]');
  if (!mount) return;

  const projects = await loadProjects();
  if (!projects) {
    mount.innerHTML = '<p style="padding: 40px; color: var(--slate);">Projects loading…</p>';
    return;
  }

  const n = mountFeatured(mount, projects);
  if (!n) return;

  // One tile width = 100% / 3 of the slider container
  const TILE_PCT = 100 / 3;
  let index = 0;
  let timer;

  // Manage transition directly via style — more reliable than class toggling
  function goTo(i, animate) {
    mount.style.transition = animate ? 'transform 0.85s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
    mount.style.transform = `translateX(-${i * TILE_PCT}%)`;
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
}

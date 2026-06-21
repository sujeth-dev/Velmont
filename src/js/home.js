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
  // Clone first 3 tiles at the end for seamless wraparound
  const cloneHtml = tiles.slice(0, 3).map(renderWorkTile).join('');
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

export async function initHome() {
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

  function goTo(i, animate) {
    if (animate) mount.classList.add('is-animated');
    mount.style.transform = `translateX(-${i * TILE_PCT}%)`;
  }

  function advance() {
    index++;
    goTo(index, true);

    // When we reach the cloned section, snap back silently
    if (index === n) {
      mount.addEventListener(
        'transitionend',
        () => {
          mount.classList.remove('is-animated');
          index = 0;
          goTo(0, false);
          // Re-enable animation after one paint so the snap isn't visible
          requestAnimationFrame(() => {
            requestAnimationFrame(() => mount.classList.add('is-animated'));
          });
        },
        { once: true },
      );
    }
  }

  // Start after a short delay so transition class is applied post-render
  requestAnimationFrame(() => {
    mount.classList.add('is-animated');
    timer = setInterval(advance, 4500);
  });

  // Pause on hover
  const slider = mount.closest('.vm-work__slider');
  if (slider) {
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', () => {
      timer = setInterval(advance, 4500);
    });
  }
}

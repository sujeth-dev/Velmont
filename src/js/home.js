// Velmont — Home page (Phase 2).
// Fetches /data/projects.json and renders the 3 featured tiles into the
// Selected Work strip. Falls back to a styled placeholder if the fetch fails
// so the strip never collapses.

const MAX_FEATURED = 3;

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
 * @param {object[]} projects - array of project records
 * @returns {object[]} the featured + published subset (max 3)
 */
export function selectFeatured(projects) {
  return projects.filter((p) => p.featured && p.published).slice(0, MAX_FEATURED);
}

/**
 * Mount featured tiles into the given container.
 * @param {HTMLElement} mount
 * @param {object[]} projects
 */
export function mountFeatured(mount, projects) {
  if (!mount) return 0;
  const tiles = selectFeatured(projects);
  mount.innerHTML = tiles.map(renderWorkTile).join('');
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
    mount.innerHTML = '<p style="padding: 40px; color: var(--slate);">Featured work loading…</p>';
    return;
  }
  mountFeatured(mount, projects);
}

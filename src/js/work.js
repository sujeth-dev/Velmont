// Velmont — Work list page.
// Fetches /data/projects.json, renders the project grid, and wires the discipline filter.

/**
 * Pad a tile index to two digits: 1 → "01"
 * @param {number} n
 * @returns {string}
 */
function padIndex(n) {
  return String(n).padStart(2, '0');
}

/**
 * Build the HTML for a single project grid tile.
 * @param {object} p - project record
 * @param {number} index - 1-based display index
 * @returns {string}
 */
export function renderGridTile(p, index) {
  const slug = String(p.slug || '').replace(/[^a-z0-9-]/gi, '');
  const year = p.year != null ? String(p.year) : '—';
  const loc = String(p.location || '');
  const meta = loc && year !== '—' ? `${loc} · ${year}` : loc || year;
  return [
    `<a class="vm-grid-tile" href="/work/${slug}" data-discipline="${p.discipline || ''}" data-tile="${slug}">`,
    `<span class="vm-grid-tile__index">${padIndex(index)}</span>`,
    `<p class="vm-grid-tile__discipline">${p.discipline || ''}</p>`,
    `<p class="vm-grid-tile__name">${p.title || ''}</p>`,
    `<p class="vm-grid-tile__meta">${meta}</p>`,
    `<div class="vm-grid-tile__foot">`,
    `<span class="vm-grid-tile__year">${year !== '—' ? year : ''}</span>`,
    `<span class="vm-grid-tile__arrow" aria-hidden="true">→</span>`,
    `</div>`,
    `</a>`,
  ].join('');
}

/**
 * Filter tiles by discipline. Pass null / "All" to show all.
 * @param {HTMLElement} grid
 * @param {string|null} discipline
 */
export function applyFilter(grid, discipline) {
  const tiles = grid.querySelectorAll('[data-discipline]');
  tiles.forEach((tile) => {
    if (!discipline || discipline === 'All') {
      tile.removeAttribute('hidden');
    } else {
      if (tile.dataset.discipline === discipline) {
        tile.removeAttribute('hidden');
      } else {
        tile.setAttribute('hidden', '');
      }
    }
  });
}

async function loadProjects() {
  try {
    const res = await fetch('/data/projects.json', { credentials: 'same-origin' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[work] projects.json fetch failed', err && err.message);
    return null;
  }
}

export async function initWork() {
  const grid = document.querySelector('[data-work-grid]');
  if (!grid) return;

  const projects = await loadProjects();
  if (!projects) {
    grid.innerHTML = '<p style="padding:40px;color:var(--slate)">Projects loading…</p>';
    return;
  }

  const published = projects.filter((p) => p.published);
  grid.innerHTML = published.map((p, i) => renderGridTile(p, i + 1)).join('');

  // Wire filter buttons
  const filterBtns = document.querySelectorAll('[data-filter-btn]');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyFilter(grid, btn.dataset.filterBtn || null);
    });
  });
}

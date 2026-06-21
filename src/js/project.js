// Velmont — Project detail page.
// Reads slug from window.location.pathname, fetches projects.json,
// and hydrates all project detail sections.

/**
 * Extract the project slug from a pathname like /work/jw-marriott-bengaluru
 * @param {string} [pathname]
 * @returns {string}
 */
export function slugFromPath(pathname) {
  const p = pathname || window.location.pathname;
  // Support /work/<slug> and fallback ?slug= query param
  const match = p.match(/\/work\/([a-z0-9-]+)/i);
  if (match) return match[1];
  const params = new URLSearchParams(window.location.search);
  return params.get('slug') || '';
}

/**
 * Build a comma-separated list of <span class="vm-material-tag"> elements.
 * @param {string[]} materials
 * @returns {string}
 */
export function renderMaterials(materials) {
  if (!Array.isArray(materials) || !materials.length) return '';
  return materials.map((m) => `<span class="vm-material-tag">${m}</span>`).join('');
}

/**
 * Hydrate the project detail page with data from the given project record.
 * @param {object} project
 * @param {object} prev - previous project (circular)
 * @param {object} next - next project (circular)
 */
export function hydratePage(project, prev, next) {
  // Breadcrumb
  const bc = document.querySelector('[data-breadcrumb-project]');
  if (bc) bc.textContent = project.title || '';

  const bcDisc = document.querySelector('[data-breadcrumb-discipline]');
  if (bcDisc) {
    bcDisc.textContent = project.discipline || '';
    bcDisc.href = `/work?filter=${encodeURIComponent(project.discipline || '')}`;
  }

  // Hero
  const eyebrow = document.querySelector('[data-proj-eyebrow]');
  if (eyebrow) eyebrow.textContent = `${project.discipline || ''} · ${project.location || ''}`;

  const h1 = document.querySelector('[data-proj-h1]');
  if (h1) h1.textContent = project.title || '';

  // Spec bar
  const specIndustry = document.querySelector('[data-spec-industry]');
  if (specIndustry) specIndustry.textContent = project.discipline || '—';

  const specArea = document.querySelector('[data-spec-area]');
  if (specArea) specArea.textContent = project.area || '—';

  const specYear = document.querySelector('[data-spec-year]');
  if (specYear) specYear.textContent = project.year != null ? String(project.year) : '—';

  const specScope = document.querySelector('[data-spec-scope]');
  if (specScope) specScope.textContent = project.scope || '—';

  // Body — editorial lead
  const lead = document.querySelector('[data-proj-lead]');
  if (lead) lead.textContent = project.lead || '';

  // Body paragraphs
  const bodyEl = document.querySelector('[data-proj-body]');
  if (bodyEl && Array.isArray(project.body)) {
    bodyEl.innerHTML = project.body
      .map((para) => `<p class="vm-proj-body__para">${para}</p>`)
      .join('');
  }

  // Materials
  const matsEl = document.querySelector('[data-proj-materials]');
  if (matsEl) matsEl.innerHTML = renderMaterials(project.materials || []);

  // Gallery images
  const imgMain = document.querySelector('[data-gallery-main]');
  if (imgMain && project.images?.gallery?.main) {
    imgMain.src = project.images.gallery.main;
    imgMain.alt = `${project.title} — main gallery image`;
  }

  const imgTR = document.querySelector('[data-gallery-top-right]');
  if (imgTR && project.images?.gallery?.topRight) {
    imgTR.src = project.images.gallery.topRight;
    imgTR.alt = `${project.title} — detail view`;
  }

  const imgBR = document.querySelector('[data-gallery-bottom-right]');
  if (imgBR && project.images?.gallery?.bottomRight) {
    imgBR.src = project.images.gallery.bottomRight;
    imgBR.alt = `${project.title} — detail view`;
  }

  // Page title
  document.title = `${project.title} — Velmont Design Studio`;

  // Prev / Next
  if (prev) {
    const prevLink = document.querySelector('[data-prev-link]');
    if (prevLink) prevLink.href = `/work/${prev.slug}`;
    const prevName = document.querySelector('[data-prev-name]');
    if (prevName) prevName.textContent = prev.title || '';
  }

  if (next) {
    const nextLink = document.querySelector('[data-next-link]');
    if (nextLink) nextLink.href = `/work/${next.slug}`;
    const nextName = document.querySelector('[data-next-name]');
    if (nextName) nextName.textContent = next.title || '';
  }
}

async function loadProjects() {
  try {
    const res = await fetch('/data/projects.json', { credentials: 'same-origin' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[project] projects.json fetch failed', err && err.message);
    return null;
  }
}

export async function initProject() {
  const slug = slugFromPath();
  if (!slug) {
    document.title = 'Project not found — Velmont Design Studio';
    return;
  }

  const projects = await loadProjects();
  if (!projects) return;

  const published = projects.filter((p) => p.published);
  const idx = published.findIndex((p) => p.slug === slug);

  if (idx === -1) {
    document.title = 'Project not found — Velmont Design Studio';
    const main = document.querySelector('#main');
    if (main) main.innerHTML = '<p style="padding:80px var(--pad-side);font-family:var(--body);color:var(--slate)">Project not found.</p>';
    return;
  }

  const project = published[idx];
  const prev = published[(idx - 1 + published.length) % published.length];
  const next = published[(idx + 1) % published.length];

  hydratePage(project, prev, next);
}

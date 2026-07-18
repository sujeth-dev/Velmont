// Velmont — Project detail page.
// Reads slug from window.location.pathname, fetches projects.json,
// and hydrates all project detail sections.

import { avifFor } from './picture-utils.js';

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
 * Set (or clear) an <source type="image/avif"> sibling's srcset based on
 * whether the given image URL has a local AVIF counterpart.
 * @param {Element|null} source
 * @param {string} url
 */
function setAvifSource(source, url) {
  if (!source) return;
  const avif = avifFor(url);
  if (avif) source.setAttribute('srcset', avif);
  else source.removeAttribute('srcset');
}

function initLightbox(images, projectTitle) {
  const lb = document.getElementById('vm-lightbox');
  if (!lb || !images.length) return;
  const lbImg = lb.querySelector('.vm-lightbox__img');
  const closeBtn = lb.querySelector('.vm-lightbox__close');
  const prevBtn = lb.querySelector('.vm-lightbox__prev');
  const nextBtn = lb.querySelector('.vm-lightbox__next');
  let lastActiveEl = null;
  let cur = 0;

  if (images.length <= 1) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  }

  function show(i, { focusClose = false } = {}) {
    cur = ((i % images.length) + images.length) % images.length;
    lbImg.src = images[cur];
    lbImg.alt = `${projectTitle} — view ${cur + 1} of ${images.length}`;
    lb.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    lastActiveEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (focusClose) closeBtn.focus({ preventScroll: true });
  }

  function close() {
    lb.setAttribute('hidden', '');
    lbImg.src = '';
    document.body.style.overflow = '';
    if (lastActiveEl && lastActiveEl.isConnected) lastActiveEl.focus({ preventScroll: true });
  }

  document.querySelectorAll('[data-gallery-img]').forEach((img) => {
    const i = Number(img.dataset.galleryImg);
    if (img.src) img.addEventListener('click', () => show(i));
  });
  prevBtn.addEventListener('click', () => show(cur - 1));
  nextBtn.addEventListener('click', () => show(cur + 1));
  closeBtn.addEventListener('click', close);
  lb.addEventListener('click', (e) => {
    if (e.target === lb) close();
  });
  document.addEventListener('keydown', (e) => {
    if (lb.hasAttribute('hidden')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
}

/**
 * Build a cover-image tile for the "Other Projects" strip.
 * @param {object} p - project record
 * @returns {string}
 */
export function renderOtherTile(p) {
  const slug = String(p.slug || '').replace(/[^a-z0-9-]/gi, '');
  const title = String(p.title || '');
  const cover = String(p.images?.cover || p.images?.hero || '');
  const avif = avifFor(cover);
  return [
    `<a class="vm-other-tile" href="/work/${slug}">`,
    `<div class="vm-other-tile__img-wrap">`,
    `<picture>`,
    avif ? `<source type="image/avif" srcset="${avif}" />` : '',
    `<img class="vm-other-tile__img" src="${cover}" alt="${title}" loading="lazy" width="480" height="360" />`,
    `</picture>`,
    `</div>`,
    `<p class="vm-other-tile__disc">${p.discipline || ''}</p>`,
    `<p class="vm-other-tile__title">${title}</p>`,
    `<p class="vm-other-tile__loc">${p.location || ''}</p>`,
    `</a>`,
  ].join('');
}

/**
 * Wire prev/next nav buttons and the "Other Projects" strip.
 * @param {string} slug - current project slug
 * @param {object[]} published - all published projects (unsorted)
 */
function hydrateNav(slug, published) {
  const sorted = [...published].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  const idx = sorted.findIndex((p) => p.slug === slug);

  const prevProj = idx > 0 ? sorted[idx - 1] : null;
  const nextProj = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  function wireBtn(btnSel, titleSel, proj) {
    const btn = document.querySelector(btnSel);
    if (!btn || !proj) return;
    btn.href = '/work/' + proj.slug;
    const titleEl = document.querySelector(titleSel);
    if (titleEl) titleEl.textContent = proj.title;
    btn.removeAttribute('hidden');
  }

  wireBtn('[data-proj-nav-prev]', '[data-proj-nav-prev-title]', prevProj);
  wireBtn('[data-proj-nav-next]', '[data-proj-nav-next-title]', nextProj);

  // Other Projects: up to 3 projects adjacent to current, excluding self
  const others = sorted
    .filter((p) => p.slug !== slug)
    .slice(Math.max(0, idx - 1), Math.max(0, idx - 1) + 3);
  // Fall back to first 3 if we don't have enough adjacent ones
  const fill =
    others.length < 3
      ? sorted.filter((p) => p.slug !== slug && !others.includes(p)).slice(0, 3 - others.length)
      : [];
  const tiles = [...others, ...fill].slice(0, 3);

  const otherGrid = document.querySelector('[data-other-projects]');
  if (otherGrid && tiles.length) {
    otherGrid.innerHTML = tiles.map(renderOtherTile).join('');
  }
}

/**
 * Hydrate the project detail page with data from the given project record.
 */
export function hydratePage(project) {
  // Breadcrumb
  const bc = document.querySelector('[data-breadcrumb-project]');
  if (bc) bc.textContent = project.title || '';

  const bcDisc = document.querySelector('[data-breadcrumb-discipline]');
  if (bcDisc) {
    bcDisc.textContent = project.discipline || '';
    bcDisc.href = `/work?filter=${encodeURIComponent(project.discipline || '')}`;
  }

  // Hero background image
  const heroImg = document.querySelector('[data-proj-hero-img]');
  if (heroImg && project.images?.hero) {
    setAvifSource(document.querySelector('[data-proj-hero-avif]'), project.images.hero);
    heroImg.src = project.images.hero;
    heroImg.alt = `${project.title} — Velmont Design Studio`;
  }

  // Hero eyebrow
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

  // Gallery — adaptive, supports 1–5 images; sets data-count for CSS layout
  const gallery = document.querySelector('.vm-proj-gallery');
  const galleryImgs = document.querySelectorAll('[data-gallery-img]');
  const galleryArr = (Array.isArray(project.images?.gallery) ? project.images.gallery : []).filter(
    Boolean,
  );
  let galleryCount = 0;

  galleryImgs.forEach((img) => {
    const i = Number(img.dataset.galleryImg);
    const src = galleryArr[i];
    if (src) {
      setAvifSource(document.querySelector(`[data-gallery-avif="${i}"]`), src);
      img.src = src;
      img.alt = `${project.title} — view ${i + 1}`;
      galleryCount++;
    } else {
      img.closest('picture')?.style.setProperty('display', 'none');
      img.style.display = 'none';
    }
  });

  if (gallery) gallery.dataset.count = String(galleryCount);

  initLightbox(galleryArr.slice(0, galleryCount), project.title);

  // Page title
  document.title = `${project.title} — Velmont Design Studio`;
}

async function loadLocalProjects() {
  try {
    const res = await fetch('/data/projects.json', { credentials: 'same-origin' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[project] projects.json fetch failed', err && err.message);
    return null;
  }
}

export async function loadProjectBySlug(slug) {
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    try {
      const { getPublishedProjectBySlug } = await import('../lib/firebase-data.js');
      return await getPublishedProjectBySlug(slug);
    } catch (err) {
      console.warn('[project] Firestore unavailable, falling back to JSON:', err && err.message);
    }
  }
  const projects = await loadLocalProjects();
  return projects?.find((p) => p.published && p.slug === slug) || null;
}

async function loadNavigationProjects() {
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    try {
      const { getPublishedProjects } = await import('../lib/firebase-data.js');
      return await getPublishedProjects();
    } catch (err) {
      console.warn(
        '[project] Firestore navigation unavailable, falling back to JSON:',
        err && err.message,
      );
    }
  }
  const projects = await loadLocalProjects();
  return projects?.filter((p) => p.published) || [];
}

function markPageLoaded() {
  const main = document.querySelector('#main');
  if (!main) return;
  requestAnimationFrame(() => {
    main.dataset.projectState = 'loaded';
    main.setAttribute('aria-busy', 'false');
  });
}

export async function initProject() {
  const slug = slugFromPath();
  if (!slug) {
    document.title = 'Project not found — Velmont Design Studio';
    return;
  }

  const project = await loadProjectBySlug(slug);

  if (!project) {
    document.title = 'Project not found — Velmont Design Studio';
    const main = document.querySelector('#main');
    if (main)
      main.innerHTML =
        '<p style="padding:80px var(--pad-side);font-family:var(--body);color:var(--slate)">Project not found.</p>';
    return;
  }

  hydratePage(project);
  markPageLoaded();

  // Navigation is useful, but should never make the main project wait.
  loadNavigationProjects()
    .then((published) => hydrateNav(slug, published))
    .catch((err) => console.warn('[project] Navigation unavailable:', err && err.message));
}

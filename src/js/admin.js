// Velmont Admin — single entry point for all admin pages.
// Dispatches to the correct init function based on data-page attribute.

import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, storage } from '../lib/firebase.js';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../lib/firebase-data.js';
import { validateProjectForm, parseMaterials, slugify } from './admin-utils.js';

export { validateProjectForm, parseMaterials, slugify };

// ─── Auth guard ───────────────────────────────────────────────────────────────

/**
 * Resolves with the current user once Firebase has determined auth state.
 * Uses auth.authStateReady() (Firebase 9.23+) which resolves after the first
 * auth state is known — faster than setting up an onAuthStateChanged listener.
 * Falls back to redirect after 8 s if Firebase is unreachable.
 * @returns {Promise<import('firebase/auth').User|null>}
 */
async function requireAuth() {
  const timeoutMs = 8000;
  const ready =
    typeof auth.authStateReady === 'function'
      ? auth.authStateReady()
      : new Promise((resolve) => {
          const unsub = onAuthStateChanged(auth, () => {
            unsub();
            resolve();
          });
        });

  await Promise.race([ready, new Promise((resolve) => setTimeout(resolve, timeoutMs))]);

  if (!auth.currentUser) {
    window.location.replace('/admin/login');
    return null;
  }
  return auth.currentUser;
}

// ─── Image upload helper ──────────────────────────────────────────────────────

/**
 * Upload a File to Firebase Storage under projects/<slug>/<slot>/<filename>.
 * @param {File} file
 * @param {string} slug
 * @param {string} slot - e.g. "cover", "hero", "gallery-0"
 * @returns {Promise<string>} download URL
 */
async function uploadImage(file, slug, slot) {
  const ext = file.name.split('.').pop();
  const path = `projects/${slug}/${slot}.${ext}`;
  const ref = storageRef(storage, path);
  const snap = await uploadBytes(ref, file);
  return await getDownloadURL(snap.ref);
}

/**
 * Delete an image from Storage by its download URL.
 * Silently skips if URL is not a Storage URL.
 */
async function deleteImageByUrl(url) {
  if (!url || !url.includes('firebasestorage')) return;
  try {
    // Extract storage path from URL
    const decodedPath = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
    await deleteObject(storageRef(storage, decodedPath));
  } catch {
    // Non-fatal: image may have already been deleted
  }
}

// ─── Shared form helpers ──────────────────────────────────────────────────────

function showErrors(form, errors) {
  Object.entries(errors).forEach(([field, msg]) => {
    const el = form.querySelector(`[data-err="${field}"]`);
    if (el) el.textContent = msg;
  });
}

function clearErrors(form) {
  form.querySelectorAll('[data-err]').forEach((el) => (el.textContent = ''));
}

function setFormStatus(container, type, msg) {
  container.innerHTML = `<p class="adm-status adm-status--${type}">${msg}</p>`;
}

/**
 * Read all form fields into a plain object.
 */
function readFormValues(form) {
  const fd = new FormData(form);
  return {
    title: fd.get('title') || '',
    discipline: fd.get('discipline') || '',
    location: fd.get('location') || '',
    year: fd.get('year') || '',
    area: fd.get('area') || '',
    scope: fd.get('scope') || '',
    lead: fd.get('lead') || '',
    body0: fd.get('body0') || '',
    body1: fd.get('body1') || '',
    body2: fd.get('body2') || '',
    materials: fd.get('materials') || '',
    published: form.querySelector('#published')?.checked ?? false,
    featured: form.querySelector('#featured')?.checked ?? false,
  };
}

/**
 * Wire image file pickers so they show a preview on selection.
 */
function wireImagePreviews(form) {
  form.querySelectorAll('[data-img-slot]').forEach((input) => {
    const slot = input.dataset.imgSlot;
    const preview = form.querySelector(`[data-preview="${slot}"]`);
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (file && preview) {
        preview.src = URL.createObjectURL(file);
        preview.classList.add('is-visible');
      }
    });
  });
}

/**
 * Upload any new image files chosen in the form and return a merged images object.
 * Existing URLs (from hidden fields or passed-in existingImages) are kept for
 * slots where no new file was selected.
 */
async function uploadFormImages(form, slug, existingImages = {}) {
  const images = {
    cover: existingImages.cover || '',
    hero: existingImages.hero || '',
    gallery: [...(existingImages.gallery || [])],
  };

  const uploads = [];

  form.querySelectorAll('[data-img-slot]').forEach((input) => {
    const file = input.files?.[0];
    if (!file) return;
    const slot = input.dataset.imgSlot;
    uploads.push(
      uploadImage(file, slug, slot).then((url) => {
        if (slot === 'cover') images.cover = url;
        else if (slot === 'hero') images.hero = url;
        else if (slot.startsWith('gallery-')) {
          const i = Number(slot.replace('gallery-', ''));
          images.gallery[i] = url;
        }
      }),
    );
  });

  await Promise.all(uploads);
  // Remove empty gallery slots
  images.gallery = images.gallery.filter(Boolean);
  return images;
}

// ─── Login page ───────────────────────────────────────────────────────────────

function initAdminLogin() {
  // Already logged in? Go straight to dashboard
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.replace('/admin/dashboard');
  });

  const form = document.querySelector('[data-login-form]');
  if (!form) return;

  const errorEl = document.querySelector('[data-login-error]');
  const submitBtn = form.querySelector('[data-login-submit]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.hidden = true;
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in…';
    }

    const email = form.querySelector('#email')?.value?.trim() || '';
    const password = form.querySelector('#password')?.value || '';

    try {
      // Race the auth call against a 12 s timeout so the UI never hangs indefinitely
      const timeout = new Promise((_, reject) =>
        setTimeout(
          () => reject(Object.assign(new Error('timeout'), { code: 'auth/timeout' })),
          12000,
        ),
      );
      await Promise.race([signInWithEmailAndPassword(auth, email, password), timeout]);
      window.location.replace('/admin/dashboard');
    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential'
          ? 'Email or password is incorrect.'
          : err.code === 'auth/timeout'
            ? 'Connection timed out. Please check your network.'
            : 'Sign-in failed. Please try again.';
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.hidden = false;
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign in';
      }
    }
  });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function renderProjectRow(p) {
  const badge = p.published
    ? '<span class="adm-badge adm-badge--published">Published</span>'
    : '<span class="adm-badge adm-badge--draft">Draft</span>';
  return [
    `<div class="adm-project-row" data-project-id="${p.id}">`,
    `<span class="adm-project-row__title">${p.title || ''}</span>`,
    `<span class="adm-project-row__discipline">${p.discipline || ''}</span>`,
    `<span class="adm-project-row__year">${p.year || ''}</span>`,
    badge,
    `<div class="adm-project-row__actions">`,
    `<a class="adm-btn adm-btn--ghost" href="/admin/project-edit?id=${p.id}">Edit</a>`,
    `<button class="adm-btn adm-btn--danger" type="button" data-delete-id="${p.id}" data-delete-title="${p.title || ''}">Delete</button>`,
    `</div>`,
    `</div>`,
  ].join('');
}

async function initAdminDashboard() {
  await requireAuth();

  const listEl = document.querySelector('[data-project-list]');
  const loadingEl = document.querySelector('[data-list-loading]');
  const modal = document.querySelector('[data-confirm-modal]');
  const modalConfirm = document.querySelector('[data-modal-confirm]');
  const modalCancel = document.querySelector('[data-modal-cancel]');
  const logoutBtn = document.querySelector('[data-logout]');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOut(auth);
      window.location.replace('/admin/login');
    });
  }

  let pendingDeleteId = null;
  let allProjects = [];

  async function loadAndRender() {
    try {
      allProjects = await getAllProjects();
      if (loadingEl) loadingEl.remove();

      const head = listEl.querySelector('.adm-project-list__head');
      // Remove existing rows (keep header)
      listEl.querySelectorAll('.adm-project-row').forEach((r) => r.remove());

      if (!allProjects.length) {
        listEl.insertAdjacentHTML(
          'beforeend',
          '<p class="adm-loading">No projects yet. Add one!</p>',
        );
        return;
      }

      const rowsHtml = allProjects.map(renderProjectRow).join('');
      if (head) {
        head.insertAdjacentHTML('afterend', rowsHtml);
      } else {
        listEl.insertAdjacentHTML('beforeend', rowsHtml);
      }

      // Wire delete buttons
      listEl.querySelectorAll('[data-delete-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          pendingDeleteId = btn.dataset.deleteId;
          if (modal) modal.removeAttribute('hidden');
        });
      });
    } catch (err) {
      console.error('[admin] Failed to load projects:', err);
      if (listEl)
        listEl.innerHTML =
          '<p class="adm-loading">Failed to load projects. Check your connection.</p>';
    }
  }

  if (modalCancel) {
    modalCancel.addEventListener('click', () => {
      pendingDeleteId = null;
      if (modal) modal.setAttribute('hidden', '');
    });
  }

  if (modalConfirm) {
    modalConfirm.addEventListener('click', async () => {
      if (!pendingDeleteId) return;
      modalConfirm.disabled = true;
      modalConfirm.textContent = 'Deleting…';

      try {
        // Delete Storage images before removing Firestore doc
        const project = allProjects.find((p) => p.id === pendingDeleteId);
        if (project?.images) {
          const urls = [
            project.images.cover,
            project.images.hero,
            ...(project.images.gallery || []),
          ];
          await Promise.all(urls.map(deleteImageByUrl));
        }
        await deleteProject(pendingDeleteId);
      } catch (err) {
        console.error('[admin] Delete failed:', err);
      }

      pendingDeleteId = null;
      if (modal) modal.setAttribute('hidden', '');
      modalConfirm.disabled = false;
      modalConfirm.textContent = 'Delete';
      await loadAndRender();
    });
  }

  await loadAndRender();
}

// ─── Project form (Add) ───────────────────────────────────────────────────────

async function initProjectForm() {
  await requireAuth();

  const form = document.querySelector('[data-project-form]');
  const statusEl = document.getElementById('form-status');
  const submitBtn = form?.querySelector('[data-form-submit]');
  const logoutBtn = document.querySelector('[data-logout]');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOut(auth);
      window.location.replace('/admin/login');
    });
  }

  if (!form) return;

  wireImagePreviews(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);

    const values = readFormValues(form);
    const { valid, errors } = validateProjectForm(values);

    if (!valid) {
      showErrors(form, errors);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving…';
    }

    try {
      const slug = slugify(values.title);
      const images = await uploadFormImages(form, slug);
      const body = [values.body0, values.body1, values.body2].filter(Boolean);
      const materials = parseMaterials(values.materials);

      await createProject({
        slug,
        title: values.title.trim(),
        discipline: values.discipline,
        location: values.location.trim(),
        year: Number(values.year),
        area: values.area.trim(),
        scope: values.scope.trim(),
        lead: values.lead.trim(),
        body,
        materials,
        images,
        published: values.published,
        featured: values.featured,
      });

      if (statusEl) setFormStatus(statusEl, 'success', 'Project saved successfully.');
      setTimeout(() => window.location.replace('/admin/dashboard'), 1200);
    } catch (err) {
      console.error('[admin] Save failed:', err);
      if (statusEl) setFormStatus(statusEl, 'error', 'Save failed. Please try again.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Project';
      }
    }
  });
}

// ─── Project edit (Edit) ──────────────────────────────────────────────────────

async function initProjectEdit() {
  await requireAuth();

  const form = document.querySelector('[data-project-form]');
  const loadingEl = document.querySelector('[data-edit-loading]');
  const statusEl = document.getElementById('form-status');
  const submitBtn = form?.querySelector('[data-form-submit]');
  const logoutBtn = document.querySelector('[data-logout]');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOut(auth);
      window.location.replace('/admin/login');
    });
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    if (loadingEl) loadingEl.textContent = 'No project ID specified.';
    return;
  }

  let existingProject;
  try {
    existingProject = await getProjectById(id);
  } catch (err) {
    if (loadingEl) loadingEl.textContent = 'Failed to load project.';
    return;
  }

  if (!existingProject) {
    if (loadingEl) loadingEl.textContent = 'Project not found.';
    return;
  }

  // Pre-fill form
  if (loadingEl) loadingEl.remove();
  if (form) form.removeAttribute('hidden');

  function setVal(name, value) {
    const el = form.querySelector(`[name="${name}"]`);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = Boolean(value);
    else el.value = value ?? '';
  }

  setVal('title', existingProject.title);
  setVal('discipline', existingProject.discipline);
  setVal('location', existingProject.location);
  setVal('year', existingProject.year);
  setVal('area', existingProject.area);
  setVal('scope', existingProject.scope);
  setVal('lead', existingProject.lead);

  const body = existingProject.body || [];
  setVal('body0', body[0] || '');
  setVal('body1', body[1] || '');
  setVal('body2', body[2] || '');
  setVal('materials', (existingProject.materials || []).join(', '));
  setVal('published', existingProject.published);
  setVal('featured', existingProject.featured);

  // Show existing images in previews
  function showExistingPreview(slot, url) {
    if (!url) return;
    const preview = form.querySelector(`[data-preview="${slot}"]`);
    const urlInput = form.querySelector(`[data-img-url="${slot}"]`);
    if (preview) {
      preview.src = url;
      preview.classList.add('is-visible');
    }
    if (urlInput) urlInput.value = url;
  }

  const imgs = existingProject.images || {};
  showExistingPreview('cover', imgs.cover);
  showExistingPreview('hero', imgs.hero);
  (imgs.gallery || []).forEach((url, i) => showExistingPreview(`gallery-${i}`, url));

  wireImagePreviews(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);

    const values = readFormValues(form);
    const { valid, errors } = validateProjectForm(values);

    if (!valid) {
      showErrors(form, errors);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving…';
    }

    try {
      const slug = existingProject.slug || slugify(values.title);
      const images = await uploadFormImages(form, slug, existingProject.images || {});
      const body = [values.body0, values.body1, values.body2].filter(Boolean);
      const materials = parseMaterials(values.materials);

      await updateProject(id, {
        slug,
        title: values.title.trim(),
        discipline: values.discipline,
        location: values.location.trim(),
        year: Number(values.year),
        area: values.area.trim(),
        scope: values.scope.trim(),
        lead: values.lead.trim(),
        body,
        materials,
        images,
        published: values.published,
        featured: values.featured,
      });

      if (statusEl) setFormStatus(statusEl, 'success', 'Changes saved.');
      setTimeout(() => window.location.replace('/admin/dashboard'), 1200);
    } catch (err) {
      console.error('[admin] Update failed:', err);
      if (statusEl) setFormStatus(statusEl, 'error', 'Save failed. Please try again.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
      }
    }
  });
}

// ─── Router (browser-only) ────────────────────────────────────────────────────

if (typeof document !== 'undefined') {
  const page = document.querySelector('main')?.dataset.page;

  if (page === 'admin-login') {
    initAdminLogin();
  } else if (page === 'admin-dashboard') {
    initAdminDashboard();
  } else if (page === 'admin-project-form') {
    initProjectForm();
  } else if (page === 'admin-project-edit') {
    initProjectEdit();
  }
}

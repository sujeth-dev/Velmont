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
import { openStoragePicker } from './admin-storage.js';

export { validateProjectForm, parseMaterials, slugify };

// ─── Auth guard ───────────────────────────────────────────────────────────────

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

// ─── Image slot wiring ────────────────────────────────────────────────────────

/**
 * Set a URL on a named image slot: update the hidden input + show preview.
 */
function setSlotUrl(form, slotName, url) {
  const hiddenInput = form.querySelector(`[data-img-url="${slotName}"]`);
  if (hiddenInput) hiddenInput.value = url || '';

  const preview = form.querySelector(`[data-preview="${slotName}"]`);
  if (preview) {
    preview.src = url || '';
    preview.classList.toggle('is-set', Boolean(url));
  }
}

/**
 * Read the current URL for a slot (from hidden input).
 */
function getSlotUrl(form, slotName) {
  return form.querySelector(`[data-img-url="${slotName}"]`)?.value || '';
}

/**
 * Wire all image slots on a form:
 * - "Browse" button → openStoragePicker → setSlotUrl
 * - "Upload" file input → upload to Storage → setSlotUrl
 * - "✕" clear button → clear slot
 */
function wireImageSlots(form, slugProvider) {
  // Browse buttons
  form.querySelectorAll('[data-pick-slot]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const slot = btn.dataset.pickSlot;
      const url = await openStoragePicker(slot);
      if (url) setSlotUrl(form, slot, url);
    });
  });

  // Direct upload file inputs
  form.querySelectorAll('[data-upload-slot]').forEach((input) => {
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      const slot = input.dataset.uploadSlot;
      const slug = slugProvider ? slugProvider() : 'uploads';
      const ext = file.name.split('.').pop() || 'webp';
      const path = `projects/${slug}/${slot}.${ext}`;

      const btn = input.closest('label');
      if (btn) btn.style.opacity = '0.5';

      try {
        const r = storageRef(storage, path);
        await uploadBytes(r, file, { contentType: file.type || 'image/webp' });
        const url = await getDownloadURL(r);
        setSlotUrl(form, slot, url);
      } catch (err) {
        console.error('[admin] Upload failed:', err);
        alert('Upload failed: ' + (err.message || err.code));
      } finally {
        if (btn) btn.style.opacity = '';
        input.value = '';
      }
    });
  });

  // Clear buttons
  form.querySelectorAll('[data-clear-slot]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setSlotUrl(form, btn.dataset.clearSlot, '');
    });
  });
}

/**
 * Read all image slot URLs from a form into an images object.
 */
function readImageSlots(form) {
  const gallery = [];
  for (let i = 0; i < 5; i++) {
    const url = getSlotUrl(form, `gallery-${i}`);
    if (url) gallery.push(url);
  }
  return {
    cover: getSlotUrl(form, 'cover'),
    hero: getSlotUrl(form, 'hero'),
    gallery,
  };
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
  if (!container) return;
  container.innerHTML = `<p class="adm-status adm-status--${type}">${msg}</p>`;
}

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
    published: document.getElementById('published')?.checked ?? false,
    featured: document.getElementById('featured')?.checked ?? false,
  };
}

/** Wire slug preview on the title input */
function wireSlugPreview(form) {
  const titleInput = form.querySelector('#title');
  const previews = document.querySelectorAll('[data-slug-preview]');
  if (!titleInput || !previews.length) return;
  titleInput.addEventListener('input', () => {
    const slug = slugify(titleInput.value);
    previews.forEach((el) => (el.textContent = `/work/${slug}`));
  });
}

// ─── Login ────────────────────────────────────────────────────────────────────

function initAdminLogin() {
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
  const thumb = p.images?.cover || p.images?.hero || '';
  const thumbHtml = thumb
    ? `<img class="adm-row-thumb" src="${thumb}" alt="${p.title || ''}" loading="lazy" />`
    : `<div class="adm-row-thumb--empty" title="No image">🖼</div>`;

  const pubToggle = `<button class="adm-pub-toggle" type="button"
    data-toggle-published="${p.id}" data-published="${p.published}"
    title="${p.published ? 'Set to draft' : 'Publish'}">
    <span class="adm-pub-toggle__dot"></span>
    ${p.published ? 'Published' : 'Draft'}
  </button>`;

  return [
    `<div class="adm-project-row" data-project-id="${p.id}">`,
    thumbHtml,
    `<span class="adm-project-row__title">${p.title || ''}</span>`,
    `<span class="adm-project-row__discipline">${p.discipline || ''}</span>`,
    `<span class="adm-project-row__year">${p.year || ''}</span>`,
    pubToggle,
    `<div class="adm-project-row__actions">`,
    `<a class="adm-btn adm-btn--ghost adm-btn--sm" href="/admin/project-edit?id=${p.id}">Edit</a>`,
    `<button class="adm-btn adm-btn--danger adm-btn--sm" type="button" data-delete-id="${p.id}">Delete</button>`,
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

  // User initials
  const initialsEl = document.querySelector('[data-user-initials]');
  if (initialsEl && auth.currentUser?.email) {
    const parts = auth.currentUser.email.split('@')[0].split(/[._-]/);
    initialsEl.textContent = parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('');
  }

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

      // Update stats bar
      const total = allProjects.length;
      const published = allProjects.filter((p) => p.published).length;
      const drafts = total - published;
      const statTotal = document.querySelector('[data-stat-total]');
      const statPublished = document.querySelector('[data-stat-published]');
      const statDrafts = document.querySelector('[data-stat-drafts]');
      if (statTotal) statTotal.textContent = total;
      if (statPublished) statPublished.textContent = published;
      if (statDrafts) statDrafts.textContent = drafts;

      // Re-render rows
      listEl.querySelectorAll('.adm-project-row').forEach((r) => r.remove());

      if (!allProjects.length) {
        listEl.insertAdjacentHTML(
          'beforeend',
          '<p class="adm-loading">No projects yet. Add one!</p>',
        );
        return;
      }

      const head = listEl.querySelector('.adm-project-list__head');
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

      // Wire inline publish toggles
      listEl.querySelectorAll('[data-toggle-published]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.togglePublished;
          const project = allProjects.find((p) => p.id === id);
          if (!project) return;
          const newVal = !project.published;
          btn.disabled = true;
          try {
            await updateProject(id, { published: newVal });
            project.published = newVal;
            btn.dataset.published = String(newVal);
            btn.querySelector('.adm-pub-toggle__dot').style.background = '';
            btn.innerHTML = `<span class="adm-pub-toggle__dot"></span>${newVal ? 'Published' : 'Draft'}`;
            btn.dataset.published = String(newVal);
            // Update badge in same row
            const row = btn.closest('.adm-project-row');
            if (row) {
              const badge = row.querySelector('.adm-badge');
              if (badge) {
                badge.className = newVal
                  ? 'adm-badge adm-badge--published'
                  : 'adm-badge adm-badge--draft';
                badge.textContent = newVal ? 'Published' : 'Draft';
              }
            }
          } catch (err) {
            console.error('[admin] Toggle failed:', err);
          } finally {
            btn.disabled = false;
          }
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
        const project = allProjects.find((p) => p.id === pendingDeleteId);
        if (project?.images) {
          const urls = [
            project.images.cover,
            project.images.hero,
            ...(project.images.gallery || []),
          ];
          await Promise.all(
            urls.filter(Boolean).map((url) => {
              if (!url.includes('firebasestorage')) return Promise.resolve();
              try {
                const decoded = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
                return deleteObject(storageRef(storage, decoded)).catch(() => {});
              } catch {
                return Promise.resolve();
              }
            }),
          );
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
  const submitBtn = document.querySelector('[data-form-submit]');
  const logoutBtn = document.querySelector('[data-logout]');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOut(auth);
      window.location.replace('/admin/login');
    });
  }
  if (!form) return;

  wireSlugPreview(form);
  wireImageSlots(form, () => slugify(form.querySelector('#title')?.value || 'new-project'));

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
      const images = readImageSlots(form);
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

      setFormStatus(statusEl, 'success', 'Project saved successfully.');
      setTimeout(() => window.location.replace('/admin/dashboard'), 1200);
    } catch (err) {
      console.error('[admin] Save failed:', err);
      setFormStatus(statusEl, 'error', 'Save failed. Please try again.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Project';
      }
    }
  });
}

// ─── Project edit ─────────────────────────────────────────────────────────────

async function initProjectEdit() {
  await requireAuth();

  const loadingEl = document.querySelector('[data-edit-loading]');
  const readyEl = document.querySelector('[data-edit-ready]');
  const form = document.querySelector('[data-project-form]');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.querySelector('[data-form-submit]');
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

  // Reveal form
  if (loadingEl) loadingEl.remove();
  if (readyEl) readyEl.removeAttribute('hidden');

  // Set edit page title
  const editTitle = document.querySelector('[data-edit-title]');
  if (editTitle) editTitle.textContent = `Edit: ${existingProject.title || ''}`;

  // Set last updated
  const updatedEl = document.querySelector('[data-edit-updated]');
  if (updatedEl && existingProject.updatedAt) {
    const d = new Date(existingProject.updatedAt);
    updatedEl.textContent = isNaN(d)
      ? existingProject.updatedAt
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Pre-fill fields
  function setVal(name, value) {
    const el = form.querySelector(`[name="${name}"]`) ?? document.querySelector(`[name="${name}"]`);
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

  // Pre-fill image slots
  const imgs = existingProject.images || {};
  setSlotUrl(form, 'cover', imgs.cover || '');
  setSlotUrl(form, 'hero', imgs.hero || '');
  (imgs.gallery || []).forEach((url, i) => setSlotUrl(form, `gallery-${i}`, url));

  // Update slug previews
  const slug = existingProject.slug || slugify(existingProject.title || '');
  document.querySelectorAll('[data-slug-preview]').forEach((el) => {
    el.textContent = `/work/${slug}`;
  });

  wireSlugPreview(form);
  wireImageSlots(
    form,
    () => existingProject.slug || slugify(form.querySelector('#title')?.value || 'project'),
  );

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
      const images = readImageSlots(form);
      const body = [values.body0, values.body1, values.body2].filter(Boolean);
      const materials = parseMaterials(values.materials);

      await updateProject(id, {
        slug: existingProject.slug || slugify(values.title),
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

      setFormStatus(statusEl, 'success', 'Changes saved.');
      setTimeout(() => window.location.replace('/admin/dashboard'), 1200);
    } catch (err) {
      console.error('[admin] Update failed:', err);
      setFormStatus(statusEl, 'error', 'Save failed. Please try again.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
      }
    }
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────

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

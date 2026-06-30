// Velmont Admin — Firebase Storage browser.
// Provides openStoragePicker(slotName) which opens a modal, lets the user
// browse folders, select or upload an image, and returns the download URL.
// Also handles delete of individual Storage objects from within the modal.

import { ref, listAll, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { storage } from '../lib/firebase-admin.js';

const ROOT = 'projects';

// ─── State ────────────────────────────────────────────────────────────────────

let currentPath = ROOT;
let selectedUrl = null;
let selectedRef = null;
let resolveCallback = null;

// ─── DOM refs (populated once the picker is opened) ──────────────────────────

function dom() {
  return {
    overlay: document.getElementById('storage-picker'),
    grid: document.querySelector('[data-sp-grid]'),
    breadcrumb: document.querySelector('[data-sp-breadcrumb]'),
    selectBtn: document.querySelector('[data-sp-select]'),
    cancelBtn: document.querySelector('[data-sp-cancel]'),
    closeBtn: document.querySelector('[data-sp-close]'),
    uploadInput: document.querySelector('[data-sp-upload]'),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Open the storage picker. Returns a Promise that resolves with the selected
 * download URL (string) or null if cancelled.
 * @param {string} slotName
 * @returns {Promise<string|null>}
 */
export function openStoragePicker(_slotName) {
  currentPath = ROOT;
  selectedUrl = null;
  selectedRef = null;

  return new Promise((resolve) => {
    resolveCallback = resolve;
    const { overlay, selectBtn, cancelBtn, closeBtn, uploadInput } = dom();

    overlay.removeAttribute('hidden');
    renderGrid(currentPath);
    updateSelectBtn();

    // Wire buttons (remove old listeners first by cloning)
    const newSelectBtn = selectBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    const newCloseBtn = closeBtn.cloneNode(true);
    const newUploadInput = uploadInput.cloneNode(true);

    selectBtn.replaceWith(newSelectBtn);
    cancelBtn.replaceWith(newCancelBtn);
    closeBtn.replaceWith(newCloseBtn);
    uploadInput.replaceWith(newUploadInput);

    document.querySelector('[data-sp-select]').addEventListener('click', () => confirmSelection());
    document.querySelector('[data-sp-cancel]').addEventListener('click', () => cancelPicker());
    document.querySelector('[data-sp-close]').addEventListener('click', () => cancelPicker());
    document.querySelector('[data-sp-upload]').addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
      e.target.value = '';
    });

    // Close on backdrop click
    overlay.addEventListener(
      'click',
      (e) => {
        if (e.target === overlay) cancelPicker();
      },
      { once: true },
    );

    // Close on Escape
    document.addEventListener('keydown', escHandler);
  });
}

function escHandler(e) {
  if (e.key === 'Escape') {
    cancelPicker();
    document.removeEventListener('keydown', escHandler);
  }
}

function cancelPicker() {
  const { overlay } = dom();
  overlay.setAttribute('hidden', '');
  document.removeEventListener('keydown', escHandler);
  if (resolveCallback) {
    resolveCallback(null);
    resolveCallback = null;
  }
}

function confirmSelection() {
  const { overlay } = dom();
  overlay.setAttribute('hidden', '');
  document.removeEventListener('keydown', escHandler);
  if (resolveCallback) {
    resolveCallback(selectedUrl);
    resolveCallback = null;
  }
}

// ─── Grid rendering ───────────────────────────────────────────────────────────

async function renderGrid(path) {
  const { grid } = dom();
  grid.innerHTML = '<p class="adm-sp-loading">Loading…</p>';
  updateBreadcrumb(path);

  try {
    const pathRef = ref(storage, path);
    const result = await listAll(pathRef);

    if (result.prefixes.length === 0 && result.items.length === 0) {
      grid.innerHTML =
        '<p class="adm-sp-empty">This folder is empty. Upload an image to get started.</p>';
      return;
    }

    const html = [];

    // Render folders first
    for (const folderRef of result.prefixes) {
      const name = folderRef.name;
      html.push(
        `<div class="adm-sp-folder" data-sp-folder="${folderRef.fullPath}">` +
          `<span class="adm-sp-folder__icon">📁</span>` +
          `<span>${name}</span>` +
          `</div>`,
      );
    }

    // Render image tiles (get download URLs in parallel)
    const urlPromises = result.items.map((itemRef) =>
      getDownloadURL(itemRef)
        .then((url) => ({ itemRef, url }))
        .catch(() => null),
    );
    const resolved = (await Promise.all(urlPromises)).filter(Boolean);

    for (const { itemRef, url } of resolved) {
      const isSelected = url === selectedUrl;
      html.push(
        `<div class="adm-sp-img-tile${isSelected ? ' is-selected' : ''}" data-sp-img="${itemRef.fullPath}" data-sp-url="${url}">` +
          `<img src="${url}" alt="${itemRef.name}" loading="lazy" />` +
          `<div class="adm-sp-img-tile__check">✓</div>` +
          `<button class="adm-sp-img-tile__delete" type="button" data-sp-delete="${itemRef.fullPath}" title="Delete">✕</button>` +
          `<span class="adm-sp-img-tile__name">${itemRef.name}</span>` +
          `</div>`,
      );
    }

    grid.innerHTML = html.join('');

    // Wire folder navigation
    grid.querySelectorAll('[data-sp-folder]').forEach((el) => {
      el.addEventListener('click', () => {
        currentPath = el.dataset.spFolder;
        selectedUrl = null;
        selectedRef = null;
        updateSelectBtn();
        renderGrid(currentPath);
      });
    });

    // Wire image selection
    grid.querySelectorAll('[data-sp-img]').forEach((tile) => {
      tile.addEventListener('click', (e) => {
        if (e.target.closest('[data-sp-delete]')) return; // let delete handle it
        const url = tile.dataset.spUrl;
        const path = tile.dataset.spImg;

        if (selectedUrl === url) {
          // Deselect
          selectedUrl = null;
          selectedRef = null;
          tile.classList.remove('is-selected');
        } else {
          // Deselect previous
          grid
            .querySelectorAll('.adm-sp-img-tile.is-selected')
            .forEach((t) => t.classList.remove('is-selected'));
          selectedUrl = url;
          selectedRef = path;
          tile.classList.add('is-selected');
        }
        updateSelectBtn();
      });
    });

    // Wire delete buttons
    grid.querySelectorAll('[data-sp-delete]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const filePath = btn.dataset.spDelete;
        const fileName = filePath.split('/').pop();
        if (!confirm(`Delete "${fileName}" from Storage? This cannot be undone.`)) return;
        try {
          await deleteObject(ref(storage, filePath));
          if (selectedRef === filePath) {
            selectedUrl = null;
            selectedRef = null;
            updateSelectBtn();
          }
          renderGrid(currentPath);
        } catch (err) {
          alert('Delete failed: ' + (err.message || err.code));
        }
      });
    });
  } catch (err) {
    grid.innerHTML = `<p class="adm-sp-empty">Failed to load: ${err.message || err.code}</p>`;
  }
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function updateBreadcrumb(path) {
  const { breadcrumb } = dom();
  const parts = path.split('/').filter(Boolean);
  const crumbs = parts.map((part, i) => {
    const crumbPath = parts.slice(0, i + 1).join('/');
    const isCurrent = i === parts.length - 1;
    return isCurrent
      ? `<span class="adm-sp-breadcrumb__part is-current">${part}/</span>`
      : `<span class="adm-sp-breadcrumb__part" data-sp-crumb="${crumbPath}">${part}/</span>`;
  });

  breadcrumb.innerHTML = crumbs.join('<span class="adm-sp-breadcrumb__sep"></span>');

  // Wire crumb navigation
  breadcrumb.querySelectorAll('[data-sp-crumb]').forEach((el) => {
    el.addEventListener('click', () => {
      currentPath = el.dataset.spCrumb;
      selectedUrl = null;
      selectedRef = null;
      updateSelectBtn();
      renderGrid(currentPath);
    });
  });
}

// ─── Upload ───────────────────────────────────────────────────────────────────

async function handleUpload(file) {
  const { grid } = dom();
  const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uploadPath = `${currentPath}/${fileName}`;

  // Show uploading state
  const placeholder = document.createElement('div');
  placeholder.className = 'adm-sp-img-tile';
  placeholder.style.cssText =
    'display:flex;align-items:center;justify-content:center;font-size:12px;color:#71717a;';
  placeholder.textContent = 'Uploading…';
  grid.prepend(placeholder);

  try {
    const storageRef = ref(storage, uploadPath);
    await uploadBytes(storageRef, file, { contentType: file.type || 'image/webp' });
    const url = await getDownloadURL(storageRef);

    // Auto-select the newly uploaded image
    selectedUrl = url;
    selectedRef = uploadPath;
    updateSelectBtn();

    renderGrid(currentPath);
  } catch (err) {
    placeholder.remove();
    alert('Upload failed: ' + (err.message || err.code));
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function updateSelectBtn() {
  const btn = document.querySelector('[data-sp-select]');
  if (!btn) return;
  btn.disabled = !selectedUrl;
  btn.textContent = selectedUrl ? 'Select Image' : 'Select Image';
}

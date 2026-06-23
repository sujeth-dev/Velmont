// Pure utility functions for admin panel — no browser/Firebase dependencies.
// Imported by admin.js (browser) and admin.test.js (Vitest/Node.js).

const VALID_DISCIPLINES = ['Hospitality', 'Workplace', 'Healthcare', 'Commercial'];

/**
 * Pure validator for admin project form.
 * @param {object} values
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateProjectForm(values) {
  const errors = {};
  const title = String(values.title || '').trim();
  const discipline = String(values.discipline || '').trim();
  const location = String(values.location || '').trim();
  const year = values.year;
  const lead = String(values.lead || '').trim();
  const body0 = String(values.body0 || '').trim();

  if (!title) errors.title = 'Title is required.';
  if (!discipline || !VALID_DISCIPLINES.includes(discipline))
    errors.discipline = 'Please select a valid discipline.';
  if (!location) errors.location = 'Location is required.';

  const yearNum = Number(year);
  if (!year && year !== 0) {
    errors.year = 'Year is required.';
  } else if (!Number.isInteger(yearNum) || yearNum < 2000 || yearNum > 2099) {
    errors.year = 'Year must be a number between 2000 and 2099.';
  }

  if (!lead) errors.lead = 'Editorial lead is required.';
  if (!body0) errors.body0 = 'At least one body paragraph is required.';

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Parse a comma-separated materials string into a trimmed array.
 * @param {string} str
 * @returns {string[]}
 */
export function parseMaterials(str) {
  return String(str || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Generate a URL-safe slug from a title string.
 * @param {string} title
 * @returns {string}
 */
export function slugify(title) {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

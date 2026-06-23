import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProjectForm, parseMaterials, slugify } from '../src/js/admin-utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Firestore rules ──────────────────────────────────────────────────────────

describe('firestore.rules', () => {
  const rules = readFileSync(resolve(__dirname, '..', 'firestore.rules'), 'utf8');

  it('requires authentication for write operations', () => {
    expect(rules).toMatch(/allow\s+create.*delete.*if\s+request\.auth\s*!=\s*null/s);
  });

  it('allows public read of published projects', () => {
    expect(rules).toMatch(/resource\.data\.published\s*==\s*true/);
    expect(rules).toMatch(/allow\s+read/);
  });

  it('does not grant unauthenticated write access', () => {
    expect(rules).not.toMatch(/allow\s+(?:create|write|update|delete)\s*:\s*if\s+true/);
  });

  it('authenticated users can also read unpublished projects', () => {
    expect(rules).toMatch(/request\.auth\s*!=\s*null/);
  });
});

// ─── Storage rules ────────────────────────────────────────────────────────────

describe('storage.rules', () => {
  const rules = readFileSync(resolve(__dirname, '..', 'storage.rules'), 'utf8');

  it('requires authentication to write', () => {
    expect(rules).toMatch(/allow\s+write\s*:\s*if\s+request\.auth\s*!=\s*null/);
  });

  it('allows public read without authentication', () => {
    expect(rules).toMatch(/allow\s+read\s*:\s*if\s+true/);
  });
});

// ─── validateProjectForm ──────────────────────────────────────────────────────

const VALID = {
  title: 'JW Marriott Test',
  discipline: 'Hospitality',
  location: 'Bengaluru, Karnataka',
  year: '2023',
  area: '30,000 sq ft',
  scope: 'Turnkey Fit-Out',
  lead: 'A landmark hospitality project.',
  body0: 'The project involved full-scope interior contracting.',
  body1: '',
  body2: '',
  materials: 'Custom Joinery, Stone, Upholstered Seating',
  published: true,
  featured: false,
};

describe('validateProjectForm()', () => {
  it('accepts a fully valid record', () => {
    const { valid } = validateProjectForm(VALID);
    expect(valid).toBe(true);
  });

  it('rejects missing title', () => {
    const { valid, errors } = validateProjectForm({ ...VALID, title: '' });
    expect(valid).toBe(false);
    expect(errors.title).toBeTruthy();
  });

  it('rejects missing discipline', () => {
    const { valid, errors } = validateProjectForm({ ...VALID, discipline: '' });
    expect(valid).toBe(false);
    expect(errors.discipline).toBeTruthy();
  });

  it('rejects invalid discipline value', () => {
    const { valid, errors } = validateProjectForm({ ...VALID, discipline: 'Retail' });
    expect(valid).toBe(false);
    expect(errors.discipline).toBeTruthy();
  });

  it('rejects missing year', () => {
    const { valid, errors } = validateProjectForm({ ...VALID, year: '' });
    expect(valid).toBe(false);
    expect(errors.year).toBeTruthy();
  });

  it('rejects non-numeric year', () => {
    const { valid, errors } = validateProjectForm({ ...VALID, year: 'abc' });
    expect(valid).toBe(false);
    expect(errors.year).toBeTruthy();
  });

  it('rejects missing body paragraph 1', () => {
    const { valid, errors } = validateProjectForm({ ...VALID, body0: '' });
    expect(valid).toBe(false);
    expect(errors.body0).toBeTruthy();
  });

  it('rejects missing editorial lead', () => {
    const { valid, errors } = validateProjectForm({ ...VALID, lead: '' });
    expect(valid).toBe(false);
    expect(errors.lead).toBeTruthy();
  });

  it('reports multiple errors at once', () => {
    const { valid, errors } = validateProjectForm({
      ...VALID,
      title: '',
      discipline: '',
      lead: '',
    });
    expect(valid).toBe(false);
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(3);
  });
});

// ─── parseMaterials ───────────────────────────────────────────────────────────

describe('parseMaterials()', () => {
  it('splits comma-separated string into array', () => {
    expect(parseMaterials('Wood, Stone, Steel')).toEqual(['Wood', 'Stone', 'Steel']);
  });

  it('trims whitespace from each item', () => {
    expect(parseMaterials('  Wood ,  Stone  ')).toEqual(['Wood', 'Stone']);
  });

  it('filters out empty segments', () => {
    expect(parseMaterials('Wood,,Stone,')).toEqual(['Wood', 'Stone']);
  });

  it('returns empty array for empty string', () => {
    expect(parseMaterials('')).toEqual([]);
  });
});

// ─── slugify ──────────────────────────────────────────────────────────────────

describe('slugify()', () => {
  it('converts title to lowercase kebab-case', () => {
    expect(slugify('JW Marriott Bengaluru')).toBe('jw-marriott-bengaluru');
  });

  it('strips special characters', () => {
    expect(slugify('Taj — Exotica (Andaman)')).toBe('taj-exotica-andaman');
  });

  it('collapses multiple separators', () => {
    expect(slugify('A  B   C')).toBe('a-b-c');
  });
});

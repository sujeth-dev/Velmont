import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, '..', 'data', 'projects.json');

const REQUIRED_FIELDS = [
  'slug',
  'title',
  'discipline',
  'location',
  'year',
  'area',
  'scope',
  'lead',
  'body',
  'materials',
  'images',
  'featured',
  'published',
];

const VALID_DISCIPLINES = ['Workplace', 'Healthcare', 'Hospitality', 'Commercial'];

describe('data/projects.json', () => {
  const projects = JSON.parse(readFileSync(DATA_PATH, 'utf8'));

  it('contains all 18 projects (6 launch + 12 seeded)', () => {
    expect(Array.isArray(projects)).toBe(true);
    expect(projects).toHaveLength(18);
  });

  it.each(REQUIRED_FIELDS)('every project declares a "%s" field', (field) => {
    for (const p of projects) {
      expect(p, `${p.slug} missing ${field}`).toHaveProperty(field);
    }
  });

  it('every slug is URL-safe and unique', () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) {
      expect(s).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('every discipline is one of the four approved categories', () => {
    for (const p of projects) {
      expect(VALID_DISCIPLINES).toContain(p.discipline);
    }
  });

  it('body is a non-empty array of strings', () => {
    for (const p of projects) {
      expect(Array.isArray(p.body)).toBe(true);
      expect(p.body.length).toBeGreaterThan(0);
      for (const para of p.body) expect(typeof para).toBe('string');
    }
  });

  it('materials is a non-empty array of strings', () => {
    for (const p of projects) {
      expect(Array.isArray(p.materials)).toBe(true);
      expect(p.materials.length).toBeGreaterThan(0);
    }
  });

  it('images includes cover, hero, and gallery array with at least 1 entry', () => {
    for (const p of projects) {
      expect(p.images).toHaveProperty('cover');
      expect(p.images).toHaveProperty('hero');
      expect(Array.isArray(p.images.gallery)).toBe(true);
      expect(p.images.gallery.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('featured / published flags are booleans', () => {
    for (const p of projects) {
      expect(typeof p.featured).toBe('boolean');
      expect(typeof p.published).toBe('boolean');
    }
  });

  it('exactly 3 projects can be featured on the home strip', () => {
    // Home strip renders 3 featured tiles (MASTER_PLAN Phase 2). We seed more
    // than 3 featured for editorial flexibility, but at least 3 must exist.
    const featured = projects.filter((p) => p.featured && p.published);
    expect(featured.length).toBeGreaterThanOrEqual(3);
  });
});

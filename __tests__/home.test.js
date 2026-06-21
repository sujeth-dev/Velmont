import { describe, it, expect } from 'vitest';
import { selectFeatured, renderWorkTile } from '../src/js/home.js';

const sample = [
  { slug: 'a', title: 'A', discipline: 'Hospitality', location: 'Goa', year: 2020, featured: true, published: true },
  { slug: 'b', title: 'B', discipline: 'Workplace', location: 'Pune', year: 2021, featured: true, published: true },
  { slug: 'c', title: 'C', discipline: 'Hospitality', location: 'Mumbai', year: 2022, featured: true, published: true },
  { slug: 'd', title: 'D', discipline: 'Hospitality', location: 'Delhi', year: 2023, featured: true, published: true },
  { slug: 'e', title: 'E', discipline: 'Hospitality', location: 'Chennai', year: 2024, featured: false, published: true },
  { slug: 'f', title: 'F', discipline: 'Workplace', location: 'Hyderabad', year: 2024, featured: true, published: false },
];

describe('selectFeatured', () => {
  it('returns at most 3 featured + published projects', () => {
    const out = selectFeatured(sample);
    expect(out).toHaveLength(3);
    for (const p of out) {
      expect(p.featured).toBe(true);
      expect(p.published).toBe(true);
    }
  });

  it('drops unpublished projects even when featured', () => {
    const out = selectFeatured(sample);
    expect(out.find((p) => p.slug === 'f')).toBeUndefined();
  });

  it('drops non-featured projects even when published', () => {
    const out = selectFeatured(sample);
    expect(out.find((p) => p.slug === 'e')).toBeUndefined();
  });
});

describe('renderWorkTile', () => {
  it('renders the discipline, title, location, year, and arrow', () => {
    const html = renderWorkTile(sample[0]);
    expect(html).toContain('Hospitality');
    expect(html).toContain('A');
    expect(html).toContain('Goa');
    expect(html).toContain('2020');
    expect(html).toContain('→');
  });

  it('links to /work/<slug>', () => {
    const html = renderWorkTile({ slug: 'taj-malabar-kochi', title: 'Taj', discipline: 'Hospitality', location: 'Kochi', year: 2024 });
    expect(html).toContain('href="/work/taj-malabar-kochi"');
  });

  it('strips characters outside [a-z0-9-] from the slug used in the href', () => {
    const html = renderWorkTile({ slug: 'bad/../slug', title: 'X', discipline: 'X', location: 'X', year: 2024 });
    expect(html).toContain('href="/work/badslug"');
  });

  it('handles missing year gracefully', () => {
    const html = renderWorkTile({ slug: 's', title: 'T', discipline: 'D', location: 'L' });
    expect(html).toContain('href="/work/s"');
  });
});

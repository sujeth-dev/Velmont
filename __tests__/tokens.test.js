import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = resolve(__dirname, '..', 'src', 'css', 'tokens.css');

// Required CSS custom-property names from DESIGN_GUIDE.md §2 (colour tokens)
// plus the four typography stacks from §3.
const REQUIRED_TOKENS = [
  '--vblack',
  '--terracotta',
  '--slate',
  '--concrete',
  '--mineral',
  '--steel',
  '--sand',
  '--paper',
  '--display',
  '--serif',
  '--head',
  '--body',
];

const EXPECTED_VALUES = {
  '--vblack': '#1a1a1a',
  '--terracotta': '#ff4015',
  '--slate': '#68778d',
  '--concrete': '#d9dce0',
  '--mineral': '#bbbcc3',
  '--steel': '#8c92ba',
  '--sand': '#d9cab0',
  '--paper': '#f4f0eb',
};

describe('tokens.css', () => {
  const css = readFileSync(TOKENS_PATH, 'utf8');

  it.each(REQUIRED_TOKENS)('declares %s', (name) => {
    const re = new RegExp(`${name}\\s*:`);
    expect(re.test(css)).toBe(true);
  });

  it.each(Object.entries(EXPECTED_VALUES))(
    'sets %s to the exact DESIGN_GUIDE value',
    (name, value) => {
      const re = new RegExp(`${name}\\s*:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
      expect(re.test(css)).toBe(true);
    },
  );
});

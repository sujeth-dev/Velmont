import { describe, expect, it } from 'vitest';
import { isSupportedProjectImage, webpFileName } from '../src/js/admin-image.js';

describe('admin project image helpers', () => {
  it('accepts only raster project-photo formats', () => {
    expect(isSupportedProjectImage({ type: 'image/jpeg' })).toBe(true);
    expect(isSupportedProjectImage({ type: 'image/png' })).toBe(true);
    expect(isSupportedProjectImage({ type: 'image/webp' })).toBe(true);
    expect(isSupportedProjectImage({ type: 'image/svg+xml' })).toBe(false);
    expect(isSupportedProjectImage({ type: 'image/avif' })).toBe(false);
  });

  it('uses safe WebP names for Storage paths', () => {
    expect(webpFileName('Lobby View (Final).JPG')).toBe('Lobby_View__Final.webp');
    expect(webpFileName('')).toBe('image.webp');
  });
});

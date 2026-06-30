// Shared helper for AVIF/WebP <picture> sourcing.
// Local images converted by scripts/convert-images.js / generate-placeholder.js
// always have a sibling .avif next to the .webp. Firebase Storage URLs (admin
// uploads) and any other format are left as-is — no AVIF source is assumed.

/**
 * @param {string} url
 * @returns {string|null} the sibling .avif path, or null if not a local .webp
 */
export function avifFor(url) {
  if (typeof url !== 'string' || !url.startsWith('/assets/') || !url.endsWith('.webp')) {
    return null;
  }
  return url.replace(/\.webp$/, '.avif');
}

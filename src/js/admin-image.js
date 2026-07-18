const SUPPORTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_LONG_EDGE = 4000;
const WEBP_QUALITY = 0.82;

export function isSupportedProjectImage(file) {
  return Boolean(file && SUPPORTED_TYPES.has(file.type));
}

export function webpFileName(name = 'image') {
  const base = String(name)
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${base || 'image'}.webp`;
}

function canvasFor(width, height) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

async function canvasBlob(canvas) {
  if (typeof canvas.convertToBlob === 'function') {
    return canvas.convertToBlob({ type: 'image/webp', quality: WEBP_QUALITY });
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('WebP encoding failed.'))),
      'image/webp',
      WEBP_QUALITY,
    );
  });
}

/** Convert supported project photography to a consistently sized WebP blob. */
export async function convertProjectImageToWebp(file) {
  if (!isSupportedProjectImage(file)) {
    throw new Error('Use a JPG, PNG, or WebP image for project photography.');
  }
  if (typeof createImageBitmap !== 'function') {
    throw new Error('This browser cannot prepare images for upload. Please use a current browser.');
  }

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_LONG_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = canvasFor(width, height);
    const context = canvas.getContext('2d');
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await canvasBlob(canvas);
    return { blob, fileName: webpFileName(file.name), width, height };
  } finally {
    bitmap.close?.();
  }
}

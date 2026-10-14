import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Uploaded images live outside dist/ so redeploys never wipe them.
// server.js serves this directory at /uploads.
export const UPLOAD_DIR = process.env.UPLOAD_DIR
  || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads');

const MAX_BYTES = 8 * 1024 * 1024;
const RASTER = /^image\/(jpeg|png|webp)$/i;
const PASSTHROUGH = { 'image/gif': '.gif' }; // SVG is rejected: it can carry scripts
const ORIGINAL_EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

// sharp is a native module; load it lazily so a host without a compatible
// binary still serves the site and stores uploads un-optimised.
let sharpPromise;
const loadSharp = () => (sharpPromise ??= import('sharp').then(m => m.default).catch((err) => {
  console.warn('[upload] sharp unavailable — storing images without optimisation:', err.message);
  return null;
}));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { fileName, fileBase64, contentType, folder } = req.body || {};
    if (!fileName || !fileBase64) {
      return res.status(400).json({ error: 'fileName and fileBase64 are required' });
    }
    const isRaster = RASTER.test(contentType || '');
    if (!isRaster && !PASSTHROUGH[contentType]) {
      return res.status(400).json({ error: 'Only JPEG, PNG, WebP or GIF images can be uploaded' });
    }

    const inputBuffer = Buffer.from(fileBase64, 'base64');
    if (inputBuffer.length > MAX_BYTES) return res.status(413).json({ error: 'Image is larger than 8 MB' });

    const sharp = isRaster ? await loadSharp() : null;
    const buffer = sharp
      ? await sharp(inputBuffer, { failOn: 'none' })
          .rotate()
          .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82, effort: 5 })
          .toBuffer()
      : inputBuffer;
    const ext = sharp ? '.webp' : (ORIGINAL_EXT[contentType] || PASSTHROUGH[contentType]);

    const safeFolder = String(folder || 'misc').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase() || 'misc';
    const base = path.basename(fileName).replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase() || 'image';
    const outputName = `${Date.now()}-${base}${ext}`;

    await fs.mkdir(path.join(UPLOAD_DIR, safeFolder), { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, safeFolder, outputName), buffer);

    const rel = `${safeFolder}/${outputName}`;
    return res.status(200).json({ url: `/uploads/${rel}`, path: rel });
  } catch (err) {
    console.error('upload API:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
}

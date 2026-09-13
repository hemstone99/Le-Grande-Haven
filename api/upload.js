import supabase from './db-client.js';

const BUCKET = 'menu-images';

const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

// Try to auto-create the bucket if it doesn't exist yet. Handles the very
// first upload on a fresh Supabase project so admins don't have to create
// it manually.
let bucketReady = false;
async function ensureBucket() {
  if (bucketReady) return;
  try {
    const { data: existing } = await supabase.storage.getBucket(BUCKET);
    if (existing) { bucketReady = true; return; }
  } catch { /* bucket doesn't exist yet */ }
  try {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'],
    });
    if (error && !/already exists/i.test(error.message)) throw error;
    bucketReady = true;
    console.log(`[upload] Created storage bucket "${BUCKET}"`);
  } catch (err) {
    // We'll surface a friendly error on upload if this failed
    console.warn(`[upload] Could not auto-create bucket "${BUCKET}":`, err.message);
  }
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { fileName, fileBase64, contentType, folder } = req.body || {};
    if (!fileName || !fileBase64) {
      return res.status(400).json({ error: 'fileName and fileBase64 are required' });
    }

    await ensureBucket();

    const buffer = Buffer.from(fileBase64, 'base64');
    const safeName = fileName.replace(/[^a-z0-9.\-_]+/gi, '-').toLowerCase();
    const path = `${folder || 'misc'}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: contentType || 'image/jpeg',
        upsert: true,
        cacheControl: '3600',
      });

    if (error) {
      // Friendly error mapping
      if (/bucket not found/i.test(error.message)) {
        return res.status(500).json({
          error: `Storage bucket "${BUCKET}" not found. Run supabase-schema.sql, or create a public bucket named "${BUCKET}" in Supabase → Storage.`,
        });
      }
      throw error;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return res.status(200).json({ url: urlData.publicUrl, path });
  } catch (err) {
    console.error('upload API:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
}

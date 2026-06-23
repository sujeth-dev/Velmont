/**
 * Upload project images to Firebase Storage and update Firestore.
 *
 * What this does:
 *   1. Uploads all images for `itc-ratnadipa-colombo` to Storage,
 *      updates its Firestore doc with the Storage download URLs.
 *   2. Creates a new "test-1" project in Firestore with an uploaded image.
 *
 * Run: npm run upload-images
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load .env ────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env');
  const env = {};
  try {
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq === -1) continue;
      env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
    }
  } catch {
    console.error('[upload] Could not read .env');
    process.exit(1);
  }
  return env;
}

const env = loadEnv();

for (const k of ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_ADMIN_EMAIL', 'VITE_FIREBASE_ADMIN_PASSWORD']) {
  if (!env[k]) { console.error('[upload] Missing env var:', k); process.exit(1); }
}

// ─── Firebase ─────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, updateDoc, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
});

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const ASSETS = resolve(__dirname, '..', 'public', 'assets', 'projects');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function uploadFile(localPath, storagePath) {
  const buffer = readFileSync(localPath);
  const storageReference = ref(storage, storagePath);
  await uploadBytes(storageReference, buffer, { contentType: 'image/webp' });
  const url = await getDownloadURL(storageReference);
  console.log(`  ✓ ${storagePath}`);
  return url;
}

async function findDocBySlug(slug) {
  const q = query(collection(db, 'projects'), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ref: snap.docs[0].ref };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[upload] Signing in…');
  await signInWithEmailAndPassword(auth, env.VITE_FIREBASE_ADMIN_EMAIL, env.VITE_FIREBASE_ADMIN_PASSWORD);
  console.log('[upload] Signed in as', auth.currentUser.email);

  // ── 1. itc-ratnadipa-colombo ─────────────────────────────────────────────

  const ITC = 'itc-ratnadipa-colombo';
  const itcDir = resolve(ASSETS, ITC);
  console.log(`\n[upload] Uploading images for ${ITC}…`);

  const coverUrl  = await uploadFile(resolve(itcDir, 'cover.webp'),       `projects/${ITC}/cover.webp`);
  const heroUrl   = await uploadFile(resolve(itcDir, 'lobby.webp'),       `projects/${ITC}/hero.webp`);
  const g0Url     = await uploadFile(resolve(itcDir, 'lobby.webp'),       `projects/${ITC}/gallery-0.webp`);
  const g1Url     = await uploadFile(resolve(itcDir, 'bar-lounge.webp'),  `projects/${ITC}/gallery-1.webp`);
  const g2Url     = await uploadFile(resolve(itcDir, 'bedroom.webp'),     `projects/${ITC}/gallery-2.webp`);
  const g3Url     = await uploadFile(resolve(itcDir, 'bar-entrance.webp'),`projects/${ITC}/gallery-3.webp`);
  const g4Url     = await uploadFile(resolve(itcDir, 'cityview.webp'),    `projects/${ITC}/gallery-4.webp`);

  const itcImages = {
    cover: coverUrl,
    hero: heroUrl,
    gallery: [g0Url, g1Url, g2Url, g3Url, g4Url],
  };

  const itcDoc = await findDocBySlug(ITC);
  if (itcDoc) {
    await updateDoc(itcDoc.ref, { images: itcImages, updatedAt: new Date().toISOString() });
    console.log(`[upload] Firestore doc updated for ${ITC}`);
  } else {
    console.warn(`[upload] No Firestore doc found for ${ITC} — run npm run seed first`);
  }

  // ── 2. test-1 ────────────────────────────────────────────────────────────

  console.log('\n[upload] Creating test-1 project…');

  const itcExterior = resolve(itcDir, 'exterior.webp');
  const t1CoverUrl = await uploadFile(itcExterior, 'projects/test-1/cover.webp');
  const t1HeroUrl  = await uploadFile(itcExterior, 'projects/test-1/hero.webp');
  const t1G0Url    = await uploadFile(itcExterior, 'projects/test-1/gallery-0.webp');

  // Skip if already exists
  const existing = await findDocBySlug('test-1');
  if (existing) {
    await updateDoc(existing.ref, {
      images: { cover: t1CoverUrl, hero: t1HeroUrl, gallery: [t1G0Url] },
      updatedAt: new Date().toISOString(),
    });
    console.log('[upload] test-1 already exists — images updated');
  } else {
    await addDoc(collection(db, 'projects'), {
      slug: 'test-1',
      title: 'Test Project 1',
      discipline: 'Commercial',
      location: 'Bengaluru, Karnataka',
      year: 2024,
      area: '5,000 sq ft',
      scope: 'Interior Fit-Out',
      lead: 'A test project to verify end-to-end Firebase Storage integration.',
      body: [
        'This project was created to test the admin panel and Firebase Storage pipeline.',
        'All images are uploaded directly to Firebase Storage and referenced via download URLs.',
      ],
      materials: ['Custom Joinery', 'Stone', 'Glass'],
      images: { cover: t1CoverUrl, hero: t1HeroUrl, gallery: [t1G0Url] },
      featured: false,
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('[upload] test-1 created in Firestore');
  }

  console.log('\n[upload] All done.');
  await signOut(auth);
  process.exit(0);
}

main().catch((err) => {
  console.error('[upload] Fatal:', err.code || err.message);
  process.exit(1);
});

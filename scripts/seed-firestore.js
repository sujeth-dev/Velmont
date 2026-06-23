/**
 * Seed Firestore with all projects from data/projects.json.
 *
 * Uses Firebase client SDK with email/password auth — no service account required.
 * Credentials are read from .env (which is gitignored).
 *
 * Prerequisites:
 *   .env must contain:
 *     VITE_FIREBASE_API_KEY=...
 *     VITE_FIREBASE_AUTH_DOMAIN=...
 *     VITE_FIREBASE_PROJECT_ID=...
 *     VITE_FIREBASE_ADMIN_EMAIL=...
 *     VITE_FIREBASE_ADMIN_PASSWORD=...
 *
 * Run: npm run seed
 *
 * Idempotent: existing slugs are skipped. Safe to re-run.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load .env manually (no dotenv dep needed) ────────────────────────────────

function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env');
  const env = {};
  try {
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      env[key] = val;
    }
  } catch {
    console.error('[seed] Could not read .env file at', envPath);
    process.exit(1);
  }
  return env;
}

const env = loadEnv();

const REQUIRED = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_ADMIN_EMAIL',
  'VITE_FIREBASE_ADMIN_PASSWORD',
];

for (const key of REQUIRED) {
  if (!env[key]) {
    console.error(`[seed] Missing required env var: ${key}`);
    process.exit(1);
  }
}

// ─── Firebase client SDK ──────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
});

const auth = getAuth(app);
const db = getFirestore(app);

// ─── Seed ─────────────────────────────────────────────────────────────────────

const DATA_PATH = resolve(__dirname, '..', 'data', 'projects.json');
const projects = JSON.parse(readFileSync(DATA_PATH, 'utf8'));

async function main() {
  console.log('[seed] Signing in…');
  await signInWithEmailAndPassword(
    auth,
    env.VITE_FIREBASE_ADMIN_EMAIL,
    env.VITE_FIREBASE_ADMIN_PASSWORD,
  );
  console.log('[seed] Signed in as', auth.currentUser.email);

  console.log(`[seed] Checking existing documents…`);
  const existing = await getDocs(collection(db, 'projects'));
  const existingSlugs = new Set(existing.docs.map((d) => d.data().slug));
  console.log(`[seed] Found ${existingSlugs.size} existing project(s) in Firestore`);

  let created = 0;
  let skipped = 0;

  for (const project of projects) {
    if (existingSlugs.has(project.slug)) {
      console.log(`  SKIP  ${project.slug}`);
      skipped++;
      continue;
    }
    await addDoc(collection(db, 'projects'), {
      ...project,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`  ADD   ${project.slug}`);
    created++;
  }

  console.log(`\n[seed] Done. Created: ${created}, Skipped: ${skipped}`);
  await signOut(auth);
  console.log('[seed] Signed out.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] Fatal:', err.code || err.message);
  process.exit(1);
});

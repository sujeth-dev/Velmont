/**
 * One-time seed script: writes all projects from data/projects.json to Firestore.
 *
 * Prerequisites:
 *   1. npm install (firebase-admin must be in devDependencies)
 *   2. Download a service account key from Firebase Console → Project Settings → Service Accounts
 *   3. Set env var: GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
 *      OR set FIREBASE_SERVICE_ACCOUNT_JSON with the JSON content as a string
 *   4. Run: node scripts/seed-firestore.js
 *
 * Idempotent: existing slugs are skipped. Re-run safely.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load firebase-admin dynamically so the script gives a clear error if not installed.
let admin;
try {
  const mod = await import('firebase-admin/app');
  const firestoreMod = await import('firebase-admin/firestore');
  admin = {
    initializeApp: mod.initializeApp,
    cert: mod.cert,
    getFirestore: firestoreMod.getFirestore,
  };
} catch {
  console.error(
    '[seed] firebase-admin is not installed. Run: npm install --save-dev firebase-admin',
  );
  process.exit(1);
}

// Resolve service account credentials
function getCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    return admin.cert(sa);
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  }
  console.error(
    '[seed] No credentials found.\n' +
      'Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json\n' +
      'or FIREBASE_SERVICE_ACCOUNT_JSON with the JSON string.',
  );
  process.exit(1);
}

// Read projects.json
const DATA_PATH = resolve(__dirname, '..', 'data', 'projects.json');
const projects = JSON.parse(readFileSync(DATA_PATH, 'utf8'));

// Init admin app
admin.initializeApp({ credential: getCredential() });
const db = admin.getFirestore();

async function main() {
  console.log(`[seed] Seeding ${projects.length} projects into Firestore…`);

  // Fetch existing slugs to enable idempotent re-runs
  const existing = await db.collection('projects').get();
  const existingSlugs = new Set(existing.docs.map((d) => d.data().slug));

  let created = 0;
  let skipped = 0;

  for (const project of projects) {
    if (existingSlugs.has(project.slug)) {
      console.log(`  SKIP  ${project.slug}`);
      skipped++;
      continue;
    }
    await db.collection('projects').add({
      ...project,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`  ADD   ${project.slug}`);
    created++;
  }

  console.log(`\n[seed] Done. Created: ${created}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error('[seed] Fatal:', err);
  process.exit(1);
});

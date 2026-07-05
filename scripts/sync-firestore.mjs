#!/usr/bin/env node
/**
 * Velmont — Sync data/projects.json into Firestore.
 *
 * For every project: updates `images` + `order` on the existing Firestore doc
 * (matched by slug), or creates the doc if the slug doesn't exist yet. Other
 * fields (lead/body/materials/etc.) are only written when creating a new doc,
 * so this is safe to re-run without clobbering copy edits made in the admin.
 *
 * Run: node scripts/sync-firestore.mjs
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env');
  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return env;
}
const env = loadEnv();

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, updateDoc } from 'firebase/firestore';

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

const DATA_PATH = resolve(__dirname, '..', 'data', 'projects.json');
const projects = JSON.parse(readFileSync(DATA_PATH, 'utf8'));

async function main() {
  await signInWithEmailAndPassword(auth, env.VITE_FIREBASE_ADMIN_EMAIL, env.VITE_FIREBASE_ADMIN_PASSWORD);

  const snap = await getDocs(collection(db, 'projects'));
  const bySlug = new Map();
  snap.forEach((d) => bySlug.set(d.data().slug, d));

  let updated = 0;
  let created = 0;

  for (const project of projects) {
    const existing = bySlug.get(project.slug);
    if (existing) {
      await updateDoc(existing.ref, {
        images: project.images,
        order: project.order,
        updatedAt: new Date().toISOString(),
      });
      console.log(`  UPDATE  ${project.slug}  (images + order=${project.order})`);
      updated++;
    } else {
      await addDoc(collection(db, 'projects'), {
        ...project,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`  CREATE  ${project.slug}  (order=${project.order})`);
      created++;
    }
  }

  console.log(`\n[sync] Done. Updated: ${updated}, Created: ${created}`);
  await signOut(auth);
  process.exit(0);
}

main().catch((err) => {
  console.error('[sync] Fatal:', err.code || err.message);
  process.exit(1);
});

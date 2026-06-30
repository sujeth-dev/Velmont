#!/usr/bin/env node
/**
 * Velmont — Update an existing Firestore project's content from data/projects.json.
 *
 * Unlike seed-firestore.js (which only ADDS new slugs), this overwrites the
 * text fields of an already-seeded project — for refreshing copy without
 * touching its existing images.
 *
 * Run: node scripts/update-project-content.js <slug>
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env');
  const env = {};
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv();
const slug = process.argv[2];
if (!slug) {
  console.error('[update-project-content] usage: node scripts/update-project-content.js <slug>');
  process.exit(1);
}

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

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
const project = projects.find((p) => p.slug === slug);
if (!project) {
  console.error(`[update-project-content] no project with slug "${slug}" in data/projects.json`);
  process.exit(1);
}

async function main() {
  await signInWithEmailAndPassword(
    auth,
    env.VITE_FIREBASE_ADMIN_EMAIL,
    env.VITE_FIREBASE_ADMIN_PASSWORD,
  );
  const q = query(collection(db, 'projects'), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) {
    console.error(`[update-project-content] "${slug}" not found in Firestore`);
    process.exit(1);
  }
  const { lead, body, materials, title, area, scope } = project;
  await updateDoc(snap.docs[0].ref, {
    lead,
    body,
    materials,
    title,
    area,
    scope,
    updatedAt: new Date().toISOString(),
  });
  console.log(`[update-project-content] updated "${slug}" content (images untouched)`);
  await signOut(auth);
  process.exit(0);
}

main().catch((err) => {
  console.error('[update-project-content] Fatal:', err.code || err.message);
  process.exit(1);
});

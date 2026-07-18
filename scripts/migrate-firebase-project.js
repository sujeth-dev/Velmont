#!/usr/bin/env node
/**
 * Clone Firebase data into a new project and normalize project photos to WebP.
 *
 * Required environment variables:
 * OLD_FIREBASE_SERVICE_ACCOUNT=/absolute/path/to/old-service-account.json
 * NEW_FIREBASE_SERVICE_ACCOUNT=/absolute/path/to/new-service-account.json
 * OLD_FIREBASE_STORAGE_BUCKET=old-project.appspot.com
 * NEW_FIREBASE_STORAGE_BUCKET=velmont-website-1d23f.firebasestorage.app
 *
 * Optional:
 * MIGRATION_REPORT_PATH=./migration-report.json
 * DRY_RUN=1
 *
 * This command never deletes source or destination files. Review the report and
 * validate the destination before separately removing legacy JPG/PNG objects.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import sharp from 'sharp';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const WEBP_EXTENSION = '.webp';
const DRY_RUN = process.env.DRY_RUN === '1';
const REPORT_PATH = resolve(process.env.MIGRATION_REPORT_PATH || 'migration-report.json');

async function readServiceAccount(variable) {
  const file = process.env[variable];
  if (!file) throw new Error(`Missing ${variable}. Provide a local service-account JSON path.`);
  return JSON.parse(await readFile(resolve(file), 'utf8'));
}

function appFor(name, serviceAccount, storageBucket) {
  const existing = getApps().find((app) => app.name === name);
  return existing || initializeApp({ credential: cert(serviceAccount), storageBucket }, name);
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Use the exact bucket name from Firebase Storage.`);
  return value;
}

function publicDownloadUrl(bucket, objectPath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;
}

function isProjectImage(path, metadata) {
  const ext = extname(path).toLowerCase();
  return (
    path.startsWith('projects/') &&
    ((metadata.contentType || '').startsWith('image/') ||
      IMAGE_EXTENSIONS.has(ext) ||
      ext === WEBP_EXTENSION)
  );
}

function destinationPath(sourcePath) {
  const ext = extname(sourcePath).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext) ? sourcePath.slice(0, -ext.length) + WEBP_EXTENSION : sourcePath;
}

async function uploadImage(sourceFile, targetFile, sourcePath, report) {
  const [metadata] = await sourceFile.getMetadata();
  const targetPath = destinationPath(sourcePath);
  const token = randomUUID();
  const targetMetadata = {
    contentType: IMAGE_EXTENSIONS.has(extname(sourcePath).toLowerCase())
      ? 'image/webp'
      : metadata.contentType || 'image/webp',
    metadata: { firebaseStorageDownloadTokens: token },
  };

  if (!DRY_RUN) {
    if (IMAGE_EXTENSIONS.has(extname(sourcePath).toLowerCase())) {
      const [buffer] = await sourceFile.download();
      const webp = await sharp(buffer)
        .rotate()
        .resize({ width: 4000, height: 4000, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      await targetFile.save(webp, targetMetadata);
      report.imagesConverted += 1;
    } else {
      const [buffer] = await sourceFile.download();
      await targetFile.save(buffer, targetMetadata);
      report.filesCopied += 1;
    }
  } else if (IMAGE_EXTENSIONS.has(extname(sourcePath).toLowerCase())) {
    report.imagesConverted += 1;
  } else {
    report.filesCopied += 1;
  }

  return publicDownloadUrl(targetFile.bucket, targetPath, token);
}

async function migrateStorage(oldBucket, newBucket, report) {
  const [files] = await oldBucket.getFiles({ autoPaginate: true });
  const urlMap = new Map();

  for (const sourceFile of files) {
    const sourcePath = sourceFile.name;
    if (!sourcePath || sourcePath.endsWith('/')) continue;
    try {
      const [metadata] = await sourceFile.getMetadata();
      const targetPath = destinationPath(sourcePath);
      const targetFile = newBucket.file(targetPath);

      if (isProjectImage(sourcePath, metadata)) {
        const targetUrl = await uploadImage(sourceFile, targetFile, sourcePath, report);
        const [oldMetadata] = await sourceFile.getMetadata();
        const oldToken = oldMetadata.metadata?.firebaseStorageDownloadTokens?.split(',')[0];
        if (oldToken) urlMap.set(publicDownloadUrl(oldBucket, sourcePath, oldToken), targetUrl);
      } else if (!DRY_RUN) {
        const [buffer] = await sourceFile.download();
        const [metadata] = await sourceFile.getMetadata();
        await targetFile.save(buffer, { contentType: metadata.contentType });
        report.filesCopied += 1;
      } else {
        report.filesCopied += 1;
      }
      report.storageObjects += 1;
    } catch (error) {
      report.failures.push({ phase: 'storage', path: sourcePath, error: error.message });
    }
  }
  return urlMap;
}

function rewriteUrls(value, urlMap, report) {
  if (typeof value === 'string') {
    const replacement = urlMap.get(value);
    if (replacement) report.urlsRewritten += 1;
    return replacement || value;
  }
  if (Array.isArray(value)) return value.map((item) => rewriteUrls(item, urlMap, report));
  if (value && value.constructor === Object) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, rewriteUrls(item, urlMap, report)]),
    );
  }
  return value;
}

async function copyCollection(oldDb, newDb, collectionPath, urlMap, report) {
  const snapshot = await oldDb.collection(collectionPath).get();
  for (const sourceDoc of snapshot.docs) {
    const targetPath = `${collectionPath}/${sourceDoc.id}`;
    const data = rewriteUrls(sourceDoc.data(), urlMap, report);
    if (!DRY_RUN) await newDb.doc(targetPath).set(data);
    report.documentsCopied += 1;

    const subcollections = await sourceDoc.ref.listCollections();
    for (const subcollection of subcollections) {
      await copyCollection(oldDb, newDb, `${targetPath}/${subcollection.id}`, urlMap, report);
    }
  }
}

async function migrateFirestore(oldDb, newDb, urlMap, report) {
  const collections = await oldDb.listCollections();
  for (const collection of collections) {
    await copyCollection(oldDb, newDb, collection.id, urlMap, report);
  }
}

async function main() {
  const report = {
    startedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    sourceProject: null,
    destinationProject: null,
    sourceBucket: null,
    destinationBucket: null,
    storageObjects: 0,
    filesCopied: 0,
    imagesConverted: 0,
    documentsCopied: 0,
    urlsRewritten: 0,
    failures: [],
  };

  const [oldServiceAccount, newServiceAccount] = await Promise.all([
    readServiceAccount('OLD_FIREBASE_SERVICE_ACCOUNT'),
    readServiceAccount('NEW_FIREBASE_SERVICE_ACCOUNT'),
  ]);
  report.sourceProject = oldServiceAccount.project_id;
  report.destinationProject = newServiceAccount.project_id;
  report.sourceBucket = requiredEnv('OLD_FIREBASE_STORAGE_BUCKET');
  report.destinationBucket = requiredEnv('NEW_FIREBASE_STORAGE_BUCKET');

  const oldApp = appFor('migration-source', oldServiceAccount, report.sourceBucket);
  const newApp = appFor('migration-destination', newServiceAccount, report.destinationBucket);
  const oldDb = getFirestore(oldApp);
  const newDb = getFirestore(newApp);
  const oldBucket = getStorage(oldApp).bucket(report.sourceBucket);
  const newBucket = getStorage(newApp).bucket(report.destinationBucket);

  const urlMap = await migrateStorage(oldBucket, newBucket, report);
  await migrateFirestore(oldDb, newDb, urlMap, report);
  report.completedAt = new Date().toISOString();
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(
    `[migration] ${DRY_RUN ? 'Dry run complete' : 'Migration complete'}: ${report.documentsCopied} documents, ${report.storageObjects} storage objects.`,
  );
  console.log(`[migration] Report: ${REPORT_PATH}`);
  if (report.failures.length) process.exitCode = 1;
}

main().catch(async (error) => {
  console.error('[migration] Fatal:', error.message);
  process.exitCode = 1;
});

// Auth + Storage, split out of firebase.js so public pages (home/work/project)
// only pull in firebase/app + firebase/firestore — not the auth/storage SDKs,
// which are only needed behind the admin login.
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import app from './firebase.js';

export const auth = getAuth(app);
export const storage = getStorage(app);

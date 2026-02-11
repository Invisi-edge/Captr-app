import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: serviceAccount.project_id
      ? `${serviceAccount.project_id}.firebasestorage.app`
      : undefined,
  });
}

export const db = getFirestore();
export const storage = getStorage();
export const auth = getAuth();

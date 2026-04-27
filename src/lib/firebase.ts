import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if config is valid
const isConfigValid = Object.values(firebaseConfig).every(val => !!val);

if (!isConfigValid) {
  console.warn('Firebase configuration is missing or incomplete. Running in guest mode without auth-backed features.');
}

const app = isConfigValid ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : null;
const auth = (app ? getAuth(app) : null) as any;
const db = (app ? getFirestore(app) : null) as any;

export const isFirebaseEnabled = isConfigValid;
export { app, auth, db };

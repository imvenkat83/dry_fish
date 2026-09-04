import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyASGlO6b0DhBPb2LZ20fMtbZzhBwgis-QA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dry-fish-bas.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dry-fish-bas",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dry-fish-bas.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "912918590463",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:912918590463:web:d603e6dc7f0a07ea482dca",
};

let app;
let auth: any = null;

// Only initialize if configuration keys are present to prevent crashes in dev/testing fallback mode
if (firebaseConfig.apiKey) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
}

export { app, auth };

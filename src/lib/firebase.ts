import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyApzj_UE-wzvRQ0e7RcCsro-qwDChKoEe0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "azaleya-b009f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "azaleya-b009f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "azaleya-b009f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "981367179944",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:981367179944:web:c9d1e8a1643e9a2a5a509d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FN6N7LD1HR"
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, 'default');

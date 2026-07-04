import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const env = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Initialize Firebase only when a Vite env API key is provided.
const hasApiKey = Boolean(env.VITE_FIREBASE_API_KEY);
let app: ReturnType<typeof initializeApp> | undefined;
let analytics: ReturnType<typeof getAnalytics> | undefined;
let auth: ReturnType<typeof getAuth> | null = null;
let provider: GoogleAuthProvider | null = null;

if (hasApiKey) {
  app = initializeApp(firebaseConfig);
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
} else {
  // When no API key is provided (local dev without credentials),
  // avoid calling Firebase functions that try to validate the key so the app can render.
  app = undefined;
  analytics = undefined;
  auth = null;
  provider = null;
}

export { app, analytics, auth, provider };

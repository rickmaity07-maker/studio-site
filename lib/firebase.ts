import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

/**
 * True once real values from a Firebase project exist in .env.local.
 * Until then we deliberately skip initializing Auth — an invalid or
 * missing API key makes `getAuth()` throw immediately, which (since
 * AuthProvider wraps the whole site) would crash every page, not just
 * the login-related ones.
 */
export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

if (firebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  authInstance = getAuth(app);
} else if (typeof window !== "undefined") {
  // Loud in the browser console, but never breaks the page.
  console.warn(
    "Firebase isn't configured — copy .env.local.example to .env.local and " +
      "fill in your Firebase project's web config. Auth and Firestore calls " +
      "will fail until then."
  );
}

// Firestore is still safe to initialize without a real key — reads/writes
// will simply fail at call time (and are already wrapped in try/catch in
// the form and admin pages) rather than throwing at import time.
if (!app) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const db = getFirestore(app);
export const auth = authInstance as Auth;

export type LeadPayload = {
  name: string;
  email: string;
  phone?: string;
  business: string;
  projectType: string;
  budget: string;
  timeline: string;
  message?: string;
  consent: boolean;
};

/**
 * Writes a new inquiry to the `leads` collection.
 * Pair this with the Firestore rules described in the README: anyone can
 * create a lead, but only accounts listed in the `admins` collection can
 * read or update them afterwards.
 */
export async function submitLead(payload: LeadPayload) {
  return addDoc(collection(db, "leads"), {
    ...payload,
    createdAt: serverTimestamp(),
    status: "new"
  });
}

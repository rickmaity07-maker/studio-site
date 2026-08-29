import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut as firebaseSignOut,
  RecaptchaVerifier,
  linkWithPhoneNumber,
  type ConfirmationResult,
  type User
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, firebaseConfigured } from "./firebase";

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

function assertConfigured() {
  if (!firebaseConfigured) {
    throw new Error(
      "Firebase isn't configured yet — add your project's config to .env.local (see README)."
    );
  }
}

export function signInWithGoogle() {
  assertConfigured();
  return signInWithPopup(auth, googleProvider);
}

export function signInWithFacebook() {
  assertConfigured();
  return signInWithPopup(auth, facebookProvider);
}

export async function signUpWithEmail(email: string, password: string) {
  assertConfigured();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(cred.user);
  return cred.user;
}

export function signInWithEmail(email: string, password: string) {
  assertConfigured();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function resendEmailVerification(user: User) {
  assertConfigured();
  return sendEmailVerification(user);
}

export function signOut() {
  assertConfigured();
  return firebaseSignOut(auth);
}

/**
 * Checks whether the given uid has an /admins/{uid} document.
 * Admin documents are created manually from the Firebase console —
 * signing up never grants admin access on its own. See README.
 */
export async function isAdmin(uid: string) {
  const snap = await getDoc(doc(db, "admins", uid));
  return snap.exists();
}

/**
 * ─── Phone verification ───────────────────────────────────────
 * Requires the Firebase project to be on the Blaze (pay-as-you-go)
 * plan — phone auth sends real SMS messages and Firebase bills for
 * each one after a small free quota. Requires a visible or
 * invisible reCAPTCHA container in the DOM (see /app/signup/page.tsx).
 *
 * This LINKS the phone number to the already-signed-in user
 * (rather than starting a separate phone-only sign-in), so the
 * person ends up with one account that has both an email and a
 * verified phone number attached.
 */
export function createRecaptcha(containerId: string) {
  assertConfigured();
  return new RecaptchaVerifier(auth, containerId, { size: "invisible" });
}

export function startPhoneVerification(
  user: User,
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  return linkWithPhoneNumber(user, phoneNumber, verifier);
}

export function confirmPhoneCode(
  confirmation: ConfirmationResult,
  code: string
) {
  return confirmation.confirm(code);
}

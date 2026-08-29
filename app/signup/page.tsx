"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ConfirmationResult, User } from "firebase/auth";
import {
  signUpWithEmail,
  resendEmailVerification,
  createRecaptcha,
  startPhoneVerification,
  confirmPhoneCode
} from "@/lib/auth";
import { auth, firebaseConfigured } from "@/lib/firebase";

type Step = "account" | "verify-email" | "verify-phone" | "done";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("account");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // account fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  // phone fields
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null
  );

  async function handleCreateAccount(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPw) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const newUser = await signUpWithEmail(email, password);
      setUser(newUser);
      setStep("verify-email");
    } catch (err) {
      setError(readableError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleResendEmail() {
    if (!user) return;
    setBusy(true);
    try {
      await resendEmailVerification(user);
      setError(null);
    } catch {
      setError("Couldn't resend — try again in a minute.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckEmailVerified() {
    if (!user) return;
    setBusy(true);
    try {
      await user.reload();
      if (auth.currentUser?.emailVerified) {
        setStep("verify-phone");
      } else {
        setError("Not verified yet — open the link in the email we sent you.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setBusy(true);
    try {
      const verifier = createRecaptcha("recaptcha-container");
      const result = await startPhoneVerification(user, phone, verifier);
      setConfirmation(result);
    } catch (err) {
      setError(readableError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmCode(e: FormEvent) {
    e.preventDefault();
    if (!confirmation) return;
    setError(null);
    setBusy(true);
    try {
      await confirmPhoneCode(confirmation, code);
      setStep("done");
    } catch (err) {
      setError("That code didn't match — check it and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-sm flex-col px-6 py-20">
      <p className="eyebrow">Create account · Step {stepNumber(step)} of 3</p>
      <h1 className="mt-2 font-display text-3xl">{stepTitle(step)}</h1>

      {!firebaseConfigured && (
        <p className="mt-4 rounded-lg border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-signal">
          Firebase isn't connected yet — add your project's config to
          <code className="mx-1">.env.local</code> (see the README) before
          creating an account.
        </p>
      )}

      {step === "account" && (
        <>
          <p className="mt-2 text-sm text-muted">
            This account is only for accessing the admin area.
          </p>
          <form onSubmit={handleCreateAccount} className="mt-8 grid gap-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-line bg-surface2 px-3.5 py-2.5 text-sm"
            />
            <input
              type="password"
              required
              placeholder="Password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-line bg-surface2 px-3.5 py-2.5 text-sm"
            />
            <input
              type="password"
              required
              placeholder="Confirm password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="rounded-lg border border-line bg-surface2 px-3.5 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-live px-5 py-2.5 font-mono text-[13px] uppercase tracking-[0.08em] text-ink transition hover:bg-live/90 disabled:opacity-40"
            >
              Create account
            </button>
          </form>
          <p className="mt-8 text-sm text-muted">
            Already have one?{" "}
            <Link href="/login" className="text-text underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </>
      )}

      {step === "verify-email" && (
        <>
          <p className="mt-2 text-sm text-muted">
            We sent a verification link to <span className="text-text">{email}</span>.
            Open it, then come back here.
          </p>
          <div className="mt-8 grid gap-3">
            <button
              onClick={handleCheckEmailVerified}
              disabled={busy}
              className="rounded-full bg-live px-5 py-2.5 font-mono text-[13px] uppercase tracking-[0.08em] text-ink transition hover:bg-live/90 disabled:opacity-40"
            >
              I've verified my email
            </button>
            <button
              onClick={handleResendEmail}
              disabled={busy}
              className="rounded-full border border-line px-5 py-2.5 font-mono text-[13px] uppercase tracking-[0.08em] text-muted transition hover:text-text disabled:opacity-40"
            >
              Resend email
            </button>
          </div>
        </>
      )}

      {step === "verify-phone" && (
        <>
          <p className="mt-2 text-sm text-muted">
            One last step — verify a phone number with a text code.
          </p>

          {!confirmation ? (
            <form onSubmit={handleSendCode} className="mt-8 grid gap-4">
              <input
                type="tel"
                required
                placeholder="+49 151 23456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-lg border border-line bg-surface2 px-3.5 py-2.5 text-sm"
              />
              <p className="text-xs text-muted">
                Include the country code, e.g. +49 for Germany.
              </p>
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-live px-5 py-2.5 font-mono text-[13px] uppercase tracking-[0.08em] text-ink transition hover:bg-live/90 disabled:opacity-40"
              >
                Send code
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirmCode} className="mt-8 grid gap-4">
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="rounded-lg border border-line bg-surface2 px-3.5 py-2.5 text-sm"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-live px-5 py-2.5 font-mono text-[13px] uppercase tracking-[0.08em] text-ink transition hover:bg-live/90 disabled:opacity-40"
              >
                Confirm code
              </button>
            </form>
          )}

          {/* Firebase attaches its invisible reCAPTCHA challenge here */}
          <div id="recaptcha-container" />
        </>
      )}

      {step === "done" && (
        <>
          <p className="mt-2 text-sm text-muted">
            Your email and phone are both verified.
          </p>
          <div className="mt-6 rounded-xl border border-line bg-surface p-5 text-sm text-muted">
            Admin access itself is granted separately — if this is the
            site owner's first account, add your user ID to the{" "}
            <code className="text-text">admins</code> collection in the
            Firebase console (see the README) to unlock the dashboard.
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="mt-6 rounded-full bg-live px-5 py-2.5 font-mono text-[13px] uppercase tracking-[0.08em] text-ink transition hover:bg-live/90"
          >
            Go to admin
          </button>
        </>
      )}

      {error && <p className="mt-4 font-mono text-[12px] text-signal">{error}</p>}
    </section>
  );
}

function stepNumber(step: Step) {
  return { account: 1, "verify-email": 2, "verify-phone": 3, done: 3 }[step];
}

function stepTitle(step: Step) {
  return {
    account: "Create your account",
    "verify-email": "Verify your email",
    "verify-phone": "Verify your phone",
    done: "You're all set"
  }[step];
}

function readableError(err: unknown) {
  const message = (err as { message?: string })?.message || "";
  if (message.includes("isn't configured"))
    return "Firebase isn't connected yet — add your project's config to .env.local first.";
  const code = (err as { code?: string })?.code || "";
  if (code.includes("email-already-in-use")) return "That email already has an account.";
  if (code.includes("invalid-phone-number")) return "That phone number doesn't look right.";
  if (code.includes("weak-password")) return "Choose a stronger password.";
  return "Something went wrong — please try again.";
}

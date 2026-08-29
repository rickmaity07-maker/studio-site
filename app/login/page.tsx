"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithEmail
} from "@/lib/auth";
import { firebaseConfigured } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function withProvider(fn: () => Promise<unknown>) {
    setError(null);
    setBusy(true);
    try {
      await fn();
      router.push("/admin");
    } catch (err) {
      setError(readableError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault();
    await withProvider(() => signInWithEmail(email, password));
  }

  return (
    <section className="mx-auto flex max-w-sm flex-col px-6 py-20">
      <p className="eyebrow">Sign in</p>
      <h1 className="mt-2 font-display text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">
        This is only used for the admin area — visitors never need an
        account to request a project.
      </p>

      {!firebaseConfigured && (
        <p className="mt-4 rounded-lg border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-signal">
          Firebase isn't connected yet — add your project's config to
          <code className="mx-1">.env.local</code> (see the README) before
          signing in.
        </p>
      )}

      <div className="mt-8 grid gap-3">
        <button
          onClick={() => withProvider(signInWithGoogle)}
          disabled={busy}
          className="rounded-full border border-line px-5 py-2.5 font-mono text-[13px] uppercase tracking-[0.08em] transition hover:border-live/50 hover:text-live disabled:opacity-40"
        >
          Continue with Google
        </button>
        <button
          onClick={() => withProvider(signInWithFacebook)}
          disabled={busy}
          className="rounded-full border border-line px-5 py-2.5 font-mono text-[13px] uppercase tracking-[0.08em] transition hover:border-live/50 hover:text-live disabled:opacity-40"
        >
          Continue with Facebook
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-muted">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[11px] uppercase tracking-[0.1em]">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleEmailLogin} className="grid gap-4">
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-line bg-surface2 px-3.5 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-live px-5 py-2.5 font-mono text-[13px] uppercase tracking-[0.08em] text-ink transition hover:bg-live/90 disabled:opacity-40"
        >
          Sign in
        </button>
      </form>

      {error && <p className="mt-4 font-mono text-[12px] text-signal">{error}</p>}

      <p className="mt-8 text-sm text-muted">
        No account yet?{" "}
        <Link href="/signup" className="text-text underline underline-offset-2">
          Create one
        </Link>
      </p>
    </section>
  );
}

function readableError(err: unknown) {
  const message = (err as { message?: string })?.message || "";
  if (message.includes("isn't configured"))
    return "Firebase isn't connected yet — add your project's config to .env.local first.";
  const code = (err as { code?: string })?.code || "";
  if (code.includes("wrong-password") || code.includes("invalid-credential"))
    return "That email or password doesn't match an account.";
  if (code.includes("user-not-found")) return "No account found for that email.";
  if (code.includes("popup-closed")) return "Sign-in was cancelled.";
  return "Something went wrong signing you in — please try again.";
}

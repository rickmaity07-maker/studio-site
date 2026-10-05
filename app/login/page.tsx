"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/admin-api";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api("/api/auth/login", { method: "POST", json: { email, password } });
      await refresh();
      router.push("/admin");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-sm flex-col px-6 py-20">
      <p className="eyebrow">Sign in</p>
      <h1 className="mt-2 font-display text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">
        This is only used for the admin area — visitors never need an
        account to request a project.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
        <input
          type="email"
          required
          autoComplete="username"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-live px-5 py-2.5 font-mono text-[13px] uppercase tracking-[0.08em] text-ink transition hover:bg-live/90 disabled:opacity-40"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {error && <p className="mt-4 font-mono text-[12px] text-signal">{error}</p>}
    </section>
  );
}

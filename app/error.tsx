"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="eyebrow">Error</p>
      <h1 className="mt-3 font-display text-3xl">Something broke on this page</h1>
      <p className="mt-3 text-muted">
        It&apos;s on my side, not yours. Try again — and if it keeps happening,
        the rest of the site still works.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          onClick={reset}
          className="rounded-full bg-live px-6 py-3 font-mono text-[13px] uppercase tracking-[0.1em] text-ink transition hover:bg-live/90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-line px-6 py-3 font-mono text-[13px] uppercase tracking-[0.1em] text-text transition hover:border-live/50 hover:text-live"
        >
          Home
        </Link>
      </div>
    </section>
  );
}

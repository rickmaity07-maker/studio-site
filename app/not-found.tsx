import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-3xl">Nothing to click through here</h1>
      <p className="mt-3 text-muted">
        This page doesn&apos;t exist, or it hasn&apos;t been built yet.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/work"
          className="rounded-full bg-live px-6 py-3 font-mono text-[13px] uppercase tracking-[0.1em] text-ink transition hover:bg-live/90"
        >
          See the work
        </Link>
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

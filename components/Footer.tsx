import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-base">
            Rick<span className="text-muted">.build</span>
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Websites built to be clicked through, not just looked at. Based in
            Schweinfurt, working with clients everywhere.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[12px] uppercase tracking-[0.1em] text-muted">
          <Link href="/work" className="transition hover:text-text">
            Work
          </Link>
          <Link href="/request" className="transition hover:text-text">
            Start a project
          </Link>
          <Link href="/privacy" className="transition hover:text-text">
            Privacy
          </Link>
          <Link href="/impressum" className="transition hover:text-text">
            Impressum
          </Link>
        </div>
      </div>
      <div className="border-t border-line/60 px-6 py-4 text-center font-mono text-[11px] text-muted/70">
        © {new Date().getFullYear()} Rick — built with Next.js, shipped on Vercel.
      </div>
    </footer>
  );
}

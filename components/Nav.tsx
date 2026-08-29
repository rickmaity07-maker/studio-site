import Link from "next/link";
import { AuthStatus } from "./AuthStatus";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-2 font-display text-lg font-medium">
          <span className="text-live">◆</span>
          <span>
            Rick<span className="text-muted">.build</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 font-mono text-[13px] uppercase tracking-[0.1em] text-muted sm:flex">
          <Link href="/work" className="transition hover:text-text">
            Work
          </Link>
          <Link href="/#process" className="transition hover:text-text">
            Process
          </Link>
          <AuthStatus />
          <Link
            href="/request"
            className="rounded-full border border-live/40 bg-live/10 px-4 py-1.5 text-live transition hover:bg-live/20"
          >
            Start a project
          </Link>
        </nav>
        <Link
          href="/request"
          className="rounded-full border border-live/40 bg-live/10 px-3 py-1.5 font-mono text-[12px] text-live sm:hidden"
        >
          Start
        </Link>
      </div>
    </header>
  );
}

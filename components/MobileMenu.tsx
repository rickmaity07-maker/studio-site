"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthStatus } from "./AuthStatus";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close after navigating.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-text"
      >
        <span className="relative block h-3 w-4">
          <span
            className={
              "absolute left-0 h-px w-4 bg-current transition " +
              (open ? "top-1.5 rotate-45" : "top-0")
            }
          />
          <span
            className={
              "absolute left-0 top-1.5 h-px w-4 bg-current transition " +
              (open ? "opacity-0" : "")
            }
          />
          <span
            className={
              "absolute left-0 h-px w-4 bg-current transition " +
              (open ? "top-1.5 -rotate-45" : "top-3")
            }
          />
        </span>
      </button>

      {open && (
        <nav
          id="mobile-menu"
          className="absolute inset-x-0 top-full border-b border-line/80 bg-ink shadow-card"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-6 font-mono text-[13px] uppercase tracking-[0.1em] text-muted">
            <Link href="/work" className="transition hover:text-text">
              Work
            </Link>
            <Link href="/#process" onClick={() => setOpen(false)} className="transition hover:text-text">
              Process
            </Link>
            <AuthStatus />
            <Link
              href="/request"
              className="self-start rounded-full border border-live/40 bg-live/10 px-4 py-1.5 text-live"
            >
              Start a project
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}

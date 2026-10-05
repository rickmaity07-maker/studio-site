"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { AuthStatus } from "./AuthStatus";
import { MobileMenu } from "./MobileMenu";

const LINKS = [
  { href: "/work", label: "Work" },
  { href: "/#process", label: "Process" }
];

/**
 * Sticky nav that gets out of the way: it slides up while you scroll
 * down through content and returns the moment you scroll back up.
 */
export function Nav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 8);
    setHidden(!reduce && y > 240 && y > prev);
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={
        "sticky top-0 z-50 border-b transition-colors duration-300 " +
        (scrolled ? "border-line/80 bg-ink/85 backdrop-blur-md" : "border-transparent bg-ink/0")
      }
    >
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2 font-display text-lg font-medium" aria-label="Rick.build home">
          <span className="text-live transition-transform duration-500 group-hover:rotate-[135deg]">◆</span>
          <span>
            Rick<span className="text-muted">.build</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 font-mono text-[13px] uppercase tracking-[0.1em] text-muted sm:flex">
          {LINKS.map((l) => {
            const active = l.href === "/work" ? pathname.startsWith("/work") : false;
            return (
              <Link key={l.href} href={l.href} className={"relative py-1 transition hover:text-text " + (active ? "text-text" : "")}>
                {l.label}
                {active && (
                  <motion.span layoutId="nav-underline" className="absolute inset-x-0 -bottom-0.5 h-px bg-live" />
                )}
              </Link>
            );
          })}
          <AuthStatus />
          <Link
            href="/request"
            className="rounded-full border border-live/40 bg-live/10 px-4 py-1.5 text-live transition hover:bg-live hover:text-ink"
          >
            Start a project
          </Link>
        </nav>
        <MobileMenu />
      </div>
    </motion.header>
  );
}

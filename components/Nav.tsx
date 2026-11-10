"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { AuthStatus } from "./AuthStatus";
import { MobileMenu } from "./MobileMenu";
import { BrandMark } from "./brand/BrandMark";
import { ArrowUpRight } from "@phosphor-icons/react";

const LINKS = [
  { href: "/work", label: "Work" },
  { href: "/for", label: "Sectors" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" }
];

/**
 * Sticky nav that gets out of the way: it slides up while you scroll
 * down through content and returns the moment you scroll back up.
 */
export function Nav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 8);
    setHidden(!reduce && y > 240 && y > prev);
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-130%" : "0%" }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4"
    >
      {/* A floating glass island, not a bar glued to the edge. */}
      <div
        className={
          "relative mx-auto flex h-14 max-w-5xl items-center justify-between overflow-hidden rounded-full pl-5 pr-2 transition-[background-color,box-shadow] duration-500 " +
          (scrolled
            ? "bg-[#0d0f14]/75 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-white/10 backdrop-blur-xl"
            : "bg-white/[0.02] ring-1 ring-white/[0.06]")
        }
      >
        <Link href="/" className="group flex items-center" aria-label="rira.build home">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-1 text-[14px] text-muted sm:flex">
          {LINKS.map((l) => {
            const active = l.href.startsWith("/#") ? false : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={"relative rounded-full px-4 py-2 transition-colors duration-300 hover:text-text " + (active ? "text-text" : "")}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-white/[0.07] ring-1 ring-white/10"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {l.label}
              </Link>
            );
          })}
          <span className="px-2">
            <AuthStatus />
          </span>
          <Link
            href="/request"
            className="group ml-1 inline-flex items-center gap-2 rounded-full bg-live py-1.5 pl-4 pr-1.5 font-medium text-ink transition active:scale-[0.98]"
          >
            Start a project
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-px group-hover:translate-x-0.5">
              <ArrowUpRight weight="bold" className="h-3.5 w-3.5" aria-hidden />
            </span>
          </Link>
        </nav>
        <MobileMenu />
        {/* How far down the page you are. */}
        <motion.div
          aria-hidden
          style={{ scaleX: progress }}
          className={"absolute inset-x-6 bottom-0 h-px origin-left bg-live/70 transition-opacity " + (scrolled ? "opacity-100" : "opacity-0")}
        />
      </div>
    </motion.header>
  );
}

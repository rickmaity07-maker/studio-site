"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { instant, useReducedMotion } from "@/components/motion/useReducedMotion";
import { AuthStatus } from "./AuthStatus";

const LINKS = [
  { href: "/work", label: "Work" },
  { href: "/for", label: "Sectors" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/estimate", label: "Cost planner" },
  { href: "/faq", label: "Questions" },
  { href: "/request", label: "Start a project" }
];
const EASE = [0.32, 0.72, 0, 1] as const;

/** Burger that morphs to an X; the menu is a full-screen glass overlay. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);
  // Close after navigating.
  useEffect(() => setOpen(false), [pathname]);
  // Escape closes; the page behind doesn't scroll while it's open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="sm:hidden">
      <Burger open={open} onClick={() => setOpen((o) => !o)} />

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.nav
                id="mobile-menu"
                aria-label="Menu"
                className="fixed inset-0 z-[70] flex flex-col bg-[#07080b]/85 px-6 pb-10 pt-6 backdrop-blur-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={instant(reduce, { duration: 0.4, ease: EASE })}
              >
                <div className="flex justify-end">
                  <Burger open onClick={() => setOpen(false)} />
                </div>
                <ul className="mt-10 grid gap-2">
                  {LINKS.map((l, i) => (
                    <li key={l.href} className="overflow-hidden">
                      <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={instant(reduce, { duration: 0.7, delay: 0.08 + i * 0.06, ease: EASE })}
                      >
                        <Link
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className={
                            "block py-2 font-display text-5xl font-medium tracking-[-0.03em] transition-colors " +
                            (l.href === "/request" ? "text-live" : "text-text hover:text-live")
                          }
                        >
                          {l.label}
                        </Link>
                      </motion.div>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto font-mono text-[12px] uppercase tracking-[0.1em] text-muted">
                  <AuthStatus />
                </div>
              </motion.nav>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

function Burger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? "Close menu" : "Open menu"}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-text ring-1 ring-white/10 transition active:scale-95"
    >
      <span className="relative block h-3 w-4">
        <span
          className={
            "absolute left-0 h-px w-4 bg-current transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] " +
            (open ? "top-1.5 rotate-45" : "top-0.5")
          }
        />
        <span
          className={
            "absolute left-0 h-px w-4 bg-current transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] " +
            (open ? "top-1.5 -rotate-45" : "top-2.5")
          }
        />
      </span>
    </button>
  );
}

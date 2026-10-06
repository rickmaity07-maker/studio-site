"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { instant, useReducedMotion } from "@/components/motion/useReducedMotion";
import { AndroidLogo, ArrowRight, X } from "@phosphor-icons/react";
import { useIntroDone } from "./motion/Intro";

const KEY = "rb-app-banner-dismissed";

/**
 * A slim bar announcing the Android app. Not shown on iPhone/iPad (there is
 * no iOS app), on /app itself or in the admin area, and once dismissed it
 * stays dismissed on this device.
 */
export function AppBanner() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const introDone = useIntroDone();
  const [state, setState] = useState<"hidden" | "android" | "other">("hidden");

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(KEY) === "1";
    } catch {}
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    if (dismissed || ios) return;
    setState(/Android/i.test(ua) ? "android" : "other");
  }, []);

  function dismiss() {
    setState("hidden");
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  }

  const offPage = pathname === "/app" || pathname.startsWith("/admin") || pathname === "/login";
  const show = state !== "hidden" && !offPage && introDone;

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          role="region"
          aria-label="Android app"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={instant(reduce, { duration: 0.5, ease: [0.16, 1, 0.3, 1] })}
          className="relative z-[60] overflow-hidden border-b border-live/20 bg-[linear-gradient(90deg,rgba(76,232,176,0.12),rgba(76,232,176,0.04)_60%,transparent)]"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
            <AndroidLogo weight="fill" className="h-4 w-4 shrink-0 text-live" aria-hidden />
            <p className="min-w-0 flex-1 truncate text-[13px] text-text/90">
              <span className="font-medium text-text">New:</span> the Rick.build Android app.
              <span className="hidden text-muted sm:inline"> Every build and every live demo, on your phone.</span>
            </p>
            <Link
              // Android phones download straight away; everyone else gets the app page.
              href={state === "android" ? "/download" : "/app"}
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-live px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink transition hover:bg-[#6bf0c1]"
            >
              {state === "android" ? "Download" : "See the app"}
              <ArrowRight weight="bold" className="h-3 w-3 transition group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <button
              onClick={dismiss}
              aria-label="Dismiss the app banner"
              className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-white/5 hover:text-text"
            >
              <X weight="bold" className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

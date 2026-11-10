"use client";

import { useEffect, useState } from "react";
import { useReducedMotion as useFramerReducedMotion, type Transition } from "motion/react";

/**
 * prefers-reduced-motion, hydration-safe. The server can't know the
 * visitor's setting, so the first client render must match it (false);
 * the real value applies right after mount. Without this, reduced-motion
 * visitors hit a hydration mismatch and React re-renders the whole page.
 * Pair it with `instant()` so entrances that start in that first render
 * finish immediately instead of animating.
 */
export function useReducedMotion() {
  const prefers = useFramerReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? Boolean(prefers) : false;
}

/** The given transition, or an instant one for reduced motion. */
export function instant(reduce: boolean, transition: Transition): Transition {
  return reduce ? { duration: 0 } : transition;
}

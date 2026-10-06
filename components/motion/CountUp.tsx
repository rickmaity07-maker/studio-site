"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

/** A real number that counts up from zero when it scrolls into view. */
export function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const value = useMotionValue(reduce ? to : 0);
  const rounded = useTransform(value, (v) => Math.round(v).toString());

  useEffect(() => {
    if (reduce) {
      value.set(to); // no counting for reduced motion: show the number
      return;
    }
    if (!inView) return;
    const controls = animate(value, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, reduce, to, value]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{to}</span>
      <motion.span aria-hidden>{rounded}</motion.span>
    </span>
  );
}

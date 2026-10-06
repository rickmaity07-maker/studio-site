"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { instant, useReducedMotion } from "@/components/motion/useReducedMotion";
import { useIntroDone } from "./Intro";

export const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Fades content up into place the first time it scrolls into view.
 * Waits for the first-visit intro so nothing animates behind the curtain.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const introDone = useIntroDone();
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={reduce || (introDone && inView) ? { opacity: 1, y: 0 } : undefined}
      transition={instant(reduce, { duration: 0.9, delay, ease: EASE })}
    >
      {children}
    </motion.div>
  );
}

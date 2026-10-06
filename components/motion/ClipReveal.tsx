"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { instant, useReducedMotion } from "@/components/motion/useReducedMotion";
import { useIntroDone } from "./Intro";

/**
 * Opens an image (or any block) with a wipe from the bottom edge while
 * its content settles from a slight zoom, the first time it scrolls in.
 *
 * Visibility is measured on the unclipped outer box: a fully clipped
 * element never reports as intersecting, which would also stop lazy
 * images inside it from loading.
 */
export function ClipReveal({
  children,
  className = "",
  delay = 0,
  radius = 16
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const introDone = useIntroDone();
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const open = reduce || (introDone && inView);

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="h-full w-full"
        initial={{ clipPath: `inset(100% 0% 0% 0% round ${radius}px)` }}
        animate={open ? { clipPath: `inset(0% 0% 0% 0% round ${radius}px)` } : undefined}
        transition={instant(reduce, { duration: 1.2, delay, ease: [0.76, 0, 0.24, 1] })}
      >
        <motion.div
          className="h-full w-full"
          initial={{ scale: 1.12 }}
          animate={open ? { scale: 1 } : undefined}
          transition={instant(reduce, { duration: 1.6, delay, ease: [0.16, 1, 0.3, 1] })}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

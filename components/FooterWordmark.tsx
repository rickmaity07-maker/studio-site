"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

/**
 * The page signs off with the wordmark at full width, rising out of the
 * footer's bottom edge as you scroll the last stretch of the page.
 */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["55%", "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  return (
    <div ref={ref} aria-hidden className="relative overflow-hidden">
      <motion.p
        style={{ y: reduce ? 0 : y, opacity: reduce ? 1 : opacity }}
        className="select-none whitespace-nowrap px-4 pb-2 text-center font-display text-[17.5vw] font-medium leading-[0.8] tracking-[-0.06em] text-text/[0.06] sm:px-6"
      >
        Rick<span className="text-live/30">.</span>build
      </motion.p>
    </div>
  );
}

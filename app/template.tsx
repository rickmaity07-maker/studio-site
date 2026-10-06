"use client";

import { motion } from "framer-motion";
import { instant, useReducedMotion } from "@/components/motion/useReducedMotion";

/**
 * Re-mounts on every navigation, so each page arrives with a short rise
 * and fade instead of a hard cut.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={instant(reduce, { duration: 0.6, ease: [0.16, 1, 0.3, 1] })}
    >
      {children}
    </motion.div>
  );
}

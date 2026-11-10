"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * A hairline at the very top of the window that fills as you read down
 * the page. From Magic UI (magicui.design/docs/components/scroll-progress),
 * ported to Tailwind 3, with a spring so it glides instead of ticking.
 */
export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-live/0 via-live to-[#A9F5D9]",
        className
      )}
    />
  );
}

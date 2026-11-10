"use client";

import { motion, type MotionStyle } from "motion/react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * A short streak of light that travels around its parent's border.
 * From Magic UI (magicui.design/docs/components/border-beam), ported to
 * Tailwind 3 and the site's mint. The parent needs `relative` and a
 * border radius. Hidden when the visitor asks for reduced motion.
 */
export function BorderBeam({
  className,
  size = 120,
  duration = 8,
  delay = 0,
  colorFrom = "#4CE8B0",
  colorTo = "#A9F5D9",
  borderWidth = 1.5,
  reverse = false
}: {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  borderWidth?: number;
  reverse?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-solid border-transparent"
      style={{
        borderWidth,
        // Two layers intersected: only the border ring stays visible.
        maskImage: "linear-gradient(transparent,transparent), linear-gradient(#000,#000)",
        maskClip: "padding-box, border-box",
        maskComposite: "intersect",
        WebkitMaskImage: "linear-gradient(transparent,transparent), linear-gradient(#000,#000)",
        WebkitMaskClip: "padding-box, border-box",
        WebkitMaskComposite: "source-in"
      }}
    >
      <motion.div
        className={cn("absolute aspect-square", className)}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`
          } as MotionStyle
        }
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: reverse ? ["100%", "0%"] : ["0%", "100%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration, delay: -delay }}
      />
    </div>
  );
}

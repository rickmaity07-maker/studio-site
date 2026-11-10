"use client";

import { motion } from "motion/react";
import { instant, useReducedMotion } from "@/components/motion/useReducedMotion";
import { useIntroDone } from "@/components/motion/Intro";

const SPRING = { type: "spring", stiffness: 260, damping: 18 } as const;

/**
 * The rira.build logo, with its motion: the mark's two halves slide
 * together when it first appears, and it turns a quarter on hover
 * (hover the parent `group`). The dot in ".build" lights up mint.
 */
export function BrandMark({ size = "md", className = "" }: { size?: "md" | "lg"; className?: string }) {
  const reduce = useReducedMotion();
  const introDone = useIntroDone();
  const show = reduce || introDone;
  const px = size === "lg" ? 26 : 18;

  return (
    <span className={"inline-flex items-center gap-2.5 " + className}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        aria-hidden
        className="shrink-0 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:rotate-90"
      >
        {/* Left half */}
        <motion.path
          d="M12 1 L1 12 L12 23 Z"
          fill="#4CE8B0"
          initial={{ x: -5, opacity: 0 }}
          animate={show ? { x: 0, opacity: 1 } : undefined}
          transition={instant(reduce, SPRING)}
        />
        {/* Right half, a shade lighter, so the mark reads as a cut gem */}
        <motion.path
          d="M12 1 L23 12 L12 23 Z"
          fill="#A9F5D9"
          initial={{ x: 5, opacity: 0 }}
          animate={show ? { x: 0, opacity: 1 } : undefined}
          transition={instant(reduce, { ...SPRING, delay: 0.08 })}
        />
      </svg>
      <span className={"font-display font-semibold tracking-[-0.03em] " + (size === "lg" ? "text-2xl" : "text-lg")}>
        rira
        <motion.span
          className="inline-block text-live"
          initial={{ scale: 0 }}
          animate={show ? { scale: 1 } : undefined}
          transition={instant(reduce, { ...SPRING, delay: 0.25 })}
        >
          .
        </motion.span>
        <span className="text-muted">build</span>
      </span>
    </span>
  );
}

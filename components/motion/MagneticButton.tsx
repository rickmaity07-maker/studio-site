"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

const MotionLink = motion.create(Link);

/**
 * A pill CTA that leans toward the cursor and springs back on leave,
 * so the primary action feels physical. Motion values only: no re-renders.
 */
export function MagneticButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className = ""
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  size?: "md" | "lg";
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  function onMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.36);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  const look =
    variant === "primary"
      ? "bg-live text-ink hover:bg-[#6bf0c1]"
      : "border border-line text-text hover:border-live/50 hover:text-live";
  const pad = size === "lg" ? "px-8 py-4 text-[14px]" : "px-6 py-3 text-[13px]";

  return (
    <MotionLink
      ref={ref}
      href={href}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group inline-flex items-center gap-3 whitespace-nowrap rounded-full font-mono uppercase tracking-[0.1em] transition-colors duration-300 active:scale-[0.98] ${look} ${pad} ${className}`}
    >
      {children}
      <ArrowRight
        weight="bold"
        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden
      />
    </MotionLink>
  );
}

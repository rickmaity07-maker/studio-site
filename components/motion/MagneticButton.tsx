"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

const MotionLink = motion.create(Link);

/**
 * A pill CTA that leans toward the cursor and springs back on leave.
 * Primary buttons get a light sheen on hover; ghost buttons fill with
 * mint from whichever side the cursor came in. Motion values and direct
 * style writes only, so hovering never re-renders React.
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
  const fill = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  function onEnter(e: React.PointerEvent) {
    if (!ref.current || !fill.current) return;
    const r = ref.current.getBoundingClientRect();
    fill.current.style.transformOrigin = e.clientX < r.left + r.width / 2 ? "left center" : "right center";
  }

  function onMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.36);
  }

  function onLeave(e: React.PointerEvent) {
    x.set(0);
    y.set(0);
    onEnter(e); // retract toward the side the cursor leaves from
  }

  const primary = variant === "primary";
  const look = primary
    ? "bg-live text-ink shadow-[0_10px_40px_-12px_rgba(76,232,176,0.6)] hover:shadow-[0_14px_50px_-10px_rgba(76,232,176,0.75)]"
    : "border border-line text-text hover:border-live hover:text-ink";
  const pad = size === "lg" ? "px-8 py-4 text-[14px]" : "px-6 py-3 text-[13px]";

  return (
    <MotionLink
      ref={ref}
      href={href}
      style={{ x, y }}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group relative isolate inline-flex items-center gap-3 overflow-hidden whitespace-nowrap rounded-full font-mono uppercase tracking-[0.1em] transition-[color,border-color,box-shadow] duration-300 active:scale-[0.98] ${look} ${pad} ${className}`}
    >
      {primary ? (
        // Sheen: a soft band of light that crosses the button on hover.
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 -z-10 w-1/2 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[400%] motion-reduce:hidden"
        />
      ) : (
        <span
          ref={fill}
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 scale-x-0 rounded-full bg-live transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
        />
      )}
      {children}
      <ArrowRight
        weight="bold"
        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden
      />
    </MotionLink>
  );
}

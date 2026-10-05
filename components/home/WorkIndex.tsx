"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring
} from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { Project } from "@/data/projects";
import { LiveDot } from "@/components/LiveDot";
import { SplitHeading } from "@/components/motion/SplitHeading";

/**
 * Every project as one big line of type. On desktop, hovering a row
 * floats that site's screenshot beside the cursor; the preview glides
 * between rows on a spring instead of jumping.
 */
export function WorkIndex({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotion();
  const list = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<Project | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 28, mass: 0.6 });
  const y = useSpring(my, { stiffness: 260, damping: 28, mass: 0.6 });

  function onMove(e: React.PointerEvent) {
    if (!list.current) return;
    const r = list.current.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:py-36">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SplitHeading
          lines={["Every build,", "one line each."]}
          className="font-display text-3xl font-medium leading-tight tracking-[-0.02em] sm:text-5xl"
        />
        <Link
          href="/work"
          className="group inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.1em] text-muted transition hover:text-live"
        >
          Filter by industry
          <ArrowUpRight weight="bold" className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>

      <div
        ref={list}
        onPointerMove={onMove}
        onPointerLeave={() => setHovered(null)}
        className="relative mt-12"
      >
      <ul className="border-t border-line">
        {projects.map((p) => (
          <li key={p.slug} className="border-b border-line">
            <Link
              href={`/work/${p.slug}`}
              onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(p)}
              onFocus={() => setHovered(p)}
              onBlur={() => setHovered(null)}
              className="group grid grid-cols-[auto_1fr] items-center gap-x-5 py-5 sm:grid-cols-[1fr_auto_auto] sm:gap-x-10 sm:py-7"
            >
              {/* Phones: a small thumbnail stands in for the floating preview. */}
              <span
                className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-line sm:hidden"
                style={{ background: `linear-gradient(155deg, ${p.accent}55 0%, #0B0D12 80%)` }}
              >
                {p.image && <Image src={p.image.url} alt="" fill sizes="64px" className="object-cover object-top" />}
              </span>

              <span className="min-w-0">
                <span className="block font-display text-2xl font-medium leading-tight sm:truncate tracking-[-0.02em] transition duration-500 ease-out group-hover:translate-x-2 group-hover:text-live sm:text-4xl lg:text-5xl">
                  {p.name}
                </span>
                <span className="mt-1 block truncate text-sm text-muted sm:hidden">{p.tagline}</span>
              </span>

              <span className="hidden text-right sm:block">
                <span className="block text-sm text-text/80">{p.tagline}</span>
                <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                  {p.category}, {p.year}
                </span>
              </span>

              <span className="hidden justify-self-end sm:block">
                <LiveDot live={Boolean(p.liveUrl)} />
              </span>
            </Link>
          </li>
        ))}
      </ul>

        {/* The floating preview. Desktop + fine pointer only. */}
        {!reduce && (
          <motion.div
            aria-hidden
            style={{ x, y }}
            className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block"
          >
            <div className="-translate-y-1/2 translate-x-10">
            <AnimatePresence>
              {hovered && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                  animate={{ opacity: 1, scale: 1, rotate: -2 }}
                  exit={{ opacity: 0, scale: 0.9, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                >
                  <div
                    className="relative aspect-[16/11] w-[340px] overflow-hidden rounded-2xl border border-line shadow-[0_40px_80px_-24px_rgba(0,0,0,0.9)]"
                    style={{ background: `linear-gradient(155deg, ${hovered.accent}55 0%, #0B0D12 80%)` }}
                  >
                    <AnimatePresence initial={false}>
                      <motion.div
                        key={hovered.slug}
                        initial={{ opacity: 0, scale: 1.06 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="absolute inset-0"
                      >
                        {hovered.image ? (
                          <Image src={hovered.image.url} alt="" fill sizes="340px" className="object-cover object-top" />
                        ) : (
                          <div className="flex h-full items-center justify-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                            Demo coming soon
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

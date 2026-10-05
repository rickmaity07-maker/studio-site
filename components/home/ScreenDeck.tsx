"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { Project } from "@/data/projects";
import { EASE } from "@/components/motion/Reveal";

const INTERVAL = 4200;
// Front, middle, back: each card steps up and to the right, smaller and dimmer.
const DEPTH = [
  { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, z: 30 },
  { x: 34, y: -26, scale: 0.94, rotate: 1.6, opacity: 0.55, z: 20 },
  { x: 66, y: -50, scale: 0.88, rotate: 3.2, opacity: 0.28, z: 10 }
];

/**
 * The hero's showpiece: real screenshots of the latest builds, fanned in
 * 3D. The whole deck tilts with the cursor, the front card cycles on a
 * timer (paused while you're interacting), and the tabs underneath jump
 * straight to a project.
 */
export function ScreenDeck({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotion();
  const deck = projects.slice(0, 5);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  // Cursor tilt, driven by motion values so React never re-renders on move.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), { stiffness: 140, damping: 18 });
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), { stiffness: 140, damping: 18 });

  useEffect(() => {
    if (reduce || paused || deck.length < 2) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % deck.length), INTERVAL);
    return () => clearTimeout(t);
  }, [active, paused, reduce, deck.length]);

  function onMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse" || !wrap.current) return;
    const r = wrap.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }

  function onLeave() {
    px.set(0);
    py.set(0);
    setPaused(false);
  }

  const visible = DEPTH.map((_, d) => deck[(active + d) % deck.length]).filter(
    (p, d, arr) => arr.findIndex((q) => q.slug === p.slug) === d
  );

  return (
    <div
      ref={wrap}
      onPointerMove={onMove}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={onLeave}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative mx-auto w-full max-w-[640px] [perspective:1600px]"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative mt-12 aspect-[16/11] w-[88%] sm:w-[90%]"
      >
        <AnimatePresence initial={false}>
          {visible
            .map((project, d) => ({ project, d }))
            .reverse()
            .map(({ project, d }) => {
              const pos = DEPTH[d];
              return (
                <motion.div
                  key={project.slug}
                  className="absolute inset-0"
                  style={{ zIndex: pos.z }}
                  initial={reduce ? false : { opacity: 0, x: 96, y: -72, scale: 0.84, rotate: 4.5 }}
                  animate={{ opacity: pos.opacity, x: pos.x, y: pos.y, scale: pos.scale, rotate: pos.rotate }}
                  exit={{ opacity: 0, x: -70, y: 30, scale: 0.96, rotate: -3, transition: { duration: 0.5, ease: EASE } }}
                  transition={{ duration: 0.9, ease: EASE }}
                >
                  <DeckCard project={project} front={d === 0} />
                </motion.div>
              );
            })}
        </AnimatePresence>
      </motion.div>

      {/* Project tabs: jump to a build; the active one shows the autoplay timer. */}
      <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2" role="tablist" aria-label="Featured projects">
        {deck.map((p, i) => {
          const on = i === active;
          return (
            <button
              key={p.slug}
              role="tab"
              aria-selected={on}
              aria-label={p.name}
              onClick={() => setActive(i)}
              className={
                "relative pb-2 font-mono text-[12px] uppercase tracking-[0.08em] transition-colors " +
                (on ? "text-text" : "text-muted hover:text-text")
              }
            >
              {/* First word keeps the tab row on one line: "Paulaner", "Rebo"... */}
              {p.name.split(" ")[0]}
              {on && (
                <span className="absolute inset-x-0 bottom-0 h-px overflow-hidden">
                  <motion.span
                    key={`${active}-${paused}`}
                    className="block h-full origin-left bg-live"
                    initial={{ scaleX: reduce || paused ? 1 : 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: reduce || paused ? 0 : INTERVAL / 1000, ease: "linear" }}
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DeckCard({ project, front }: { project: Project; front: boolean }) {
  const url = project.liveUrl?.replace(/^https?:\/\//, "").replace(/\/$/, "") ?? `${project.slug}.build`;
  return (
    <Link
      href={`/work/${project.slug}`}
      tabIndex={front ? 0 : -1}
      aria-hidden={!front}
      className={
        "group/card absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85)] " +
        (front ? "" : "pointer-events-none")
      }
    >
      <div className="flex items-center gap-3 border-b border-line/70 bg-surface2 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/70" />
        </div>
        <div className="min-w-0 flex-1 truncate rounded-md border border-line bg-ink px-3 py-1 font-mono text-[11.5px] text-muted">
          {url}
        </div>
      </div>
      <div
        className="relative flex-1"
        style={{ background: `linear-gradient(155deg, ${project.accent}33 0%, #0B0D12 72%)` }}
      >
        {project.image && (
          <Image
            src={project.image.url}
            alt={`${project.name} website`}
            fill
            sizes="(min-width: 1024px) 580px, 90vw"
            priority={front}
            className="object-cover object-top"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/0 to-ink/0" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
          <div>
            <p className="font-display text-xl font-medium leading-tight">{project.name}</p>
            <p className="mt-0.5 text-sm text-text/70">{project.tagline}</p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-live text-ink opacity-0 transition duration-300 group-hover/card:opacity-100">
            <ArrowUpRight weight="bold" className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}

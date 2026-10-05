"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/data/projects";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { EASE } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { useIntroDone } from "@/components/motion/Intro";
import { ScreenDeck } from "./ScreenDeck";

export function Hero({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotion();
  const introDone = useIntroDone();
  const section = useRef<HTMLElement>(null);
  const go = reduce || introDone;

  // A mint light that follows the cursor over the dot grid. CSS variables
  // only, so moving the mouse never re-renders.
  function onMove(e: React.PointerEvent) {
    const el = section.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--hx", `${e.clientX - r.left}px`);
    el.style.setProperty("--hy", `${e.clientY - r.top}px`);
  }

  return (
    <section ref={section} onPointerMove={onMove} className="hero-light relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 h-[640px] w-[640px] rounded-full opacity-[0.13] blur-[120px]"
        style={{ background: "radial-gradient(circle, #4CE8B0 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.12fr] lg:gap-10 lg:py-20">
        <div>
          <motion.p
            className="eyebrow"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={go ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: EASE }}
          >
            Web studio in Schweinfurt
          </motion.p>

          <SplitHeading
            as="h1"
            immediate
            delay={0.08}
            accent="click"
            lines={["Websites you can", "actually click through."]}
            className="mt-5 font-display text-[2.6rem] font-medium leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-[4.1rem]"
          />

          <motion.p
            className="mt-6 max-w-md text-lg leading-relaxed text-muted"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={go ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
          >
            Every project here is a real, working build. Open one, click around,
            then tell me what your business needs.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={go ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
          >
            <MagneticButton href="/work">See the work</MagneticButton>
            <MagneticButton href="/request" variant="ghost">
              Start a project
            </MagneticButton>
          </motion.div>
        </div>

        {projects.length > 0 && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 60, scale: 0.94, rotateX: 12 }}
            animate={go ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : undefined}
            transition={{ duration: 1.3, delay: 0.3, ease: EASE }}
            style={{ transformPerspective: 1600 }}
          >
            <ScreenDeck projects={projects} />
          </motion.div>
        )}
      </div>
    </section>
  );
}

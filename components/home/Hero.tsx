"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { instant, useReducedMotion } from "@/components/motion/useReducedMotion";
import type { Project } from "@/data/projects";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { EASE } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { useIntroDone } from "@/components/motion/Intro";
import { ScreenDeck } from "./ScreenDeck";
import { HeroBackdrop } from "./HeroBackdrop";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";

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
    <section ref={section} onPointerMove={onMove} className="hero-light relative isolate -mt-[4.5rem] overflow-hidden pt-[4.5rem]">
      <HeroBackdrop />

      <div className="relative mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.12fr] lg:gap-10 lg:py-20">
        <div>
          <motion.p
            className="eyebrow inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1.5 ring-1 ring-white/10 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={go ? { opacity: 1, y: 0 } : undefined}
            transition={instant(reduce, { duration: 0.8, ease: EASE })}
          >
            <AnimatedShinyText>Web studio · clients in every country</AnimatedShinyText>
          </motion.p>

          <SplitHeading
            as="h1"
            immediate
            delay={0.08}
            accent="click"
            lines={["Websites you can", "actually click through."]}
            className="mt-5 font-display text-[2.8rem] font-medium leading-[0.98] tracking-[-0.045em] sm:text-7xl lg:text-[5.2rem]"
          />

          <motion.p
            className="mt-6 max-w-md text-lg leading-relaxed text-muted"
            initial={{ opacity: 0, y: 16 }}
            animate={go ? { opacity: 1, y: 0 } : undefined}
            transition={instant(reduce, { duration: 0.9, delay: 0.55, ease: EASE })}
          >
            Every project here is a real, working build. Open one, click around,
            then tell me what your business needs.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={go ? { opacity: 1, y: 0 } : undefined}
            transition={instant(reduce, { duration: 0.9, delay: 0.7, ease: EASE })}
          >
            <MagneticButton href="/work">See the work</MagneticButton>
            <MagneticButton href="/request" variant="ghost">
              Start a project
            </MagneticButton>
          </motion.div>
        </div>

        {projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.94, rotateX: 12 }}
            animate={go ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : undefined}
            transition={instant(reduce, { duration: 1.3, delay: 0.3, ease: EASE })}
            style={{ transformPerspective: 1600 }}
          >
            <ScreenDeck projects={projects} />
          </motion.div>
        )}
      </div>
    </section>
  );
}

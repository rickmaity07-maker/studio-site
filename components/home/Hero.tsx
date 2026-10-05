"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/data/projects";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { EASE } from "@/components/motion/Reveal";
import { ScreenDeck } from "./ScreenDeck";

const HEADLINE = [["Websites", "you", "can"], ["actually", "click", "through."]];

export function Hero({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotion();
  let wordIndex = 0;

  return (
    <section className="relative overflow-hidden">
      {/* Soft mint light behind the deck; static, so it costs nothing to scroll. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 h-[640px] w-[640px] rounded-full opacity-[0.13] blur-[120px]"
        style={{ background: "radial-gradient(circle, #4CE8B0 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.12fr] lg:gap-10 lg:py-20">
        <div>
          <motion.p
            className="eyebrow"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            Web studio in Schweinfurt
          </motion.p>

          <h1 className="mt-5 font-display text-[2.6rem] font-medium leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-[4.1rem]">
            {HEADLINE.map((line, li) => (
              <span key={li} className="block">
                {line.map((word) => {
                  const i = wordIndex++;
                  const accent = word === "click";
                  return (
                    <span key={word} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                      <motion.span
                        className={"inline-block " + (accent ? "text-live" : "")}
                        initial={reduce ? false : { y: "105%" }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.9, delay: 0.08 + i * 0.07, ease: EASE }}
                      >
                        {word}
                      </motion.span>
                      {" "}
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>

          <motion.p
            className="mt-6 max-w-md text-lg leading-relaxed text-muted"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
          >
            Every project here is a real, working build. Open one, click around,
            then tell me what your business needs.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
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
            initial={reduce ? false : { opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
          >
            <ScreenDeck projects={projects} />
          </motion.div>
        )}
      </div>
    </section>
  );
}

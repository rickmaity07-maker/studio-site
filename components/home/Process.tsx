"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { instant, useReducedMotion } from "@/components/motion/useReducedMotion";
import { EASE } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

const STEPS = [
  {
    title: "Discover",
    body: "A short call about your business, your customers, and what the site actually needs to do: book a table, take an order, build trust."
  },
  {
    title: "Design",
    body: "A direction built around your brand, not a template. Real layout decisions, not a theme picker."
  },
  {
    title: "Build",
    body: "Production code from the first commit: Next.js, proper data handling, and security rules that hold up. Not a throwaway prototype."
  },
  {
    title: "Launch",
    body: "Deployed, tested on real phones, and handed to you as a live demo to click through before your customers ever see it."
  }
];

/**
 * The headline stays pinned while the four stages scroll past; a mint
 * line draws down the timeline in step with your scroll position.
 */
export function Process() {
  const reduce = useReducedMotion();
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 75%", "end 55%"] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="process" className="scroll-mt-20 border-t border-line/70">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 py-28 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:py-36">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow">How a project runs</p>
          <SplitHeading
            lines={["Four stages,", "no surprises."]}
            className="mt-4 font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-5xl"
          />
          <p className="mt-5 max-w-sm text-lg leading-relaxed text-muted">
            You click through a working demo of your own site before anything goes live.
          </p>
        </div>

        <ol ref={list} className="relative pl-10 sm:pl-14">
          {/* The rail, and the mint line drawing down it. */}
          <span aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px bg-line sm:left-[11px]" />
          <motion.span
            aria-hidden
            style={{ scaleY: reduce ? 1 : line }}
            className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-live sm:left-[11px]"
          />

          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              className="relative pb-20 last:pb-0"
              initial={{ opacity: 0.25 }}
              whileInView={{ opacity: 1 }}
              viewport={{ amount: 0.6, margin: "0px 0px -20% 0px" }}
              transition={instant(reduce, { duration: 0.6, ease: EASE })}
            >
              <motion.span
                aria-hidden
                className="absolute -left-10 top-2 flex h-[15px] w-[15px] items-center justify-center rounded-full border border-line bg-ink sm:-left-14 sm:h-[23px] sm:w-[23px]"
                initial={{ borderColor: "#262B38" }}
                whileInView={{ borderColor: "#4CE8B0" }}
                viewport={{ amount: 1, margin: "0px 0px -35% 0px" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-live sm:h-2 sm:w-2" />
              </motion.span>
              <h3 className="font-display text-3xl font-medium tracking-[-0.02em] sm:text-4xl">
                {s.title}
              </h3>
              <p className="mt-3 max-w-lg text-lg leading-relaxed text-muted">{s.body}</p>
              <span className="sr-only">Stage {i + 1} of {STEPS.length}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

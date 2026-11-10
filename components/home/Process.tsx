"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { instant, useReducedMotion } from "@/components/motion/useReducedMotion";
import { EASE } from "@/components/motion/Reveal";
import { ParticleField } from "@/components/science/ParticleField";
import { DecodeText } from "@/components/science/DecodeText";

const STEPS = [
  {
    title: "Discover",
    figure: "Spiral galaxy",
    body: "A short call about your business, your customers, and what the site actually needs to do: book a table, take an order, build trust."
  },
  {
    title: "Design",
    figure: "Wave interference",
    body: "A direction built around your brand, not a template. Real layout decisions, not a theme picker."
  },
  {
    title: "Build",
    figure: "Double helix",
    body: "Production code from the first commit: Next.js, proper data handling, and security rules that hold up. Not a throwaway prototype."
  },
  {
    title: "Launch",
    figure: "Globe in orbit",
    body: "Deployed, tested on real phones, and handed to you as a live demo to click through before your customers ever see it."
  }
];

const LAST = STEPS.length - 1;

/** Scroll 0..1 -> shape 0..3, holding still on each shape for a moment. */
function toMorph(s: number) {
  const x = Math.min(Math.max(s, 0), 1) * LAST;
  const seg = Math.min(Math.floor(x), LAST - 1);
  const t = x - seg;
  const k = Math.min(Math.max((t - 0.18) / 0.64, 0), 1);
  return seg + k * k * (3 - 2 * k);
}

/**
 * How a project runs, as a pinned scroll scene: 14,000 particles burst and
 * re-form into a galaxy, an interference pattern, a DNA helix and a globe
 * while the stage title decodes itself and a counter ticks 01 to 04.
 */
export function Process() {
  const reduce = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const morph = useTransform(scrollYProgress, toMorph);
  const [active, setActive] = useState(0);
  useMotionValueEvent(morph, "change", (v) => setActive(Math.round(v)));

  // Clicking a stage name scrolls to it (through Lenis when it's running).
  function jump(i: number) {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + (el.offsetHeight - window.innerHeight) * (i / LAST);
    const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }

  const step = STEPS[active];

  return (
    <section id="process" aria-labelledby="process-title" className="scroll-mt-20 border-t border-line/70">
      {/* The full list, for screen readers and search engines. */}
      <ol className="sr-only">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            Stage {i + 1} of {STEPS.length}: {s.title}. {s.body}
          </li>
        ))}
      </ol>

      <div ref={track} className="relative h-[420vh]">
        <div className="sticky top-0 h-[100dvh] overflow-hidden">
          {/* The particle stage: between the heading and the stage text on phones, the right side on desktop. */}
          <ParticleField
            progress={morph}
            reduce={reduce}
            className="absolute inset-x-0 top-[17%] h-[36%] lg:inset-y-0 lg:left-[38%] lg:right-0 lg:top-0 lg:h-auto"
          />
          {/* Keeps the text readable where it meets the particles. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/0 via-45% to-ink/0 lg:bg-gradient-to-r lg:from-ink lg:via-ink/70 lg:via-35% lg:to-ink/0 lg:to-60%"
          />

          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-between px-4 pb-8 pt-24 sm:px-6 lg:justify-center lg:pb-0 lg:pt-28">
            <div>
              <p className="eyebrow">
                <DecodeText text="How a project runs" />
              </p>
              <h2
                id="process-title"
                className="mt-4 max-w-md font-display text-3xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-4xl"
              >
                Four stages, no surprises.
              </h2>
            </div>

            <div>
              <div aria-hidden className="lg:mt-16">
                {/* Counter: 01 / 04, the current number rolls. */}
                <div className="flex items-baseline gap-3 font-mono text-sm text-muted">
                  <span className="relative inline-flex h-[1.2em] w-[2ch] overflow-hidden text-live">
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.span
                        key={active}
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "-100%", opacity: 0 }}
                        transition={instant(reduce, { duration: 0.5, ease: EASE })}
                      >
                        {String(active + 1).padStart(2, "0")}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span>/ {String(STEPS.length).padStart(2, "0")}</span>
                  <span className="ml-3 hidden text-[11px] uppercase tracking-[0.2em] text-muted/70 sm:inline">
                    fig. <DecodeText key={step.figure} text={step.figure} speed={22} />
                  </span>
                </div>

                <p className="mt-2 font-display text-5xl font-medium tracking-[-0.04em] sm:text-7xl lg:mt-3 lg:text-8xl">
                  <DecodeText key={step.title} text={step.title} speed={45} />
                </p>

                <div className="relative mt-3 min-h-[6.5rem] max-w-md lg:mt-5 lg:min-h-[7.5rem]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={active}
                      className="text-base leading-relaxed text-muted sm:text-lg"
                      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                      transition={instant(reduce, { duration: 0.45, ease: EASE })}
                    >
                      {step.body}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* Stage rail: where you are, and a way to jump. */}
              <div aria-hidden className="pointer-events-auto mt-5 flex max-w-md gap-2 lg:mt-14">
                {STEPS.map((s, i) => (
                  <button
                    key={s.title}
                    type="button"
                    tabIndex={-1}
                    onClick={() => jump(i)}
                    className="group flex-1 text-left"
                  >
                    <span className="block h-px overflow-hidden bg-line">
                      <span
                        className={
                          "block h-full origin-left bg-live transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] " +
                          (i <= active ? "scale-x-100" : "scale-x-0")
                        }
                      />
                    </span>
                    <span
                      className={
                        "mt-2 block font-mono text-[11px] uppercase tracking-[0.14em] transition-colors " +
                        (i === active ? "text-text" : "text-muted/60 group-hover:text-muted")
                      }
                    >
                      {s.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

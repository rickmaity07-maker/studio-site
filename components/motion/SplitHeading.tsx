"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useIntroDone } from "./Intro";
import { EASE } from "./Reveal";

type Tag = "h1" | "h2" | "h3";

/**
 * Headline whose words rise into place from behind a mask, one after
 * another, the first time it scrolls into view. Pass `lines` to control
 * where the line breaks fall; each line is a string.
 */
export function SplitHeading({
  lines,
  as: As = "h2",
  className = "",
  accent,
  delay = 0,
  immediate = false
}: {
  lines: string[];
  as?: Tag;
  className?: string;
  /** A word to colour mint. */
  accent?: string;
  delay?: number;
  /** Animate on mount (above the fold) instead of on scroll. */
  immediate?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotion();
  const introDone = useIntroDone();
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const show = reduce || (introDone && (immediate || inView));
  let i = 0;

  return (
    <As ref={ref} className={className}>
      <span className="sr-only">{lines.join(" ")}</span>
      <span aria-hidden>
        {lines.map((line, li) => (
          <span key={li} className="block">
            {line.split(" ").map((word, wi) => {
              const n = i++;
              return (
                <span key={wi} className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                  <motion.span
                    className={"inline-block " + (accent && word.replace(/[.,]/g, "") === accent ? "text-live" : "")}
                    initial={reduce ? false : { y: "110%", rotate: 4 }}
                    animate={show ? { y: 0, rotate: 0 } : undefined}
                    transition={{ duration: 0.95, delay: delay + n * 0.06, ease: EASE }}
                  >
                    {word}
                  </motion.span>
                  {" "}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </As>
  );
}

"use client";

import { useRef } from "react";
import { useInView } from "motion/react";
import { ScrambleText } from "@/components/unlumen-ui/scramble-text";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

/** Code and maths symbols the text decodes through. */
export const CODE_GLYPHS = "{}[]<>/\\=;:01∑∂λΔπ∫√≈#$%&*+";

/**
 * Text that decodes itself, character by character, through code and
 * maths symbols the first time it scrolls into view (or whenever `text`
 * changes). Uses Unlumen UI's Scramble Text. Plain text with reduced motion.
 */
export function DecodeText({
  text,
  speed = 32,
  className,
  delay = 0
}: {
  text: string;
  speed?: number;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  return (
    <span ref={ref} className={className}>
      {reduce ? (
        text
      ) : inView ? (
        <ScrambleText
          key={text}
          text={text}
          delay={delay}
          scrambleSpeed={speed}
          scrambledLetterCount={3}
          characters={CODE_GLYPHS}
          scrambledClassName="text-live"
        />
      ) : (
        // Holds the space until it decodes; read by screen readers meanwhile.
        <span className="opacity-0">{text}</span>
      )}
    </span>
  );
}

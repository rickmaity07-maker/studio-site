"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/utils";

// Same feel as SmoothUI's Digit Roll (smoothui.dev/docs/components/digit-roll):
// a short, barely-bouncy spring per character.
const SPRING = { type: "spring" as const, bounce: 0.1, duration: 0.45 };
const ROLL = "0.9em";

/** First number in a price string, e.g. "€1,850 - €2,800" -> 1850. */
function firstNumber(text: string) {
  const m = text.replace(/[\s,.  ]/g, "").match(/\d+/);
  return m ? Number(m[0]) : 0;
}

/**
 * Text whose digits roll to their new value when it changes: up when the
 * number grows, down when it shrinks. Other characters cross-fade.
 * Built on SmoothUI's Digit Roll slot, made read-only for price display.
 *
 * Screen readers (and tests, via `testId`) get the plain text; the
 * animated characters are hidden from them.
 */
export function RollingText({ text, testId, className }: { text: string; testId?: string; className?: string }) {
  const reduce = useReducedMotion();
  const prev = useRef(text);
  const dir = firstNumber(text) >= firstNumber(prev.current) ? 1 : -1;
  useEffect(() => {
    prev.current = text;
  }, [text]);

  const chars = text.split("");
  return (
    <span className={cn("relative inline-flex", className)}>
      <span className="sr-only" data-testid={testId}>
        {text}
      </span>
      <span aria-hidden className="inline-flex">
        {chars.map((ch, i) => {
          // Key slots from the right, so units stay put when "€950" becomes "€1,300".
          const slot = chars.length - i;
          const digit = /\d/.test(ch);
          return (
            <span key={slot} className="relative inline-block overflow-hidden">
              {/* Invisible copy sizes the slot; the animated copy sits on top. */}
              <span className="invisible whitespace-pre">{ch}</span>
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={ch}
                  className="absolute inset-0 whitespace-pre text-center"
                  initial={reduce ? false : { opacity: 0, y: digit ? `calc(${ROLL} * ${dir})` : 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: digit ? `calc(${ROLL} * ${-dir})` : 0 }}
                  transition={reduce ? { duration: 0 } : { ...SPRING, delay: Math.min(i, 8) * 0.025 }}
                >
                  {ch}
                </motion.span>
              </AnimatePresence>
            </span>
          );
        })}
      </span>
    </span>
  );
}

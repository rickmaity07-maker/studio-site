"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { instant, useReducedMotion } from "@/components/motion/useReducedMotion";

const COPY = {
  de: { cta: "Tisch reservieren", hours: "Heute geöffnet bis 23 Uhr" },
  en: { cta: "Book a table", hours: "Open today until 11 pm" }
} as const;

type Lang = keyof typeof COPY;

/** A miniature of the language switch the client sites use. */
export function LanguageToggle() {
  const [lang, setLang] = useState<Lang>("de");
  const reduce = useReducedMotion();
  const t = COPY[lang];

  return (
    <div className="rounded-xl border border-line bg-ink p-5">
      <div className="flex items-center justify-between gap-4">
        <div role="radiogroup" aria-label="Language" className="relative flex rounded-full border border-line p-1">
          {(Object.keys(COPY) as Lang[]).map((l) => (
            <button
              key={l}
              role="radio"
              aria-checked={lang === l}
              onClick={() => setLang(l)}
              className={
                "relative z-10 rounded-full px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.1em] transition-colors " +
                (lang === l ? "text-ink" : "text-muted hover:text-text")
              }
            >
              {lang === l && (
                <motion.span
                  layoutId="lang-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-live"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 min-h-[5.5rem]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={lang}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={instant(reduce, { duration: 0.25 })}
          >
            <p className="text-sm text-muted">{t.hours}</p>
            <span className="mt-3 inline-flex rounded-full bg-text px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.1em] text-ink">
              {t.cta}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

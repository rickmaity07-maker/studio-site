"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import type { Project, ProjectCategory } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";
import { EASE } from "./motion/Reveal";

// With all 13 showing on large screens, cards 0 and 8 span two columns:
// rows of [wide + 1], [3], [3], [wide + 1], [3] fill five rows with no gaps.
const WIDE = new Set([0, 8]);

export function WorkGrid({
  projects,
  categories
}: {
  projects: Project[];
  categories: ProjectCategory[];
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<ProjectCategory | "All">("All");
  const filtered = active === "All" ? projects : projects.filter((p) => p.category === active);
  const count = (c: ProjectCategory | "All") =>
    c === "All" ? projects.length : projects.filter((p) => p.category === c).length;
  const useWide = active === "All" && projects.length === 13;

  return (
    <LayoutGroup>
      <div role="tablist" aria-label="Filter by industry" className="flex flex-wrap gap-2">
        {(["All", ...categories] as const).map((c) => {
          const on = active === c;
          return (
            <button
              key={c}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(c)}
              className={
                "relative rounded-full border px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] transition-colors " +
                (on ? "border-transparent text-ink" : "border-line text-muted hover:border-live/30 hover:text-text")
              }
            >
              {on && (
                <motion.span
                  layoutId="work-filter"
                  className="absolute inset-0 -z-10 rounded-full bg-live"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">
                {c} <span className={on ? "text-ink/60" : "text-muted/60"}>{count(c)}</span>
              </span>
            </button>
          );
        })}
      </div>

      <motion.ul layout={!reduce} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((p, i) => (
            <motion.li
              key={p.slug}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, ease: EASE }}
              className={useWide && WIDE.has(i) ? "lg:col-span-2" : ""}
            >
              <ProjectCard project={p} wide={useWide && WIDE.has(i)} priority={i < 3} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </LayoutGroup>
  );
}

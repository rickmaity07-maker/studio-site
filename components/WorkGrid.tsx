"use client";

import { useEffect, useRef, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { instant, useReducedMotion } from "@/components/motion/useReducedMotion";
import type { Project, ProjectCategory } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";
import { EASE } from "./motion/Reveal";
import { useIntroDone } from "./motion/Intro";

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
  const introDone = useIntroDone();
  // Only the first render cascades; filtering afterwards animates instantly.
  const [first, setFirst] = useState(true);
  useEffect(() => {
    if (!introDone) return;
    const t = setTimeout(() => setFirst(false), 1200);
    return () => clearTimeout(t);
  }, [introDone]);
  const [active, setActive] = useState<ProjectCategory | "All">("All");
  const [query, setQuery] = useState("");
  const search = useRef<HTMLInputElement>(null);
  const q = query.trim().toLowerCase();
  const filtered = projects.filter(
    (p) =>
      (active === "All" || p.category === active) &&
      (!q || [p.name, p.tagline, p.category, p.description, ...p.stack].join(" ").toLowerCase().includes(q))
  );

  // "/" jumps to the search box, like most sites with search.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) {
        e.preventDefault();
        search.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const count = (c: ProjectCategory | "All") =>
    c === "All" ? projects.length : projects.filter((p) => p.category === c).length;
  const useWide = active === "All" && !q && projects.length === 13;

  return (
    <LayoutGroup>
      <div className="flex flex-col-reverse gap-4 lg:flex-row lg:items-center lg:justify-between">
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

      <label className="relative block w-full lg:w-80">
        <span className="sr-only">Search projects</span>
        <MagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          ref={search}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, industry or stack"
          className="input rounded-full !py-2.5 !pl-11 !pr-16"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-white/5 hover:text-text"
          >
            <X weight="bold" className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 font-mono text-[11px] text-muted lg:block">/</kbd>
        )}
      </label>
      </div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-muted" role="status">
          Nothing matches &ldquo;{query}&rdquo;. Try a business type like &ldquo;bar&rdquo; or a tool like &ldquo;Postgres&rdquo;.
        </p>
      )}

      <motion.ul layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={introDone ? { opacity: 1, y: 0, scale: 1 } : undefined}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={instant(reduce, { duration: 0.7, delay: first ? Math.min(i * 0.06, 0.5) : 0, ease: EASE })}
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

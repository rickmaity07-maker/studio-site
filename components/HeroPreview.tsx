"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/data/projects";
import { LiveDot } from "./LiveDot";

export function HeroPreview({ projects }: { projects: Project[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % projects.length), 3400);
    return () => clearInterval(t);
  }, [projects.length]);

  const project = projects[i];

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex items-center gap-3 border-b border-line/70 bg-surface2 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/70" />
        </div>
        <div className="flex flex-1 items-center rounded-md border border-line bg-ink px-3 py-1 font-mono text-[12px] text-muted">
          <AnimatePresence mode="wait">
            <motion.span
              key={project.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="truncate"
            >
              {project.liveUrl
                ? project.liveUrl.replace(/^https?:\/\//, "")
                : `${project.slug}.build`}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <Link href={`/work/${project.slug}`} className="block">
        <div className="relative h-64 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col justify-end p-6"
              style={{
                background: `linear-gradient(160deg, ${project.accent}33 0%, #0B0D12 75%)`
              }}
            >
              {project.image && (
                <>
                  <Image
                    src={project.image.url}
                    alt=""
                    fill
                    sizes="448px"
                    className="object-cover object-top"
                    priority={i === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
                </>
              )}
              <span className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                {project.category}
              </span>
              <h3 className="relative mt-1 font-display text-2xl">{project.name}</h3>
              <p className="relative mt-1 text-sm text-muted">{project.tagline}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </Link>

      <div className="flex items-center justify-between border-t border-line/70 bg-surface2 px-4 py-2.5">
        <LiveDot live={Boolean(project.liveUrl)} />
        <div className="flex gap-1.5">
          {projects.map((p, idx) => (
            <button
              key={p.slug}
              aria-label={`Show ${p.name}`}
              onClick={() => setI(idx)}
              className={
                "h-1.5 w-4 rounded-full transition " +
                (idx === i ? "bg-live" : "bg-line")
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

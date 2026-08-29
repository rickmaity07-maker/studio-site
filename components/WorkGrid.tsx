"use client";

import { useState } from "react";
import type { Project, ProjectCategory } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";

export function WorkGrid({
  projects,
  categories
}: {
  projects: Project[];
  categories: ProjectCategory[];
}) {
  const [active, setActive] = useState<ProjectCategory | "All">("All");
  const filtered =
    active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(["All", ...categories] as const).map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={
              "rounded-full border px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.08em] transition " +
              (active === c
                ? "border-live/50 bg-live/10 text-live"
                : "border-line text-muted hover:border-live/30 hover:text-text")
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </div>
  );
}

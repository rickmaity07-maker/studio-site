import Link from "next/link";
import type { Project } from "@/data/projects";
import { LiveDot } from "./LiveDot";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition duration-300 hover:-translate-y-1 hover:border-line/0"
      style={{ boxShadow: undefined }}
    >
      <div
        className="relative flex aspect-[4/3] items-end overflow-hidden p-5"
        style={{
          background: `linear-gradient(155deg, ${project.accent}26 0%, #0B0D12 70%)`
        }}
      >
        <div
          className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl transition group-hover:opacity-50"
          style={{ background: project.accent }}
        />
        <div className="relative flex w-full items-center justify-between rounded-lg border border-line/70 bg-ink/60 px-3 py-2 backdrop-blur">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
          </div>
          <span className="truncate font-mono text-[11px] text-muted">
            {project.liveUrl
              ? project.liveUrl.replace(/^https?:\/\//, "")
              : `${project.slug}.build`}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg leading-tight">{project.name}</h3>
            <p className="mt-0.5 text-sm text-muted">{project.tagline}</p>
          </div>
          <LiveDot live={Boolean(project.liveUrl)} />
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
          <span className="text-text/70">{project.category}</span>
          <span aria-hidden>·</span>
          <span>{project.year}</span>
        </div>
      </div>
    </Link>
  );
}

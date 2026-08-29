import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projects, getProject } from "@/data/projects";
import { DemoFrame } from "@/components/DemoFrame";
import { LiveDot } from "@/components/LiveDot";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params
}: {
  params: { slug: string };
}): Metadata {
  const project = getProject(params.slug);
  if (!project) return {};
  return {
    title: `${project.name} — Rick.build`,
    description: project.tagline
  };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  if (!project) notFound();

  const currentIndex = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(currentIndex + 1) % projects.length];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/work"
        className="font-mono text-[12px] uppercase tracking-[0.1em] text-muted transition hover:text-live"
      >
        ← All work
      </Link>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">
            {project.category} · {project.year}
          </p>
          <h1 className="mt-2 font-display text-4xl">{project.name}</h1>
          <p className="mt-2 text-lg text-muted">{project.tagline}</p>
        </div>
        <LiveDot live={Boolean(project.liveUrl)} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.stack.map((s) => (
          <span
            key={s}
            className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-muted"
          >
            {s}
          </span>
        ))}
      </div>

      <p className="mt-6 max-w-2xl leading-relaxed text-text/85">
        {project.description}
      </p>

      <div className="mt-10">
        <DemoFrame project={project} />
      </div>

      <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl border border-line bg-surface p-8 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl">Want something like this?</h2>
          <p className="mt-1 max-w-md text-sm text-muted">
            Tell me about your business and I&apos;ll put together something
            built for it — not a copy of this one.
          </p>
        </div>
        <Link
          href={`/request?ref=${project.slug}`}
          className="shrink-0 rounded-full bg-live px-6 py-3 font-mono text-[13px] uppercase tracking-[0.1em] text-ink transition hover:bg-live/90"
        >
          Request this style
        </Link>
      </div>

      <Link
        href={`/work/${next.slug}`}
        className="mt-10 flex items-center justify-between rounded-xl border border-line px-6 py-4 transition hover:border-live/40"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
          Next project
        </span>
        <span className="font-display text-lg">{next.name} →</span>
      </Link>
    </section>
  );
}

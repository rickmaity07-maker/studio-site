import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getProjectBySlug, getProjects } from "@/lib/server/projects";
import { DemoFrame } from "@/components/DemoFrame";
import { LiveDot } from "@/components/LiveDot";
import { Reveal } from "@/components/motion/Reveal";
import { MagneticButton } from "@/components/motion/MagneticButton";

// Projects added in the admin portal after a deploy still render on demand.
export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.tagline,
    openGraph: project.image ? { images: [project.image.url] } : undefined
  };
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  const currentIndex = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(currentIndex + 1) % projects.length];
  const host = project.liveUrl?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <article className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:pt-14">
      <Link
        href="/work"
        className="group inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.1em] text-muted transition hover:text-live"
      >
        <ArrowLeft weight="bold" className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" aria-hidden />
        All work
      </Link>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
        <Reveal>
          <h1 className="font-display text-5xl font-medium leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
            {project.name}
          </h1>
          <p className="mt-4 text-xl text-muted">{project.tagline}</p>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-text/85">{project.description}</p>
        </Reveal>

        {/* The facts, as a quiet column rather than a row of badges. */}
        <Reveal delay={0.1}>
          <dl className="grid gap-6 border-t border-line pt-6 lg:mt-3">
            <Fact label="Status">
              <LiveDot live={Boolean(project.liveUrl)} />
            </Fact>
            <Fact label="Industry">{project.category}</Fact>
            <Fact label="Year">{project.year}</Fact>
            <Fact label="Built with">
              <span className="flex flex-wrap gap-1.5">
                {project.stack.map((s) => (
                  <span key={s} className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-muted">
                    {s}
                  </span>
                ))}
              </span>
            </Fact>
          </dl>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="group mt-8 inline-flex items-center gap-3 rounded-full border border-line px-5 py-3 font-mono text-[12px] uppercase tracking-[0.1em] transition hover:border-live hover:text-live"
            >
              Visit {host}
              <ArrowUpRight weight="bold" className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </a>
          )}
        </Reveal>
      </div>

      <Reveal className="mt-16" y={40}>
        <DemoFrame project={project} />
      </Reveal>

      <Reveal className="mt-20">
        <div className="flex flex-col items-start justify-between gap-8 border-y border-line py-12 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl font-medium tracking-[-0.02em] sm:text-4xl">Want something like this?</h2>
            <p className="mt-3 max-w-md text-muted">
              Tell me about your business and I&apos;ll put together something built for it, not a copy of this one.
            </p>
          </div>
          <MagneticButton href={`/request?ref=${project.slug}`}>Request this style</MagneticButton>
        </div>
      </Reveal>

      {/* The next project, as a large panel built from its own screenshot. */}
      {next && next.slug !== project.slug && (
        <Reveal className="mt-20">
          <Link
            href={`/work/${next.slug}`}
            className="group relative block overflow-hidden rounded-2xl border border-line"
            style={{ background: `linear-gradient(155deg, ${next.accent}40 0%, #0B0D12 72%)` }}
          >
            {next.image && (
              <Image
                src={next.image.url}
                alt=""
                fill
                sizes="(min-width: 1280px) 1232px, 100vw"
                className="object-cover object-top opacity-40 transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-60"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/10" />
            <div className="relative flex min-h-[280px] flex-col justify-end gap-3 p-8 sm:min-h-[340px] sm:p-12">
              <span className="font-mono text-[12px] uppercase tracking-[0.15em] text-muted">Next project</span>
              <span className="flex items-center gap-4 font-display text-4xl font-medium tracking-[-0.03em] transition-colors group-hover:text-live sm:text-6xl">
                {next.name}
                <ArrowRight weight="bold" className="h-8 w-8 shrink-0 transition-transform duration-500 group-hover:translate-x-2 sm:h-10 sm:w-10" aria-hidden />
              </span>
              <span className="text-muted">{next.tagline}</span>
            </div>
          </Link>
        </Reveal>
      )}
    </article>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] items-start gap-4">
      <dt className="pt-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="text-text/90">{children}</dd>
    </div>
  );
}

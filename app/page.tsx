import Link from "next/link";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { HeroPreview } from "@/components/HeroPreview";
import { ProcessSteps } from "@/components/ProcessSteps";

export default function Home() {
  const featured = projects.filter((p) => p.featured).slice(0, 5);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pt-24">
        <div>
          <p className="eyebrow">Web development studio · Schweinfurt</p>
          <h1 className="mt-4 text-balance font-display text-4xl leading-[1.08] sm:text-5xl">
            Websites you can actually click through, not just look at.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            Every project below is a real, working build — open it, click
            around, book a table, add something to a cart. Then tell me what
            your business needs, and I&apos;ll build the same for you.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/work"
              className="rounded-full bg-live px-6 py-3 font-mono text-[13px] uppercase tracking-[0.1em] text-ink transition hover:bg-live/90"
            >
              See the work
            </Link>
            <Link
              href="/request"
              className="rounded-full border border-line px-6 py-3 font-mono text-[13px] uppercase tracking-[0.1em] text-text transition hover:border-live/50 hover:text-live"
            >
              Start a project
            </Link>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroPreview projects={featured} />
        </div>
      </section>

      {/* Value props */}
      <section className="border-y border-line/70 bg-surface/40">
        <div className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-none sm:grid-cols-3">
          {[
            {
              t: "Live, not static",
              d: "Every demo is the actual product, embedded and clickable — not a screenshot pretending to be one."
            },
            {
              t: "Production-grade",
              d: "Firebase, security rules, and data handling built to hold up in front of real customers from day one."
            },
            {
              t: "Built to grow",
              d: "New pages, features, or a full redesign — the same site, extended, not rebuilt from zero."
            }
          ].map((v) => (
            <div key={v.t} className="px-6 py-10">
              <h3 className="font-display text-lg">{v.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured work */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 className="mt-2 font-display text-3xl">A few builds worth clicking into</h2>
          </div>
          <Link
            href="/work"
            className="hidden shrink-0 font-mono text-[12px] uppercase tracking-[0.1em] text-muted transition hover:text-live sm:block"
          >
            View all →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>

        <Link
          href="/work"
          className="mt-8 inline-block font-mono text-[12px] uppercase tracking-[0.1em] text-muted transition hover:text-live sm:hidden"
        >
          View all →
        </Link>
      </section>

      {/* Process */}
      <section id="process" className="mx-auto max-w-6xl px-6 pb-20">
        <p className="eyebrow">How a project runs</p>
        <h2 className="mt-2 font-display text-3xl">Four stages, no surprises</h2>
        <div className="mt-10">
          <ProcessSteps />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-line bg-surface p-10 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl">Have a business that needs a site?</h2>
            <p className="mt-2 max-w-md text-muted">
              Tell me what it needs to do, and I&apos;ll follow the same
              process shown above — you&apos;ll get a working demo before
              anything goes live.
            </p>
          </div>
          <Link
            href="/request"
            className="shrink-0 rounded-full bg-live px-6 py-3 font-mono text-[13px] uppercase tracking-[0.1em] text-ink transition hover:bg-live/90"
          >
            Start a project
          </Link>
        </div>
      </section>
    </div>
  );
}

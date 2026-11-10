import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { DecodeText } from "@/components/science/DecodeText";
import { SECTORS } from "@/data/sectors";
import type { Project } from "@/data/projects";

/** One tile per kind of business, each opening its /for page. */
export function SectorGrid({ projects }: { projects: Project[] }) {
  const bySlug = new Map(projects.map((p) => [p.slug, p]));

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SECTORS.map((s, i) => {
        const builds = s.projects.map((slug) => bySlug.get(slug)).filter((p) => p !== undefined);
        const cover = builds.find((p) => p.image);
        return (
          <li
            key={s.slug}
            // First tile is tall; the last one spans two columns so the grid ends flush.
            className={i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : i === SECTORS.length - 1 ? "lg:col-span-2" : ""}
          >
            <Link
              href={`/for/${s.slug}`}
              className="group relative flex h-full min-h-[220px] flex-col justify-end overflow-hidden rounded-2xl border border-line bg-surface p-6 transition hover:border-live/50"
              data-testid="sector"
            >
              {cover?.image && (
                <>
                  <Image
                    src={cover.image.url}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-top opacity-35 transition duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-50"
                  />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/10" />
                </>
              )}
              <span className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-ink/40 text-text backdrop-blur transition group-hover:border-live group-hover:bg-live group-hover:text-ink">
                <ArrowUpRight weight="bold" className="h-4 w-4" aria-hidden />
              </span>
              <span className="relative font-mono text-[11px] uppercase tracking-[0.14em] text-live">
                {builds.length} live {builds.length === 1 ? "build" : "builds"}
              </span>
              <span className="relative mt-2 font-display text-2xl font-medium leading-tight">{s.name}</span>
              <span className="relative mt-1.5 line-clamp-2 max-w-sm text-sm leading-relaxed text-muted">{s.needs[0]}.</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Home page section: "Built for your kind of business". */
export function Sectors({ projects }: { projects: Project[] }) {
  return (
    <section aria-label="Who it's for" className="border-t border-line/70">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">
              <DecodeText text="Who it's for" />
            </p>
            <SplitHeading
              lines={["Built for your", "kind of business."]}
              className="mt-4 max-w-xl font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-5xl"
            />
          </div>
          <Link href="/features" className="font-mono text-[12px] uppercase tracking-[0.1em] text-muted transition hover:text-text">
            Every feature →
          </Link>
        </div>
        <Reveal delay={0.08} className="mt-12">
          <SectorGrid projects={projects} />
        </Reveal>
      </div>
    </section>
  );
}

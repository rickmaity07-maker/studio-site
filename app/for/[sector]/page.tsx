import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { ProjectCard } from "@/components/ProjectCard";
import { ClosingBand, List, PageHero, Section, primaryButton, quietLink } from "@/components/PageSection";
import { CountryPicker, CountryProvider, MockupLink, PriceMenu, Validity } from "@/components/pricing/CountryPrices";
import { getProjects } from "@/lib/server/projects";
import { pickCountry } from "@/lib/pricing";
import { SECTORS, getSector } from "@/data/sectors";
import { TIERS, featuresForSector } from "@/data/features";

type Props = { params: Promise<{ sector: string }>; searchParams: Promise<{ country?: string | string[] }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const sector = getSector((await props.params).sector);
  if (!sector) return {};
  const title = `Websites for ${sector.name.toLowerCase()}`;
  return {
    title,
    description: sector.intro,
    alternates: { canonical: `/for/${sector.slug}` },
    openGraph: { title: `${title} | rira.build`, description: sector.intro }
  };
}

export default async function SectorPage(props: Props) {
  const sector = getSector((await props.params).sector);
  if (!sector) notFound();
  const searchParams = await props.searchParams;
  const h = await headers();
  const initial = pickCountry({
    query: searchParams.country,
    ipCountry: h.get("x-vercel-ip-country"),
    acceptLanguage: h.get("accept-language")
  });

  const all = await getProjects();
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  const projects = sector.projects.map((s) => bySlug.get(s)).filter((p) => p !== undefined);
  const features = featuresForSector(sector.slug).slice(0, 9);
  const others = SECTORS.filter((s) => s.slug !== sector.slug);

  return (
    <CountryProvider initial={initial}>
      <PageHero eyebrow={sector.name} lines={sector.lines} intro={sector.intro}>
        <MockupLink sector={sector.slug} className={primaryButton}>
          Request a free mock-up
          <ArrowUpRight weight="bold" className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </MockupLink>
        {projects.length > 0 && (
          <a href="#work" className={quietLink}>
            See {projects.length} live {projects.length === 1 ? "build" : "builds"}
          </a>
        )}
      </PageHero>

      <Section eyebrow="What it needs" title={["What a good site", "does for you."]}>
        <List items={sector.needs} mark="text-live" />
      </Section>

      {projects.length > 0 && (
        <Section
          id="work"
          wide
          eyebrow="Live builds"
          title={["Built for businesses", "like yours."]}
          intro="Real sites, live right now. Open any of them on your phone."
        >
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li key={p.slug}>
                <ProjectCard project={p} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section eyebrow="Features" title={["What's in it", "for you."]} intro="The features that matter most here. Every website includes the basics; the rest is quoted with your project.">
        <ul className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <li key={f.id} className="rounded-2xl border border-line bg-surface/60 p-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-live">{TIERS[f.tier].label}</span>
              <h3 className="mt-2 font-display text-lg font-medium leading-snug">{f.name}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{f.body}</p>
            </li>
          ))}
        </ul>
        <Link href={`/features?for=${sector.slug}`} className={quietLink + " mt-8 inline-block"}>
          All features for {sector.short.toLowerCase()} →
        </Link>
      </Section>

      <Section eyebrow="Price" title={["A fixed price,", "in your currency."]}>
        <div className="grid gap-8">
          <CountryPicker />
          <PriceMenu />
          <p className="text-sm text-muted">
            <Validity />{" "}
            <Link href="/estimate" className="text-text underline underline-offset-4 transition hover:text-live">
              Plan the full cost with care
            </Link>
            .
          </p>
        </div>
      </Section>

      <section className="border-t border-line/70">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="eyebrow">Other kinds of business</p>
          <ul className="mt-5 flex flex-wrap gap-3">
            {others.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/for/${s.slug}`}
                  className="inline-flex rounded-full border border-line px-4 py-2 text-sm text-text/85 transition hover:border-live/60 hover:text-live"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ClosingBand lines={["Start with a", "free mock-up."]} body="A design of your homepage within 2 to 3 days. If you don't like it, you owe nothing.">
        <MockupLink sector={sector.slug} className={primaryButton}>
          Request a free mock-up
          <ArrowUpRight weight="bold" className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </MockupLink>
      </ClosingBand>
    </CountryProvider>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { FeatureExplorer } from "@/components/features/FeatureExplorer";
import { ClosingBand, PageHero, PrimaryLink, quietLink } from "@/components/PageSection";
import { getProjects } from "@/lib/server/projects";
import { FEATURES } from "@/data/features";
import { SECTORS, getSector } from "@/data/sectors";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Everything a rira.build site can include: menus, booking, online orders, several languages, an admin panel and more. Filter by your kind of business.",
  alternates: { canonical: "/features" }
};

export default async function FeaturesPage(props: { searchParams: Promise<{ for?: string }> }) {
  const searchParams = await props.searchParams;
  const projects = await getProjects();
  const names = Object.fromEntries(projects.map((p) => [p.slug, p.name]));
  const initial = getSector(searchParams.for)?.slug;

  return (
    <>
      <PageHero
        eyebrow="Features"
        lines={["Everything your site", "can do."]}
        intro={`${FEATURES.length} features, from the basics every site gets to the extras already running on live client sites. Filter by your kind of business, or by what's included in the price.`}
      >
        <PrimaryLink href="/estimate">Work out the cost</PrimaryLink>
        <Link href="/pricing" className={quietLink}>
          Pricing
        </Link>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:pb-32">
        <FeatureExplorer names={names} initialSector={initial} />
      </section>

      <section className="border-t border-line/70">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <p className="eyebrow">By kind of business</p>
          <ul className="mt-6 flex flex-wrap gap-3">
            {SECTORS.map((s) => (
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

      <ClosingBand
        lines={["Missing something?", "Just ask."]}
        body="If it isn't on this list, it's probably still possible. Describe what you need and you'll get an honest answer and a fixed quote."
      >
        <PrimaryLink href="/request">Ask about a feature</PrimaryLink>
      </ClosingBand>
    </>
  );
}

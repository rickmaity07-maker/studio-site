import type { Metadata } from "next";
import Link from "next/link";
import { SectorGrid } from "@/components/home/Sectors";
import { ClosingBand, PageHero, PrimaryLink, quietLink } from "@/components/PageSection";
import { getProjects } from "@/lib/server/projects";

export const metadata: Metadata = {
  title: "Who it's for",
  description:
    "Websites for restaurants, cafés and bars, takeaways, bakeries, shops, barbers and salons, and local services. See live builds for your kind of business.",
  alternates: { canonical: "/for" }
};

export default async function SectorsPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHero
        eyebrow="Who it's for"
        lines={["Built for your", "kind of business."]}
        intro="Each kind of business needs something different from its website. Pick yours to see live builds, the features that matter and the price in your country."
      >
        <Link href="/features" className={quietLink}>
          Every feature
        </Link>
        <Link href="/estimate" className={quietLink}>
          Cost planner
        </Link>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:pb-32">
        <SectorGrid projects={projects} />
      </section>
      <ClosingBand lines={["Not on the list?", "Still ask."]} body="These are the businesses built for so far, not the limit. Tell me about yours.">
        <PrimaryLink href="/request">Start a project</PrimaryLink>
      </ClosingBand>
    </>
  );
}

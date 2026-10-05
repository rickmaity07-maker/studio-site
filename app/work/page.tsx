import type { Metadata } from "next";
import { CATEGORIES } from "@/data/projects";
import { getProjects } from "@/lib/server/projects";
import { WorkGrid } from "@/components/WorkGrid";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Work",
  description: "Every project, live and clickable."
};

export default async function WorkPage() {
  const projects = await getProjects();
  const categories = CATEGORIES.filter((c) => projects.some((p) => p.category === c));

  return (
    <section className="mx-auto max-w-7xl px-4 pb-28 pt-16 sm:px-6 lg:pt-24">
      <Reveal>
        <h1 className="max-w-3xl font-display text-5xl font-medium leading-[1.04] tracking-[-0.03em] sm:text-6xl">
          Every build, live and clickable.
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-5 max-w-lg text-lg text-muted">
          Bars, restaurants, salons and shops. Filter by industry, then open any of them.
        </p>
      </Reveal>

      <div className="mt-12">
        <WorkGrid projects={projects} categories={categories} />
      </div>
    </section>
  );
}

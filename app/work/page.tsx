import type { Metadata } from "next";
import { CATEGORIES } from "@/data/projects";
import { getProjects } from "@/lib/server/projects";
import { WorkGrid } from "@/components/WorkGrid";

export const metadata: Metadata = {
  title: "Work",
  description: "Every project, live and clickable."
};

export default async function WorkPage() {
  const projects = await getProjects();
  const categories = CATEGORIES.filter((c) => projects.some((p) => p.category === c));

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="eyebrow">All work</p>
      <h1 className="mt-2 font-display text-4xl">Every build, live and clickable</h1>
      <p className="mt-3 max-w-lg text-muted">
        Filter by the kind of business — hospitality, beauty and booking,
        e-commerce — or just browse everything.
      </p>

      <div className="mt-10">
        <WorkGrid projects={projects} categories={categories} />
      </div>
    </section>
  );
}

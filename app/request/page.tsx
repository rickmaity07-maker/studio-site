import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { getProjectBySlug } from "@/lib/server/projects";

export const metadata: Metadata = {
  title: "Start a project",
  description: "Tell me about your business and what your site needs to do."
};

export default async function RequestPage({
  searchParams
}: {
  searchParams: { ref?: string };
}) {
  const refProject = searchParams.ref ? await getProjectBySlug(searchParams.ref) : undefined;

  return (
    <section className="mx-auto grid max-w-5xl gap-12 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="eyebrow">Start a project</p>
        <h1 className="mt-2 font-display text-4xl">Tell me about your business</h1>
        <p className="mt-4 max-w-sm text-muted">
          A few details are enough to get started — no jargon, no obligation.
          I read every request myself and reply within one business day.
        </p>

        <ul className="mt-8 grid gap-4 font-mono text-[13px] text-muted">
          <li className="flex gap-3">
            <span className="text-live">01</span> I&apos;ll follow up with
            questions or a short call.
          </li>
          <li className="flex gap-3">
            <span className="text-live">02</span> You&apos;ll see a working
            demo, like the ones in{" "}
            <a href="/work" className="text-text underline underline-offset-2">
              the work section
            </a>
            , before anything is final.
          </li>
          <li className="flex gap-3">
            <span className="text-live">03</span> Nothing goes live for your
            customers until you approve it.
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <LeadForm projectRef={refProject?.name} />
      </div>
    </section>
  );
}

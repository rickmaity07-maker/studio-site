import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { Reveal } from "@/components/motion/Reveal";
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
    <section className="mx-auto grid max-w-7xl gap-14 px-4 pb-28 pt-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:pt-24">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <Reveal>
          <h1 className="font-display text-5xl font-medium leading-[1.04] tracking-[-0.03em] sm:text-6xl">
            Tell me about your business.
          </h1>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
            A few details are enough to get started. No jargon, no obligation.
            I read every request myself and reply within one business day.
          </p>
        </Reveal>

        <Reveal delay={0.16}>
          <ol className="mt-10 grid gap-5 border-t border-line pt-8">
            {[
              <>I&apos;ll follow up with questions or a short call.</>,
              <>
                You&apos;ll see a working demo, like the ones in{" "}
                <Link href="/work" className="text-text underline underline-offset-4 transition hover:text-live">
                  the work section
                </Link>
                , before anything is final.
              </>,
              <>Nothing goes live for your customers until you approve it.</>
            ].map((item, i) => (
              <li key={i} className="grid grid-cols-[2rem_1fr] gap-3 text-muted">
                <span className="pt-0.5 font-mono text-[13px] text-live">{String(i + 1).padStart(2, "0")}</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-10">
          <LeadForm projectRef={refProject?.name} />
        </div>
      </Reveal>
    </section>
  );
}

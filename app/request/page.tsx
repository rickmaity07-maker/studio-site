import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { getProjectBySlug } from "@/lib/server/projects";
import { PRICES, isCountry } from "@/lib/pricing";
import { describePlan } from "@/lib/estimate";
import { getSector } from "@/data/sectors";

export const metadata: Metadata = {
  title: "Start a project",
  description:
    "Request a free website mock-up. Tell me about your business and what your site needs to do; you get a reply within one business day, with no obligation.",
  alternates: { canonical: "/request" }
};

export default async function RequestPage(props: { searchParams: Promise<{ ref?: string; mockup?: string; sector?: string; plan?: string }> }) {
  const searchParams = await props.searchParams;
  const refProject = searchParams.ref ? await getProjectBySlug(searchParams.ref) : undefined;
  // From the pricing page's "Request a free mock-up": note which prices they saw.
  const mockup = isCountry(searchParams.mockup) ? `Free mock-up (prices for ${PRICES[searchParams.mockup.toLowerCase()].name})` : undefined;
  // From a /for page or the cost planner: only known values make it into the note.
  const sector = getSector(searchParams.sector)?.name;
  const plan = describePlan(searchParams.plan);
  const note = [refProject?.name ?? mockup, sector, plan].filter(Boolean).join(" · ").slice(0, 120) || undefined;

  return (
    <section className="mx-auto grid max-w-7xl gap-14 px-4 pb-28 pt-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:pt-24">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <SplitHeading
          as="h1"
          immediate
          lines={["Tell me about", "your business."]}
          className="font-display text-5xl font-medium leading-[1.04] tracking-[-0.03em] sm:text-6xl"
        />
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
          <LeadForm projectRef={note} />
        </div>
      </Reveal>
    </section>
  );
}

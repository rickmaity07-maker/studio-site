import type { Metadata } from "next";
import Link from "next/link";
import { FaqSearch } from "@/components/faq/FaqSearch";
import { ClosingBand, PageHero, PrimaryLink, quietLink } from "@/components/PageSection";
import { FAQ } from "@/data/faq";

export const metadata: Metadata = {
  title: "Questions",
  description: "Straight answers on timelines, payment, ownership, languages, care plans and what happens after launch.",
  alternates: { canonical: "/faq" }
};

// FAQ rich results for search engines. "<" is escaped so the JSON can't close the script tag.
const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
}).replace(/</g, "\\u003c");

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <PageHero
        eyebrow="Questions"
        lines={["Questions,", "answered straight."]}
        intro="Timelines, payment, who owns what, and what happens after launch. Search, or filter by topic."
      >
        <Link href="/estimate" className={quietLink}>
          Cost planner
        </Link>
        <Link href="/pricing" className={quietLink}>
          Pricing
        </Link>
      </PageHero>
      <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:pb-32">
        <FaqSearch />
      </section>
      <ClosingBand lines={["Still wondering", "about something?"]} body="Ask it in a request. You'll get a reply within one business day, with no obligation.">
        <PrimaryLink href="/request">Ask a question</PrimaryLink>
      </ClosingBand>
    </>
  );
}

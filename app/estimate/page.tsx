import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { CountryProvider } from "@/components/pricing/CountryPrices";
import { Planner } from "@/components/estimate/Planner";
import { PageHero, quietLink } from "@/components/PageSection";
import { pickCountry } from "@/lib/pricing";
import { isBuild } from "@/lib/estimate";

export const metadata: Metadata = {
  title: "Cost planner",
  description:
    "Work out what a website or online shop costs in your country: the one-off price, an optional care plan, and the total over one and three years.",
  alternates: { canonical: "/estimate" }
};

export default async function EstimatePage(props: { searchParams: Promise<{ country?: string | string[]; type?: string }> }) {
  const searchParams = await props.searchParams;
  const h = await headers();
  const initial = pickCountry({
    query: searchParams.country,
    ipCountry: h.get("x-vercel-ip-country"),
    acceptLanguage: h.get("accept-language")
  });

  return (
    <CountryProvider initial={initial}>
      <PageHero
        eyebrow="Cost planner"
        lines={["What will it cost,", "really?"]}
        intro="Pick your country, what you need and whether you want care after launch. You'll see the one-off price, the monthly cost and what it adds up to over one and three years. No hidden extras."
      >
        <Link href="/pricing" className={quietLink}>
          Full price list
        </Link>
        <Link href="/features" className={quietLink}>
          What&apos;s included
        </Link>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:pb-36">
        <Planner initialBuild={isBuild(searchParams.type) ? searchParams.type : undefined} />
      </section>
    </CountryProvider>
  );
}

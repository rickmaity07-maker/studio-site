import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import {
  CarePlans,
  CountryName,
  CountryPicker,
  CountryProvider,
  MockupLink,
  PriceCompare,
  PriceMenu,
  Validity
} from "@/components/pricing/CountryPrices";
import { getProjects } from "@/lib/server/projects";
import { DecodeText } from "@/components/science/DecodeText";
import { pickCountry } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Fixed prices for a website or online shop in your country, with a free mock-up first, your own admin panel, and optional monthly care plans.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing | rira.build",
    description: "Local prices for a custom website or shop. Free mock-up first, pay the rest once you've seen it working."
  }
};

const COMPARE: { what: string; me: string; diy: Cell; free: Cell; agency: Cell }[] = [
  { what: "Free design mock-up before you pay", me: "Yes", diy: ["no", "No"], free: ["part", "Rarely"], agency: ["part", "Sometimes, as a paid pitch"] },
  { what: "Design made around your venue, not a template", me: "Yes", diy: ["no", "Template"], free: ["part", "Often a template"], agency: ["yes", "Yes"] },
  { what: "Admin panel to edit menu, prices and photos yourself", me: "Yes, included", diy: ["yes", "Yes"], free: ["part", "Sometimes"], agency: ["part", "Often extra"] },
  { what: "You see the finished site working before paying in full", me: "Yes, on a preview link", diy: ["no", "n/a"], free: ["part", "Varies"], agency: ["part", "Varies"] },
  { what: "Fixed price agreed up front", me: "Yes", diy: ["yes", "Monthly plan"], free: ["part", "Often hourly"], agency: ["part", "Often hourly extras"] },
  { what: "Monthly fee required to keep the site online", me: "No, care plans are optional", diy: ["no", "Yes, every month"], free: ["part", "Varies"], agency: ["no", "Usually"] },
  { what: "You own the domain and the site", me: "Yes", diy: ["no", "Site stays on the platform"], free: ["part", "Varies"], agency: ["part", "Check the contract"] },
  { what: "Built for phones and fast loading", me: "Yes", diy: ["part", "Depends on template"], free: ["part", "Varies"], agency: ["yes", "Yes"] },
  { what: "Google basics: page titles, map, Google Business link", me: "Included", diy: ["part", "You set it up"], free: ["part", "Sometimes extra"], agency: ["part", "Often extra"] },
  { what: "Several languages on one site", me: "Available", diy: ["part", "Paid add-on"], free: ["part", "Extra"], agency: ["part", "Extra"] },
  { what: "30 days of free fixes after launch", me: "Yes", diy: ["no", "n/a"], free: ["part", "Varies"], agency: ["part", "Varies"] }
];
type Cell = ["yes" | "part" | "no", string];

const STEPS: { title: string; body: string; pay?: string }[] = [
  { title: "Free mock-up", body: "A design of your homepage within 2 to 3 days. If you don't like it, we stop there and you owe nothing.", pay: "You pay nothing" },
  { title: "Short written agreement", body: "One page: what's included, the price, the timeline, two rounds of changes, and what counts as extra.", pay: "30% deposit to start the build" },
  { title: "Build on a private preview link", body: "You can open the site on your phone while it's being built and send feedback any time. Usually 1 to 2 weeks for a website, 2 to 4 for a shop." },
  { title: "Review and changes", body: "Two rounds of changes are included. You approve the final version.", pay: "Remaining 70% on approval" },
  { title: "Go live and handover", body: "The site goes live on your domain the same day. You get admin logins, a short video on how to edit, and the files. Everything is yours." },
  { title: "30 days of free fixes", body: "Anything that doesn't work as agreed is fixed free for 30 days after launch." }
];

const YOU_GET = [
  "A fixed price in writing before any work starts",
  "Seeing the full site working before the final payment",
  "The domain registered in your name from day one",
  "All logins and files handed over when the site goes live",
  "No lock-in: care plans are optional and can be cancelled",
  "If you cancel after the deposit, you keep everything built so far",
  "Replies within 1 working day during the project"
];
const I_ASK = [
  "The deposit before the build starts",
  "Your content (menu, photos, logo, hours) within a week",
  "Feedback on each version within 5 working days",
  "Changes grouped into the two included rounds",
  "The final payment on approval, before the site goes live on your domain",
  "New features outside the agreement quoted separately"
];

const NEED = [
  "Your logo, or a photo of your sign",
  "Your menu with prices (a photo is fine)",
  "10 to 20 photos of food, drinks and the room",
  "Opening hours, address and phone number",
  "Links to Instagram, Facebook, booking and delivery pages",
  "A few words on what makes your place yours",
  "The domain you want, or one you already own",
  "For shops: product list, prices and how you want to be paid"
];

const FAQ = [
  { q: "I already have Instagram. Why do I need a website?", a: "Google shows websites first when people search for places to eat. A site gives them your menu, hours and location in one tap, works for people without Instagram, and sends them to your Instagram too." },
  { q: "Can I change the menu and prices myself?", a: "Yes. Every site comes with an admin panel. You log in on your phone or laptop and edit text, prices and photos. No coding." },
  { q: "Do I have to pay every month?", a: "No. The website is a one-off price. Care plans are optional, for people who want hosting, backups and changes handled for them." },
  { q: "Who owns the website?", a: "You do. The domain is registered in your name, and after the final payment you get all logins and files." },
  { q: "What if I don't like the design?", a: "The first mock-up is free and comes with no obligation. During the build you get two rounds of changes, and you see every version on a preview link." },
  { q: "Can the site take orders or bookings?", a: "Yes. It can link to your existing booking and delivery services, or include an online shop with payments." },
  { q: "Can the site be in more than one language?", a: "Yes. Sites can switch between languages, for example English and your local language." }
];

export default async function PricingPage({ searchParams }: { searchParams: { country?: string | string[] } }) {
  const h = headers();
  const initial = pickCountry({
    query: searchParams.country,
    ipCountry: h.get("x-vercel-ip-country"),
    acceptLanguage: h.get("accept-language")
  });
  const live = (await getProjects()).filter((p) => p.liveUrl);

  return (
    <CountryProvider initial={initial}>
      {/* Prices */}
      <section className="mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:pb-32 lg:pt-24">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">
            <DecodeText text="Pricing" />
          </p>
          <SplitHeading
            as="h1"
            immediate
            lines={["Websites for restaurants,", "bars and cafés."]}
            className="mt-4 font-display text-5xl font-medium leading-[1.04] tracking-[-0.03em] sm:text-6xl"
          />
          <Reveal delay={0.08}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Designed around your place, with your own admin panel so you can change the menu, prices and photos
              yourself. Choose your country to see local prices.
            </p>
          </Reveal>
          <Reveal delay={0.14} className="mt-8">
            <CountryPicker />
          </Reveal>
          <Reveal delay={0.2} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <MockupLink className="group inline-flex items-center gap-2 rounded-full bg-live px-6 py-3 text-[15px] font-medium text-ink transition hover:bg-[#6ff0c2] active:scale-[0.98]">
              Request a free mock-up
              <ArrowUpRight weight="bold" className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </MockupLink>
            <Link href="/work" className="font-mono text-[12px] uppercase tracking-[0.1em] text-muted transition hover:text-text">
              See the work
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <h2 className="sr-only">
            Prices in <CountryName />
          </h2>
          <p className="mb-2 font-mono text-[12px] uppercase tracking-[0.12em] text-muted" aria-hidden>
            Prices in <span className="text-text"><CountryName /></span>
          </p>
          <PriceMenu />
        </Reveal>
      </section>

      {/* How the price compares */}
      <Section id="compare" eyebrow="Compared locally" title={["How the price", "compares."]}>
        <PriceCompare />
      </Section>

      {/* What you get */}
      <section className="border-t border-line/70">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
          <p className="eyebrow">
            <DecodeText text="Side by side" />
          </p>
          <SplitHeading
            lines={["What you get here that you often don't elsewhere."]}
            className="mt-4 max-w-2xl text-balance font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-5xl"
          />
          <Reveal delay={0.1} className="mt-12">
            <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" data-lenis-prevent>
              <table className="w-full min-w-[760px] border-collapse text-left text-[14px]">
                <caption className="sr-only">rira.build compared with DIY builders, freelancers and agencies</caption>
                <thead>
                  <tr className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                    <th scope="col" className="w-[30%] py-4 pr-4 font-normal">What you get</th>
                    <th scope="col" className="rounded-t-xl bg-live/[0.08] px-4 py-4 font-medium text-live">rira.build</th>
                    <th scope="col" className="px-4 py-4 font-normal">DIY builder</th>
                    <th scope="col" className="px-4 py-4 font-normal">Typical freelancer</th>
                    <th scope="col" className="px-4 py-4 font-normal">Agency</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((r, i) => (
                    <tr key={r.what} className="border-t border-line/70">
                      <th scope="row" className="py-4 pr-4 font-normal text-text/90">{r.what}</th>
                      <td className={"bg-live/[0.08] px-4 py-4 font-medium text-live " + (i === COMPARE.length - 1 ? "rounded-b-xl" : "")}>{r.me}</td>
                      {[r.diy, r.free, r.agency].map(([kind, text], j) => (
                        <td key={j} className={"px-4 py-4 " + (kind === "yes" ? "text-text/85" : kind === "no" ? "text-signal/90" : "text-muted")}>
                          {text}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Care plans */}
      <Section
        eyebrow="After launch"
        title={["Monthly", "care plans."]}
        intro="Optional. Your site runs without them, and you can update the menu and photos yourself in the admin panel. Cancel any month with 30 days' notice."
        wide
      >
        <CarePlans />
      </Section>

      {/* Steps and payment */}
      <Section
        id="how-it-works"
        eyebrow="How it works"
        title={["How it works and", "when you pay."]}
        intro="You never pay for something you haven't seen. I never build without a commitment. Both sides are covered at every step."
      >
        <ol className="grid gap-0">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-3 border-t border-line/70 py-6 first:border-t-0 first:pt-0">
              <span className="pt-1 font-mono text-[13px] text-live">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-xl font-medium tracking-[-0.01em]">{s.title}</h3>
                <p className="mt-2 max-w-[60ch] leading-relaxed text-muted">{s.body}</p>
                {s.pay && (
                  <p className="mt-3 inline-block rounded-[4px] border border-live/30 bg-live/[0.07] px-2.5 py-1 font-mono text-[12px] text-live">
                    {s.pay}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-[60ch] text-sm leading-relaxed text-muted/80">
          Online shops are paid in three parts: 30% to start, 40% when the shop works on the preview link, 30% on
          approval. Payment by bank transfer or a local payment method; you get an invoice for every payment.
        </p>
      </Section>

      {/* Fair deal */}
      <Section eyebrow="Terms" title={["A fair deal", "for both sides."]}>
        <div className="grid gap-10 sm:grid-cols-2">
          <List title="What you can count on" items={YOU_GET} mark="text-live" />
          <List title="What I ask from you" items={I_ASK} mark="text-muted" />
        </div>
      </Section>

      {/* What I need */}
      <Section eyebrow="Getting started" title={["What I need", "from you."]}>
        <List items={NEED} mark="text-live" columns />
        <p className="mt-8 text-sm text-muted/80">
          No photos? I can work with what you have and suggest what to shoot on a phone.
        </p>
      </Section>

      {/* Recent work */}
      {live.length > 0 && (
        <Section eyebrow="Recent work" title={["All live.", "Open them on your phone."]}>
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {live.map((p) => (
              <li key={p.slug} className="border-t border-line/70">
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-baseline justify-between gap-4 py-4 transition hover:text-live"
                >
                  <span className="font-display text-lg font-medium">{p.name}</span>
                  <span className="flex items-center gap-2 text-right text-sm text-muted group-hover:text-live/80">
                    {p.tagline}
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* FAQ */}
      <Section id="faq" eyebrow="Questions" title={["Questions", "people ask."]}>
        <dl className="grid gap-x-10 gap-y-9 md:grid-cols-2">
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt className="font-display text-lg font-medium leading-snug">{f.q}</dt>
              <dd className="mt-2 leading-relaxed text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden border-t border-line/70">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-full h-[480px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.14] blur-[120px]"
          style={{ background: "radial-gradient(circle, #4CE8B0 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-3xl px-4 py-28 text-center sm:px-6 lg:py-36">
          <SplitHeading
            lines={["Start with a", "free mock-up."]}
            className="font-display text-4xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-6xl"
          />
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-muted">
              A design of your homepage within 2 to 3 days. If you don&apos;t like it, you owe nothing.
            </p>
          </Reveal>
          <Reveal delay={0.18} className="mt-10 flex flex-col items-center gap-6">
            <MockupLink className="group inline-flex items-center gap-2 rounded-full bg-live px-7 py-3.5 text-base font-medium text-ink transition hover:bg-[#6ff0c2] active:scale-[0.98]">
              Request a free mock-up
              <ArrowUpRight weight="bold" className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </MockupLink>
            <p className="font-mono text-[12px] text-muted/70" data-testid="validity">
              <Validity />
            </p>
          </Reveal>
        </div>
      </section>
    </CountryProvider>
  );
}

function Section({
  id,
  eyebrow,
  title,
  intro,
  wide,
  children
}: {
  id?: string;
  eyebrow: string;
  title: string[];
  intro?: string;
  /** Content spans the full width under the heading instead of sitting beside it. */
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line/70">
      <div
        className={
          "mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:py-32 " +
          (wide ? "" : "lg:grid-cols-[0.8fr_1.2fr] lg:gap-20")
        }
      >
        <div className={wide ? "max-w-2xl" : "lg:sticky lg:top-28 lg:self-start"}>
          <p className="eyebrow">
            <DecodeText text={eyebrow} />
          </p>
          <SplitHeading
            lines={title}
            className="mt-4 font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-5xl"
          />
          {intro && <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">{intro}</p>}
        </div>
        <Reveal delay={0.08}>{children}</Reveal>
      </div>
    </section>
  );
}

function List({ title, items, mark, columns }: { title?: string; items: string[]; mark: string; columns?: boolean }) {
  return (
    <div>
      {title && <h3 className="font-display text-xl font-medium">{title}</h3>}
      <ul className={"grid gap-3 " + (title ? "mt-5 " : "") + (columns ? "sm:grid-cols-2 sm:gap-x-10" : "")}>
        {items.map((it) => (
          <li key={it} className="grid grid-cols-[1rem_1fr] gap-2 leading-relaxed text-text/85">
            <span aria-hidden className={mark}>
              +
            </span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

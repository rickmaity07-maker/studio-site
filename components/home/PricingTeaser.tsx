import Link from "next/link";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

const TERMS = [
  { figure: "Free", label: "Mock-up of your homepage", body: "Within 2 to 3 days. Don't like it? You owe nothing." },
  { figure: "30%", label: "To start the build", body: "A fixed price in writing first, then a private preview link." },
  { figure: "70%", label: "Once you approve it", body: "You see the full site working before the final payment." }
];

/** Home page pointer to /pricing: the payment deal, not a price list. */
export function PricingTeaser() {
  return (
    <section id="pricing" className="scroll-mt-20 border-t border-line/70">
      <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:py-36">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">Pricing</p>
            <SplitHeading
              lines={["A fixed price for", "your country."]}
              className="mt-4 font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-5xl"
            />
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              One-off price, your own admin panel included, no monthly fee required. Local prices for 115 countries.
            </p>
          </div>
          <Reveal className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <MagneticButton href="/pricing">See prices</MagneticButton>
            <Link
              href="/pricing#how-it-works"
              className="font-mono text-[12px] uppercase tracking-[0.1em] text-muted transition hover:text-text"
            >
              How payment works
            </Link>
          </Reveal>
        </div>

        <ol className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {TERMS.map((t, i) => (
            <li key={t.label} className="bg-ink p-8 sm:p-10">
              <Reveal delay={i * 0.08}>
                <span className="font-display text-5xl font-medium tracking-[-0.03em] text-live sm:text-6xl">{t.figure}</span>
                <h3 className="mt-6 font-display text-xl font-medium">{t.label}</h3>
                <p className="mt-2 leading-relaxed text-muted">{t.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

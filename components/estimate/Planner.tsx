"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { RollingText } from "@/components/smoothui/rolling-text";
import { CountryPicker, useCountry } from "@/components/pricing/CountryPrices";
import { money, VALID_UNTIL, type CountryPrice } from "@/lib/pricing";
import {
  BUILDS,
  BUILD_LABEL,
  PLANS,
  PLAN_LABEL,
  estimate,
  freelancerMiddle,
  planPrice,
  type Build,
  type Plan,
  type Range
} from "@/lib/estimate";

const BUILD_NOTE: Record<Build, string> = {
  beauty: "Barbers, hair, nail, beauty and tattoo studios.",
  food: "Restaurants, takeaway, bakeries, sweet shops and local services.",
  bar: "Bars, cafés, lounges and pubs.",
  shop: "A website plus products, basket, checkout and orders."
};

const PLAN_NOTE: Record<Plan, string> = {
  none: "You keep the site running yourself. No monthly fee.",
  essential: "Hosting, SSL, daily backups, updates and monitoring.",
  care: "Essential, plus up to 1 hour of changes a month done for you.",
  growth: "Care, plus up to 3 hours, Google Business Profile and a monthly report."
};

function show(c: CountryPrice, r: Range) {
  return r[0] === r[1] ? money(c, r[0]) : `${money(c, r[0])} - ${money(c, r[1])}`;
}

/** Build + care plan + country -> what it costs now, per month and over time. */
export function Planner({ initialBuild = "food" }: { initialBuild?: Build }) {
  const { code, c } = useCountry();
  const [build, setBuild] = useState<Build>(initialBuild);
  const [plan, setPlan] = useState<Plan>("none");
  const e = estimate(c, build, plan);
  const mid = freelancerMiddle(c);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
      <div className="grid content-start gap-10">
        <CountryPicker />

        <fieldset>
          <legend className="eyebrow">Your kind of business</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {BUILDS.map((b) => (
              <Choice key={b} name="build" checked={build === b} onChange={() => setBuild(b)} title={BUILD_LABEL[b]} note={BUILD_NOTE[b]}>
                {show(c, c.sectors[b])}
              </Choice>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="eyebrow">Care after launch</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {PLANS.map((p) => (
              <Choice key={p} name="plan" checked={plan === p} onChange={() => setPlan(p)} title={PLAN_LABEL[p]} note={PLAN_NOTE[p]}>
                {p === "none" ? "Free" : `${money(c, planPrice(c, p))}/mo`}
              </Choice>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl border border-live/40 bg-live/[0.05] p-6 sm:p-8" data-testid="estimate">
          <p className="eyebrow">Your estimate · {c.name}</p>
          <dl className="mt-6 grid gap-5">
            <Row label="One-off, for the build">
              <RollingText text={show(c, e.oneOff)} testId="estimate-oneoff" className="font-mono text-3xl tabular-nums text-text sm:text-4xl" />
            </Row>
            <Row label="Per month after launch">
              <RollingText text={money(c, e.monthly)} testId="estimate-monthly" className="font-mono text-xl tabular-nums text-text" />
            </Row>
            <Row label="First year in total">
              <RollingText text={show(c, e.firstYear)} testId="estimate-year" className="font-mono text-xl tabular-nums text-text" />
            </Row>
            <Row label="Three years in total">
              <RollingText text={show(c, e.threeYears)} testId="estimate-3y" className="font-mono text-xl tabular-nums text-text" />
            </Row>
          </dl>

          {mid !== null && build !== "shop" && (
            <p className="mt-6 border-t border-line/70 pt-5 text-sm leading-relaxed text-muted">
              For comparison: a local freelancer in {c.name} typically charges around{" "}
              <span className="text-text">{money(c, mid)}</span> for a site like this, before any upkeep.
            </p>
          )}
          <p className="mt-4 text-sm leading-relaxed text-muted">
            The mock-up is free. You pay 30% to start the build and the rest once you&apos;ve approved the finished site.
            Your domain is paid separately, in your name.
          </p>

          <Link
            href={`/request?mockup=${code}&plan=${build}-${plan}`}
            className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-live px-6 py-3 text-center text-[15px] font-medium text-ink transition hover:bg-[#6ff0c2] active:scale-[0.98]"
          >
            Request this, start with a free mock-up
            <ArrowUpRight weight="bold" className="h-4 w-4 shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <p className="mt-4 text-center text-xs text-muted/80">Prices for projects agreed by {VALID_UNTIL}.</p>
        </div>
      </div>
    </div>
  );
}

function Choice({
  name,
  checked,
  onChange,
  title,
  note,
  children
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={
        "relative flex cursor-pointer flex-col gap-1.5 rounded-xl border p-4 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-live/70 " +
        (checked ? "border-live/60 bg-live/[0.06]" : "border-line bg-surface/60 hover:bg-surface")
      }
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-display text-lg font-medium">{title}</span>
        <span className={"shrink-0 font-mono text-sm tabular-nums " + (checked ? "text-live" : "text-muted")}>{children}</span>
      </span>
      <span className="text-sm leading-snug text-muted">{note}</span>
    </label>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <dt className="text-sm text-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

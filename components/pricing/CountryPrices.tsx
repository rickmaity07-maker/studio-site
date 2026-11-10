"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState } from "react";
import { motion } from "motion/react";
import { instant, useReducedMotion } from "@/components/motion/useReducedMotion";
import { EASE } from "@/components/motion/Reveal";
import { RollingText } from "@/components/smoothui/rolling-text";
import {
  COUNTRY_CODES,
  PRICES,
  VALID_UNTIL,
  compareRows,
  isCountry,
  money,
  range,
  type CountryPrice
} from "@/lib/pricing";

const Ctx = createContext<{ code: string; c: CountryPrice; setCode: (code: string) => void } | null>(null);

function useCountry() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCountry needs <CountryProvider>");
  return v;
}

/**
 * Holds the chosen country. The server picks the first one (?country=, geo,
 * browser language); a #code in the URL wins on load, and choosing a country
 * writes #code so the link can be shared.
 */
export function CountryProvider({ initial, children }: { initial: string; children: React.ReactNode }) {
  const [code, setState] = useState(initial);

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1).toLowerCase();
      if (isCountry(h)) setState(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  function setCode(next: string) {
    if (!isCountry(next)) return;
    setState(next);
    const url = new URL(window.location.href);
    url.searchParams.delete("country");
    url.hash = next;
    window.history.replaceState(window.history.state, "", url);
  }

  return <Ctx.Provider value={{ code, c: PRICES[code], setCode }}>{children}</Ctx.Provider>;
}

export function CountryPicker() {
  const { code, setCode } = useCountry();
  return (
    <div className="flex flex-col gap-2 sm:max-w-xs">
      <label htmlFor="country" className="eyebrow">
        Your country
      </label>
      <select id="country" className="input" value={code} onChange={(e) => setCode(e.target.value)}>
        {COUNTRY_CODES.map((cc) => (
          <option key={cc} value={cc}>
            {PRICES[cc].name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CountryName() {
  return <>{useCountry().c.name}</>;
}

/** The three headline prices, laid out like a menu with dotted leaders. */
export function PriceMenu() {
  const { c } = useCountry();
  const items = [
    {
      title: "Free mock-up",
      price: "Free",
      body: "A design of your homepage, made for your place, before you pay anything. No obligation."
    },
    {
      title: "Website",
      price: money(c, c.site),
      body: "Custom design, menu, photos, opening hours, map, booking and delivery links, Instagram and WhatsApp buttons, admin panel. One-off price."
    },
    {
      title: "Website with online shop",
      price: range(c, c.shop[0], c.shop[1]),
      body: "Everything above, plus products, cart, online payments and order emails. Price depends on the number of products and payment options."
    }
  ];

  return (
    <div data-testid="price-menu">
      <ul className="divide-y divide-line/80 border-y border-line/80">
        {items.map((it) => (
          <li key={it.title} className="py-6">
            <div className="flex items-baseline gap-3">
              <h3 className="font-display text-xl font-medium tracking-[-0.01em] sm:text-2xl">{it.title}</h3>
              <span aria-hidden className="mb-1.5 min-w-6 flex-1 border-b border-dotted border-muted/40" />
              <RollingText
                text={it.price}
                testId={`price-${it.title}`}
                className="whitespace-nowrap font-mono text-lg tabular-nums text-live sm:text-xl"
              />
            </div>
            <p className="mt-2 max-w-[60ch] leading-relaxed text-muted">{it.body}</p>
          </li>
        ))}
      </ul>
      <p className="mt-5 max-w-[60ch] text-sm leading-relaxed text-muted/80">
        Your domain name (usually the price of a coffee or two per year) is registered in your name and paid at
        cost. Taxes may apply depending on your country.
      </p>
    </div>
  );
}

/** To-scale chart: the rira.build price against local freelancers and agencies. */
export function PriceCompare() {
  const { c } = useCountry();
  const reduce = useReducedMotion();
  const data = compareRows(c);

  if (!data || !c.market) {
    return (
      <p className="max-w-[60ch] leading-relaxed text-muted" data-testid="compare-none">
        There&apos;s no reliable price research for {c.name} yet, so there&apos;s no chart here. The price above
        follows the nearest researched neighbour.
      </p>
    );
  }

  const m = c.market;
  const pct = (v: number) => `${((100 * v) / data.max).toFixed(2)}%`;

  return (
    <div data-testid="compare">
      <p className="max-w-[60ch] text-lg leading-relaxed text-muted">
        A website here costs <span className="text-text">{money(c, c.site)}</span>,{" "}
        {data.belowMiddle ? "below the middle of" : "within the usual range for"} what local freelancers charge in{" "}
        {c.name} ({range(c, m.free[0], m.free[1])}), with the admin panel and free mock-up included.
      </p>

      <div className="mt-10 grid gap-7" role="img" aria-label={data.rows.map((r) => (r.me ? `${r.label}: ${money(c, r.from)}` : `${r.label}: ${range(c, r.from, r.to)}`)).join(". ")}>
        {data.rows.map((r) => (
          <div key={r.label} className="grid gap-2 sm:grid-cols-[9rem_1fr] sm:items-center sm:gap-5">
            <span className={"font-mono text-[12px] uppercase tracking-[0.1em] " + (r.me ? "text-live" : "text-muted")}>
              {r.label}
            </span>
            <div className="relative h-9">
              <span aria-hidden className="absolute inset-x-0 top-[11px] h-px bg-line" />
              {r.me ? (
                <>
                  <motion.span
                    key={c.name}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={instant(reduce, { duration: 0.5, ease: EASE })}
                    className="absolute top-[5px] h-3 w-3 -translate-x-1/2 rounded-full bg-live shadow-[0_0_0_4px_rgba(76,232,176,0.18)]"
                    style={{ left: pct(r.from) }}
                  />
                  <Val left={pct(r.from)} me>
                    {money(c, r.from)}
                  </Val>
                </>
              ) : (
                <>
                  <motion.span
                    key={c.name}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={instant(reduce, { duration: 0.8, ease: EASE })}
                    className="absolute top-[7px] h-2 origin-left rounded-[3px] bg-muted/35"
                    style={{ left: pct(r.from), width: `calc(${pct(r.to)} - ${pct(r.from)})` }}
                  />
                  {(r.to - r.from) / data.max > 0.3 ? (
                    <>
                      <Val left={pct(r.from)}>{money(c, r.from)}</Val>
                      <Val left={pct(r.to)} end>
                        {money(c, r.to)}
                      </Val>
                    </>
                  ) : (
                    // Narrow range: one label, so the two ends don't collide on a phone.
                    <Val left={r.to / data.max > 0.5 ? pct(r.to) : pct(r.from)} end={r.to / data.max > 0.5}>
                      {range(c, r.from, r.to)}
                    </Val>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div className="flex justify-between font-mono text-[11px] text-muted/60 sm:ml-[10.25rem]">
          <span>{money(c, 0)}</span>
          <span>{money(c, data.max)}</span>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted/80">
        Local ranges are from 2026 web design price guides for small businesses. Your own quotes may differ.
      </p>
    </div>
  );
}

function Val({ left, me, end, children }: { left: string; me?: boolean; end?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={
        "absolute top-[18px] whitespace-nowrap font-mono text-[12px] tabular-nums " +
        (me ? "-translate-x-1/2 text-live" : end ? "-translate-x-full text-text/80" : "text-text/80")
      }
      style={{ left }}
    >
      {children}
    </span>
  );
}

const PLANS = [
  {
    name: "Essential",
    items: ["Hosting and SSL certificate", "Daily backups", "Security and software updates", "Uptime monitoring", "Domain renewal handled"]
  },
  {
    name: "Care",
    pick: true,
    items: [
      "Everything in Essential",
      "Up to 1 hour of changes a month, done for you",
      "Seasonal menu or event updates",
      "Reply within 1 working day"
    ]
  },
  {
    name: "Growth",
    items: [
      "Everything in Care",
      "Up to 3 hours of changes a month",
      "Google Business Profile kept up to date",
      "Monthly visitor and search report",
      "Small design refreshes"
    ]
  }
];

export function CarePlans() {
  const { c } = useCountry();
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p, i) => (
          <div
            key={p.name}
            className={
              "relative flex flex-col rounded-2xl border p-7 " +
              (p.pick ? "border-live/50 bg-live/[0.06]" : "border-line bg-surface/60")
            }
          >
            {p.pick && (
              <span className="absolute -top-3 left-7 rounded-[4px] bg-live px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink">
                Most chosen
              </span>
            )}
            <h3 className="font-display text-2xl font-medium">{p.name}</h3>
            <p className="mt-4 flex items-baseline gap-2">
              <RollingText
                text={money(c, c.care[i])}
                testId={`care-${p.name}`}
                className="font-mono text-3xl tabular-nums text-text"
              />
              <span className="text-sm text-muted">per month</span>
            </p>
            <ul className="mt-6 grid gap-3 border-t border-line/80 pt-6">
              {p.items.map((it) => (
                <li key={it} className="grid grid-cols-[1rem_1fr] gap-2 text-[15px] leading-snug text-text/85">
                  <span aria-hidden className={p.pick ? "text-live" : "text-muted"}>
                    +
                  </span>
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {c.market?.care && (
        <p className="mt-6 text-sm text-muted/80">
          For comparison, upkeep in {c.name} typically runs {c.market.care}.
        </p>
      )}
    </div>
  );
}

export function Validity() {
  const { c } = useCountry();
  return (
    <>
      Prices for {c.name}, valid for projects agreed by {VALID_UNTIL}.
    </>
  );
}

/** The mock-up CTA carries the country so the request shows which prices were seen. */
export function MockupLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const { code } = useCountry();
  return (
    <Link href={`/request?mockup=${code}`} className={className}>
      {children}
    </Link>
  );
}

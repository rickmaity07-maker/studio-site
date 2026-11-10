"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { instant, useReducedMotion } from "@/components/motion/useReducedMotion";
import { FEATURES, TIERS, type Tier } from "@/data/features";
import { SECTORS } from "@/data/sectors";

const TIER_STYLE: Record<Tier, string> = {
  included: "bg-live/15 text-live",
  shop: "bg-[#7aa7ff]/15 text-[#a9c4ff]",
  extra: "bg-[#f0b45a]/15 text-[#f5cd8e]",
  care: "bg-white/10 text-text/80"
};

/**
 * Every feature, filterable by kind of business and by how it's priced.
 * `names` maps project slugs to names for the "seen in" links.
 */
export function FeatureExplorer({ names, initialSector = "all" }: { names: Record<string, string>; initialSector?: string }) {
  const reduce = useReducedMotion();
  const [sector, setSector] = useState(initialSector);
  const [tier, setTier] = useState<Tier | "all">("all");

  const shown = useMemo(
    () =>
      FEATURES.filter(
        (f) =>
          (tier === "all" || f.tier === tier) &&
          (sector === "all" || f.sectors.length === 0 || f.sectors.includes(sector))
      ),
    [sector, tier]
  );

  return (
    <div>
      <div className="grid gap-5">
        <Chips
          label="For"
          value={sector}
          onChange={setSector}
          options={[{ value: "all", label: "Every business" }, ...SECTORS.map((s) => ({ value: s.slug, label: s.short }))]}
        />
        <Chips
          label="Price"
          value={tier}
          onChange={(v) => setTier(v as Tier | "all")}
          options={[
            { value: "all", label: "Everything" },
            ...(Object.keys(TIERS) as Tier[]).map((t) => ({ value: t, label: TIERS[t].label }))
          ]}
        />
      </div>

      <p className="mt-8 font-mono text-[12px] uppercase tracking-[0.12em] text-muted" aria-live="polite">
        {shown.length} feature{shown.length === 1 ? "" : "s"}
        {tier !== "all" && <> · {TIERS[tier].note}</>}
      </p>

      <motion.ul layout={!reduce} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((f) => (
            <motion.li
              layout={!reduce}
              key={f.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={instant(reduce, { duration: 0.3 })}
              className="flex flex-col rounded-2xl border border-line bg-surface/60 p-6"
              data-testid="feature"
            >
              <span className={"self-start rounded-[4px] px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em] " + TIER_STYLE[f.tier]}>
                {TIERS[f.tier].label}
              </span>
              <h3 className="mt-4 font-display text-xl font-medium leading-snug">{f.name}</h3>
              <p className="mt-2 flex-1 leading-relaxed text-muted">{f.body}</p>
              {f.seenIn.some((s) => names[s]) && (
                <p className="mt-5 border-t border-line/70 pt-4 text-sm text-muted">
                  Seen in{" "}
                  {f.seenIn
                    .filter((s) => names[s])
                    .map((s, i, arr) => (
                      <span key={s}>
                        <Link href={`/work/${s}`} className="text-text/90 underline decoration-line underline-offset-4 transition hover:text-live">
                          {names[s]}
                        </Link>
                        {i < arr.length - 1 ? ", " : ""}
                      </span>
                    ))}
                </p>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}

function Chips({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="eyebrow mr-2 w-12">{label}</span>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={
            "rounded-full border px-3.5 py-1.5 text-sm transition active:scale-[0.97] " +
            (value === o.value ? "border-live/60 bg-live/10 text-text" : "border-line text-muted hover:border-text/30 hover:text-text")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { FAQ, FAQ_TOPICS, type FaqTopic } from "@/data/faq";

/** Searchable, topic-filtered questions. Every answer stays in the page for search engines. */
export function FaqSearch() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<FaqTopic | "all">("all");

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return FAQ.filter(
      (f) =>
        (topic === "all" || f.topic === topic) &&
        words.every((w) => (f.q + " " + f.a).toLowerCase().includes(w))
    );
  }, [query, topic]);

  return (
    <div>
      <div className="relative max-w-xl">
        <MagnifyingGlass aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search: payment, languages, domain…"
          aria-label="Search the questions"
          className="input !rounded-full !py-3 !pl-11 !pr-11"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-white/5 hover:text-text"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      <div role="group" aria-label="Topic" className="mt-5 flex flex-wrap gap-2">
        {(["all", ...FAQ_TOPICS] as const).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={topic === t}
            onClick={() => setTopic(t)}
            className={
              "rounded-full border px-3.5 py-1.5 text-sm transition active:scale-[0.97] " +
              (topic === t ? "border-live/60 bg-live/10 text-text" : "border-line text-muted hover:border-text/30 hover:text-text")
            }
          >
            {t === "all" ? "All questions" : t}
          </button>
        ))}
      </div>

      <p className="mt-8 font-mono text-[12px] uppercase tracking-[0.12em] text-muted" aria-live="polite">
        {shown.length} of {FAQ.length}
      </p>

      {shown.length ? (
        <div className="mt-4 divide-y divide-line/70 border-y border-line/70">
          {shown.map((f) => (
            <details key={f.q} className="group py-1" data-testid="faq">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-lg font-medium leading-snug transition group-hover:text-live">{f.q}</span>
                <span
                  aria-hidden
                  className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line font-mono text-sm text-muted transition group-open:rotate-45 group-open:border-live/60 group-open:text-live"
                >
                  +
                </span>
              </summary>
              <p className="max-w-2xl pb-6 leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-line bg-surface/60 p-8">
          <p className="font-display text-lg">No question matches that yet.</p>
          <p className="mt-2 text-muted">
            Ask it directly:{" "}
            <Link href="/request" className="text-text underline underline-offset-4 transition hover:text-live">
              send a request
            </Link>{" "}
            and you&apos;ll get a reply within one business day.
          </p>
        </div>
      )}
    </div>
  );
}

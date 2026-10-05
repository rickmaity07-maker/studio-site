"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/data/site";
import { BUDGETS, PROJECT_TYPES, TIMELINES } from "@/lib/lead-schema";

type Status = "idle" | "submitting" | "success" | "error";

export function LeadForm({ projectRef }: { projectRef?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) return;
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(form),
          projectRef: projectRef ?? "",
          consent
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(typeof body.error === "string" ? body.error : null);
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-live/30 bg-live/5 p-8 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-live">
          Request sent
        </p>
        <h3 className="mt-3 font-display text-2xl">Got it, thank you.</h3>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          I read every request myself and reply within one business day, usually
          sooner.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative grid gap-5">
      {projectRef && (
        <div className="rounded-lg border border-line bg-surface2 px-4 py-2 font-mono text-[12px] text-muted">
          Referencing: <span className="text-text">{projectRef}</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name">
          <input id="name" name="name" required className="input" placeholder="Lena Hoffmann" autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input"
            placeholder="lena@cafe-hoffmann.de"
            autoComplete="email"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone (optional)" htmlFor="phone">
          <input id="phone" name="phone" className="input" placeholder="+49 151 2345 6789" autoComplete="tel" type="tel" />
        </Field>
        <Field label="Business name" htmlFor="business">
          <input id="business" name="business" required className="input" placeholder="Café Hoffmann" autoComplete="organization" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Project type" htmlFor="projectType">
          <select id="projectType" name="projectType" required className="input" defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Budget" htmlFor="budget">
          <select id="budget" name="budget" required className="input" defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            {BUDGETS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Timeline" htmlFor="timeline">
          <select id="timeline" name="timeline" required className="input" defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            {TIMELINES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Honeypot — hidden from people, irresistible to spam bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <Field label="Anything else? (optional)" htmlFor="message">
        <textarea
          id="message"
          name="message"
          rows={4}
          className="input resize-none"
          placeholder="What you sell, who your customers are, a site you like"
        />
      </Field>

      <label className="flex items-start gap-3 text-sm text-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-line bg-surface2 accent-live"
          required
        />
        <span>
          I agree that Rick can store this information to get back to me about my
          request. See the{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-text">
            privacy notice
          </a>
          .
        </span>
      </label>

      <button
        type="submit"
        disabled={status === "submitting" || !consent}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-live px-6 py-3 font-mono text-[13px] uppercase tracking-[0.1em] text-ink transition hover:bg-live/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "submitting" ? "Sending…" : "Send request"}
      </button>

      {status === "error" && (
        <p className="font-mono text-[12px] text-signal">
          {error ?? "Something went wrong sending that. Please try again."}
          {site.owner.email && (
            <>
              {" "}You can also email{" "}
              <a href={`mailto:${site.owner.email}`} className="underline underline-offset-2">
                {site.owner.email}
              </a>
              .
            </>
          )}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

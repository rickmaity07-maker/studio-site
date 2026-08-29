"use client";

import { useState, type FormEvent } from "react";
import { submitLead } from "@/lib/firebase";

const PROJECT_TYPES = [
  "New website",
  "Redesign of an existing site",
  "Booking / appointment system",
  "Online store",
  "Something else"
];

const BUDGETS = ["Under €1,000", "€1,000 – €3,000", "€3,000 – €7,000", "Not sure yet"];

const TIMELINES = ["Whenever it's ready", "Within a month", "Within 2 weeks", "It's urgent"];

type Status = "idle" | "submitting" | "success" | "error";

export function LeadForm({ projectRef }: { projectRef?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [consent, setConsent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) return;
    setStatus("submitting");

    const form = new FormData(e.currentTarget);
    try {
      await submitLead({
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
        business: String(form.get("business") || ""),
        projectType: String(form.get("projectType") || ""),
        budget: String(form.get("budget") || ""),
        timeline: String(form.get("timeline") || ""),
        message:
          String(form.get("message") || "") +
          (projectRef ? `\n\n(Reference: ${projectRef})` : ""),
        consent
      });
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
        <h3 className="mt-3 font-display text-2xl">Got it — thank you.</h3>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          I read every request myself and reply within one business day, usually
          sooner.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {projectRef && (
        <div className="rounded-lg border border-line bg-surface2 px-4 py-2 font-mono text-[12px] text-muted">
          Referencing: <span className="text-text">{projectRef}</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name">
          <input id="name" name="name" required className="input" placeholder="Jane Doe" />
        </Field>
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input"
            placeholder="jane@business.de"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone (optional)" htmlFor="phone">
          <input id="phone" name="phone" className="input" placeholder="+49 ..." />
        </Field>
        <Field label="Business name" htmlFor="business">
          <input id="business" name="business" required className="input" placeholder="What should the site say?" />
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

      <Field label="Anything else? (optional)" htmlFor="message">
        <textarea
          id="message"
          name="message"
          rows={4}
          className="input resize-none"
          placeholder="Tell me about your business, your customers, or a site you like"
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
          Something went wrong sending that — please try again, or email directly.
        </p>
      )}

      <style jsx global>{`
        .input {
          background: #1b202b;
          border: 1px solid #262b38;
          border-radius: 0.6rem;
          padding: 0.65rem 0.85rem;
          color: #eceef3;
          font-size: 0.925rem;
          width: 100%;
        }
        .input:focus {
          border-color: #4ce8b0;
        }
        select.input {
          appearance: none;
        }
      `}</style>
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

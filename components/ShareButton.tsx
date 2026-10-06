"use client";

import { useState } from "react";
import { Check, ShareNetwork } from "@phosphor-icons/react";

/**
 * Shares the current page with the phone's share sheet where there is one,
 * and copies the link everywhere else.
 */
export function ShareButton({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return; // closed the sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={share}
      className="group inline-flex items-center gap-2.5 rounded-full border border-line px-5 py-3 font-mono text-[12px] uppercase tracking-[0.1em] text-text transition hover:border-live hover:text-live"
    >
      {copied ? <Check weight="bold" className="h-4 w-4 text-live" aria-hidden /> : <ShareNetwork weight="bold" className="h-4 w-4" aria-hidden />}
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}

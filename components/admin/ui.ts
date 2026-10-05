/** Shared class names for the admin portal's controls. */

export const btnPrimary =
  "inline-flex items-center justify-center rounded-full bg-live px-5 py-2 font-mono text-[12px] uppercase tracking-[0.1em] text-ink transition hover:bg-live/90 disabled:cursor-not-allowed disabled:opacity-40";

export const btnGhost =
  "inline-flex items-center justify-center rounded-full border border-line px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.1em] text-muted transition hover:border-live/40 hover:text-text disabled:cursor-not-allowed disabled:opacity-40";

export const btnDanger =
  "inline-flex items-center justify-center rounded-full border border-signal/30 px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.1em] text-signal transition hover:bg-signal/10 disabled:cursor-not-allowed disabled:opacity-40";

export const labelCls = "font-mono text-[11px] uppercase tracking-[0.1em] text-muted";

export function pill(active: boolean) {
  return (
    "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.06em] transition " +
    (active ? "border-live/50 bg-live/10 text-live" : "border-line text-muted hover:text-text")
  );
}

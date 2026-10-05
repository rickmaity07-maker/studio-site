export function LiveDot({ live }: { live: boolean }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.15em]">
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={
            "absolute inline-flex h-full w-full rounded-full " +
            (live ? "bg-live animate-blink" : "bg-muted/50")
          }
        />
      </span>
      <span className={live ? "text-live" : "text-muted"}>
        {live ? "Live demo" : "In build"}
      </span>
    </span>
  );
}

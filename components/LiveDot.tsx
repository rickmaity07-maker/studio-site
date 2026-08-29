export function LiveDot({ live }: { live: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.15em] uppercase">
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

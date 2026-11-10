import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Text with a soft highlight that sweeps across it every few seconds.
 * From Magic UI (magicui.design/docs/components/animated-shiny-text),
 * ported to Tailwind 3. The keyframes live in tailwind.config.ts.
 */
export function AnimatedShinyText({
  children,
  className,
  shimmerWidth = 120,
  ...props
}: ComponentPropsWithoutRef<"span"> & { shimmerWidth?: number }) {
  return (
    <span
      style={{ "--shiny-width": `${shimmerWidth}px` } as CSSProperties}
      className={cn(
        // Semi-transparent text lets the sweeping highlight show through.
        "text-text/55",
        "animate-shiny-text bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shiny-width)_100%]",
        "bg-gradient-to-r from-transparent via-[#A9F5D9] via-50% to-transparent",
        "motion-reduce:animate-none",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";

/** The last thing on the page: one statement, one action. */
export function ClosingCta() {
  return (
    <section className="relative overflow-hidden border-t border-line/70">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-full h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16] blur-[120px]"
        style={{ background: "radial-gradient(circle, #4CE8B0 0%, transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-4xl px-4 py-32 text-center sm:px-6 lg:py-44">
        <Reveal>
          <h2 className="text-balance font-display text-4xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
            Have a business that needs a site?
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted">
            Tell me what it needs to do. You get a working demo before anything goes live.
          </p>
        </Reveal>
        <Reveal delay={0.2} className="mt-10 flex justify-center">
          <MagneticButton href="/request" size="lg">
            Start a project
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}

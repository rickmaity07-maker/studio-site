import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { DecodeText } from "@/components/science/DecodeText";

/** A page section: eyebrow + heading on the left (sticky), content on the right. */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  wide,
  children
}: {
  id?: string;
  eyebrow: string;
  title: string[];
  intro?: string;
  /** Content spans the full width under the heading instead of sitting beside it. */
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line/70">
      <div
        className={
          "mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:py-32 " +
          (wide ? "" : "lg:grid-cols-[0.8fr_1.2fr] lg:gap-20")
        }
      >
        <div className={wide ? "max-w-2xl" : "lg:sticky lg:top-28 lg:self-start"}>
          <p className="eyebrow">
            <DecodeText text={eyebrow} />
          </p>
          <SplitHeading
            lines={title}
            className="mt-4 font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-5xl"
          />
          {intro && <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">{intro}</p>}
        </div>
        <Reveal delay={0.08}>{children}</Reveal>
      </div>
    </section>
  );
}

/** A plain "+" list. */
export function List({ title, items, mark, columns }: { title?: string; items: string[]; mark: string; columns?: boolean }) {
  return (
    <div>
      {title && <h3 className="font-display text-xl font-medium">{title}</h3>}
      <ul className={"grid gap-3 " + (title ? "mt-5 " : "") + (columns ? "sm:grid-cols-2 sm:gap-x-10" : "")}>
        {items.map((it) => (
          <li key={it} className="grid grid-cols-[1rem_1fr] gap-2 leading-relaxed text-text/85">
            <span aria-hidden className={mark}>
              +
            </span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Page opening: eyebrow, big two-line heading, intro and optional actions. */
export function PageHero({
  eyebrow,
  lines,
  intro,
  children
}: {
  eyebrow: string;
  lines: string[];
  intro: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:pb-24 lg:pt-24">
      <p className="eyebrow">
        <DecodeText text={eyebrow} />
      </p>
      <SplitHeading
        as="h1"
        immediate
        lines={lines}
        className="mt-4 max-w-4xl font-display text-5xl font-medium leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-7xl"
      />
      <Reveal delay={0.08}>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p>
      </Reveal>
      {children && (
        <Reveal delay={0.16} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          {children}
        </Reveal>
      )}
    </section>
  );
}

export const primaryButton =
  "group inline-flex items-center gap-2 rounded-full bg-live px-6 py-3 text-[15px] font-medium text-ink transition hover:bg-[#6ff0c2] active:scale-[0.98]";
export const quietLink = "font-mono text-[12px] uppercase tracking-[0.1em] text-muted transition hover:text-text";

/** The mint pill button with the arrow. */
export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={primaryButton}>
      {children}
      <ArrowUpRight weight="bold" className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

/** Closing call to action with the soft mint glow. */
export function ClosingBand({ lines, body, children }: { lines: string[]; body: string; children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-t border-line/70">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-full h-[480px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.14] blur-[120px]"
        style={{ background: "radial-gradient(circle, #4CE8B0 0%, transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-3xl px-4 py-28 text-center sm:px-6 lg:py-36">
        <SplitHeading
          lines={lines}
          className="font-display text-4xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-6xl"
        />
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-muted">{body}</p>
        </Reveal>
        <Reveal delay={0.18} className="mt-10 flex flex-col items-center gap-6">
          {children}
        </Reveal>
      </div>
    </section>
  );
}

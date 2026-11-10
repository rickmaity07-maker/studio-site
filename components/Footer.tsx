import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { FooterWordmark } from "./FooterWordmark";
import { BrandMark } from "./brand/BrandMark";
import { SECTORS } from "@/data/sectors";

const COLUMNS = [
  {
    title: "Studio",
    links: [
      { href: "/work", label: "Work" },
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/estimate", label: "Cost planner" },
      { href: "/faq", label: "Questions" },
      { href: "/#process", label: "Process" },
      { href: "/request", label: "Start a project" },
      { href: "/app", label: "Android app" }
    ]
  },
  {
    title: "Who it's for",
    links: SECTORS.map((s) => ({ href: `/for/${s.slug}`, label: s.short }))
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/impressum", label: "Impressum" }
    ]
  }
];

export function Footer() {
  return (
    <footer className="border-t border-line/80">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="group inline-flex" aria-label="rira.build home">
            <BrandMark size="lg" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Websites built to be clicked through, not just looked at, for
            businesses in every country.
          </p>
          <Link
            href="/request"
            className="group mt-6 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.1em] text-live"
          >
            Start a project
            <ArrowUpRight weight="bold" className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted/70">{col.title}</p>
            <ul className="mt-4 grid gap-3">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-text/80 transition hover:text-live">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <FooterWordmark />

      <div className="border-t border-line/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 font-mono text-[11px] text-muted/70 sm:px-6">
          <span>© {new Date().getFullYear()} rira.build</span>
          <span>Built with Next.js, shipped on Vercel.</span>
        </div>
      </div>
    </footer>
  );
}

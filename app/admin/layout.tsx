"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const TABS = [
  { href: "/admin", label: "Inbox" },
  { href: "/admin/projects", label: "Projects" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin, email, signOut } = useAuth();
  const pathname = usePathname();

  if (loading) return null;

  if (!isAdmin) {
    return (
      <Gate
        title="Sign in required"
        body="This area is only for the site owner."
        cta={{ href: "/login", label: "Sign in" }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/70 pb-4">
        <nav className="flex gap-1.5 font-mono text-[12px] uppercase tracking-[0.1em]">
          {TABS.map((t) => {
            const active =
              t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={
                  "rounded-full px-4 py-1.5 transition " +
                  (active ? "bg-live/15 text-live" : "text-muted hover:text-text")
                }
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4 font-mono text-[12px] text-muted">
          <span className="hidden sm:inline">{email}</span>
          <button
            onClick={() => signOut()}
            className="uppercase tracking-[0.1em] transition hover:text-signal"
          >
            Sign out
          </button>
        </div>
      </div>
      <div className="pt-8">{children}</div>
    </div>
  );
}

function Gate({
  title,
  body,
  cta
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <section className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-3 text-muted">{body}</p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-6 inline-block rounded-full bg-live px-6 py-3 font-mono text-[13px] uppercase tracking-[0.1em] text-ink transition hover:bg-live/90"
        >
          {cta.label}
        </Link>
      )}
    </section>
  );
}

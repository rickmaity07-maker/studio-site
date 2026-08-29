"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { signOut } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  business: string;
  projectType: string;
  budget: string;
  timeline: string;
  message?: string;
  status: "new" | "contacted" | "archived";
  createdAt?: Timestamp;
};

const STATUSES: Lead["status"][] = ["new", "contacted", "archived"];

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const [leads, setLeads] = useState<Lead[] | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lead)));
    });
    return unsub;
  }, [isAdmin]);

  if (loading) return null;

  if (!user) {
    return (
      <Gate
        title="Sign in required"
        body="This area is only for the site owner."
        cta={{ href: "/login", label: "Sign in" }}
      />
    );
  }

  if (!user.emailVerified) {
    return (
      <Gate
        title="Verify your email"
        body="Finish the verification steps from signup before continuing."
        cta={{ href: "/signup", label: "Continue verification" }}
      />
    );
  }

  if (!isAdmin) {
    return (
      <Gate
        title="Not authorized"
        body="Your account isn't on the admin list yet. Add your user ID to the `admins` collection in the Firebase console — see the README."
      />
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 font-display text-3xl">Project requests</h1>
        </div>
        <button
          onClick={() => signOut()}
          className="font-mono text-[12px] uppercase tracking-[0.1em] text-muted transition hover:text-signal"
        >
          Sign out
        </button>
      </div>

      {!leads ? (
        <p className="mt-10 text-muted">Loading…</p>
      ) : leads.length === 0 ? (
        <p className="mt-10 text-muted">No requests yet.</p>
      ) : (
        <div className="mt-10 grid gap-4">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </section>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  async function setStatus(status: Lead["status"]) {
    await updateDoc(doc(db, "leads", lead.id), { status });
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg">
            {lead.name} <span className="text-muted">· {lead.business}</span>
          </h3>
          <p className="mt-1 font-mono text-[12px] text-muted">
            {lead.email}
            {lead.phone ? ` · ${lead.phone}` : ""}
          </p>
        </div>
        <div className="flex gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={
                "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.06em] transition " +
                (lead.status === s
                  ? "border-live/50 bg-live/10 text-live"
                  : "border-line text-muted hover:text-text")
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 font-mono text-[11px] uppercase tracking-[0.05em] text-muted sm:grid-cols-4">
        <div>
          <dt>Type</dt>
          <dd className="mt-0.5 normal-case text-text/80">{lead.projectType}</dd>
        </div>
        <div>
          <dt>Budget</dt>
          <dd className="mt-0.5 normal-case text-text/80">{lead.budget}</dd>
        </div>
        <div>
          <dt>Timeline</dt>
          <dd className="mt-0.5 normal-case text-text/80">{lead.timeline}</dd>
        </div>
        <div>
          <dt>Received</dt>
          <dd className="mt-0.5 normal-case text-text/80">
            {lead.createdAt ? lead.createdAt.toDate().toLocaleDateString() : "—"}
          </dd>
        </div>
      </dl>

      {lead.message && (
        <p className="mt-4 whitespace-pre-line border-t border-line/70 pt-4 text-sm text-text/85">
          {lead.message}
        </p>
      )}
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

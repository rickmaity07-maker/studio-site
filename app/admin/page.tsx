"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/admin-api";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/lead-schema";
import { btnDanger, btnGhost, btnPrimary, labelCls, pill } from "@/components/admin/ui";

type Filter = LeadStatus | "all";

export default function InboxPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("new");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setLeads((await api<{ leads: Lead[] }>("/api/admin/leads")).leads);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: 0, new: 0, contacted: 0, won: 0, archived: 0 };
    leads?.forEach((l) => {
      c.all++;
      c[l.status]++;
    });
    return c;
  }, [leads]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (leads ?? []).filter(
      (l) =>
        (filter === "all" || l.status === filter) &&
        (!q ||
          [l.name, l.email, l.business, l.message, l.notes, l.projectType]
            .join(" ")
            .toLowerCase()
            .includes(q))
    );
  }, [leads, filter, search]);

  function patchLocal(id: string, patch: Partial<Lead>) {
    setLeads((ls) => ls?.map((l) => (l.id === id ? { ...l, ...patch } : l)) ?? null);
  }

  async function update(lead: Lead, patch: Partial<Pick<Lead, "status" | "notes">>) {
    const before = { status: lead.status, notes: lead.notes };
    patchLocal(lead.id, patch);
    try {
      await api(`/api/admin/leads/${lead.id}`, { method: "PATCH", json: patch });
    } catch (err) {
      patchLocal(lead.id, before);
      alert((err as Error).message);
    }
  }

  async function remove(lead: Lead) {
    if (!confirm(`Permanently delete the request from ${lead.name}? This can't be undone.`)) return;
    try {
      await api(`/api/admin/leads/${lead.id}`, { method: "DELETE" });
      setLeads((ls) => ls?.filter((l) => l.id !== lead.id) ?? null);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Inbox</p>
          <h1 className="mt-2 font-display text-3xl">Project requests</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className={btnGhost}>
            Refresh
          </button>
          <button
            onClick={() => downloadCsv(visible)}
            disabled={!visible.length}
            className={btnGhost}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...LEAD_STATUSES] as Filter[]).map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={pill(filter === s)}>
              {s} <span className="opacity-60">{counts[s]}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, business, notes…"
          className="input sm:ml-auto sm:max-w-xs"
        />
      </div>

      {error ? (
        <div className="mt-10 rounded-xl border border-signal/30 bg-signal/10 p-4 text-sm text-signal">
          {error}
        </div>
      ) : !leads ? (
        <p className="mt-10 text-muted">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="mt-10 text-muted">
          {leads.length === 0 ? "No requests yet." : "Nothing matches this filter."}
        </p>
      ) : (
        <div className="mt-8 grid gap-3">
          {visible.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              open={openId === lead.id}
              onToggle={() => setOpenId(openId === lead.id ? null : lead.id)}
              onUpdate={(patch) => update(lead, patch)}
              onDelete={() => remove(lead)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LeadRow({
  lead,
  open,
  onToggle,
  onUpdate,
  onDelete
}: {
  lead: Lead;
  open: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<Pick<Lead, "status" | "notes">>) => Promise<void>;
  onDelete: () => void;
}) {
  const [notes, setNotes] = useState(lead.notes);
  const [saving, setSaving] = useState(false);
  const dirty = notes !== lead.notes;

  useEffect(() => setNotes(lead.notes), [lead.notes]);

  async function saveNotes() {
    setSaving(true);
    await onUpdate({ notes });
    setSaving(false);
  }

  return (
    <div
      className={
        "rounded-2xl border bg-surface transition " +
        (lead.status === "new" ? "border-live/30" : "border-line")
      }
    >
      <button
        onClick={onToggle}
        className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg">
            {lead.status === "new" && (
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-live align-middle" />
            )}
            {lead.name} <span className="text-muted">· {lead.business}</span>
          </h3>
          <p className="mt-0.5 font-mono text-[12px] text-muted">
            {lead.projectType} · {lead.budget} · {formatDate(lead.createdAt)}
            {lead.source === "android" && <span className="text-live"> · via app</span>}
          </p>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
          {lead.status} {open ? "▴" : "▾"}
        </span>
      </button>

      {open && (
        <div className="grid gap-5 border-t border-line/70 p-5">
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <Detail label="Email">
              <a href={`mailto:${lead.email}`} className="underline underline-offset-2 hover:text-live">
                {lead.email}
              </a>
            </Detail>
            <Detail label="Phone">
              {lead.phone ? (
                <a href={`tel:${lead.phone}`} className="hover:text-live">
                  {lead.phone}
                </a>
              ) : (
                "—"
              )}
            </Detail>
            <Detail label="Timeline">{lead.timeline}</Detail>
            <Detail label="Referenced">{lead.projectRef || "—"}</Detail>
          </dl>

          {lead.message && (
            <p className="whitespace-pre-line rounded-xl bg-surface2 p-4 text-sm text-text/85">
              {lead.message}
            </p>
          )}

          <div className="grid gap-1.5">
            <label htmlFor={`notes-${lead.id}`} className={labelCls}>
              Private notes
            </label>
            <textarea
              id={`notes-${lead.id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Call scheduled, quote sent, follow up on…"
              className="input resize-y"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {LEAD_STATUSES.map((s) => (
                <button key={s} onClick={() => onUpdate({ status: s })} className={pill(lead.status === s)}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={onDelete} className={btnDanger}>
                Delete
              </button>
              <button onClick={saveNotes} disabled={!dirty || saving} className={btnPrimary}>
                {saving ? "Saving…" : "Save notes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className={labelCls}>{label}</dt>
      <dd className="mt-1 truncate text-text/85">{children}</dd>
    </div>
  );
}

function formatDate(iso: string | null) {
  return iso
    ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : "—";
}

function downloadCsv(leads: Lead[]) {
  const cols: (keyof Lead)[] = [
    "createdAt",
    "status",
    "name",
    "email",
    "phone",
    "business",
    "projectType",
    "budget",
    "timeline",
    "projectRef",
    "message",
    "notes"
  ];
  const esc = (v: unknown) => {
    let s = String(v ?? "");
    // Stop spreadsheet apps from executing values that look like formulas.
    if (/^[=+\-@]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = [cols.join(","), ...leads.map((l) => cols.map((c) => esc(l[c])).join(","))].join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `requests-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

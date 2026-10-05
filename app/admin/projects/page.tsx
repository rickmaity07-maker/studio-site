"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/admin-api";
import type { StoredProject } from "@/lib/project-schema";
import { btnDanger, btnGhost, btnPrimary, pill } from "@/components/admin/ui";

type Data = { projects: StoredProject[] };

export default function ProjectsAdminPage() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await api<Data>("/api/admin/projects"));
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      await load();
      setBusy(false);
    }
  }

  function move(index: number, delta: number) {
    if (!data) return;
    const list = [...data.projects];
    const [item] = list.splice(index, 1);
    list.splice(index + delta, 0, item);
    setData({ ...data, projects: list });
    run(() => api("/api/admin/projects/reorder", { method: "POST", json: { ids: list.map((p) => p.id) } }));
  }

  function togglePublished(p: StoredProject) {
    const { id, order, ...input } = p;
    run(() => api(`/api/admin/projects/${id}`, { method: "PUT", json: { ...input, published: !p.published } }));
  }

  function remove(p: StoredProject) {
    if (!confirm(`Delete "${p.name}" and its screenshot? This can't be undone.`)) return;
    run(() => api(`/api/admin/projects/${p.id}`, { method: "DELETE" }));
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1 className="mt-2 font-display text-3xl">Projects</h1>
        </div>
        <Link href="/admin/projects/new" className={btnPrimary}>
          New project
        </Link>
      </div>

      {error ? (
        <div className="mt-10 rounded-xl border border-signal/30 bg-signal/10 p-4 text-sm text-signal">
          {error}
        </div>
      ) : !data ? (
        <p className="mt-10 text-muted">Loading…</p>
      ) : data.projects.length === 0 ? (
        <div className="mt-10 max-w-xl rounded-2xl border border-line bg-surface p-8">
          <h2 className="font-display text-xl">Start managing your projects here</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The database is empty. Import the starter projects from{" "}
            <code className="text-text">data/projects.ts</code> (with their
            screenshots), or add your first one with “New project”. Everything —
            edits, order, screenshots — is managed from this page, no redeploy needed.
          </p>
          <button
            onClick={() => run(() => api("/api/admin/projects/import", { method: "POST" }))}
            disabled={busy}
            className={btnPrimary + " mt-6"}
          >
            {busy ? "Importing…" : "Import starter projects"}
          </button>
        </div>
      ) : (
        <ol className="mt-8 grid gap-3">
          {data.projects.map((p, i) => (
            <li
              key={p.id}
              className={
                "flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-3 pr-5 " +
                (p.published ? "" : "opacity-60")
              }
            >
              <div className="flex flex-col">
                <button
                  onClick={() => move(i, -1)}
                  disabled={busy || i === 0}
                  aria-label={`Move ${p.name} up`}
                  className="px-2 text-muted transition hover:text-live disabled:opacity-20"
                >
                  ▲
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={busy || i === data.projects.length - 1}
                  aria-label={`Move ${p.name} down`}
                  className="px-2 text-muted transition hover:text-live disabled:opacity-20"
                >
                  ▼
                </button>
              </div>

              <div
                className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-line"
                style={{ background: `linear-gradient(155deg, ${p.accent}55 0%, #0B0D12 80%)` }}
              >
                {p.image && (
                  <Image src={p.image.url} alt="" fill sizes="80px" className="object-cover object-top" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg leading-tight">
                  {p.name}
                  {p.featured && <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.1em] text-live">Featured</span>}
                </p>
                <p className="truncate font-mono text-[12px] text-muted">
                  {p.category} · {p.year} · {p.liveUrl ? "live" : "in build"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => togglePublished(p)} disabled={busy} className={pill(p.published)}>
                  {p.published ? "Visible" : "Hidden"}
                </button>
                {p.published && (
                  <Link href={`/work/${p.slug}`} target="_blank" className={btnGhost}>
                    View
                  </Link>
                )}
                <Link href={`/admin/projects/${p.id}`} className={btnGhost}>
                  Edit
                </Link>
                <button onClick={() => remove(p)} disabled={busy} className={btnDanger}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

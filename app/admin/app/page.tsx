"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/admin-api";
import type { AppReleaseInfo } from "@/lib/server/app-releases";
import { btnDanger, btnGhost, pill } from "@/components/admin/ui";

export default function AppReleasesPage() {
  const [releases, setReleases] = useState<AppReleaseInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setReleases((await api<{ releases: AppReleaseInfo[] }>("/api/admin/app-releases")).releases);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(r: AppReleaseInfo, data: Partial<Pick<AppReleaseInfo, "published" | "mandatory">>) {
    try {
      await api(`/api/admin/app-releases/${r.versionCode}`, { method: "PATCH", json: data });
    } catch (err) {
      alert((err as Error).message);
    }
    load();
  }

  async function remove(r: AppReleaseInfo) {
    if (!confirm(`Delete version ${r.versionName} (build ${r.versionCode})? Installed copies keep working.`)) return;
    try {
      await api(`/api/admin/app-releases/${r.versionCode}`, { method: "DELETE" });
    } catch (err) {
      alert((err as Error).message);
    }
    load();
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/download`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const live = releases?.find((r) => r.published);

  return (
    <div>
      <p className="eyebrow">Android app</p>
      <h1 className="mt-2 font-display text-3xl">Releases</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-5">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">Download link to share</p>
          <p className="mt-1 truncate font-mono text-text">/download</p>
          <p className="mt-1 text-[12px] text-muted">
            {live ? `Currently serves ${live.versionName} (build ${live.versionCode}).` : "No published version yet."}
          </p>
        </div>
        <button onClick={copyLink} className={btnGhost}>
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <p className="mt-6 text-sm text-muted">
        Publish a new version with{" "}
        <code className="rounded bg-surface2 px-1.5 py-0.5 text-text">npm run app:release -- --notes &quot;What changed&quot;</code>.
        Installed apps offer the update the next time they open.
      </p>

      {error ? (
        <p className="mt-8 rounded-xl border border-signal/30 bg-signal/10 p-4 text-sm text-signal">{error}</p>
      ) : !releases ? (
        <p className="mt-8 text-muted">Loading…</p>
      ) : releases.length === 0 ? (
        <p className="mt-8 text-muted">No versions released yet.</p>
      ) : (
        <ol className="mt-8 grid gap-3">
          {releases.map((r) => (
            <li key={r.versionCode} className={"rounded-2xl border border-line bg-surface p-5 " + (r.published ? "" : "opacity-60")}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg">
                    {r.versionName} <span className="font-mono text-[12px] text-muted">build {r.versionCode}</span>
                  </p>
                  <p className="font-mono text-[12px] text-muted">
                    {new Date(r.createdAt).toLocaleDateString("de-DE")}, {(r.sizeBytes / 1048576).toFixed(1)} MB
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => patch(r, { published: !r.published })} className={pill(r.published)}>
                    {r.published ? "Published" : "Hidden"}
                  </button>
                  <button onClick={() => patch(r, { mandatory: !r.mandatory })} className={pill(r.mandatory)}>
                    {r.mandatory ? "Mandatory" : "Optional"}
                  </button>
                  <a href={r.url} className={btnGhost}>
                    APK
                  </a>
                  <button onClick={() => remove(r)} className={btnDanger}>
                    Delete
                  </button>
                </div>
              </div>
              {r.notes && <p className="mt-3 whitespace-pre-line text-sm text-text/85">{r.notes}</p>}
              <p className="mt-3 break-all font-mono text-[11px] text-muted/80">SHA-256 {r.sha256}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

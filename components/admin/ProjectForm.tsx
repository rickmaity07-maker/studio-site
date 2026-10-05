"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/data/projects";
import { api } from "@/lib/admin-api";
import { slugify, type ProjectInput } from "@/lib/project-schema";
import { btnGhost, btnPrimary, labelCls } from "./ui";

export const EMPTY_PROJECT: ProjectInput = {
  slug: "",
  name: "",
  tagline: "",
  category: CATEGORIES[0],
  year: String(new Date().getFullYear()),
  stack: [],
  description: "",
  accent: "#4CE8B0",
  embeddable: true,
  featured: false,
  published: false
};

export function ProjectForm({ id, initial }: { id?: string; initial: ProjectInput }) {
  const router = useRouter();
  const [p, setP] = useState<ProjectInput>(initial);
  const [stackText, setStackText] = useState(initial.stack.join(", "));
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setP((prev) => ({ ...prev, [key]: value }));
  }

  function setName(name: string) {
    setP((prev) => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name) }));
  }

  async function upload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { image } = await api<{ image: { url: string; id: string } }>("/api/admin/upload", {
        method: "POST",
        form
      });
      set("image", image);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const body = {
      ...p,
      stack: stackText.split(",").map((s) => s.trim()).filter(Boolean)
    };
    try {
      if (id) {
        await api(`/api/admin/projects/${id}`, { method: "PUT", json: body });
      } else {
        await api("/api/admin/projects", { method: "POST", json: body });
      }
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="grid content-start gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <input id="name" required value={p.name} onChange={(e) => setName(e.target.value)} className="input" />
          </Field>
          <Field label="URL slug" htmlFor="slug" hint={`/work/${p.slug || "…"}`}>
            <input
              id="slug"
              required
              value={p.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value.toLowerCase());
              }}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              className="input font-mono"
            />
          </Field>
        </div>

        <Field label="Tagline" htmlFor="tagline" hint="One line: who it's for">
          <input id="tagline" required value={p.tagline} onChange={(e) => set("tagline", e.target.value)} className="input" />
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Category" htmlFor="category">
            <select
              id="category"
              value={p.category}
              onChange={(e) => set("category", e.target.value as ProjectInput["category"])}
              className="input"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Year" htmlFor="year">
            <input
              id="year"
              required
              inputMode="numeric"
              pattern="\d{4}"
              value={p.year}
              onChange={(e) => set("year", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Accent color" htmlFor="accent">
            <div className="flex gap-2">
              <input
                type="color"
                aria-label="Pick accent color"
                value={/^#[0-9a-fA-F]{6}$/.test(p.accent) ? p.accent : "#000000"}
                onChange={(e) => set("accent", e.target.value)}
                className="h-[42px] w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-surface2 p-1"
              />
              <input id="accent" value={p.accent} onChange={(e) => set("accent", e.target.value)} className="input font-mono" />
            </div>
          </Field>
        </div>

        <Field label="Tech stack" htmlFor="stack" hint="Comma-separated">
          <input
            id="stack"
            value={stackText}
            onChange={(e) => setStackText(e.target.value)}
            placeholder="Next.js, Postgres, Tailwind"
            className="input"
          />
        </Field>

        <Field
          label="Live URL"
          htmlFor="liveUrl"
          hint="Leave empty until it's hosted; the page shows “Demo coming soon”"
        >
          <input
            id="liveUrl"
            type="url"
            value={p.liveUrl ?? ""}
            onChange={(e) => set("liveUrl", e.target.value || undefined)}
            placeholder="https://client-site.vercel.app"
            className="input"
          />
        </Field>

        <Field label="Case study" htmlFor="description" hint="2-4 sentences">
          <textarea
            id="description"
            required
            rows={5}
            value={p.description}
            onChange={(e) => set("description", e.target.value)}
            className="input resize-y"
          />
        </Field>
      </div>

      <div className="grid content-start gap-5">
        <div className="grid gap-2">
          <span className={labelCls}>Screenshot</span>
          <div
            className="relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl border border-line p-4"
            style={{ background: `linear-gradient(155deg, ${p.accent}40 0%, #0B0D12 70%)` }}
          >
            {p.image ? (
              <Image src={p.image.url} alt="" fill sizes="320px" className="object-cover object-top" />
            ) : (
              <span className="relative font-mono text-[11px] text-muted">
                No screenshot. The card uses the accent gradient.
              </span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={btnGhost}>
              {uploading ? "Uploading…" : p.image ? "Replace" : "Upload"}
            </button>
            {p.image && (
              <button type="button" onClick={() => set("image", undefined)} className={btnGhost}>
                Remove
              </button>
            )}
          </div>
          <p className="text-[12px] text-muted">PNG, JPG, WebP or AVIF, up to 4 MB. 1600×1200 works well.</p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-line bg-surface p-5">
          <Check
            label="Visible on the site"
            hint="Hidden projects stay here as drafts."
            checked={p.published}
            onChange={(v) => set("published", v)}
          />
          <Check
            label="Embed live demo"
            hint="Untick if the site blocks framing; visitors get the screenshot and a link instead."
            checked={p.embeddable !== false}
            onChange={(v) => set("embeddable", v)}
          />
          <Check
            label="Featured"
            hint="Shown on the home page (first five)."
            checked={Boolean(p.featured)}
            onChange={(v) => set("featured", v)}
          />
        </div>

        {error && (
          <p className="rounded-xl border border-signal/30 bg-signal/10 p-3 text-sm text-signal">{error}</p>
        )}

        <div className="flex gap-2">
          <button type="submit" disabled={saving || uploading} className={btnPrimary}>
            {saving ? "Saving…" : id ? "Save changes" : "Create project"}
          </button>
          <Link href="/admin/projects" className={btnGhost}>
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className={labelCls}>
          {label}
        </label>
        {hint && <span className="truncate text-[11px] text-muted/70">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Check({
  label,
  hint,
  checked,
  onChange
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-live"
      />
      <span>
        <span className="block text-sm">{label}</span>
        <span className="block text-[12px] text-muted">{hint}</span>
      </span>
    </label>
  );
}

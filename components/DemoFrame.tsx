"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Project } from "@/data/projects";

const SIZES = {
  desktop: { width: "100%", height: 640, label: "Desktop" },
  mobile: { width: 390, height: 720, label: "Mobile" }
} as const;

type SizeKey = keyof typeof SIZES;

export function DemoFrame({ project }: { project: Project }) {
  const [size, setSize] = useState<SizeKey>("desktop");
  const [slow, setSlow] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!project.liveUrl) return;
    setSlow(false);
    const t = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(t);
  }, [project.liveUrl, key]);

  if (!project.liveUrl) {
    return (
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <ChromeBar url={`${project.slug}.build`} />
        <div
          className="relative flex h-[420px] flex-col items-center justify-center gap-3 px-6 text-center"
          style={{
            background: `linear-gradient(160deg, ${project.accent}20 0%, #0B0D12 75%)`
          }}
        >
          {project.image && (
            <>
              <Image
                src={project.image.url}
                alt={`Screenshot of ${project.name}`}
                fill
                sizes="(min-width: 1024px) 960px, 100vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-ink/70" />
            </>
          )}
          <span className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Demo coming soon
          </span>
          <p className="relative max-w-sm text-balance text-lg text-text/80">
            This build isn&apos;t hosted yet — as soon as it goes live, this
            panel turns into a real, clickable preview.
          </p>
        </div>
      </div>
    );
  }

  if (project.embeddable === false) {
    return <ScreenshotDemo project={project} liveUrl={project.liveUrl} />;
  }

  const active = SIZES[size];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <ChromeBar url={project.liveUrl.replace(/^https?:\/\//, "")} />

      <div className="flex items-center justify-between gap-3 border-b border-line/70 bg-surface2 px-4 py-2">
        <div className="flex gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
          {(Object.keys(SIZES) as SizeKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSize(k)}
              className={
                "rounded-full px-3 py-1 transition " +
                (size === k
                  ? "bg-live/15 text-live"
                  : "hover:bg-white/5 hover:text-text")
              }
            >
              {SIZES[k].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {slow && (
            <span className="hidden font-mono text-[11px] text-muted sm:inline">
              Slow to load? It may not allow embedding —
            </span>
          )}
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] uppercase tracking-[0.1em] text-live transition hover:text-live/80"
          >
            Open live site ↗
          </a>
        </div>
      </div>

      <div className="flex justify-center bg-[#05060a] p-4">
        <iframe
          key={key}
          src={project.liveUrl}
          title={`Live demo of ${project.name}`}
          width={active.width}
          height={active.height}
          className="max-w-full rounded-lg border border-line/60 bg-white"
          loading="lazy"
        />
      </div>
    </div>
  );
}

/**
 * For live sites that (rightly) forbid being framed: the screenshot in
 * the same browser chrome, with the live site one click away.
 */
function ScreenshotDemo({ project, liveUrl }: { project: Project; liveUrl: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <ChromeBar url={liveUrl.replace(/^https?:\/\//, "")} />
      <a
        href={liveUrl}
        target="_blank"
        rel="noreferrer"
        className="group relative block aspect-[4/3] overflow-hidden sm:aspect-[16/10]"
        style={{ background: `linear-gradient(160deg, ${project.accent}20 0%, #0B0D12 75%)` }}
      >
        {project.image && (
          <Image
            src={project.image.url}
            alt={`Screenshot of ${project.name}`}
            fill
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-cover object-top transition duration-500 group-hover:scale-[1.015]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-sm text-sm text-text/80">
            This site keeps itself out of other pages&apos; frames for security,
            so the live demo opens in its own tab.
          </p>
          <span className="shrink-0 rounded-full bg-live px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.1em] text-ink transition group-hover:bg-live/90">
            Open live site ↗
          </span>
        </div>
      </a>
    </div>
  );
}

function ChromeBar({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-line/70 bg-surface2 px-4 py-2.5">
      <div className="flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/70" />
      </div>
      <div className="flex flex-1 items-center rounded-md border border-line bg-ink px-3 py-1 font-mono text-[12px] text-muted">
        <span className="truncate">{url}</span>
      </div>
    </div>
  );
}

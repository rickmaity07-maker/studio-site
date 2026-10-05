import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Project } from "@/data/projects";
import { LiveDot } from "./LiveDot";
import { Spotlight } from "./motion/Spotlight";

export function ProjectCard({
  project,
  wide = false,
  priority = false
}: {
  project: Project;
  wide?: boolean;
  priority?: boolean;
}) {
  const url = project.liveUrl
    ? project.liveUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : `${project.slug}.build`;

  return (
    <Spotlight className="h-full">
      <Link href={`/work/${project.slug}`} className="group relative z-10 flex h-full flex-col">
        <div
          className={"relative overflow-hidden " + (wide ? "aspect-[4/3] lg:aspect-auto lg:min-h-[300px] lg:flex-1" : "aspect-[4/3]")}
          style={{ background: `linear-gradient(155deg, ${project.accent}30 0%, #0B0D12 72%)` }}
        >
          {project.image ? (
            <Image
              src={project.image.url}
              alt={`${project.name} website`}
              fill
              priority={priority}
              sizes={wide ? "(min-width: 1024px) 800px, (min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"}
              className="object-cover object-top transition duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div
              className="absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-30 blur-3xl transition group-hover:opacity-50"
              style={{ background: project.accent }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />

          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-lg border border-line/70 bg-ink/70 px-3 py-2 backdrop-blur">
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
            </div>
            <span className="truncate font-mono text-[11px] text-muted">{url}</span>
          </div>

          <span className="absolute right-4 top-4 flex h-10 w-10 translate-y-1 items-center justify-center rounded-full bg-live text-ink opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight weight="bold" className="h-4 w-4" aria-hidden />
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className={"font-display font-medium leading-tight transition-colors group-hover:text-live " + (wide ? "text-2xl" : "text-lg")}>
                {project.name}
              </h3>
              <p className="mt-0.5 text-sm text-muted">{project.tagline}</p>
            </div>
            <LiveDot live={Boolean(project.liveUrl)} />
          </div>
          <p className="mt-auto pt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
            <span className="text-text/70">{project.category}</span>, {project.year}
          </p>
        </div>
      </Link>
    </Spotlight>
  );
}

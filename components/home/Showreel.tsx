"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { Project } from "@/data/projects";

/**
 * Scroll down, the builds pan sideways: the section pins to the viewport
 * and vertical scroll drives a horizontal track of full-size screenshots.
 * Phones and reduced-motion get a native swipeable row instead.
 */
export function Showreel({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  // How far the track must travel: its width minus the viewport.
  useLayoutEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  // The pan is a desktop moment; phones keep the native swipe row.
  const [wide, setWide] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const pinned = !reduce && wide;

  return (
    <section
      ref={section}
      aria-label="Live builds"
      className="relative"
      // The pinned pan needs scroll room equal to the horizontal travel.
      // Scroll room for the pan; 0.7 makes the sideways travel a little faster than the scroll.
      style={pinned ? { height: `calc(100dvh + ${Math.round(distance * 0.7)}px)` } : undefined}
    >
      <div className={pinned ? "sticky top-0 flex h-[100dvh] flex-col justify-center overflow-hidden" : ""}>
        <div className={"mx-auto w-full max-w-7xl px-4 sm:px-6 " + (pinned ? "" : "pt-24")}>
          <h2 className="max-w-xl font-display text-3xl font-medium leading-tight tracking-[-0.02em] sm:text-4xl">
            {projects.length} builds you can open right now.
          </h2>
        </div>

        <motion.div
          ref={track}
          style={pinned ? { x } : undefined}
          className={
            "mt-10 flex gap-5 px-4 sm:px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] " +
            // Without the pan, the row scrolls natively with snap points.
            (pinned ? "" : "snap-x snap-mandatory scroll-px-4 overflow-x-auto pb-6 [scrollbar-width:none] sm:scroll-px-6")
          }
        >
          {projects.map((p) => (
            <ReelCard key={p.slug} project={p} />
          ))}
          <Link
            href="/work"
            className="group flex w-[70vw] shrink-0 snap-start flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-line text-center transition hover:border-live/50 sm:w-[340px]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line transition group-hover:border-live group-hover:bg-live group-hover:text-ink">
              <ArrowUpRight weight="bold" className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-display text-xl">Every build</span>
          </Link>
        </motion.div>

        {pinned && (
          <div className="mx-auto mt-10 w-full max-w-7xl px-6">
            <motion.div style={{ scaleX: progress }} className="h-px origin-left bg-live/70" />
          </div>
        )}
      </div>
    </section>
  );
}

function ReelCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group w-[82vw] shrink-0 snap-start sm:w-[560px] lg:w-[680px]"
    >
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line"
        style={{ background: `linear-gradient(155deg, ${project.accent}40 0%, #0B0D12 72%)` }}
      >
        {project.image && (
          <Image
            src={project.image.url}
            alt={`${project.name} website`}
            fill
            sizes="(min-width: 1024px) 680px, (min-width: 640px) 560px, 82vw"
            // The track moves with transforms, which can outrun lazy loading.
            loading="eager"
            className="object-cover object-top transition duration-700 ease-out group-hover:scale-[1.04]"
          />
        )}
        <div className="absolute inset-0 bg-ink/0 transition duration-500 group-hover:bg-ink/25" />
        <span className="absolute right-4 top-4 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-live text-ink opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight weight="bold" className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <div className="mt-4">
        <h3 className="font-display text-xl font-medium transition-colors group-hover:text-live">{project.name}</h3>
        <p className="mt-0.5 truncate text-sm text-muted">{project.tagline}</p>
      </div>
    </Link>
  );
}

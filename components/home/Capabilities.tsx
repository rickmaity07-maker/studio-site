import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";
import { Spotlight } from "@/components/motion/Spotlight";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { ClipReveal } from "@/components/motion/ClipReveal";
import { CountUp } from "@/components/motion/CountUp";
import { LanguageToggle } from "./LanguageToggle";

function pick(projects: Project[], slug: string) {
  return projects.find((p) => p.slug === slug && p.image) ?? projects.find((p) => p.image);
}

/** What the studio builds, shown with the builds themselves rather than icons. */
export function Capabilities({ projects }: { projects: Project[] }) {
  const booking = pick(projects, "rebo-salon");
  const store = pick(projects, "al-madina");
  const portal = pick(projects, "paulaner-route-66");
  const live = projects.filter((p) => p.liveUrl).length;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:pb-36">
      <SplitHeading
        lines={["What I build for", "local businesses."]}
        className="max-w-2xl font-display text-3xl font-medium leading-tight tracking-[-0.02em] sm:text-5xl"
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-6 lg:grid-rows-[minmax(340px,auto)_minmax(300px,auto)]">
        {/* Bookings: the widest tile, with the salon system as its picture. */}
        <Reveal className="lg:col-span-4">
          <Spotlight className="flex h-full flex-col">
            <div className="relative z-10 p-7 sm:p-8">
              <h3 className="font-display text-2xl font-medium">Bookings that run themselves</h3>
              <p className="mt-2 max-w-md text-muted">
                Appointments, SMS confirmations, waitlists and a staff calendar.
                Rebo Salon runs its whole day on one.
              </p>
            </div>
            {booking?.image && (
              <ShotLink project={booking} className="mx-7 mt-auto aspect-[16/7] rounded-t-xl sm:mx-8" sizes="(min-width: 1024px) 760px, 90vw" />
            )}
          </Spotlight>
        </Reveal>

        {/* Bilingual: a real, working toggle instead of a picture of one. */}
        <Reveal className="lg:col-span-2" delay={0.08}>
          <Spotlight className="flex h-full flex-col justify-between p-7 sm:p-8">
            <div className="relative z-10">
              <h3 className="font-display text-2xl font-medium">German and English, built in</h3>
              <p className="mt-2 text-muted">The language switches instantly, without a reload. Try it.</p>
            </div>
            <div className="relative z-10 mt-8">
              <LanguageToggle />
            </div>
          </Spotlight>
        </Reveal>

        <Reveal className="lg:col-span-2" delay={0.04}>
          <Spotlight className="flex h-full flex-col">
            <div className="relative z-10 p-7">
              <h3 className="font-display text-xl font-medium">Online stores</h3>
              <p className="mt-2 text-sm text-muted">Search, basket, pickup or delivery, built around how your shop already works.</p>
            </div>
            {store?.image && <ShotLink project={store} className="mx-7 mt-auto aspect-[16/9] rounded-t-xl" sizes="(min-width: 1024px) 360px, 90vw" />}
          </Spotlight>
        </Reveal>

        <Reveal className="lg:col-span-2" delay={0.1}>
          <Spotlight className="flex h-full flex-col">
            <div className="relative z-10 p-7">
              <h3 className="font-display text-xl font-medium">Your own admin portal</h3>
              <p className="mt-2 text-sm text-muted">Change menus, prices, hours and texts yourself. No developer needed for the small stuff.</p>
            </div>
            {portal?.image && <ShotLink project={portal} className="mx-7 mt-auto aspect-[16/9] rounded-t-xl" sizes="(min-width: 1024px) 360px, 90vw" />}
          </Spotlight>
        </Reveal>

        {/* A real number from the database, not a marketing stat. */}
        <Reveal className="lg:col-span-2" delay={0.16}>
          <Spotlight className="h-full">
            <Link href="/work" className="relative z-10 flex h-full flex-col justify-between p-7">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-live">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-60 motion-reduce:hidden" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
                </span>
                Online now
              </span>
              <span>
                <CountUp
                  to={live}
                  className="block font-display text-[5.5rem] font-medium leading-none tracking-[-0.04em] text-text"
                />
                <span className="mt-2 block text-muted">
                  client sites live and clickable, from bars to barbershops.
                </span>
              </span>
            </Link>
          </Spotlight>
        </Reveal>
      </div>
    </section>
  );
}

function ShotLink({ project, className, sizes }: { project: Project; className: string; sizes: string }) {
  return (
    <ClipReveal className={`relative z-10 ${className}`} radius={12}>
      <Link
        href={`/work/${project.slug}`}
        aria-label={`${project.name} case study`}
        className="group/shot relative block h-full w-full overflow-hidden rounded-t-xl border border-b-0 border-line"
      >
        <Image
          src={project.image!.url}
          alt={`${project.name} website`}
          fill
          sizes={sizes}
          className="object-cover object-top transition duration-700 ease-out group-hover/shot:scale-[1.03]"
        />
      </Link>
    </ClipReveal>
  );
}

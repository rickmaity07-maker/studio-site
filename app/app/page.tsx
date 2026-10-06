import Image from "next/image";
import type { Metadata } from "next";
import { AndroidLogo, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { androidApp } from "@/data/app";
import { latestRelease } from "@/lib/server/app-releases";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

export const metadata: Metadata = {
  title: "Android app",
  description: "Every Rick.build project on your phone: live demos full screen, and a project request in a minute."
};

const SCREENS = [
  { src: "/app/work.jpg", alt: "The work list with industry filters" },
  { src: "/app/project.jpg", alt: "A project page with its stack and description" },
  { src: "/app/demo.jpg", alt: "A live client site opened full screen inside the app" },
  { src: "/app/request.jpg", alt: "The project request form" }
];

const FEATURES = [
  { title: "Every build, in your pocket", body: "The same projects as this site, always up to date, filtered by industry." },
  { title: "Live demos, full screen", body: "Open any client site inside the app, even the ones that refuse to be embedded on the web." },
  { title: "A request in a minute", body: "Send a project request from the app. It lands in the same inbox and gets the same reply." },
  { title: "No account, no tracking", body: "Nothing to sign up for, no analytics, no ads. It only talks to this website." }
];

// Always reflects the newest published release.
export const dynamic = "force-dynamic";

export default async function AppPage() {
  const release = await latestRelease();
  const apk = release && { sizeMb: (release.sizeBytes / 1048576).toFixed(1), sha256: release.sha256 };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-16 sm:px-6 lg:pt-24">
      <section className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="eyebrow inline-flex items-center gap-2">
            <AndroidLogo weight="fill" className="h-4 w-4 text-live" aria-hidden />
            For Android {androidApp.minAndroid} and newer
          </p>
          <SplitHeading
            as="h1"
            immediate
            lines={["Rick.build,", "on your phone."]}
            className="mt-5 font-display text-5xl font-medium leading-[1.04] tracking-[-0.03em] sm:text-7xl"
          />
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Browse every build, open live demos full screen and send a project request, all from one small app.
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href={androidApp.downloadPath}
              className="group inline-flex items-center gap-3 rounded-full bg-live px-7 py-4 font-mono text-[13px] uppercase tracking-[0.1em] text-ink shadow-[0_10px_40px_-12px_rgba(76,232,176,0.6)] transition hover:bg-[#6bf0c1] active:scale-[0.98]"
            >
              <DownloadSimple weight="bold" className="h-5 w-5 transition group-hover:translate-y-0.5" aria-hidden />
              Download the app
            </a>
            {release && (
              <span className="font-mono text-[12px] text-muted">
                Version {release.versionName}, {apk!.sizeMb} MB
              </span>
            )}
          </Reveal>
        </div>

        {/* Real screenshots from the app, fanned like a hand of cards. */}
        <Reveal delay={0.15}>
          <div className="relative mx-auto flex h-[520px] max-w-[560px] items-center justify-center sm:h-[600px]">
            {SCREENS.slice(0, 3).map((s, i) => {
              const pos = [
                "-translate-x-[62%] -rotate-[8deg] scale-[0.86] opacity-70",
                "z-10",
                "translate-x-[62%] rotate-[8deg] scale-[0.86] opacity-70"
              ][i];
              return (
                <div
                  key={s.src}
                  className={`absolute aspect-[9/20] w-[44%] overflow-hidden rounded-[2rem] border-[6px] border-surface2 bg-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-line transition duration-500 ${pos}`}
                >
                  <Image src={s.src} alt={s.alt} fill sizes="260px" className="object-cover object-top" priority={i === 1} />
                </div>
              );
            })}
          </div>
        </Reveal>
      </section>

      <section className="mt-28 grid gap-x-10 gap-y-12 border-t border-line pt-16 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.06}>
            <h2 className="font-display text-xl font-medium">{f.title}</h2>
            <p className="mt-2 text-muted">{f.body}</p>
          </Reveal>
        ))}
      </section>

      <section id="install" className="mt-28 grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <h2 className="font-display text-3xl font-medium tracking-[-0.02em] sm:text-4xl">Installing takes a minute.</h2>
          <p className="mt-4 max-w-md text-muted">
            The app comes straight from this site rather than the Play Store, so Android asks you to allow it once.
          </p>
          <ol className="mt-8 grid gap-5">
            {[
              "Tap Download the app above. Your browser saves the app file (rick-build-…apk).",
              "Open the download. If Android asks, allow your browser to install apps.",
              "Tap Install, then Open. That's it."
            ].map((step, i) => (
              <li key={step} className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="pt-0.5 font-mono text-[13px] text-live">{String(i + 1).padStart(2, "0")}</span>
                <span className="leading-relaxed text-text/85">{step}</span>
              </li>
            ))}
          </ol>
          {release?.notes && (
            <div className="mt-8 rounded-xl border border-line bg-surface p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">What&apos;s new in {release.versionName}</p>
              <p className="mt-2 whitespace-pre-line text-text/85">{release.notes}</p>
            </div>
          )}
          <p className="mt-8 text-sm text-muted">
            On an iPhone? There&apos;s no iOS app yet, but this website works the same in Safari.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid gap-4 rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <Detail label="App">{androidApp.name}</Detail>
            {release && <Detail label="Version">{release.versionName}</Detail>}
            <Detail label="Requires">Android {androidApp.minAndroid} or newer</Detail>
            {apk && <Detail label="Size">{apk.sizeMb} MB</Detail>}
            <Detail label="Permissions">Internet only</Detail>
            {apk && (
              <Detail label="SHA-256">
                <code className="block break-all font-mono text-[12px] leading-relaxed text-muted">{apk.sha256}</code>
              </Detail>
            )}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {SCREENS.map((s) => (
              <div key={s.src} className="relative aspect-[9/20] overflow-hidden rounded-xl border border-line">
                <Image src={s.src} alt={s.alt} fill sizes="(min-width: 640px) 150px, 45vw" className="object-cover object-top" />
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] items-start gap-4 border-b border-line/60 pb-4 last:border-0 last:pb-0">
      <span className="pt-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{label}</span>
      <span className="text-text/90">{children}</span>
    </div>
  );
}

import { getProjects } from "@/lib/server/projects";
import { Hero } from "@/components/home/Hero";
import { Showreel } from "@/components/home/Showreel";
import { WorkIndex } from "@/components/home/WorkIndex";
import { Capabilities } from "@/components/home/Capabilities";
import { Process } from "@/components/home/Process";
import { ClosingCta } from "@/components/home/ClosingCta";

export default async function Home() {
  const projects = await getProjects();
  const live = projects.filter((p) => p.liveUrl && p.image);
  // The hero deck leads with the featured builds, then the rest of the live ones.
  const deck = [...live.filter((p) => p.featured), ...live.filter((p) => !p.featured)];

  return (
    <>
      <Hero projects={deck} />
      <Showreel projects={live} />
      <WorkIndex projects={projects} />
      <Capabilities projects={projects} />
      <Process />
      <ClosingCta />
    </>
  );
}

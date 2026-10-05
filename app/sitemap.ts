import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/server/projects";
import { site } from "@/data/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const pages = ["", "/work", "/request", "/privacy", "/impressum"];
  return [
    ...pages.map((path) => ({ url: `${site.url}${path}` })),
    ...projects.map((p) => ({ url: `${site.url}/work/${p.slug}` }))
  ];
}
